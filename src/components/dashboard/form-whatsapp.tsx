'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { MessageCircle, Loader2 } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { salvarConfigWhatsapp } from '@/app/(dashboard)/configuracoes/actions'

const schema = z.object({
  telefone: z.string().min(1, 'Informe o número'),
  whatsapp_notificacoes: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  telefoneAtual: string | null
  notificacoesAtivas: boolean
}

export function FormWhatsapp({ telefoneAtual, notificacoesAtivas }: Props) {
  const [salvando, setSalvando] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      telefone: telefoneAtual ? formatarTelefone(telefoneAtual) : '',
      whatsapp_notificacoes: notificacoesAtivas,
    },
  })

  async function onSubmit(values: FormValues) {
    setSalvando(true)
    const result = await salvarConfigWhatsapp(values)
    setSalvando(false)

    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Configurações salvas!', {
      description: values.whatsapp_notificacoes
        ? 'Você receberá resumos diários às 8h.'
        : 'Notificações desativadas.',
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do WhatsApp</FormLabel>
              <FormControl>
                <Input
                  placeholder="(11) 99999-9999"
                  {...field}
                  onChange={e => field.onChange(formatarTelefone(e.target.value))}
                />
              </FormControl>
              <FormDescription>DDD + número, sem o +55</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="whatsapp_notificacoes"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">Resumo diário às 8h</FormLabel>
                <FormDescription>
                  Receba uma mensagem todo dia com vencimentos de hoje e dos próximos 3 dias.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={salvando} className="gap-2">
          {salvando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="h-4 w-4" />
          )}
          {salvando ? 'Salvando...' : 'Salvar configurações'}
        </Button>
      </form>
    </Form>
  )
}

function formatarTelefone(v: string): string {
  const digits = v.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
