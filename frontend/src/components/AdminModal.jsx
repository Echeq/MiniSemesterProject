import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import Avatar from './Avatar'
import { useMembers } from '../hooks/useMembers'
import { useInvitations } from '../hooks/useInvitations'
import LogViewer from './LogViewer'
import BackupPanel from './BackupPanel'
import RestorePanel from './RestorePanel'

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
    <Modal title={t('admin.title')} subtitle={t('admin.subtitle')} onClose={onClose} maxWidth="max-w-3xl">
      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-1">
        <TabButton active={tab === 'members'} onClick={() => setTab('members')}>{t('admin.members') || 'Members'}</TabButton>
        <TabButton active={tab === 'invites'} onClick={() => setTab('invites')}>{t('admin.invitations') || 'Invitations'}</TabButton>
        <TabButton active={tab === 'logs'} onClick={() => setTab('logs')}>{t('admin.logs') || 'Logs'}</TabButton>
        <TabButton active={tab === 'backup'} onClick={() => setTab('backup')}>{t('admin.backup') || 'Backup'}</TabButton>
        <TabButton active={tab === 'restore'} onClick={() => setTab('restore')}>{t('admin.restore') || 'Restore'}</TabButton>
      </div>
      {tab === 'members' && <Members session={session} />}
      {tab === 'invites' && <Invites />}
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

  async function toggle(m) {
    setBusyId(m.id)
    try {
      await setRole(m.id, m.role === 'admin' ? 'member' : 'admin')
    } catch (err) {
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner />

  return (
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
  const { invitations, loading, invite, revoke } = useInvitations()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function send(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await invite({ email: email.trim(), role })
      setEmail('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <form onSubmit={send} className="mb-3 flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" className="input" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input w-28">
          <option value="member">{t('admin.member')}</option>
          <option value="admin">{t('admin.admin')}</option>
        </select>
        <button disabled={busy} className="btn btn-primary">{busy ? t('admin.inviting') : t('admin.invite')}</button>
      </form>
      {error && <p className="mb-3 rounded-md border px-3 py-2 text-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', background: 'var(--danger-soft)' }}>{error}</p>}
      <p className="mb-3 text-xs text-[var(--fg-muted)]">
        The invited person gets their role automatically when they sign up with this email. Sending the actual email is out of scope — tell them to register.
      </p>

      {loading ? (
        <Spinner />
      ) : invitations.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--fg-muted)]">{t('admin.noInvitations')}</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-[var(--glass-border)] bg-[var(--card)] p-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{inv.email}</p>
                <p className="text-xs text-[var(--fg-subtle)]">{inv.role}</p>
              </div>
              <StatusPill status={inv.status} />
              {inv.status === 'pending' && (
                <button onClick={() => revoke(inv.id).catch((e) => alert(e.message))} className="btn btn-danger !py-1 !text-xs">{t('admin.revoke')}</button>
              )}
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
