'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { estadoConta } from '@/lib/planos'

const whatsappSchema = z.object({
  telefone: z
    .string()
    .transform(v => v.replace(/\D/g, ''))
    .refine(v => v.length >= 10 && v.length <= 11, 'Número inválido — use o formato (11) 99999-9999'),
  whatsapp_notificacoes: z.boolean(),
})

export async function salvarConfigWhatsapp(data: {
  telefone: string
  whatsapp_notificacoes: boolean
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: credor } = await supabase
    .from('credores')
    .select('plano, created_at, data_vencimento')
    .eq('id', user.id)
    .single()

  if (!credor || estadoConta(credor.plano, credor.created_at, credor.data_vencimento) === 'expirado') {
    return { error: 'Conta expirada — renove para receber notificações' }
  }

  const parsed = whatsappSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('credores')
    .update({
      telefone: parsed.data.telefone,
      whatsapp_notificacoes: parsed.data.whatsapp_notificacoes,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/configuracoes')
  return { success: true }
}
