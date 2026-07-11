export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-16 w-64 rounded-lg bg-muted animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    </div>
  )
}
