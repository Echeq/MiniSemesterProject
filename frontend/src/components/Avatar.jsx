const GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
]

const _gradientCache = new Map()

function pickGradient(seed = '') {
  if (_gradientCache.has(seed)) return _gradientCache.get(seed)
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const result = GRADIENTS[Math.abs(hash) % GRADIENTS.length]
  _gradientCache.set(seed, result)
  return result
}

const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }
const DIMS = { xs: 24, sm: 32, md: 40, lg: 64 }

export default function Avatar({ name = '', url = null, size = 'md', ring = false }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const base = `relative inline-flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZES[size]} ${
    ring ? 'ring-2 ring-[var(--border)]' : ''
  }`

  if (url) {
    const dim = DIMS[size] || 40
    return <img src={url} alt={name} width={dim} height={dim} className={`${base} object-cover`} />
  }
  return (
    <span className={`${base} bg-gradient-to-br ${pickGradient(name)}`}>
      {initials || '?'}
    </span>
  )
}
