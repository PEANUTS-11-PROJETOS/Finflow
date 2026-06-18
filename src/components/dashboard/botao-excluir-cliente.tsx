'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deletarCliente } from '@/app/(dashboard)/clientes/actions'

export function BotaoExcluirCliente({ clienteId, nomeCliente }: { clienteId: string; nomeCliente: string }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function confirmar() {
    startTransition(async () => {
      const result = await deletarCliente(clienteId)
      if (result?.error) {
        toast.error(result.error)
        setOpen(false)
        return
      }
      toast.success('Cliente excluído')
      router.push('/clientes')
      router.refresh()
    })
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        Excluir cliente
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir cliente?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O cliente <span className="font-medium text-foreground">{nomeCliente}</span> será excluído permanentemente. Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmar} disabled={pending}>
              {pending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
