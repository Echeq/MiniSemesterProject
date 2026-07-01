import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'
import Avatar from './Avatar'

export default function ProjectInfoModal({ project, onClose }) {
  const { t } = useTranslation()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from('project_members')
      .select('id, user_id, role, profile:profiles!project_members_user_id_fkey(display_name, avatar_url)')
      .eq('project_id', project.id)
    setMembers(data ?? [])
    setLoading(false)
  }, [project.id])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  return (
    <Modal title={project.name} onClose={onClose}>
      <div className="flex flex-col gap-4 break-words">
        {project.description?.trim() && (
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-sm text-[var(--fg-muted)] leading-relaxed whitespace-pre-wrap break-words max-h-[180px] overflow-y-auto">
            {project.description}
          </p>
        )}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">
            {t('admin.members')} ({members.length})
          </span>
          {loading ? (
            <p className="py-3 text-center text-sm text-[var(--fg-muted)]">{t('profile.loading')}</p>
          ) : members.length === 0 ? (
            <p className="py-3 text-center text-sm text-[var(--fg-muted)]">{t('sidebar.noMembers')}</p>
          ) : (
            <div className="flex flex-col gap-1">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                  <Avatar name={m.profile?.display_name} url={m.profile?.avatar_url} size="sm" />
                  <span className="flex-1 text-sm">{m.profile?.display_name}</span>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] font-semibold text-[var(--fg-muted)]">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button type="button" onClick={onClose} className="btn btn-default">{t('task.close')}</button>
        </div>
      </div>
    </Modal>
  )
}
