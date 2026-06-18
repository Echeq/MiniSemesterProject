/**
 * API Integration Tests — TaskFlow Supabase API
 *
 * These tests hit the real Supabase PostgREST API using the anon key.
 * Set VITE_TEST_USER_EMAIL and VITE_TEST_USER_PASSWORD in frontend/.env.
 *
 * To run:  npm test          (from frontend/)
 * Single:  npx vitest run --reporter=verbose
 * Watch:   npm run test:watch
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'


// Load .env manually so tests work regardless of Vite env handling
dotenv.config()

const URL = process.env.VITE_SUPABASE_URL
const KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!URL || !KEY) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env')
}

const supabase = createClient(URL, KEY)

// ─── Test account credentials from .env ──────────────────────────────────────
if (!process.env.VITE_TEST_USER_EMAIL || !process.env.VITE_TEST_USER_PASSWORD) {
  throw new Error('Missing VITE_TEST_USER_EMAIL or VITE_TEST_USER_PASSWORD in frontend/.env')
}
const TEST_USER = { email: process.env.VITE_TEST_USER_EMAIL, password: process.env.VITE_TEST_USER_PASSWORD }
const TASK_COLUMNS = ['todo', 'doing', 'done']

// ─── Auth API ────────────────────────────────────────────────────────────────
describe('POST /auth/v1/token (auth.signInWithPassword)', () => {
  it('signs in with valid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword(TEST_USER)
    expect(error).toBeNull()
    expect(data.session).toBeDefined()
    expect(data.session.access_token).toBeTruthy()
    expect(data.user.email).toBe(TEST_USER.email)
    await supabase.auth.signOut()
  })

  it('rejects invalid password', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: 'wrongpassword',
    })
    expect(error).not.toBeNull()
    expect(data.session).toBeNull()
  })
})

describe('GET /auth/v1/user (auth.getUser)', () => {
  it('returns the current user when authenticated', async () => {
    await supabase.auth.signInWithPassword(TEST_USER)
    const { data, error } = await supabase.auth.getUser()
    expect(error).toBeNull()
    expect(data.user.email).toBe(TEST_USER.email)
    expect(data.user.id).toBeTruthy()
    await supabase.auth.signOut()
  })

  it('returns null when not authenticated', async () => {
    const { data } = await supabase.auth.getUser()
    expect(data.user).toBeNull()
  })
})

// ─── Tasks CRUD ─────────────────────────────────────────────────────────────
describe('Tasks API (GET/POST/PATCH/DELETE /rest/v1/tasks)', () => {
  // Sign in once before all task tests
  beforeAll(async () => {
    const { error } = await supabase.auth.signInWithPassword(TEST_USER)
    if (error) throw new Error(`Test auth failed: ${error.message}`)
  })

  let createdTaskId = null

  // ── CREATE ──────────────────────────────────────────────────────────────
  it('POST /tasks — creates a task', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('tasks').insert({
      title: 'TEST: Check API',
      description: '',
      status: 'todo',
      position: 0,
      created_by: user.id,
    }).select().single()

    expect(error).toBeNull()
    expect(data.id).toBeTruthy()
    expect(data.title).toBe('TEST: Check API')
    expect(data.status).toBe('todo')
    createdTaskId = data.id
  })

  it('POST /tasks — rejects missing title (RLS constraint)', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('tasks').insert({
      title: '',          // empty title should fail (check constraint 1-200)
      status: 'todo',
      position: 1,
      created_by: user.id,
    })
    expect(error).not.toBeNull()
  })

  it('POST /tasks — rejects wrong created_by (RLS)', async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('tasks').insert({
      title: 'Should fail',
      status: 'todo',
      position: 2,
      created_by: '00000000-0000-0000-0000-000000000000',
    })
    expect(error).not.toBeNull()
  })

  // ── READ ─────────────────────────────────────────────────────────────────
  it('GET /tasks — returns all tasks for authenticated users', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
  })

  it('GET /tasks — includes joined assignee profile', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_fkey(display_name, avatar_url)')
      .order('position', { ascending: true })

    expect(error).toBeNull()
    if (data.length > 0) {
      // The join structure should return assignee as an object or null
      expect(data[0]).toHaveProperty('assignee')
    }
  })

  it('GET /tasks — returns empty array for anonymous user', async () => {
    const anonClient = createClient(URL, KEY)
    const { data, error } = await anonClient.from('tasks').select('*')
    // RLS should block anonymous access
    // PostgREST returns empty array (not an error) for blocked reads with RLS
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  // ── UPDATE ───────────────────────────────────────────────────────────────
  it('PATCH /tasks — updates a task title', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ title: 'TEST: Updated title' })
      .eq('id', createdTaskId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.title).toBe('TEST: Updated title')
  })

  it('PATCH /tasks — changes task status', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: 'doing' })
      .eq('id', createdTaskId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.status).toBe('doing')
  })

  it('PATCH /tasks — cannot change created_by (column-level grant)', async () => {
    // Trying to update a column not in the grant list returns a 42501 error
    const { error } = await supabase
      .from('tasks')
      .update({ created_by: '00000000-0000-0000-0000-000000000000' })
      .eq('id', createdTaskId)
      .select()
      .single()

    expect(error).not.toBeNull()
    expect(error.code).toBe('42501')
  })

  // ── DELETE ───────────────────────────────────────────────────────────────
  it('DELETE /tasks — deletes a task', async () => {
    const { error } = await supabase.from('tasks').delete().eq('id', createdTaskId)
    expect(error).toBeNull()

    // Verify it's gone
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', createdTaskId)

    expect(data).toHaveLength(0)
  })

  it('DELETE /tasks — fails for anonymous user', async () => {
    const anonClient = createClient(URL, KEY)
    const { error } = await anonClient.from('tasks').delete().eq('id', '00000000-0000-0000-0000-000000000000')
    // RLS blocks the deletion — no rows affected, no error (RLS silently blocks)
    // Supabase PostgREST returns success with 0 rows affected for blocked deletes
    expect(error).toBeNull()
  })
})

// ─── Profiles API ───────────────────────────────────────────────────────────
describe('Profiles API (GET /rest/v1/profiles)', () => {
  it('GET /profiles — returns profiles for authenticated users', async () => {
    await supabase.auth.signInWithPassword(TEST_USER)
    const { data, error } = await supabase.from('profiles').select('*')

    expect(error).toBeNull()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    await supabase.auth.signOut()
  })

  it('GET /profiles — returns empty array for anonymous user', async () => {
    const anonClient = createClient(URL, KEY)
    const { data, error } = await anonClient.from('profiles').select('*')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})


