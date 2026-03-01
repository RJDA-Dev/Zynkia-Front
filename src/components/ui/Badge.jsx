const colors = {
  primary: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  success: 'bg-green-50 text-green-700 ring-green-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-700/10',
  purple: 'bg-purple-50 text-purple-700 ring-purple-700/10',
  teal: 'bg-teal-50 text-teal-700 ring-teal-700/10',
  neutral: 'bg-gray-100 text-gray-800 ring-gray-500/10',
}

export default function Badge({ color = 'primary', dot, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]}`}>
      {dot && <span className={`size-1.5 rounded-full bg-current`} />}
      {children}
    </span>
  )
}
