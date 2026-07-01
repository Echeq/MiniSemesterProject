import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function ProjectMenu({ project, isAdmin, onEditProject, onAddMember, onClose }) {
  const { t } = useTranslation()
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (isAdmin) {
    return (
      <div
        ref={menuRef}
        className="absolute left-0 top-full z-50 mt-1 w-56 animate-pop-in rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-lg sm:left-0"
      >
        <button
          onClick={() => { onEditProject(project); onClose() }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)] sm:py-2"
        >
          <svg className="h-4 w-4 shrink-0 text-[var(--fg-muted)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Z" />
          </svg>
          {t('project.menuEdit')}
        </button>
        <button
          onClick={() => { onAddMember(project); onClose() }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)] sm:py-2"
        >
          <svg className="h-4 w-4 shrink-0 text-[var(--fg-muted)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.5 1.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm4 6a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm-6 5.25c0-1.355.948-2.5 2.25-2.5h1.5c.4 0 .762.1 1.083.276a3.2 3.2 0 0 0-.083.724c0 .628.163 1.222.45 1.739-.45.168-.94.261-1.45.261h-1.5c-.831 0-1.5-.56-1.5-1.25Zm8.25-5.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm.75 3.5a.75.75 0 0 0-1.5 0v1.5h-1.5a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5h-1.5v-1.5Z" />
          </svg>
          {t('project.menuAddMember')}
        </button>
        <hr className="my-1 border-[var(--border)]" />
        <button
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)] sm:py-2"
        >
          <svg className="h-4 w-4 shrink-0 text-[var(--fg-muted)]" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
          </svg>
          {t('project.menuCancel')}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-full z-50 mt-1 w-72 animate-pop-in rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg sm:left-0 sm:w-80"
    >
      <p className="mb-1 text-sm font-semibold text-[var(--fg)]">{project.name}</p>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-[var(--fg-muted)]">
        {project.description || t('project.noDescription')}
      </p>
    </div>
  )
}
