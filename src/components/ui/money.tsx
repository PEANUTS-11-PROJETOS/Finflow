// src/components/ui/money.tsx
import { cn } from '@/lib/utils'

interface MoneyProps {
  value: number | string
  /** Hero variant: usa Instrument Serif gigante. Padrão: false (mono inline) */
  display?: boolean
  /** Mostra sinal de + se positivo (para extratos / atividade) */
  showSign?: boolean
  /** Cor do valor. 'success' = sálvia, 'warning' = âmbar, 'danger' = terra */
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

/**
 * Formatação monetária com numerais tabulares + R$ esmaecido.
 * Substitui chamadas inline de fmtMoeda() em valores visíveis.
 */
export function Money({
  value,
  display = false,
  showSign = false,
  tone = 'default',
  className,
}: MoneyProps) {
  const n = typeof value === 'string' ? Number(value) : value
  const fmt = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const [int, dec] = fmt.format(Math.abs(n)).split(',')
  const sign = n < 0 ? '−' : showSign ? '+' : ''

  const toneClass = {
    default: 'text-foreground',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning-foreground)]',
    danger:  'text-destructive',
    muted:   'text-muted-foreground',
  }[tone]

  if (display) {
    return (
      <span className={cn('font-serif-display tabular-nums', toneClass, className)}>
        <span className="text-[0.42em] text-muted-foreground mr-1.5 align-baseline">R$</span>
        {sign}{int}
        <span className="opacity-55">,{dec}</span>
      </span>
    )
  }

  return (
    <span className={cn('font-mono tabular-nums', toneClass, className)}>
      <span className="text-[0.78em] text-muted-foreground mr-1">R$</span>
      {sign}{int}
      <span className="opacity-55">,{dec}</span>
    </span>
  )
}
