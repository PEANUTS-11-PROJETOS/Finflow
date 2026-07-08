'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Send, Loader2, CheckCircle2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  verificarConexaoTelegram,
  enviarTesteTelegram,
  desconectarTelegram,
} from '@/app/(dashboard)/configuracoes/telegram-actions'

const BOT = 'Finflow_labs_bot'

interface Props {
  conectado: boolean
  credorId: string
}

export function TelegramConnect({ conectado, credorId }: Props) {
  const [verificando, setVerificando] = useState(false)
  const [testando, setTestando] = useState(false)
  const [abriu, setAbriu] = useState(false)

  const linkApp = `tg://resolve?domain=${BOT}&start=${credorId}`
  const linkWeb = `https://t.me/${BOT}?start=${credorId}`

  async function verificar() {
    setVerificando(true)
    const r = await verificarConexaoTelegram()
    setVerificando(false)
    if (r.error) return toast.error(r.error)
    toast.success('Telegram conectado!', {
      description: 'Enviamos uma confirmação no seu Telegram.',
    })
  }

  async function testar() {
    setTestando(true)
    const r = await enviarTesteTelegram()
    setTestando(false)
    if (r.error) return toast.error(r.error)
    toast.success('Mensagem de teste enviada!')
  }

  async function desconectar() {
    const r = await desconectarTelegram()
    if (r.error) return toast.error(r.error)
    toast.success('Telegram desconectado.')
  }

  if (conectado) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Telegram conectado</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Você recebe o resumo diário dos vencimentos todo dia às 8h.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={testar} disabled={testando} variant="outline" className="gap-2">
            {testando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Enviar teste
          </Button>
          <Button onClick={desconectar} variant="ghost" className="text-destructive hover:text-destructive">
            Desconectar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Receba todo dia às 8h um resumo dos vencimentos no seu Telegram. É só conectar uma vez:
      </p>
      <ol className="space-y-4">
        <li className="flex items-start gap-3 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            1
          </span>
          <div className="space-y-2">
            <p>
              Abra o bot no Telegram e aperte <span className="font-medium">Iniciar</span>.
            </p>
            <a
              href={linkApp}
              onClick={() => setAbriu(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
              Conectar Telegram
            </a>
            <p className="text-xs text-muted-foreground">
              Não abriu o app?{' '}
              <a
                href={linkWeb}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAbriu(true)}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Abrir no navegador
              </a>
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3 text-sm">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            2
          </span>
          <div className="space-y-2">
            <p>Volte aqui e confirme a conexão.</p>
            <Button
              onClick={verificar}
              disabled={verificando || !abriu}
              variant="outline"
              className="gap-2"
            >
              {verificando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Já apertei Iniciar
            </Button>
          </div>
        </li>
      </ol>
    </div>
  )
}
