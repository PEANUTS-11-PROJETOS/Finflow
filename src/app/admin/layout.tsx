import { Toaster } from '@/components/ui/sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
