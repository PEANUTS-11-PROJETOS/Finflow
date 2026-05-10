import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: credor } = await supabase
    .from('credores').select('plano').eq('id', user.id).single()

  if (!credor || credor.plano === 'free') {
    return NextResponse.json({ error: 'Recurso disponível nos planos Pro e Premium' }, { status: 403 })
  }

  const { data: clientes } = await supabase
    .from('clientes')
    .select('nome, cpf, telefone, email, ativo, created_at')
    .order('nome')

  const linhas = [
    ['Nome', 'CPF', 'Telefone', 'Email', 'Ativo', 'Cadastrado em'],
    ...(clientes ?? []).map(c => [
      c.nome ?? '',
      c.cpf ?? '',
      c.telefone ?? '',
      c.email ?? '',
      c.ativo ? 'Sim' : 'Não',
      c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '',
    ]),
  ]

  const csv = linhas.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clientes.csv"',
    },
  })
}
