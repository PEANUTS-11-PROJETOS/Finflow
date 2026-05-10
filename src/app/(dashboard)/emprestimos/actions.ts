'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { calcularParcelas } from '@/lib/utils'

export async function criarEmprestimoAction(formData: FormData) {
  const tipo = formData.get('tipo') as string
  const cliente_id = (formData.get('cliente_id') as string) ?? ''
  const valor_principal = formData.get('valor_principal') as string
  const taxa_juros = formData.get('taxa_juros') as string
  const observacoes = (formData.get('observacoes') as string) || undefined

  if (!cliente_id) redirect(`/emprestimos/novo?tipo=${tipo}&erro=Selecione+um+cliente`)

  if (tipo === 'price') {
    const num_parcelas = formData.get('num_parcelas') as string
    const data_inicio  = formData.get('data_inicio') as string
    const result = await criarEmprestimo({ tipo: 'price', cliente_id, valor_principal: Number(valor_principal), taxa_juros: Number(taxa_juros), num_parcelas: Number(num_parcelas), data_inicio, observacoes })
    if (result.error) redirect(`/emprestimos/novo?tipo=price&erro=${encodeURIComponent(typeof result.error === 'string' ? result.error : 'Erro ao criar')}`)
    redirect(`/emprestimos/${result.id}`)
  } else {
    const data_vencimento = formData.get('data_vencimento') as string
    const result = await criarEmprestimo({ tipo: 'renovavel', cliente_id, valor_principal: Number(valor_principal), taxa_juros: Number(taxa_juros), data_vencimento, observacoes })
    if (result.error) redirect(`/emprestimos/novo?tipo=renovavel&erro=${encodeURIComponent(typeof result.error === 'string' ? result.error : 'Erro ao criar')}`)
    redirect(`/emprestimos/${result.id}`)
  }
}

// ─── Tabela Price ──────────────────────────────────────────────────────────────

const schemaPrice = z.object({
  tipo:            z.literal('price'),
  cliente_id:      z.string().uuid('Selecione um cliente'),
  valor_principal: z.coerce.number().positive('Informe o valor'),
  taxa_juros:      z.coerce.number().min(0, 'Taxa inválida'),
  num_parcelas:    z.coerce.number().int().min(1).max(360),
  data_inicio:     z.string().min(1, 'Informe a data'),
  observacoes:     z.string().optional(),
})

// ─── Renovável ────────────────────────────────────────────────────────────────

const schemaRenovavel = z.object({
  tipo:            z.literal('renovavel'),
  cliente_id:      z.string().uuid('Selecione um cliente'),
  valor_principal: z.coerce.number().positive('Informe o valor'),
  taxa_juros:      z.coerce.number().min(0, 'Taxa inválida'),
  data_vencimento: z.string().min(1, 'Informe o vencimento'),
  observacoes:     z.string().optional(),
})

const schemaEmprestimo = z.discriminatedUnion('tipo', [schemaPrice, schemaRenovavel])
type EmprestimoInput = z.infer<typeof schemaEmprestimo>

export async function criarEmprestimo(data: EmprestimoInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const parsed = schemaEmprestimo.safeParse(data)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  if (parsed.data.tipo === 'price') {
    const { cliente_id, valor_principal, taxa_juros, num_parcelas, data_inicio, observacoes } = parsed.data

    const { data: emp, error } = await supabase.from('emprestimos').insert({
      credor_id: user.id, cliente_id, tipo: 'price',
      valor_principal, taxa_juros, num_parcelas, data_inicio,
      observacoes: observacoes || null,
    }).select('id').single()

    if (error || !emp) return { error: error?.message ?? 'Erro ao criar' }

    const parcelas = calcularParcelas(valor_principal, taxa_juros, num_parcelas, new Date(data_inicio + 'T12:00:00'))
    const { error: pe } = await supabase.from('parcelas').insert(
      parcelas.map(p => ({
        emprestimo_id: emp.id, credor_id: user.id,
        numero: p.numero, valor: p.valor,
        vencimento: p.vencimento.toISOString().split('T')[0],
      }))
    )
    if (pe) {
      await supabase.from('emprestimos').delete().eq('id', emp.id)
      return { error: pe.message }
    }

    revalidatePath('/emprestimos')
    return { success: true, id: emp.id }

  } else {
    const { cliente_id, valor_principal, taxa_juros, data_vencimento, observacoes } = parsed.data
    const valor_juros = Number((valor_principal * (taxa_juros / 100)).toFixed(2))

    const { data: emp, error } = await supabase.from('emprestimos').insert({
      credor_id: user.id, cliente_id, tipo: 'renovavel',
      valor_principal, taxa_juros, num_parcelas: null,
      data_inicio: data_vencimento,
      observacoes: observacoes || null,
    }).select('id').single()

    if (error || !emp) return { error: error?.message ?? 'Erro ao criar' }

    const { error: pe } = await supabase.from('parcelas').insert({
      emprestimo_id: emp.id, credor_id: user.id,
      numero: 1,
      valor: Number((valor_principal + valor_juros).toFixed(2)),
      valor_juros,
      vencimento: data_vencimento,
    })
    if (pe) {
      await supabase.from('emprestimos').delete().eq('id', emp.id)
      return { error: pe.message }
    }

    revalidatePath('/emprestimos')
    return { success: true, id: emp.id }
  }
}

