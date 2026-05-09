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

export async function alterarPlano(credorId: string, plano: string) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin.from('credores').update({ plano }).eq('id', credorId)
  revalidatePath('/admin')
}

export async function toggleCredorAtivo(credorId: string, ativo: boolean) {
  await checkAdmin()
  const admin = createAdminClient()
  await admin.from('credores').update({ ativo }).eq('id', credorId)
  revalidatePath('/admin')
}
