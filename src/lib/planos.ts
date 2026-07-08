export const PLANO = {
  trial_dias: 30,
  preco_mensal: 5990,
  preco_anual: 44900,
  preco_anual_promo: 34900,
  features: [
    'Clientes ilimitados',
    'Empréstimos price e renovável',
    'Dashboard com KPIs',
    'Relatório de inadimplência',
    'Exportação CSV',
    'Histórico completo',
    'Suporte prioritário via WhatsApp',
    'Notificações no Telegram diárias às 8h',
  ],
  features_em_breve: [],
} as const

export type PlanoCredor = 'trial' | 'ativo'
export type EstadoConta = 'trial' | 'ativo' | 'expirado'
export type Ciclo = 'mensal' | 'anual'

export function estadoConta(
  plano: string,
  createdAt: string,
  dataVencimento: string | null,
): EstadoConta {
  if (plano === 'ativo') {
    if (!dataVencimento) return 'expirado'
    const venc = new Date(dataVencimento + 'T12:00:00').getTime()
    return venc >= Date.now() ? 'ativo' : 'expirado'
  }
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000
  return dias > PLANO.trial_dias ? 'expirado' : 'trial'
}

export function trialDiasRestantes(createdAt: string): number {
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000
  return Math.max(0, Math.ceil(PLANO.trial_dias - dias))
}

export function precoCiclo(ciclo: Ciclo, primeiroPagamento: boolean): number {
  if (ciclo === 'anual') return primeiroPagamento ? PLANO.preco_anual_promo : PLANO.preco_anual
  return PLANO.preco_mensal
}

export function diasDoCiclo(ciclo: Ciclo): number {
  return ciclo === 'anual' ? 365 : 30
}
