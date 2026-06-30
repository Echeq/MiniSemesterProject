import { useState } from 'react'
import ProjectSettingsModal from './ProjectSettingsModal'

export default function ProjectActionSheet({ project, projectActions, onClose }) {
  const [showSettings, setShowSettings] = useState(null)

  if (showSettings) {
    return (
      <ProjectSettingsModal
        project={project}
        initialTab={showSettings}
        onUpdate={(id, fields) => { projectActions.update(id, fields); setShowSettings(null); onClose() }}
        onClose={() => { setShowSettings(null); onClose() }}
      />
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up rounded-t-2xl bg-[var(--card)] p-5 pb-8 shadow-lg sm:inset-auto sm:left-6 sm:top-14 sm:w-56 sm:rounded-xl sm:p-2 sm:animate-pop-in sm:shadow-xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--glass-border)] sm:hidden" />

        <p className="mb-3 text-center text-sm font-semibold sm:text-left">{project.name}</p>

        <div className="space-y-0.5">
          <ActionButton icon="gear" onClick={() => setShowSettings('settings')}>
            Edit Project
          </ActionButton>
          <ActionButton icon="personAdd" onClick={() => setShowSettings('members')}>
            Add Member
          </ActionButton>
        </div>

        <button onClick={onClose} className="btn btn-default mt-4 w-full justify-center sm:hidden">Cancel</button>
      </div>
    </>
  )
}

function ActionButton({ icon, onClick, children }) {
  const paths = {
    gear: 'M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0m5.21-5.72-.664-.248-.412-1.344A1 1 0 0 0 8.19 0H7.81a1 1 0 0 0-.944.688l-.412 1.344-.664.248-1.362-.701a1 1 0 0 0-1.236.435l-.19.33a1 1 0 0 0 .16 1.22l.957.998-.006.712-.957.998a1 1 0 0 0-.16 1.22l.19.33a1 1 0 0 0 1.236.434l1.362-.7.664.247.412 1.345a1 1 0 0 0 .944.688h.38a1 1 0 0 0 .944-.688l.412-1.344.664-.248 1.362.701a1 1 0 0 0 1.236-.435l.19-.33a1 1 0 0 0-.16-1.22l-.957-.998v-.712l.957-.998A1 1 0 0 0 13.58 2.6l-.19-.33a1 1 0 0 0-1.236-.435Z',
    personAdd: 'M10.561 8.073a6 6 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6 6 0 0 1 3.431-5.142 4 4 0 1 1 5.123 0ZM8 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12.25 3a.75.75 0 0 1 .75.75V5h1.25a.75.75 0 0 1 0 1.5H13v1.25a.75.75 0 0 1-1.5 0V6.5h-1.25a.75.75 0 0 1 0-1.5H11.5V3.75a.75.75 0 0 1 .75-.75Z',
  }
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-hover)]">
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d={paths[icon]} /></svg>
      {children}
    </button>
  )
}