// ─── Renovável: pagar só os juros → rola principal ────────────────────────────

export async function pagarJuros(parcelaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: parcela } = await supabase.from('parcelas')
    .select('*, emprestimos(valor_principal, taxa_juros)')
    .eq('id', parcelaId).eq('credor_id', user.id).single()

  if (!parcela) return { error: 'Parcela não encontrada' }

  // Próximo vencimento = 1 mês após o atual
  const vencAtual   = new Date(parcela.vencimento + 'T12:00:00')
  const proxVenc    = new Date(vencAtual)
  proxVenc.setMonth(proxVenc.getMonth() + 1)

  const { error: e1 } = await supabase.from('parcelas')
    .update({ rolado: true, data_pagamento: new Date().toISOString().split('T')[0] })
    .eq('id', parcelaId)

  if (e1) return { error: e1.message }

  const emprestimo = parcela.emprestimos as { valor_principal: number; taxa_juros: number }
  const valor_juros = Number((emprestimo.valor_principal * (emprestimo.taxa_juros / 100)).toFixed(2))

  const { data: ultimaParcela } = await supabase.from('parcelas')
    .select('numero').eq('emprestimo_id', parcela.emprestimo_id)
    .order('numero', { ascending: false }).limit(1).single()

  await supabase.from('parcelas').insert({
    emprestimo_id: parcela.emprestimo_id,
    credor_id: user.id,
    numero: (ultimaParcela?.numero ?? 0) + 1,
    valor: Number((emprestimo.valor_principal + valor_juros).toFixed(2)),
    valor_juros,
    vencimento: proxVenc.toISOString().split('T')[0],
  })

  revalidatePath(`/emprestimos/${parcela.emprestimo_id}`)
  revalidatePath('/emprestimos')
  return { success: true }
}

// ─── Renovável: pagou tudo → quita o empréstimo ───────────────────────────────

export async function pagarTudo(parcelaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: parcela } = await supabase.from('parcelas')
    .select('emprestimo_id').eq('id', parcelaId).eq('credor_id', user.id).single()

  if (!parcela) return { error: 'Parcela não encontrada' }

  await supabase.from('parcelas')
    .update({ pago: true, data_pagamento: new Date().toISOString().split('T')[0] })
    .eq('id', parcelaId)

  await supabase.from('emprestimos')
    .update({ status: 'quitado' })
    .eq('id', parcela.emprestimo_id)
    .eq('credor_id', user.id)

  revalidatePath(`/emprestimos/${parcela.emprestimo_id}`)
  revalidatePath('/emprestimos')
  return { success: true }
}

// ─── Price: marcar parcela individual ─────────────────────────────────────────

export async function marcarParcela(parcelaId: string, pago: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('parcelas')
    .update({ pago, data_pagamento: pago ? new Date().toISOString().split('T')[0] : null })
    .eq('id', parcelaId).eq('credor_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/emprestimos')
  return { success: true }
}

export async function atualizarStatusEmprestimo(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const hoje = new Date().toISOString().split('T')[0]
  const { data: parcelas } = await supabase.from('parcelas').select('pago, vencimento, rolado').eq('emprestimo_id', id)
  if (!parcelas) return { error: 'Não encontrado' }

  const ativas = parcelas.filter(p => !p.rolado)
  const todasPagas = ativas.every(p => p.pago)
  const temInadimplente = ativas.some(p => !p.pago && p.vencimento < hoje)
  const status = todasPagas ? 'quitado' : temInadimplente ? 'inadimplente' : 'ativo'

  await supabase.from('emprestimos').update({ status }).eq('id', id).eq('credor_id', user.id)
  revalidatePath(`/emprestimos/${id}`)
  return { success: true }
}
