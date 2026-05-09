export interface Credor {
  id: string
  nome: string
  email: string
  plano: 'free' | 'pro' | 'premium'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
}

export interface Cliente {
  id: string
  credor_id: string
  nome: string
  cpf: string | null
  telefone: string | null
  email: string | null
  ativo: boolean
  created_at: string
}

export interface Emprestimo {
  id: string
  credor_id: string
  cliente_id: string
  tipo: 'price' | 'renovavel'
  valor_principal: number
  taxa_juros: number
  num_parcelas: number | null
  data_inicio: string
  status: 'ativo' | 'quitado' | 'inadimplente'
  observacoes: string | null
  created_at: string
  clientes?: Pick<Cliente, 'id' | 'nome'>
}

export interface Parcela {
  id: string
  emprestimo_id: string
  credor_id: string
  numero: number
  valor: number
  valor_juros: number | null
  vencimento: string
  pago: boolean
  rolado: boolean
  data_pagamento: string | null
  created_at: string
}
