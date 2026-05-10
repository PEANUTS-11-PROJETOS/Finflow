'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

export function DashboardShell({
  header,
  children,
}: {
  header: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — fixo no mobile, estático no desktop */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:pointer-events-auto',
          open ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        )}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Barra de topo: hambúrguer (mobile) + header (server component) */}
        <div className="flex h-14 items-center border-b bg-background">
          <button
            onClick={() => setOpen(true)}
            className="flex h-14 w-14 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {header}
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
