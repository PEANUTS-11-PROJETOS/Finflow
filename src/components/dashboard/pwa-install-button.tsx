'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaPrompt: BeforeInstallPromptEvent | null
  }
}

export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)

  useEffect(() => {
    // Não mostrar se já instalado como PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)
    if (standalone) return

    if (window.__pwaPrompt) setPrompt(window.__pwaPrompt)

    const handler = () => {
      if (window.__pwaPrompt) setPrompt(window.__pwaPrompt)
    }
    window.addEventListener('pwaready', handler)
    return () => window.removeEventListener('pwaready', handler)
  }, [])

  if (isStandalone || dismissed) return null

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        setPrompt(null)
        window.__pwaPrompt = null
        setDismissed(true)
      }
    } else {
      setShowInstructions(true)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={handleClick}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Instalar app</span>
      </Button>

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowInstructions(false)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <p className="font-semibold text-base">Instalar Finflow</p>
              <button onClick={() => setShowInstructions(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-foreground">1.</span>
                Remova o ícone antigo do Finflow da tela inicial (se tiver)
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">2.</span>
                Toque nos <strong className="text-foreground">3 pontinhos ⋮</strong> no canto superior direito do Chrome
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">3.</span>
                Toque em <strong className="text-foreground">"Instalar aplicativo"</strong>
              </li>
            </ol>
            <button
              onClick={() => { setShowInstructions(false); setDismissed(true) }}
              className="mt-5 w-full text-center text-xs text-muted-foreground"
            >
              Não mostrar novamente
            </button>
          </div>
        </div>
      )}
    </>
  )
}
