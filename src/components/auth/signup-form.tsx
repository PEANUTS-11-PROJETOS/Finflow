'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TERMOS_VERSAO } from '@/lib/termos'

const schema = z.object({
  nome:  z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  termos: z.boolean().refine(v => v === true, 'Você precisa aceitar os Termos e a Política de Privacidade para criar a conta'),
})
type FormValues = z.infer<typeof schema>

export function SignupForm() {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: '', email: '', senha: '', termos: false },
  })

  async function onSubmit({ nome, email, senha }: FormValues) {
    setErro(null)
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome, termos_versao: TERMOS_VERSAO } },
    })
    if (error) {
      setErro(error.message)
      return
    }
    await fetch('/api/notify-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email }),
    })
    setSucesso(true)
  }

  if (sucesso) {
    return (
      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center text-sm space-y-1">
        <p className="font-medium">Cadastro realizado!</p>
        <p className="text-muted-foreground">
          Sua conta está aguardando aprovação do administrador. Em breve você receberá acesso.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="termos"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="flex items-start gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    id="termos"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
                  />
                </FormControl>
                <label htmlFor="termos" className="text-xs leading-relaxed text-muted-foreground cursor-pointer">
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" className="underline underline-offset-2 hover:text-foreground">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link href="/privacidade" target="_blank" className="underline underline-offset-2 hover:text-foreground">Política de Privacidade</Link>.
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta grátis'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Entrar
          </Link>
        </p>
      </form>
    </Form>
  )
}
