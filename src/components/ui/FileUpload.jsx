import { useRef } from 'react'

export default function FileUpload({ onFiles, accept = '.pdf,.png,.jpg,.svg', maxSize = '5MB' }) {
  const ref = useRef()

  const handleChange = (e) => onFiles?.(Array.from(e.target.files))
  const handleDrop = (e) => { e.preventDefault(); onFiles?.(Array.from(e.dataTransfer.files)) }

  return (
    <div
      onClick={() => ref.current?.click()}
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      className="border-2 border-dashed border-gray-200 hover:border-primary bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
    >
      <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
      </div>
      <p className="text-gray-900 font-medium text-sm">Haga clic para subir o arrastre y suelte</p>
      <p className="text-gray-400 text-xs mt-1">{accept.replace(/\./g, '').toUpperCase()} (max. {maxSize})</p>
      <input ref={ref} type="file" accept={accept} multiple onChange={handleChange} className="hidden" />
    </div>
  )
}
