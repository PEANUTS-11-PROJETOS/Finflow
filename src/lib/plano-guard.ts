import { createClient } from '@/lib/supabase/server'
import { PLANOS, podeAdicionarCliente, type Plano } from '@/lib/planos'

export async function checkLimitePlano() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { permitido: false, plano: 'free' as Plano, totalClientes: 0, limite: 10 }

  const [{ data: credor }, { count }] = await Promise.all([
    supabase.from('credores').select('plano').eq('id', user.id).single(),
    supabase.from('clientes').select('*', { count: 'exact', head: true })
      .eq('credor_id', user.id).eq('ativo', true),
  ])

  const plano = (credor?.plano ?? 'free') as Plano
  const totalClientes = count ?? 0
  return {
    permitido: podeAdicionarCliente(plano, totalClientes),
    plano,
    totalClientes,
    limite: PLANOS[plano].clientes,
  }
}
