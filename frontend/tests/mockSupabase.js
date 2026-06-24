import { vi } from 'vitest'

export function createMockBuilder(resolveValue) {
  const thenFn = (fn) => Promise.resolve(resolveValue).then(fn)
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    is: vi.fn(() => builder),
    in: vi.fn(() => builder),
    match: vi.fn(() => builder),
    single: vi.fn(() => ({ then: thenFn, catch: (fn) => Promise.resolve(resolveValue).catch(fn) })),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => ({ ...builder, eq: vi.fn(() => builder) })),
    then: thenFn,
    catch: (fn) => Promise.resolve(resolveValue).catch(fn),
  }
  return builder
}

export function createMockSupabase() {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock', user: { email: 'test@test.com', id: 'uid' } } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'new-uid' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
    },
    from: vi.fn(() => createMockBuilder({ data: [], error: null })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/avatar.jpg' },
        })),
      })),
    },
    rpc: vi.fn().mockResolvedValue({ error: null }),
  }
}
