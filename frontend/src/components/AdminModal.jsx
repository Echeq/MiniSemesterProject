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
  return (
    <Modal title={t('admin.title')} subtitle={t('admin.subtitle')} onClose={onClose} maxWidth="max-w-lg">
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-1">
        <TabButton active={tab === 'members'} onClick={() => setTab('members')}>{t('admin.members') || 'Members'}</TabButton>
        <TabButton active={tab === 'invites'} onClick={() => setTab('invites')}>{t('admin.invitations') || 'Invitations'}</TabButton>
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>Requests</TabButton>
        <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>{t('admin.logs') || 'Logs'}</TabButton>
        <TabButton active={tab === 'backup'} onClick={() => setTab('backup')}>{t('admin.backup') || 'Backup'}</TabButton>
        <TabButton active={tab === 'restore'} onClick={() => setTab('restore')}>{t('admin.restore') || 'Restore'}</TabButton>
      </div>
      {tab === 'members' && <Members session={session} />}
      {tab === 'invites' && <Invites />}
      {tab === 'requests' && <JoinRequests />}
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

function Members({ session }) {
  const { t } = useTranslation()
  const { members, loading, setRole } = useMembers()
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  async function toggle(m) {
    setBusyId(m.id)
    setError(null)
    try {
      await setRole(m.id, m.role === 'admin' ? 'member' : 'admin')
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
      {members.map((m) => {
        const isSelf = m.id === session.user.id
        return (
          <div key={m.id} className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
            <Avatar name={m.display_name} url={m.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.display_name} {isSelf && <span className="text-xs text-[var(--fg-subtle)]">({t('sidebar.you')})</span>}
              </p>
            </div>
            <span className="rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={rolePill(m.role)}>{m.role}</span>
            <button
              onClick={() => toggle(m)}
              disabled={isSelf || busyId === m.id}
              title={isSelf ? "You can't change your own role" : ''}
              className="btn btn-default !py-1 !text-xs"
            >
              {m.role === 'admin' ? t('admin.demote') : t('admin.promote')}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Invites() {
  const { t } = useTranslation()
  const { members, setRole } = useMembers()
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

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

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="input"
          autoFocus
        />
      </div>
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}

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

function JoinRequests() {
  const { t } = useTranslation()
  const { setRole } = useMembers()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('join_requests')
      .select('id, requester_id, admin_email, status, created_at, profile:profiles!join_requests_requester_id_fkey(display_name, avatar_url)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function approve(r) {
    setBusyId(r.id)
    try {
      await setRole(r.requester_id, 'member')
      await supabase.from('join_requests').update({ status: 'resolved' }).eq('id', r.id)
      await fetchRequests()
    } catch (err) {
      alert(err.message)
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
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="mb-3 text-xs text-[var(--fg-muted)]">
        Users with the "unknown" role who have requested access to the board.
      </p>
      {requests.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">No pending requests.</p>
      ) : (
        <div className="max-h-80 space-y-1.5 overflow-y-auto">
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
