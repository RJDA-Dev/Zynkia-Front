import { formLabelClass, formTextareaClass } from './formStyles'

export default function Textarea({ label, className = '', rows = 4, ...props }) {
  return (
    <div className={className}>
      {label && <label className={formLabelClass}>{label}</label>}
      <textarea
        rows={rows}
        className={formTextareaClass}
        {...props}
      />
    </div>
  )
}
