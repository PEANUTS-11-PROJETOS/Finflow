'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAIL = 'soaresvinicius11112@gmail.com'

async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) throw new Error('Não autorizado')
}

export async function alterarPlano(credorId: string, plano: string, ciclo: string | null) {
  await checkAdmin()
  const admin = createAdminClient()

  let data_vencimento: string | null = null
  if (plano !== 'free' && ciclo) {
    const d = new Date()
    d.setDate(d.getDate() + (ciclo === 'anual' ? 365 : 30))
    data_vencimento = d.toISOString().split('T')[0]
  }

  await admin
    .from('credores')
    .update({ plano, ciclo_plano: plano === 'free' ? null : ciclo, data_vencimento })
    .eq('id', credorId)

  revalidatePath('/admin')
}

export async function toggleCredorAtivo(credorId: string, ativo: boolean) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin.from('credores').update({ ativo }).eq('id', credorId)
  revalidatePath('/admin')
}

export async function togglePagamento(credorId: string, pago: boolean) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin.from('credores').update({ pagamento_confirmado: pago }).eq('id', credorId)
  revalidatePath('/admin')
}
