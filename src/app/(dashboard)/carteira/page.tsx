import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Money } from '@/components/ui/money'
import { DayNav } from '@/components/carteira/day-nav'
import { PautaRow, type PautaItem } from '@/components/carteira/pauta-row'

type EmpJoin = {
  id: string
  tipo: 'price' | 'renovavel'
  valor_principal: number
  clientes: { nome: string; telefone: string | null } | null
}
type ParcelaJoin = {
  id: string
  valor: number
  valor_juros: number | null
  vencimento: string
  pago: boolean
  rolado: boolean
  baixa: 'tudo' | 'parcial' | 'juros' | null
  emprestimos: EmpJoin | null
}

export default async function CarteiraPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { dia: diaParam } = await searchParams
  const dia = diaParam ?? new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('parcelas')
    .select('id, valor, valor_juros, vencimento, pago, rolado, baixa, emprestimos(id, tipo, valor_principal, clientes(nome, telefone))')
    .eq('credor_id', user.id)
    .eq('vencimento', dia)

  const itens: PautaItem[] = []
  for (const p of (data ?? []) as unknown as ParcelaJoin[]) {
    const emp = p.emprestimos
    if (!emp?.clientes) continue
    itens.push({
      parcelaId: p.id,
      emprestimoId: emp.id,
      tipo: emp.tipo,
      clienteNome: emp.clientes.nome,
      clienteTelefone: emp.clientes.telefone,
      valorPego: Number(emp.valor_principal),
      valorParcela: Number(p.valor),
      valorJuros: Number(p.valor_juros ?? 0),
      vencimento: p.vencimento,
      baixa: p.baixa,
      pago: p.pago,
      rolado: p.rolado,
    })
  }

  // Em aberto primeiro, baixados embaixo
  itens.sort((a, b) => Number(a.pago || a.rolado) - Number(b.pago || b.rolado))

  const aReceber = itens.reduce((s, i) => s + i.valorParcela, 0)
  const baixados = itens.filter(i => i.pago || i.rolado).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DayNav dia={dia} />
        <div className="flex gap-3">
          <Card className="min-w-[9rem]">
            <CardContent className="py-3 px-4">
              <p className="eyebrow">A receber</p>
              <p className="text-xl font-mono mt-1"><Money value={aReceber} /></p>
            </CardContent>
          </Card>
          <Card className="min-w-[6rem]">
            <CardContent className="py-3 px-4">
              <p className="eyebrow">Baixados</p>
              <p className="text-xl font-mono mt-1">{baixados}/{itens.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <p className="text-4xl">☕</p>
            <p className="text-sm font-medium">Nenhuma cobrança nesse dia</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {itens.map(item => (
            <PautaRow key={item.parcelaId} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
