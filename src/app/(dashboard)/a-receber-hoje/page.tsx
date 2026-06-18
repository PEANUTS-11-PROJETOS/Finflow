import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Money } from '@/components/ui/money'
import { Calendar, ArrowRight } from 'lucide-react'
import { fmtData } from '@/lib/utils'
import Link from 'next/link'

export default async function AReceberHojePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoje = new Date().toISOString().split('T')[0]

  const { data: parcelas } = await supabase
    .from('parcelas')
    .select('valor, vencimento, emprestimos(id, tipo, clientes(id, nome))')
    .eq('vencimento', hoje)
    .eq('pago', false)
    .eq('rolado', false)
    .order('valor', { ascending: false })

  type ItemHoje = { clienteNome: string; empId: string; tipo: string; valor: number }
  const itens: ItemHoje[] = []
  for (const p of parcelas ?? []) {
    const emp = p.emprestimos as unknown as { id: string; tipo: string; clientes: { id: string; nome: string } | null } | null
    if (!emp?.clientes) continue
    itens.push({ clienteNome: emp.clientes.nome, empId: emp.id, tipo: emp.tipo, valor: Number(p.valor) })
  }

  const totalHoje = itens.reduce((s, i) => s + i.valor, 0)
  const dataExtenso = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--warning)]" />
            A receber hoje
          </h1>
          <p className="text-sm text-muted-foreground mt-1 first-letter:uppercase">{dataExtenso}</p>
        </div>
        {itens.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total do dia</p>
            <p className="text-2xl font-mono"><Money value={totalHoje} /></p>
          </div>
        )}
      </div>

      {itens.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-2">
            <p className="text-4xl">☕</p>
            <p className="text-sm font-medium">Nenhuma cobrança hoje</p>
            <p className="text-xs text-muted-foreground">{fmtData(hoje)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {itens.map((item, i) => (
            <Link key={i} href={`/emprestimos/${item.empId}`}
              className="flex items-center gap-4 rounded-xl border bg-card px-4 py-4 hover:border-foreground/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-muted text-foreground/80 flex items-center justify-center text-sm font-semibold flex-none">
                {item.clienteNome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.clienteNome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.tipo === 'price' ? 'Tabela Price' : 'Renovável'} · vence hoje
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium"><Money value={item.valor} /></p>
                <Badge variant="secondary" className="mt-1 text-[10px]">hoje</Badge>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-none" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
