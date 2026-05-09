import { Clock } from 'lucide-react'

export default function AguardandoAprovacaoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">
          <Clock className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Cadastro em análise</h1>
        <p className="text-muted-foreground">
          Sua conta foi criada e está aguardando a aprovação do administrador.
          Você receberá acesso em breve.
        </p>
        <p className="text-sm text-muted-foreground">
          Dúvidas? Entre em contato:{' '}
          <a href="mailto:soaresvinicius11112@gmail.com" className="underline">
            soaresvinicius11112@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}
