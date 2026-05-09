import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { PLANOS } from '@/lib/planos'

export default async function UpgradePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Seu período de teste encerrou</h1>
          <p className="text-muted-foreground">
            Escolha um plano para continuar usando o FinFlow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {(['pro', 'premium'] as const).map(key => {
            const p = PLANOS[key]
            return (
              <Card key={key} className={key === 'premium' ? 'border-primary shadow-md' : ''}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{p.nome}</CardTitle>
                    {key === 'premium' && <Badge>Recomendado</Badge>}
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">
                      R$ {(p.preco_mensal / 100).toFixed(2).replace('.', ',')}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ou R$ {(p.preco_anual / 100).toFixed(2).replace('.', ',')}/ano (2 meses grátis)
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {p.nao_inclui.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="h-4 w-4 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={key === 'premium' ? 'default' : 'outline'}>
                    Assinar {p.nome}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Dúvidas? Entre em contato:{' '}
          <a href="mailto:soaresvinicius11112@gmail.com" className="underline">
            soaresvinicius11112@gmail.com
          </a>
        </p>

        <div className="text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sair da conta</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
