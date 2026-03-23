export default function InfoCell({ label, value, className = '' }) {
  return (
    <div className={`ui-cell ${className}`}>
      <p className="ui-cell-label">{label}</p>
      <p className="ui-cell-value">{value}</p>
    </div>
  )
}
