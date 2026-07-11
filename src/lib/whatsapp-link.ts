import { fmtData } from '@/lib/utils'

/**
 * Monta o link wa.me com uma mensagem de cobrança pronta.
 * Retorna null quando o cliente não tem telefone.
 */
export function linkCobranca(
  telefone: string | null,
  nomeCliente: string,
  valorParcela: number,
  vencimento: string,
): string | null {
  if (!telefone) return null
  const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcela)
  const venc = fmtData(vencimento)
  const msg =
    `Olá ${nomeCliente}! Passando para lembrar da parcela do seu empréstimo 📋\n\n` +
    `Valor: ${valor}\nVencimento: ${venc}\n\nQualquer dúvida estou à disposição! 😊`
  return `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}
