// src/components/dashboard/sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Home, Users, HandCoins, Settings, LogOut, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

const navLinks = [
  { href: '/carteira',      label: 'Carteira',       icon: Wallet },
  { href: '/dashboard',     label: 'Painel',         icon: Home },
  { href: '/clientes',      label: 'Clientes',       icon: Users },
  { href: '/emprestimos',   label: 'Empréstimos',    icon: HandCoins },
  { href: '/configuracoes', label: 'Configurações',  icon: Settings },
]

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function sair() {
    onClose?.()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r bg-background">
      {/* Marca */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background font-serif-display text-xl leading-none">
          f
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-medium tracking-tight">Finflow</span>
          <span className="text-[10px] text-muted-foreground">by Peanuts Labs</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 space-y-0.5 px-3 pt-4">
        <p className="eyebrow px-3 pb-1.5">Menu</p>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                active
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 space-y-2 border-t">
        <button
          onClick={sair}
          className="flex w-full h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
