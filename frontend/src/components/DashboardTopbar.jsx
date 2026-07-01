import { memo } from 'react'
import ThemeToggle from './ThemeToggle'
import ProfileMenu from './ProfileMenu'
import NotificationBell from './NotificationBell'

const DashboardTopbar = memo(function DashboardTopbar({
  session,
  profile,
  isAdmin,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  onOpenAccount,
  onOpenAdmin,
  onMenuOpen,
  taskCount = 0,
  overdueCount = 0,
}) {
  const displayName = profile?.display_name || session?.user?.email?.split('@')[0] || 'User'

  return (
    <header className="relative flex items-center justify-between gap-3 border-b border-[var(--glass-border)] bg-[var(--glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onToggleMobileSidebar}
          className="btn btn-default !px-2 md:!hidden sidebar-toggle"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-[var(--fg)]">
            Welcome, <span className="text-[var(--accent)]">{displayName}</span>
          </h1>
          <p className="text-xs text-[var(--fg-muted)] truncate">
            {taskCount} task{taskCount !== 1 ? 's' : ''}{' '}
            {overdueCount > 0 && (
              <span className="text-[var(--danger)]">· {overdueCount} overdue</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <NotificationBell userId={session?.user?.id} onOpen={onMenuOpen} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <ProfileMenu
          profile={profile}
          email={session?.user?.email}
          isAdmin={isAdmin}
          onOpenAccount={onOpenAccount}
          onOpenAdmin={onOpenAdmin}
          onOpen={onMenuOpen}
        />
      </div>
    </header>
  )
})

export default DashboardTopbar
