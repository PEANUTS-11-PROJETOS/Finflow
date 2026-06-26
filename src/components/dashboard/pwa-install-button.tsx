'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaPrompt: BeforeInstallPromptEvent | null
  }
}

export function PwaInstallBanner() {
  const [ready, setReady] = useState(false)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Não mostrar se já está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return

    setReady(true)

    if (window.__pwaPrompt) setPrompt(window.__pwaPrompt)

    const handler = () => {
      if (window.__pwaPrompt) setPrompt(window.__pwaPrompt)
    }
    window.addEventListener('pwaready', handler)
    return () => window.removeEventListener('pwaready', handler)
  }, [])

  if (!ready || dismissed) return null

  const handleInstall = async () => {
    if (prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        setDismissed(true)
        window.__pwaPrompt = null
      }
    } else {
      setShowInstructions(true)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#232830]">
          <svg viewBox="0 0 512 512" width="22" height="22">
            <rect x="130" y="110" width="76" height="292" rx="10" fill="#F5F1E8"/>
            <rect x="130" y="110" width="260" height="76" rx="10" fill="#F5F1E8"/>
            <rect x="130" y="228" width="192" height="68" rx="10" fill="#F5F1E8"/>
            <circle cx="380" cy="360" r="38" fill="#4A8C5C"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">Instalar Finflow</p>
          <p className="text-xs text-muted-foreground">Adicione à tela inicial para acesso rápido</p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-[#232830] px-3 py-1.5 text-xs font-medium text-[#F5F1E8]"
        >
          <Download className="h-3.5 w-3.5" />
          Instalar
        </button>
        <button onClick={() => setDismissed(true)} className="shrink-0 text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setShowInstructions(false)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <p className="font-semibold text-base">Como instalar</p>
              <button onClick={() => setShowInstructions(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-bold text-foreground shrink-0">1.</span>
                Toque nos <strong className="text-foreground">3 pontinhos ⋮</strong> no canto superior direito do Chrome
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground shrink-0">2.</span>
                Toque em <strong className="text-foreground">"Instalar aplicativo"</strong>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground shrink-0">3.</span>
                Confirme e o app vai aparecer na sua tela inicial com o ícone correto
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

// Botão minimalista para o header (mantido para compatibilidade)
export function PwaInstallButton() {
  return null
}
