export default function Avatar({ src, name, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`} />
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium ring-2 ring-white`}>
      {initials}
    </div>
  )
}
