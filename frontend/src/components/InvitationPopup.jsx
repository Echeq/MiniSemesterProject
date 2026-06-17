import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'

export default function InvitationPopup({ userId, onClose }) {
  const { t } = useTranslation()
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { error } = await supabase.from('join_requests').insert({
        requester_id: userId,
        admin_email: adminEmail,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:rounded-xl"
      >
        <h2 className="mb-2 text-lg font-bold text-slate-800">{t('invitation.title')}</h2>

        {sent ? (
          <>
            <p className="mb-5 text-sm text-slate-600 leading-relaxed">
              {t('invitation.sent')}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors sm:rounded-lg sm:py-2.5"
            >
              {t('invitation.gotIt')}
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              {t('invitation.description')}
            </p>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">
                {t('invitation.adminEmail')}
              </span>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={t('invitation.adminPlaceholder')}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>
            {error && (
              <p className="mb-3 text-sm text-red-600">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors sm:rounded-lg sm:py-2.5"
              >
                {t('invitation.cancel')}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors sm:rounded-lg sm:py-2.5"
              >
                {busy ? t('invitation.sending') : t('invitation.requestAccess')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
