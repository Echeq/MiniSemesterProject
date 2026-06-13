import { STATUSES } from '../hooks/useBoard'

const LABELS = { todo: 'To Do', doing: 'In progress', done: 'Done' }

export default function TaskActionSheet({ task, onEdit, onMove, onDelete, onClose }) {
  const otherStatuses = STATUSES.filter((s) => s !== task.status)

  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white px-6 pb-8 pt-4 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300" />

        <p className="mb-4 text-sm font-semibold text-slate-800">{task.title}</p>

        <button
          type="button"
          onClick={() => { onEdit(task); onClose() }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
        >
          <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>

        {otherStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => { onMove(task.id, { status }); onClose() }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            Move to {LABELS[status]}
          </button>
        ))}

        <hr className="my-2 border-slate-200" />

        <button
          type="button"
          onClick={() => { onDelete(task.id); onClose() }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100"
        >
          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}
