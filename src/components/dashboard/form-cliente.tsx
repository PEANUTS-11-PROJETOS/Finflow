'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { criarCliente, atualizarCliente } from '@/app/(dashboard)/clientes/actions'
import type { Cliente } from '@/types'

const schema = z.object({
  nome:     z.string().min(2, 'Nome obrigatório'),
  cpf:      z.string().optional(),
  telefone: z.string().optional(),
  email:    z.string().email('Email inválido').optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

interface Props {
  cliente?: Cliente
}

export function FormCliente({ cliente }: Props) {
  const router  = useRouter()
  const modoEdicao = !!cliente

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome:     cliente?.nome     ?? '',
      cpf:      cliente?.cpf      ?? '',
      telefone: cliente?.telefone ?? '',
      email:    cliente?.email    ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const result = modoEdicao
      ? await atualizarCliente(cliente!.id, values)
      : await criarCliente(values)

    if (result?.error) {
      toast.error('Erro ao salvar cliente')
      return
    }

    toast.success(modoEdicao ? 'Cliente atualizado!' : 'Cliente cadastrado!')
    router.push('/clientes')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <FormField control={form.control} name="nome" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome completo *</FormLabel>
            <FormControl><Input placeholder="João da Silva" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="cpf" render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl><Input placeholder="000.000.000-00" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="telefone" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl><Input placeholder="(11) 99999-9999" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" placeholder="joao@email.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Cadastrar cliente'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
