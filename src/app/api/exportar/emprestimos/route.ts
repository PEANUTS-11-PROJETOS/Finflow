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

  const { data: emprestimos } = await supabase
    .from('emprestimos')
    .select(`
      tipo, valor_principal, taxa_juros, num_parcelas, data_inicio, status, observacoes, created_at,
      clientes(nome),
      parcelas(numero, valor, valor_juros, vencimento, pago, rolado, data_pagamento)
    `)
    .order('created_at', { ascending: false })

  const linhas: string[][] = [
    ['Cliente', 'Tipo', 'Valor Principal', 'Taxa Juros (%)', 'Parcelas', 'Data Início', 'Status',
     'Nº Parcela', 'Valor Parcela', 'Valor Juros', 'Vencimento', 'Pago', 'Rolado', 'Data Pagamento'],
  ]

  for (const e of emprestimos ?? []) {
    const cliente = (e.clientes as unknown as { nome: string } | null)?.nome ?? ''
    const parcelas = (e.parcelas as unknown as {
      numero: number; valor: number; valor_juros: number | null;
      vencimento: string; pago: boolean; rolado: boolean; data_pagamento: string | null
    }[]) ?? []

    if (parcelas.length === 0) {
      linhas.push([
        cliente, e.tipo, String(e.valor_principal), String(e.taxa_juros),
        String(e.num_parcelas ?? ''), e.data_inicio, e.status ?? '',
        '', '', '', '', '', '', '',
      ])
    } else {
      for (const p of parcelas) {
        linhas.push([
          cliente, e.tipo, String(e.valor_principal), String(e.taxa_juros),
          String(e.num_parcelas ?? ''), e.data_inicio, e.status ?? '',
          String(p.numero), String(p.valor), String(p.valor_juros ?? ''),
          p.vencimento, p.pago ? 'Sim' : 'Não', p.rolado ? 'Sim' : 'Não', p.data_pagamento ?? '',
        ])
      }
    }
  }

  const csv = linhas.map(l => l.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="emprestimos.csv"',
    },
  })
}
