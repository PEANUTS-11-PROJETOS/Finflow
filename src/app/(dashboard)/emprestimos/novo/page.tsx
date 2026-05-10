import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { criarEmprestimoAction } from '@/app/(dashboard)/emprestimos/actions'

const INPUT = "h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
const LABEL = "block text-sm font-medium mb-1"

export default async function NovoEmprestimoPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; erro?: string }>
}) {
  const { tipo: tipoParam, erro } = await searchParams
  const tipo = tipoParam === 'renovavel' ? 'renovavel' : 'price'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  if (!clientes || clientes.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Novo empréstimo</h1>
        <p className="text-muted-foreground">Você precisa ter ao menos um cliente ativo antes de criar um empréstimo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Novo empréstimo</h1>

      {/* Tabs via links */}
      <div className="flex gap-2 border-b pb-0">
        <a
          href="/emprestimos/novo?tipo=price"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tipo === 'price' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Parcelas fixas (Tabela Price)
        </a>
        <a
          href="/emprestimos/novo?tipo=renovavel"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tipo === 'renovavel' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Renovável (juros mensais)
        </a>
      </div>

      {erro && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {decodeURIComponent(erro)}
        </div>
      )}

      <form action={criarEmprestimoAction} className="space-y-4">
        <input type="hidden" name="tipo" value={tipo} />

        <div>
          <label className={LABEL}>Cliente *</label>
          <select name="cliente_id" className={INPUT} defaultValue="">
            <option value="" disabled>Selecione o cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Valor principal (R$) *</label>
            <input type="number" name="valor_principal" step="0.01" min="0" placeholder="1000.00" className={INPUT} required />
          </div>
          <div>
            <label className={LABEL}>Taxa de juros (% a.m.) *</label>
            <input type="number" name="taxa_juros" step="0.01" min="0" placeholder="5.00" className={INPUT} required />
          </div>
        </div>

        {tipo === 'price' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Número de parcelas *</label>
              <input type="number" name="num_parcelas" min="1" max="360" placeholder="12" className={INPUT} required />
            </div>
            <div>
              <label className={LABEL}>Data de início *</label>
              <input type="date" name="data_inicio" className={INPUT} required />
            </div>
          </div>
        )}

        {tipo === 'renovavel' && (
          <div>
            <label className={LABEL}>Data do primeiro vencimento *</label>
            <input type="date" name="data_vencimento" className={INPUT} required />
          </div>
        )}

        <div>
          <label className={LABEL}>Observações</label>
          <input type="text" name="observacoes" placeholder="Anotações..." className={INPUT} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="inline-flex h-8 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Criar empréstimo
          </button>
          <a href="/emprestimos" className="inline-flex h-8 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
