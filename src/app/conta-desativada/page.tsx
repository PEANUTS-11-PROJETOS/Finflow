import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ContaDesativadaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-2xl font-bold">Conta desativada</h1>
        <p className="text-muted-foreground">
          Sua conta foi desativada. Entre em contato com o suporte para mais informações.
        </p>
        <Button render={<Link href="/login" />} variant="outline">
          Voltar ao login
        </Button>
      </div>
    </div>
  )
}
