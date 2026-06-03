'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { diasDoCiclo, type Ciclo } from '@/lib/planos'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Não autorizado')
}

function novaDataVencimento(vencimentoAtual: string | null, ciclo: Ciclo): string {
  const baseMs = vencimentoAtual
    ? Math.max(Date.now(), new Date(vencimentoAtual + 'T12:00:00').getTime())
    : Date.now()
  const nova = new Date(baseMs)
  nova.setDate(nova.getDate() + diasDoCiclo(ciclo))
  return nova.toISOString().split('T')[0]
}

export async function confirmarPagamento(credorId: string, ciclo: Ciclo) {
  await checkAdmin()
  const admin = createAdminClient()

  const { data: credor } = await admin
    .from('credores')
    .select('data_vencimento, plano')
    .eq('id', credorId)
    .single()

  const baseVenc = credor?.plano === 'ativo' ? credor.data_vencimento : null

  await admin
    .from('credores')
    .update({
      plano: 'ativo',
      ciclo_plano: ciclo,
      pagamento_confirmado: true,
      data_vencimento: novaDataVencimento(baseVenc, ciclo),
    })
    .eq('id', credorId)

  revalidatePath('/admin')
}

export async function reverterParaTrial(credorId: string) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin
    .from('credores')
    .update({
      plano: 'trial',
      ciclo_plano: null,
      pagamento_confirmado: false,
      data_vencimento: null,
    })
    .eq('id', credorId)
  revalidatePath('/admin')
}

export async function toggleCredorAtivo(credorId: string, ativo: boolean) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin.from('credores').update({ ativo }).eq('id', credorId)
  revalidatePath('/admin')
}
