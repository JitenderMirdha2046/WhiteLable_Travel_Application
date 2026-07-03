export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-lighter rounded-lg ${className}`}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-32 mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mt-4 pt-4 border-t border-surface-border">
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}
