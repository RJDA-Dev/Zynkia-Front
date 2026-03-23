import { useRef } from 'react'
import { useLang } from '../../context/LangContext'

export default function FileUpload({ onFiles, accept = '.pdf,.png,.jpg,.svg', maxSize = '5MB' }) {
  const ref = useRef()
  const { lang } = useLang()
  const es = lang === 'es'

  const handleChange = (e) => onFiles?.(Array.from(e.target.files))
  const handleDrop = (e) => { e.preventDefault(); onFiles?.(Array.from(e.dataTransfer.files)) }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[--radius-md] border border-dashed border-slate-300 bg-[linear-gradient(145deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.94))] p-6 sm:p-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]"
    >
      <div className="pointer-events-none absolute inset-x-[-40%] top-0 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-beam-sweep" />
      <div className="mb-3 rounded-full bg-[linear-gradient(135deg,_rgba(15,118,110,0.16),_rgba(255,255,255,0.96))] p-3 shadow-sm transition-transform duration-300 group-hover:scale-110">
        <span className="material-symbols-outlined text-2xl sm:text-3xl text-primary">upload_file</span>
      </div>
      <p className="text-sm font-semibold text-slate-900">{es ? 'Toca para subir o arrastra' : 'Tap to upload or drag & drop'}</p>
      <p className="mt-1 text-xs text-slate-400">{accept.replace(/\./g, '').toUpperCase()} · {es ? 'máx.' : 'max'} {maxSize}</p>
      <input ref={ref} type="file" accept={accept} multiple onChange={handleChange} className="hidden" />
    </div>
  )
}
