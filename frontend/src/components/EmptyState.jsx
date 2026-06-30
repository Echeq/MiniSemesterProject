const ICONS = {
  inbox:
    'M2.8 2.06A1.75 1.75 0 0 1 4.41 1h7.18c.7 0 1.333.417 1.61 1.06l2.74 6.395c.04.093.06.194.06.295v4.5A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25v-4.5c0-.101.02-.202.06-.295Zm1.61.44a.25.25 0 0 0-.23.152L1.887 8H4.75a.75.75 0 0 1 .6.3L6.625 10h2.75l1.275-1.7a.75.75 0 0 1 .6-.3h2.863L11.82 2.652a.25.25 0 0 0-.23-.152Z',
  project:
    'M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0M1.5 1.75v12.5c0 .138.112.25.25.25h2.875V1.5H1.75a.25.25 0 0 0-.25.25m4.625-.25v13h2.875v-13zm4.375 0v13h2.875a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25z',
  check:
    'M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z',
  search:
    'M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z',
}

export default function EmptyState({ icon, title, description, action, compact }) {
  const path = icon ? ICONS[icon] || ICONS.inbox : null

  return (
    <div className={`flex ${compact ? 'min-h-[100px]' : 'min-h-[240px]'} items-center justify-center px-4`}>
      <div className="text-center">
        {icon && (
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ color: 'var(--fg-subtle)', background: 'var(--glass-border)' }}>
            <svg className="h-6 w-6" viewBox="0 0 16 16" fill="currentColor">
              <path d={path} />
            </svg>
          </span>
        )}
        {title && <h3 className="mt-3 text-sm font-semibold text-[var(--fg)]">{title}</h3>}
        {description && <p className="mt-1 text-xs text-[var(--fg-muted)]">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
