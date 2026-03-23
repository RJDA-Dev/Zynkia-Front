const presets = {
  laptop: { icon: 'laptop_mac', gradient: 'from-slate-700 via-slate-800 to-slate-900', label: 'Laptop' },
  monitor: { icon: 'desktop_windows', gradient: 'from-blue-700 via-blue-800 to-blue-900', label: 'Monitor' },
  phone: { icon: 'smartphone', gradient: 'from-purple-700 via-purple-800 to-purple-900', label: 'Phone' },
  keyboard: { icon: 'keyboard', gradient: 'from-zinc-600 via-zinc-700 to-zinc-800', label: 'Keyboard' },
  mouse: { icon: 'mouse', gradient: 'from-zinc-600 via-zinc-700 to-zinc-800', label: 'Mouse' },
  headset: { icon: 'headset_mic', gradient: 'from-indigo-700 via-indigo-800 to-indigo-900', label: 'Headset' },
  tablet: { icon: 'tablet_mac', gradient: 'from-teal-700 via-teal-800 to-teal-900', label: 'Tablet' },
  printer: { icon: 'print', gradient: 'from-gray-600 via-gray-700 to-gray-800', label: 'Printer' },
  chair: { icon: 'chair', gradient: 'from-amber-700 via-amber-800 to-amber-900', label: 'Chair' },
  generic: { icon: 'inventory_2', gradient: 'from-slate-600 via-slate-700 to-slate-800', label: 'Asset' },
  avatar: { icon: 'person', gradient: 'from-primary via-teal-700 to-teal-900', label: '' },
  building: { icon: 'domain', gradient: 'from-sky-700 via-sky-800 to-sky-900', label: 'Office' },
  document: { icon: 'description', gradient: 'from-amber-600 via-amber-700 to-amber-800', label: 'Document' },
  chart: { icon: 'monitoring', gradient: 'from-emerald-700 via-emerald-800 to-emerald-900', label: 'Report' },
}

function resolvePreset(category) {
  if (!category) return presets.generic
  const key = category.toLowerCase()
  if (key.includes('laptop') || key.includes('portátil') || key.includes('notebook')) return presets.laptop
  if (key.includes('monitor') || key.includes('pantalla') || key.includes('display')) return presets.monitor
  if (key.includes('phone') || key.includes('celular') || key.includes('móvil')) return presets.phone
  if (key.includes('keyboard') || key.includes('teclado')) return presets.keyboard
  if (key.includes('mouse') || key.includes('ratón')) return presets.mouse
  if (key.includes('headset') || key.includes('audífono') || key.includes('diadema')) return presets.headset
  if (key.includes('tablet') || key.includes('ipad')) return presets.tablet
  if (key.includes('print') || key.includes('impresora')) return presets.printer
  if (key.includes('chair') || key.includes('silla')) return presets.chair
  return presets[key] || presets.generic
}

export default function MockImage({ src, alt, category, preset, className = '', size = 'md' }) {
  if (src) return <img src={src} alt={alt} className={`object-cover ${className}`} />

  const p = preset ? (presets[preset] || presets.generic) : resolvePreset(category)
  const sizeMap = { sm: 'text-[28px]', md: 'text-[40px]', lg: 'text-[56px]' }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br ${p.gradient} ${className}`}>
      <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-sm">
        <span className={`material-symbols-outlined ${sizeMap[size]} text-white/90`}>{p.icon}</span>
      </div>
      {p.label && <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">{p.label}</span>}
    </div>
  )
}

export { presets, resolvePreset }
