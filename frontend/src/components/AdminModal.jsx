import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import Avatar from './Avatar'
import { useMembers } from '../hooks/useMembers'
import LogViewer from './LogViewer'
import BackupPanel from './BackupPanel'
import RestorePanel from './RestorePanel'
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
        <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>{t('admin.logs') || 'Logs'}</TabButton>
        <TabButton active={tab === 'backup'} onClick={() => setTab('backup')}>{t('admin.backup') || 'Backup'}</TabButton>
        <TabButton active={tab === 'restore'} onClick={() => setTab('restore')}>{t('admin.restore') || 'Restore'}</TabButton>
      </div>
      {tab === 'members' && <Members session={session} />}
      {tab === 'access' && <Access onApproved={(name) => setMsg(`✅ ${name} has been accepted, now a member.`)} />}
      {tab === 'emailChanges' && <EmailChanges />}
      {tab === 'logs' && <LogViewer />}
      {tab === 'backup' && <BackupPanel />}
      {tab === 'restore' && <RestorePanel />}
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
      {!isSelf && (
        <select
          value={m.role}
          onChange={(e) => onRoleChange(m.id, e.target.value)}
          disabled={busyId === m.id}
          className="input w-24 !py-1 !text-xs"
        >
          <option value="admin">admin</option>
          <option value="member">member</option>
          <option value="unknown">unknown</option>
        </select>
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

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return members.filter((m) =>
      m.display_name?.toLowerCase().includes(q)
    ).slice(0, 8)
  }, [members, query])

  async function assign(userId, role) {
    setBusyId(userId)
    setError(null)
    try {
      await setRole(userId, role)
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

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Search & assign role</p>
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="input"
        />
      </div>

      {query.trim() && filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--fg-muted)]">No accounts found.</p>
      ) : query.trim() ? (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {filtered.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
              <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.display_name}</p>
                <p className="text-xs text-[var(--fg-subtle)]">{m.role}</p>
              </div>
              <select
                value={m.role}
                onChange={(e) => assign(m.id, e.target.value)}
                disabled={busyId === m.id}
                className="input w-24 !py-1 !text-xs"
              >
                <option value="unknown">unknown</option>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">Type a name or email to find an account and assign a role.</p>
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

function StatusPill({ status }) {
  const styles = {
    pending: { color: 'var(--doing)', borderColor: 'var(--doing)' },
    accepted: { color: 'var(--done)', borderColor: 'var(--done)' },
    revoked: { color: 'var(--fg-subtle)', borderColor: 'var(--border)' },
  }
  return <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={styles[status]}>{status}</span>
}
