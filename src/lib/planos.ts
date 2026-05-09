export const PLANOS = {
  free: {
    nome: 'Free',
    clientes: 10,
    preco_mensal: 0,
    preco_anual: 0,
    trial_dias: 15,
    features: [
      'Até 10 clientes',
      'Empréstimos price e renovável',
      'Dashboard com KPIs',
      '15 dias de teste grátis',
    ],
    nao_inclui: [
      'Relatório de inadimplência',
      'Exportação CSV',
      'Histórico completo',
      'Suporte prioritário',
    ],
  },
  pro: {
    nome: 'Pro',
    clientes: 100,
    preco_mensal: 5000,
    preco_anual: 50000,
    trial_dias: 0,
    features: [
      'Até 100 clientes',
      'Empréstimos price e renovável',
      'Dashboard com KPIs',
      'Relatório de inadimplência',
      'Exportação CSV',
    ],
    nao_inclui: [
      'Histórico completo',
      'Suporte prioritário',
    ],
  },
  premium: {
    nome: 'Premium',
    clientes: -1,
    preco_mensal: 8000,
    preco_anual: 80000,
    trial_dias: 0,
    features: [
      'Clientes ilimitados',
      'Empréstimos price e renovável',
      'Dashboard com KPIs',
      'Relatório de inadimplência',
      'Exportação CSV',
      'Histórico completo',
      'Suporte prioritário',
    ],
    nao_inclui: [],
  },
} as const

export type Plano = keyof typeof PLANOS

export function podeAdicionarCliente(plano: Plano, totalAtual: number): boolean {
  const limite = PLANOS[plano].clientes
  return limite === -1 || totalAtual < limite
}

export function precoPlano(plano: string, ciclo: string | null): number {
  const p = PLANOS[plano as Plano]
  if (!p || plano === 'free') return 0
  return ciclo === 'anual' ? p.preco_anual : p.preco_mensal
}

export function trialExpirado(plano: string, createdAt: string): boolean {
  if (plano !== 'free') return false
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000
  return dias > PLANOS.free.trial_dias
}

export function trialDiasRestantes(createdAt: string): number {
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000
  return Math.max(0, Math.ceil(PLANOS.free.trial_dias - dias))
}
