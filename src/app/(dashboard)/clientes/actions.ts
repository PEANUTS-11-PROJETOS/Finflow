'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  nome:     z.string().min(2, 'Nome obrigatório'),
  cpf:      z.string().optional(),
  telefone: z.string().optional(),
  email:    z.string().email('Email inválido').optional().or(z.literal('')),
})

type ClienteInput = z.infer<typeof schema>

export async function criarCliente(data: ClienteInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data: novo, error } = await supabase.from('clientes').insert({
    ...parsed.data,
    email: parsed.data.email || null,
    credor_id: user.id,
  }).select('id, nome').single()
  if (error) return { error: error.message }

  revalidatePath('/clientes')
  return { success: true, id: novo.id, nome: novo.nome }
}

export async function atualizarCliente(id: string, data: ClienteInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabase.from('clientes')
    .update({ ...parsed.data, email: parsed.data.email || null })
    .eq('id', id)
    .eq('credor_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
  return { success: true }
}

export async function desativarCliente(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('clientes')
    .update({ ativo: false })
    .eq('id', id)
    .eq('credor_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/clientes')
  return { success: true }
}
