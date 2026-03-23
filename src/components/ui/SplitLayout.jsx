export default function SplitLayout({ sidebar, children }) {
  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {sidebar}
      {children}
    </div>
  )
}
