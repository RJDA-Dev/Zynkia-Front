import { getBadgeToneClass } from '../../config/uiTokens'

const sizeMap = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-xs',
}

export default function Badge({ color = 'primary', size = 'md', dot, icon, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset whitespace-nowrap ${getBadgeToneClass(color)} ${sizeMap[size]}`}>
      {dot && <span className="size-1.5 rounded-full bg-current animate-pulse" />}
      {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
      {children}
    </span>
  )
}
