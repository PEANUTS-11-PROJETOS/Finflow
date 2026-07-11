'use client'
import Link from 'next/link'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

function shift(dia: string, delta: number): string {
  const d = new Date(dia + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]
}

export function DayNav({ dia }: { dia: string }) {
  const router = useRouter()
  const dateRef = useRef<HTMLInputElement>(null)
  const d = new Date(dia + 'T12:00:00')
  const dataBR = d.toLocaleDateString('pt-BR')
  const semana = d.toLocaleDateString('pt-BR', { weekday: 'long' })

  function abrirCalendario() {
    const el = dateRef.current
    if (!el) return
    // showPicker() abre o seletor nativo de forma confiável (o input fica oculto).
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker()
        return
      } catch {
        // alguns navegadores lançam se não for gesto direto — cai no fallback
      }
    }
    el.focus()
    el.click()
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" render={<Link href={`/carteira?dia=${shift(dia, -1)}`} prefetch />}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-0">
        <p className="eyebrow">Pauta do dia</p>
        <p className="text-2xl font-serif-display leading-none">{dataBR}</p>
        <p className="text-xs text-muted-foreground first-letter:uppercase">{semana}</p>
      </div>

      <Button variant="outline" size="icon" render={<Link href={`/carteira?dia=${shift(dia, 1)}`} prefetch />}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <button
        type="button"
        onClick={abrirCalendario}
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border px-3 h-8 text-sm cursor-pointer hover:bg-muted transition-colors"
      >
        <CalendarDays className="h-4 w-4" />
        Trocar dia
      </button>
      <input
        ref={dateRef}
        type="date"
        value={dia}
        onChange={e => { if (e.target.value) router.push(`/carteira?dia=${e.target.value}`) }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}
