import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: credor } = user
    ? await supabase.from('credores').select('nome, plano').eq('id', user.id).single()
    : { data: null }

  const iniciais = credor?.nome
    ? credor.nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <header className="flex h-14 items-center justify-end border-b bg-background px-6 gap-3">
      <Badge variant="secondary" className="capitalize">
        {credor?.plano ?? 'free'}
      </Badge>
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{iniciais}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{credor?.nome ?? user?.email}</span>
      </div>
    </header>
  )
}
