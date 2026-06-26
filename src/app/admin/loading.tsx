import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array(7).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-10 w-full" />
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    </div>
  )
}
