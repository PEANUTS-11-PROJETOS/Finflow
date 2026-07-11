import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtMoeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtData = (v: string | Date) => {
  if (typeof v === 'string' && v.length === 10) {
    return new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')
  }
  return new Date(v).toLocaleDateString('pt-BR')
}

export function calcularParcelas(
  principal: number,
  taxaMensal: number,
  numParcelas: number,
  dataInicio: Date
): { numero: number; vencimento: Date; valor: number }[] {
  const taxa = taxaMensal / 100
  const valorParcela =
    taxa === 0
      ? principal / numParcelas
      : (principal * taxa * Math.pow(1 + taxa, numParcelas)) /
        (Math.pow(1 + taxa, numParcelas) - 1)

  return Array.from({ length: numParcelas }, (_, i) => {
    const venc = new Date(dataInicio)
    venc.setMonth(venc.getMonth() + i + 1)
    return { numero: i + 1, vencimento: venc, valor: Number(valorParcela.toFixed(2)) }
  })
}

// Juros fixo: N parcelas iguais de (principal + juros) / N.
export function calcularParcelasFixas(
  principal: number,
  jurosTotal: number,
  numParcelas: number,
  dataInicio: Date
): { numero: number; vencimento: Date; valor: number }[] {
  const valorParcela = Number(((principal + jurosTotal) / numParcelas).toFixed(2))
  return Array.from({ length: numParcelas }, (_, i) => {
    const venc = new Date(dataInicio)
    venc.setMonth(venc.getMonth() + i + 1)
    return { numero: i + 1, vencimento: venc, valor: valorParcela }
  })
}
