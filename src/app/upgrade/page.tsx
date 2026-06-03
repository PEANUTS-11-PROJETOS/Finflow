import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import { PLANO } from '@/lib/planos'
import { fmtMoeda } from '@/lib/utils'

const WHATSAPP_URL = 'https://wa.me/5511989408375'
const wa = (msg: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: credor } = await supabase
    .from('credores')
    .select('pagamento_confirmado')
    .eq('id', user.id)
    .single()

  const primeiroPagamento = !credor?.pagamento_confirmado
  const precoAnualExibido = primeiroPagamento ? PLANO.preco_anual_promo : PLANO.preco_anual

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Seu período de teste encerrou</h1>
          <p className="text-muted-foreground">
            Continue gerenciando seus empréstimos sem limites. Pagamento via PIX.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Mensal</CardTitle>
              <div className="space-y-1">
                <p className="text-3xl font-bold">
                  {fmtMoeda(PLANO.preco_mensal / 100)}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Cobrança via PIX a cada 30 dias
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {PLANO.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
                {PLANO.features_em_breve.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    {f}
                    <Badge variant="secondary" className="ml-auto text-[10px] uppercase tracking-wide">Em breve</Badge>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" render={<a href={wa(`Olá! Quero ativar o FinFlow Mensal (${fmtMoeda(PLANO.preco_mensal / 100)}/mês).`)} target="_blank" rel="noopener noreferrer" />}>
                Quero o mensal
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Anual</CardTitle>
                <Badge>
                  {primeiroPagamento ? 'Promo 1ª assinatura' : 'Economize 37%'}
                </Badge>
              </div>
              <div className="space-y-1">
                {primeiroPagamento && (
                  <p className="text-sm text-muted-foreground line-through">
                    De {fmtMoeda(PLANO.preco_anual / 100)}
                  </p>
                )}
                <p className="text-3xl font-bold">
                  {fmtMoeda(precoAnualExibido / 100)}
                  <span className="text-sm font-normal text-muted-foreground">/ano</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Equivale a {fmtMoeda(precoAnualExibido / 12 / 100)}/mês
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {PLANO.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
                {PLANO.features_em_breve.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    {f}
                    <Badge variant="secondary" className="ml-auto text-[10px] uppercase tracking-wide">Em breve</Badge>
                  </li>
                ))}
              </ul>
              <Button className="w-full" render={<a href={wa(`Olá! Quero ativar o FinFlow Anual${primeiroPagamento ? ' com promo da 1ª assinatura' : ''} (${fmtMoeda(precoAnualExibido / 100)}/ano).`)} target="_blank" rel="noopener noreferrer" />}>
                Quero o anual
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Dúvidas? Fale com a gente no{' '}
          <a
            href={wa('Olá! Tenho uma dúvida sobre o FinFlow.')}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            WhatsApp
          </a>
        </p>

        <div className="text-center">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  )
}
