// src/app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* COLUNA ESQUERDA — formulário */}
      <div className="flex flex-1 flex-col bg-background p-8 md:p-12 lg:flex-none lg:w-[540px]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background font-serif-display text-xl leading-none">
            f
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-medium tracking-tight">Finflow</span>
            <span className="text-[10px] text-muted-foreground">by Peanuts Labs</span>
          </div>
        </div>

        <div className="my-auto max-w-sm">
          <p className="eyebrow mb-4">Bem-vindo de volta</p>
          <h1 className="font-serif-display text-4xl md:text-5xl leading-[1.05]">
            Sua carteira, <i>na ponta do dedo</i>.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Entre para acompanhar cobranças do dia, registrar pagamentos e ver os juros que entraram este mês.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <p className="text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} Peanuts Labs</span>
          <span className="flex gap-4">
            <Link href="#" className="hover:text-foreground">Termos</Link>
            <Link href="#" className="hover:text-foreground">Privacidade</Link>
          </span>
        </p>
      </div>

      {/* COLUNA DIREITA — visual (esconde em telas pequenas) */}
      <div className="relative hidden flex-1 overflow-hidden bg-foreground text-background lg:flex lg:flex-col p-12">
        {/* Watermark R$ gigante */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] font-serif-display"
          style={{ fontSize: '32rem', lineHeight: 0.8, letterSpacing: '-0.04em' }}
        >
          R$
        </div>

        <div className="mt-auto relative z-10 max-w-md">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            Em tempo real
          </Badge>

          {/* Card de prévia */}
          <div className="mt-7 rounded-2xl bg-background text-foreground p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Cobrança · Ciclo 6</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/15 text-[var(--warning-foreground)] px-2 py-0.5 text-[11px] font-medium">
                Vence hoje
              </span>
            </div>
            <p className="font-serif-display text-4xl leading-none">
              <span className="text-[0.42em] text-muted-foreground mr-1.5">R$</span>
              8.925<span className="opacity-55">,00</span>
            </p>
            <div className="flex h-1.5 gap-1 mt-4 rounded-full overflow-hidden">
              <div className="bg-foreground" style={{ flex: 8500 }} />
              <div className="bg-[var(--warning)]" style={{ flex: 425 }} />
            </div>
            <div className="flex justify-between text-xs mt-2.5 text-muted-foreground">
              <span>Principal <span className="font-mono text-foreground">R$ 8.500</span></span>
              <span>Juros <span className="font-mono text-[var(--warning-foreground)]">R$ 425</span></span>
            </div>
          </div>

          <p className="font-serif-display text-2xl leading-tight mt-10 max-w-md">
            "Antes eu fazia tudo no caderno. Agora abro o Finflow e em <i>30 segundos</i> sei o que entrou no dia."
          </p>
          <p className="mt-3 text-xs text-background/60">
            Roberval Lima · usuário desde 2025
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente minimalista (evita import extra do shadcn pra não conflitar)
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-background">
      {children}
    </span>
  )
}
