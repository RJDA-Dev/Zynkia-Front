export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <svg className="h-8 w-8 animate-spin" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" className="text-primary/15" />
        <path d="M44 24c0-11.046-8.954-20-20-20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-primary" />
      </svg>
    </div>
  )
}
