import { useEffect } from 'react'

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong w-full max-w-sm rounded-2xl p-6 shadow-xl animate-pop-in">
        <h3 className="text-lg font-semibold">{title}</h3>
        {message && <p className="mt-2 text-sm text-[var(--fg-muted)]">{message}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn btn-default">{cancelLabel || 'Cancel'}</button>
          <button type="button" onClick={onConfirm} className={danger ? 'btn btn-danger' : 'btn btn-primary'}>{confirmLabel || 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
