import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
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
    <>
      <DashboardShell header={<Header />}>
        {children}
      </DashboardShell>
      <Toaster richColors position="top-right" />
    </>
  )
}
