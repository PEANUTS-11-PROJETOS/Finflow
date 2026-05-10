import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANOS, trialDiasRestantes } from '@/lib/planos'
import { Check, X, Download } from 'lucide-react'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: credor } = await supabase
    .from('credores')
    .select('nome, email, plano, created_at')
    .eq('id', user.id)
    .single()

  const plano = (credor?.plano ?? 'free') as keyof typeof PLANOS
  const diasRestantes = plano === 'free' ? trialDiasRestantes(credor?.created_at ?? '') : null

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sua conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span className="font-medium">{credor?.nome}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{credor?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plano atual</span>
            <Badge variant="secondary" className="capitalize">{plano}</Badge>
          </div>
          {diasRestantes !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trial restante</span>
              <span className={`font-medium ${diasRestantes <= 3 ? 'text-destructive' : 'text-yellow-600'}`}>
                {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {(plano === 'pro' || plano === 'premium') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exportar dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Baixe todos os seus dados em formato CSV para guardar uma cópia ou importar em outros sistemas.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/api/exportar/clientes"
                download
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar clientes
              </a>
              <a
                href="/api/exportar/emprestimos"
                download
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Exportar empréstimos e parcelas
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planos disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.entries(PLANOS) as [keyof typeof PLANOS, typeof PLANOS[keyof typeof PLANOS]][]).map(([key, p]) => (
              <div
                key={key}
                className={`rounded-lg border p-4 space-y-3 ${plano === key ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.nome}</span>
                  {plano === key && <Badge>Atual</Badge>}
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {p.preco_mensal === 0 ? 'Grátis' : `R$ ${(p.preco_mensal / 100).toFixed(2).replace('.', ',')}`}
                    {p.preco_mensal > 0 && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                  </p>
                  {p.preco_anual > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ou R$ {(p.preco_anual / 100).toFixed(2).replace('.', ',')}/ano
                    </p>
                  )}
                </div>
                <ul className="space-y-1.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {p.nao_inclui.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <X className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Para fazer upgrade entre em contato: soaresvinicius11112@gmail.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
