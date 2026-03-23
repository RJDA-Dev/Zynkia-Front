const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const gradients = [
  'from-teal-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
]

function getGradient(name) {
  if (!name) return gradients[0]
  const code = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return gradients[code % gradients.length]
}

export default function Avatar({ src, name, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white shrink-0`} />
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${getGradient(name)} flex items-center justify-center text-white font-semibold ring-2 ring-white shrink-0 leading-none shadow-sm`}>
      {initials || '?'}
    </div>
  )
}
