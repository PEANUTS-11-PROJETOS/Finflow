import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANOS } from '@/lib/planos'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: credor } = await supabase
    .from('credores')
    .select('nome, email, plano')
    .eq('id', user.id)
    .single()

  const plano = (credor?.plano ?? 'free') as keyof typeof PLANOS

  return (
    <div className="space-y-6 max-w-2xl">
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Limite de clientes</span>
            <span className="font-medium">
              {PLANOS[plano].clientes === -1 ? 'Ilimitado' : PLANOS[plano].clientes}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planos disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.entries(PLANOS) as [keyof typeof PLANOS, typeof PLANOS[keyof typeof PLANOS]][]).map(([key, p]) => (
              <div
                key={key}
                className={`rounded-lg border p-4 space-y-2 ${plano === key ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.nome}</span>
                  {plano === key && <Badge>Atual</Badge>}
                </div>
                <p className="text-2xl font-bold">
                  {p.preco === 0 ? 'Grátis' : `R$ ${(p.preco / 100).toFixed(2).replace('.', ',')}`}
                  {p.preco > 0 && <span className="text-sm font-normal text-muted-foreground">/mês</span>}
                </p>
                <p className="text-sm text-muted-foreground">
                  {p.clientes === -1 ? 'Clientes ilimitados' : `Até ${p.clientes} clientes`}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Integração com Stripe disponível na Fase 3 do projeto.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
