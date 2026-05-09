'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()

  async function handleSair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6">
      <span className="font-semibold text-sm">FinFlow Admin</span>
      <Button variant="ghost" size="sm" onClick={handleSair}>
        <LogOut className="h-4 w-4 mr-2" />
        Sair
      </Button>
    </header>
  )
}
