import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Toaster } from '@/components/ui/sonner'
import { trialExpirado } from '@/lib/planos'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.email === ADMIN_EMAIL) redirect('/admin')

  const { data: credor } = await supabase
    .from('credores')
    .select('ativo, plano, created_at')
    .eq('id', user.id)
    .single()

  if (credor?.ativo === false) {
    const diasCadastrado = credor.created_at
      ? (Date.now() - new Date(credor.created_at).getTime()) / 86400000
      : 99
    redirect(diasCadastrado < 1 ? '/aguardando-aprovacao' : '/conta-desativada')
  }
  if (credor && trialExpirado(credor.plano, credor.created_at)) redirect('/upgrade')

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}
