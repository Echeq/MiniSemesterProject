import { useRef, useState } from 'react'

export default function ProfileSettings({
  profile,
  email,
  onUpdate,
  onUploadAvatar,
  onChangePassword,
  onClose,
}) {
  const fileRef = useRef(null)
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [busy, setBusy] = useState(false)

  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be 2MB or less')
      return
    }
    setError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      if (avatarFile) {
        await onUploadAvatar(avatarFile)
      }
      if (displayName !== (profile?.display_name ?? '')) {
        await onUpdate({ display_name: displayName })
      }
      setSuccess('Profile updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    setPasswordBusy(true)
    try {
      await onChangePassword(oldPassword, newPassword)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password changed')
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 modal-overlay sm:flex sm:items-center sm:justify-center sm:bg-black/40 sm:px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-panel sm:sheet-panel-none flex h-full flex-col bg-white sm:max-h-[90vh] sm:w-full sm:max-w-md sm:rounded-xl sm:shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-bold text-slate-800">Profile Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 sm:p-1"
          >
            <svg className="h-6 w-6 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
          )}

          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="relative">
              {avatarPreview || avatarUrl ? (
                <img
                  src={avatarPreview || avatarUrl}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200"
                />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white ring-2 ring-slate-200">
                  {(profile?.display_name ?? '?')[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors"
            >
              {avatarUrl || avatarPreview ? 'Change photo' : 'Upload photo'}
            </button>
            <p className="text-xs text-slate-400">PNG, JPG, GIF or WebP • 2MB max</p>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-600">Display name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all sm:rounded-lg sm:px-3 sm:py-2"
            />
          </label>

          <div className="mb-6">
            <span className="mb-1.5 block text-sm font-semibold text-slate-600">Email</span>
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:rounded-lg sm:px-3 sm:py-2">
              {email}
            </p>
          </div>

          <div className="mb-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors sm:rounded-lg sm:px-4 sm:py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-colors sm:rounded-lg sm:px-4 sm:py-2"
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>

          <hr className="my-6 border-slate-200" />

          <h3 className="mb-4 text-sm font-bold text-slate-700">Change password</h3>

          <form onSubmit={handlePasswordChange}>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">Current password</span>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">New password</span>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-600">Confirm new password</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all sm:rounded-lg sm:px-3 sm:py-2"
              />
            </label>

            {passwordError && (
              <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 sm:rounded-lg sm:px-3 sm:py-2">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="mb-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 sm:rounded-lg sm:px-3 sm:py-2">{passwordSuccess}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordBusy}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-colors sm:rounded-lg sm:px-4 sm:py-2"
              >
                {passwordBusy ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
