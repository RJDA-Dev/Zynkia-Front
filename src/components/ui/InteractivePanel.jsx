function supportsFinePointer() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(pointer: fine)').matches
}

export default function InteractivePanel({ children, className = '', active = false, onClick }) {
  const isInteractive = typeof onClick === 'function'

  const handleMove = (e) => {
    if (!supportsFinePointer()) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    e.currentTarget.style.setProperty('--panel-rx', `${((0.5 - (y / rect.height)) * 8).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--panel-ry', `${(((x / rect.width) - 0.5) * 9).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--panel-shift', active ? '-8px' : '-4px')
    e.currentTarget.style.setProperty('--panel-mx', `${Math.round((x / rect.width) * 100)}%`)
    e.currentTarget.style.setProperty('--panel-my', `${Math.round((y / rect.height) * 100)}%`)
  }

  const handleLeave = (e) => {
    e.currentTarget.style.setProperty('--panel-rx', '0deg')
    e.currentTarget.style.setProperty('--panel-ry', '0deg')
    e.currentTarget.style.setProperty('--panel-shift', active ? '-4px' : '0px')
    e.currentTarget.style.setProperty('--panel-mx', '50%')
    e.currentTarget.style.setProperty('--panel-my', '0%')
  }

  const baseClass = `group relative isolate overflow-hidden rounded-[--radius-md] sm:rounded-[--radius-lg] transition-[transform,box-shadow,border-color,background-color] duration-300 will-change-transform sm:[transform:perspective(1200px)_rotateX(var(--panel-rx,0deg))_rotateY(var(--panel-ry,0deg))_translateY(var(--panel-shift,0px))] ${
    active
      ? 'shadow-[0_20px_50px_rgba(15,23,42,0.12)]'
      : 'shadow-[0_12px_28px_rgba(15,23,42,0.06)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]'
  } ${isInteractive ? 'cursor-pointer' : ''} ${className}`

  const content = (
    <>
      <div className="pointer-events-none absolute inset-0 rounded-[--radius-md] sm:rounded-[--radius-lg] opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden sm:block" style={{ background: 'radial-gradient(circle at var(--panel-mx,50%) var(--panel-my,0%), rgba(255,255,255,0.34), transparent 38%)' }} />
      <div className="pointer-events-none absolute inset-0 rounded-[--radius-md] sm:rounded-[--radius-lg] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.52),_transparent_42%)] opacity-75" />
      <div className="pointer-events-none absolute inset-x-[-45%] top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-beam-sweep hidden sm:block" />
      <div className="relative z-10">{children}</div>
    </>
  )

  if (!isInteractive) {
    return (
      <div className={baseClass} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ '--panel-shift': active ? '-4px' : '0px' }}>
        {content}
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave} className={baseClass} style={{ '--panel-shift': active ? '-4px' : '0px' }}>
      {content}
    </button>
  )
}
