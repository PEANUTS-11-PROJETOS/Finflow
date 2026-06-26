'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
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

  useEffect(() => {
    // Pega o evento já capturado antes do React montar
    if (window.__pwaPrompt) {
      setPrompt(window.__pwaPrompt)
    }

    const handler = () => {
      if (window.__pwaPrompt) setPrompt(window.__pwaPrompt)
    }
    window.addEventListener('pwaready', handler)
    return () => window.removeEventListener('pwaready', handler)
  }, [])

  if (!prompt) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-muted-foreground"
      onClick={async () => {
        await prompt.prompt()
        setPrompt(null)
        window.__pwaPrompt = null
      }}
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar app</span>
    </Button>
  )
}
