import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { checkLimitePlano } from '@/lib/plano-guard'
import { FormCliente } from '@/components/dashboard/form-cliente'
import { BannerLimite } from '@/components/dashboard/banner-limite'

export default async function NovoClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const limite = await checkLimitePlano()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo cliente</h1>
        <p className="text-sm text-muted-foreground mt-1">Preencha os dados do cliente devedor.</p>
      </div>

      {!limite.permitido ? (
        <BannerLimite plano={limite.plano} totalClientes={limite.totalClientes} />
      ) : (
        <FormCliente />
      )}
    </div>
  )
}
