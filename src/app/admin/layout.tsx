import { Toaster } from '@/components/ui/sonner'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
