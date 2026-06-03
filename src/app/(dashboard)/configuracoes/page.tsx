import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANO, estadoConta, trialDiasRestantes } from '@/lib/planos'
import { fmtData, fmtMoeda } from '@/lib/utils'
import { Check, Download, HelpCircle, Lock, MessageCircle, Sparkles } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/5511989408375'
const wa = (msg: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: credor } = await supabase
    .from('credores')
    .select('nome, email, plano, ciclo_plano, data_vencimento, created_at')
    .eq('id', user.id)
    .single()

  const estado = credor
    ? estadoConta(credor.plano, credor.created_at, credor.data_vencimento)
    : 'trial'
  const diasRestantes = estado === 'trial' && credor?.created_at
    ? trialDiasRestantes(credor.created_at)
    : null

  const statusLabel =
    estado === 'ativo' ? 'Ativo' : estado === 'trial' ? 'Em teste' : 'Expirado'
  const statusVariant =
    estado === 'ativo' ? 'default' : estado === 'trial' ? 'secondary' : 'destructive'

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
            <span className="text-muted-foreground">Status</span>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          {diasRestantes !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teste restante</span>
              <span className={`font-medium ${diasRestantes <= 3 ? 'text-destructive' : 'text-yellow-600'}`}>
                {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {estado === 'ativo' && credor?.data_vencimento && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo vencimento</span>
              <span className="font-medium">{fmtData(credor.data_vencimento)}</span>
            </div>
          )}
          {estado === 'ativo' && credor?.ciclo_plano && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ciclo</span>
              <span className="font-medium capitalize">{credor.ciclo_plano}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Notificações WhatsApp</CardTitle>
            <Badge variant="secondary" className="ml-auto text-[10px] uppercase tracking-wide">Em breve</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Em breve você poderá receber todo dia às 8h uma mensagem no WhatsApp com os vencimentos do dia e dos próximos 3 dias — sem precisar abrir o app.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className={`h-5 w-5 ${estado === 'ativo' ? 'text-primary' : 'text-muted-foreground'}`} />
            <CardTitle className="text-base">Suporte prioritário</CardTitle>
            {estado !== 'ativo' && (
              <Badge variant="secondary" className="ml-auto text-[10px] uppercase tracking-wide gap-1">
                <Lock className="h-3 w-3" />
                Exclusivo do plano
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {estado === 'ativo' ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Tem alguma dúvida, problema ou sugestão? Fale direto com a gente pelo WhatsApp — resposta no mesmo dia útil.
              </p>
              <a
                href={wa(`Olá! Sou ${credor?.email ?? ''} e preciso de ajuda com o FinFlow.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Falar com suporte
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Suporte direto via WhatsApp está disponível para assinantes do plano. Durante o teste você pode tirar dúvidas sobre ativação na seção <span className="font-medium">Seu plano</span> abaixo.
              </p>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Ver planos
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Seu plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Mensal</p>
              <p className="text-2xl font-bold">
                {fmtMoeda(PLANO.preco_mensal / 100)}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </p>
              <p className="text-xs text-muted-foreground">Cobrança via PIX a cada 30 dias</p>
            </div>
            <div className="rounded-lg border-2 border-primary p-4 space-y-2 bg-primary/5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Anual</p>
                <Badge>Economize 37%</Badge>
              </div>
              <p className="text-2xl font-bold">
                {fmtMoeda(PLANO.preco_anual / 100)}
                <span className="text-sm font-normal text-muted-foreground">/ano</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Equivale a {fmtMoeda(PLANO.preco_anual / 12 / 100)}/mês
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 pt-2">
            {PLANO.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
            {PLANO.features_em_breve.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                {f}
                <Badge variant="secondary" className="ml-auto text-[10px] uppercase tracking-wide">Em breve</Badge>
              </li>
            ))}
          </ul>

          <a
            href={`https://wa.me/5511989408375?text=${encodeURIComponent(estado === 'ativo' ? 'Olá! Quero renovar meu plano FinFlow.' : 'Olá! Quero ativar meu plano FinFlow.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {estado === 'ativo' ? 'Renovar pelo WhatsApp' : 'Ativar pelo WhatsApp'}
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
