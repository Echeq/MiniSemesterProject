import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import Avatar from './Avatar'
import { useMembers } from '../hooks/useMembers'
import LogViewer from './LogViewer'
import { supabase } from '../api/supabaseClient'

function Spinner() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
    </div>
  )
}

export default function AdminModal({ session, onClose }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('members')
  const [pendingCount, setPendingCount] = useState(0)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    supabase
      .from('join_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0))
    const sub = supabase
      .channel('admin-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'join_requests' }, () => {
        supabase
          .from('join_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .then(({ count }) => setPendingCount(count ?? 0))
      })
      .subscribe()
    return () => { supabase.removeChannel(sub) }
  }, [])

  return (
    <Modal title={t('admin.title')} subtitle={t('admin.subtitle')} onClose={onClose} maxWidth="max-w-lg">
      {msg && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)', background: 'color-mix(in srgb, var(--done) 12%, transparent)' }}>{msg}</p>}
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-1">
        <TabButton active={tab === 'members'} onClick={() => setTab('members')}>{t('admin.members') || 'Members'}</TabButton>
        <TabButton active={tab === 'access'} onClick={() => setTab('access')}>
          Access
          {pendingCount > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'emailChanges'} onClick={() => setTab('emailChanges')}>Email Changes</TabButton>
        <TabButton active={tab === 'data'} onClick={() => setTab('data')}>Data</TabButton>
        <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>{t('admin.logs') || 'Logs'}</TabButton>
      </div>
      {tab === 'members' && <Members session={session} />}
      {tab === 'access' && <Access onApproved={(name) => setMsg(`✅ ${name} has been accepted, now a member.`)} />}
      {tab === 'emailChanges' && <EmailChanges />}
      {tab === 'data' && <DataPanel />}
      {tab === 'logs' && <LogViewer />}
    </Modal>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-[var(--card-hover)] text-[var(--fg)] shadow-[var(--shadow-sm)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
      }`}
    >
      {children}
    </button>
  )
}

function rolePill(role) {
  return role === 'admin'
    ? { color: 'var(--accent)', borderColor: 'var(--accent)' }
    : { color: 'var(--fg-muted)', borderColor: 'var(--border)' }
}

function MemberRow({ m, session, busyId, onRoleChange, onDelete, t }) {
  const isSelf = m.id === session.user.id
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (deleteConfirm) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--danger)] bg-[var(--card)] p-2.5">
        <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{m.display_name}</p>
          <p className="text-xs" style={{ color: 'var(--danger)' }}>Delete this user?</p>
        </div>
        <button onClick={() => onDelete(m.id)} disabled={busyId === m.id} className="btn btn-danger !py-1 !text-xs">
          {busyId === m.id ? '...' : 'Delete'}
        </button>
        <button onClick={() => setDeleteConfirm(false)} disabled={busyId === m.id} className="btn btn-default !py-1 !text-xs">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
      <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {m.display_name} {isSelf && <span className="text-xs text-[var(--fg-subtle)]">({t('sidebar.you')})</span>}
        </p>
      </div>
      <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={rolePill(m.role)}>{m.role}</span>
      {!isSelf && (
        <>
          <button onClick={() => onRoleChange(m.id, m.role === 'unknown' ? 'member' : 'admin')} disabled={busyId === m.id || m.role === 'admin'} className="btn btn-default !py-1 !text-xs">
            Promote
          </button>
          <button onClick={() => onRoleChange(m.id, m.role === 'admin' ? 'member' : 'unknown')} disabled={busyId === m.id || m.role === 'unknown'} className="btn btn-default !py-1 !text-xs">
            Demote
          </button>
        </>
      )}
      {isSelf && (
        <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={rolePill(m.role)}>{m.role}</span>
      )}
      {!isSelf && (
        <button onClick={() => setDeleteConfirm(true)} disabled={busyId === m.id} className="btn btn-default !py-1 !text-xs" title="Delete user">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.748 1.748 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z" />
          </svg>
        </button>
      )}
    </div>
  )
}

function Members({ session }) {
  const { t } = useTranslation()
  const { members, loading, setRole, refetch } = useMembers()
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  async function onRoleChange(id, role) {
    setBusyId(id); setError(null)
    try {
      await setRole(id, role)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(id) {
    setBusyId(id); setError(null)
    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user: id })
      if (error) throw error
      await refetch()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}
      <div className="max-h-80 space-y-1.5 overflow-y-auto">
        {members.map((m) =>
          <MemberRow key={m.id} m={m} session={session} busyId={busyId} onRoleChange={onRoleChange} onDelete={onDelete} t={t} />
        )}
      </div>
    </div>
  )
}

function Access({ onApproved }) {
  const { t } = useTranslation()
  const { members, setRole } = useMembers()
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)
  const [requests, setRequests] = useState([])
  const [loadingReqs, setLoadingReqs] = useState(true)

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('join_requests')
      .select('id, requester_id, admin_email, status, created_at, profile:profiles!join_requests_requester_id_fkey(display_name, avatar_url)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoadingReqs(false)
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const unknownMembers = useMemo(() =>
    members.filter((m) => m.role === 'unknown'),
  [members])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return unknownMembers.filter((m) =>
      m.display_name?.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [unknownMembers, query])

  async function acceptUnknown(userId) {
    setBusyId(userId)
    setError(null)
    try {
      await setRole(userId, 'member')
      setQuery('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function approve(r) {
    setBusyId(r.id)
    try {
      await setRole(r.requester_id, 'member')
      await supabase.from('join_requests').update({ status: 'resolved' }).eq('id', r.id)
      await fetchRequests()
      onApproved?.(r.profile?.display_name || 'User')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function deny(r) {
    setBusyId(r.id)
    try {
      await supabase.from('join_requests').update({ status: 'resolved' }).eq('id', r.id)
      await fetchRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Pending requests</p>
      {loadingReqs ? <Spinner /> : requests.length === 0 ? (
        <p className="mb-4 rounded-lg border border-dashed border-[var(--glass-border)] py-3 text-center text-xs text-[var(--fg-muted)]">No pending requests.</p>
      ) : (
        <div className="mb-4 max-h-40 space-y-1.5 overflow-y-auto">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
              <Avatar name={r.profile?.display_name} url={r.profile?.avatar_url} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.profile?.display_name || 'Unknown'}</p>
                <p className="text-xs text-[var(--fg-subtle)]">{r.admin_email}</p>
              </div>
              <button onClick={() => approve(r)} disabled={busyId === r.id} className="btn btn-primary !py-1 !text-xs">
                {busyId === r.id ? '...' : 'Approve'}
              </button>
              <button onClick={() => deny(r)} disabled={busyId === r.id} className="btn btn-default !py-1 !text-xs">
                Deny
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Find unknown users to accept</p>
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search unknown users by name..."
          className="input"
        />
      </div>

      {query.trim() && filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--fg-muted)]">No unknown users found.</p>
      ) : query.trim() ? (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
              <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.display_name}</p>
                <p className="text-xs text-[var(--fg-subtle)]">unknown</p>
              </div>
              <button onClick={() => acceptUnknown(m.id)} disabled={busyId === m.id} className="btn btn-primary !py-1 !text-xs">
                {busyId === m.id ? '...' : 'Accept'}
              </button>
            </div>
          ))}
        </div>
      ) : unknownMembers.length > 0 ? (
        <p className="py-4 text-center text-xs text-[var(--fg-muted)]">{unknownMembers.length} unknown user(s) awaiting access. Search by name to accept them.</p>
      ) : (
        <p className="py-4 text-center text-xs text-[var(--fg-muted)]">All users have been accepted. No unknown users to show.</p>
      )}
    </div>
  )
}

function EmailChanges() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('email_change_requests')
      .select('id, user_id, old_email, new_email, status, created_at, reviewed_by, reviewed_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function approve(r) {
    setBusyId(r.id); setError(null)
    try {
      const { error: e } = await supabase.rpc('approve_email_change', { request_id: r.id })
      if (e) throw e
      setMsg(`Approved: ${r.new_email}`)
      await fetchRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function reject(r) {
    setBusyId(r.id); setError(null)
    try {
      const { error: e } = await supabase.rpc('reject_email_change', { request_id: r.id })
      if (e) throw e
      setMsg(`Rejected: ${r.new_email}`)
      await fetchRequests()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      {msg && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--done)', borderColor: 'var(--done)' }}>{msg}</p>}
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}
      {requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">No pending email change requests.</p>
      ) : (
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
          {requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-3">
              <p className="text-sm">
                <span className="font-medium">{r.old_email}</span>
                <span className="mx-1 text-[var(--fg-subtle)]">→</span>
                <span className="font-medium">{r.new_email}</span>
              </p>
              <p className="mt-0.5 text-xs text-[var(--fg-subtle)]">Requested {new Date(r.created_at).toLocaleDateString()}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => approve(r)} disabled={busyId === r.id} className="btn btn-primary !py-1 !text-xs">
                  {busyId === r.id ? '...' : 'Approve'}
                </button>
                <button onClick={() => reject(r)} disabled={busyId === r.id} className="btn btn-default !py-1 !text-xs">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DataPanel() {
  const [backupStep, setBackupStep] = useState('idle')
  const [backupError, setBackupError] = useState(null)
  const [backupSummary, setBackupSummary] = useState(null)
  const [restoreStep, setRestoreStep] = useState('idle')
  const [restoreError, setRestoreError] = useState(null)
  const [restorePreview, setRestorePreview] = useState(null)
  const [restoreFileName, setRestoreFileName] = useState('')
  const fileRef = useRef(null)

  async function handleExport() {
    setBackupStep('generating'); setBackupError(null)
    try {
      const { data, error } = await supabase.rpc('export_all_data')
      if (error) throw error
      setBackupSummary({
        projects: data?.projects?.length ?? 0,
        tasks: data?.tasks?.length ?? 0,
        labels: data?.labels?.length ?? 0,
        members: data?.members?.length ?? 0,
      })
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setBackupStep('done')
    } catch (err) {
      setBackupError(err.message); setBackupStep('idle')
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) { setRestorePreview(null); setRestoreFileName(''); return }
    setRestoreFileName(file.name); setRestoreError(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object') throw new Error('expected an object')
        setRestorePreview({
          projects: data.projects?.length ?? 0,
          tasks: data.tasks?.length ?? 0,
          labels: data.labels?.length ?? 0,
        })
        setRestoreStep('preview')
      } catch (err) {
        setRestoreError('Invalid file: ' + err.message)
        setRestorePreview(null); setRestoreStep('idle')
      }
    }
    reader.readAsText(file)
  }

  async function handleRestore() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setRestoreStep('restoring'); setRestoreError(null)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const { error } = await supabase.rpc('restore_from_backup', { data })
      if (error) throw error
      setRestoreStep('done')
      fileRef.current.value = ''
    } catch (err) {
      setRestoreError(err.message)
      setRestoreStep('preview')
    }
  }

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-hover)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="var(--fg)">
              <path d="M7.47 10.78a.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0-1.06-1.06L8.5 8.44V1.75a.75.75 0 0 0-1.5 0v6.69L4.78 5.97a.75.75 0 0 0-1.06 1.06Z" />
              <path d="M2.75 10.5a.75.75 0 0 1 .75.75v1.5a.25.25 0 0 0 .25.25h8.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-1.5a.75.75 0 0 1 .75-.75" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Export data</p>
            <p className="text-xs text-[var(--fg-muted)]">Download all projects, tasks, and labels as JSON.</p>
          </div>
          <button onClick={handleExport} disabled={backupStep === 'generating'} className="btn btn-default !py-1.5 !text-xs">
            {backupStep === 'generating' ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exporting…
              </span>
            ) : 'Download'}
          </button>
        </div>
        {backupSummary && (
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-md bg-[var(--surface-hover)] p-2 text-xs text-[var(--fg-muted)]">
            <span>Projects <strong className="text-[var(--fg)]">{backupSummary.projects}</strong></span>
            <span>Tasks <strong className="text-[var(--fg)]">{backupSummary.tasks}</strong></span>
            <span>Labels <strong className="text-[var(--fg)]">{backupSummary.labels}</strong></span>
            <span>Members <strong className="text-[var(--fg)]">{backupSummary.members}</strong></span>
          </div>
        )}
        {backupError && <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{backupError}</p>}
      </div>

      {/* Import */}
      <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-hover)]">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="var(--fg)">
              <path d="M7.47 5.22a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L8.5 6.56v6.69a.75.75 0 0 1-1.5 0V6.56L4.78 10.03a.75.75 0 0 1-1.06-1.06Z" />
              <path d="M2.75 10.5a.75.75 0 0 1 .75.75v1.5a.25.25 0 0 0 .25.25h8.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-1.5a.75.75 0 0 1 .75-.75" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Import data</p>
            <p className="text-xs text-[var(--fg-muted)]">Upload a backup JSON file. Existing records are skipped.</p>
          </div>
        </div>
        <div className="mt-3">
          <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:px-3 file:py-1 file:text-sm file:font-medium file:bg-[var(--surface-hover)] file:text-[var(--fg)] hover:file:bg-[var(--card-hover)]" />
        </div>
        {restorePreview && restoreStep === 'preview' && (
          <div className="mt-3 rounded-md bg-[var(--surface-hover)] p-3">
            <p className="mb-1.5 text-xs font-medium text-[var(--fg)]">Found in <span className="font-mono">{restoreFileName}</span>:</p>
            <div className="mb-2 grid grid-cols-3 gap-1 text-xs text-[var(--fg-muted)]">
              <span>Projects <strong className="text-[var(--fg)]">{restorePreview.projects}</strong></span>
              <span>Tasks <strong className="text-[var(--fg)]">{restorePreview.tasks}</strong></span>
              <span>Labels <strong className="text-[var(--fg)]">{restorePreview.labels}</strong></span>
            </div>
            <button onClick={handleRestore} disabled={restoreStep === 'restoring'} className="btn btn-primary w-full justify-center !py-1.5 !text-xs">
              {restoreStep === 'restoring' ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Restoring…
                </span>
              ) : 'Restore from backup'}
            </button>
          </div>
        )}
        {restoreStep === 'done' && (
          <p className="mt-2 rounded-md border px-3 py-2 text-xs" style={{ color: 'var(--done)', borderColor: 'var(--done)', background: 'color-mix(in srgb, var(--done) 12%, transparent)' }}>
            Backup restored successfully. Existing records were skipped.
          </p>
        )}
        {restoreError && <p className="mt-2 text-xs" style={{ color: 'var(--danger)' }}>{restoreError}</p>}
      </div>
    </div>
  )
}

function StatusPill({ status }) {
  const styles = {
    pending: { color: 'var(--doing)', borderColor: 'var(--doing)' },
    accepted: { color: 'var(--done)', borderColor: 'var(--done)' },
    revoked: { color: 'var(--fg-subtle)', borderColor: 'var(--border)' },
  }
  return <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={styles[status]}>{status}</span>
}
