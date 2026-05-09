export const PLANOS = {
  free:    { nome: 'Free',    clientes: 10,  preco: 0 },
  pro:     { nome: 'Pro',     clientes: 100, preco: 2990 },
  premium: { nome: 'Premium', clientes: -1,  preco: 7990 },
} as const

export type Plano = keyof typeof PLANOS

export function podeAdicionarCliente(plano: Plano, totalAtual: number): boolean {
  const limite = PLANOS[plano].clientes
  return limite === -1 || totalAtual < limite
}
