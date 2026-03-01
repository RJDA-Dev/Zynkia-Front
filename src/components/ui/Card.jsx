export default function Card({ title, subtitle, badge, actions, className = '', children }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
