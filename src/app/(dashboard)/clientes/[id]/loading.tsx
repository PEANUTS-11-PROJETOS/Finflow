import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-3 max-w-lg">
        <Skeleton className="h-5 w-24" />
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    </div>
  )
}
