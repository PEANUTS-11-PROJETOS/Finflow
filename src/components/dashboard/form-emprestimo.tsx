'use client'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { criarEmprestimo } from '@/app/(dashboard)/emprestimos/actions'
import { calcularParcelas, fmtMoeda } from '@/lib/utils'
import type { Cliente } from '@/types'

const schemaPrice = z.object({
  tipo:            z.literal('price'),
  cliente_id:      z.string().min(1, 'Selecione um cliente'),
  valor_principal: z.coerce.number().positive('Informe o valor'),
  taxa_juros:      z.coerce.number().min(0),
  num_parcelas:    z.coerce.number().int().min(1).max(360),
  data_inicio:     z.string().min(1, 'Informe a data'),
  observacoes:     z.string().optional(),
})

const schemaRenovavel = z.object({
  tipo:            z.literal('renovavel'),
  cliente_id:      z.string().min(1, 'Selecione um cliente'),
  valor_principal: z.coerce.number().positive('Informe o valor'),
  taxa_juros:      z.coerce.number().min(0),
  data_vencimento: z.string().min(1, 'Informe o vencimento'),
  observacoes:     z.string().optional(),
})

type PriceValues     = z.infer<typeof schemaPrice>
type RenovavelValues = z.infer<typeof schemaRenovavel>

interface Props {
  clientes: Pick<Cliente, 'id' | 'nome'>[]
}

export function FormEmprestimo({ clientes }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'price' | 'renovavel'>('price')

  const formPrice = useForm<PriceValues>({
    resolver: zodResolver(schemaPrice),
    defaultValues: { tipo: 'price', cliente_id: '', observacoes: '' },
  })

  const formRenovavel = useForm<RenovavelValues>({
    resolver: zodResolver(schemaRenovavel),
    defaultValues: { tipo: 'renovavel', cliente_id: '', observacoes: '' },
  })

  // Prévia Price
  const [vp, vt, vn] = useWatch({ control: formPrice.control, name: ['valor_principal', 'taxa_juros', 'num_parcelas'] })
  const valorParcelaPrice = (() => {
    if (!vp || vp <= 0 || !vn || vn <= 0) return null
    const t = (vt ?? 0) / 100
    if (t === 0) return vp / vn
    return (vp * t * Math.pow(1 + t, vn)) / (Math.pow(1 + t, vn) - 1)
  })()

  // Prévia Renovável
  const [rvp, rtr] = useWatch({ control: formRenovavel.control, name: ['valor_principal', 'taxa_juros'] })
  const jurosRenovavel = (rvp && rvp > 0 && rtr != null && rtr >= 0) ? rvp * (rtr / 100) : null

  async function onSubmitPrice(values: PriceValues) {
    const result = await criarEmprestimo(values)
    if (result?.error) { toast.error('Erro ao criar empréstimo'); return }
    toast.success('Empréstimo criado!')
    router.push(`/emprestimos/${result.id}`)
    router.refresh()
  }

  async function onSubmitRenovavel(values: RenovavelValues) {
    const result = await criarEmprestimo(values)
    if (result?.error) { toast.error('Erro ao criar empréstimo'); return }
    toast.success('Empréstimo renovável criado!')
    router.push(`/emprestimos/${result.id}`)
    router.refresh()
  }

  const camposComuns = (form: typeof formPrice | typeof formRenovavel) => (
    <>
      <FormField control={form.control as typeof formPrice.control} name="cliente_id" render={({ field }) => (
        <FormItem>
          <FormLabel>Cliente *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger></FormControl>
            <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control as typeof formPrice.control} name="valor_principal" render={({ field }) => (
          <FormItem>
            <FormLabel>Valor principal (R$) *</FormLabel>
            <FormControl><Input type="number" step="0.01" min="0" placeholder="1000.00" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control as typeof formPrice.control} name="taxa_juros" render={({ field }) => (
          <FormItem>
            <FormLabel>Taxa de juros (% a.m.) *</FormLabel>
            <FormControl><Input type="number" step="0.01" min="0" placeholder="5.00" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control as typeof formPrice.control} name="observacoes" render={({ field }) => (
        <FormItem>
          <FormLabel>Observações</FormLabel>
          <FormControl><Input placeholder="Anotações..." {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )

  return (
    <div className="space-y-6">
      <Tabs value={tipo} onValueChange={v => setTipo(v as 'price' | 'renovavel')}>
        <TabsList>
          <TabsTrigger value="price">Parcelas fixas (Tabela Price)</TabsTrigger>
          <TabsTrigger value="renovavel">Renovável (juros mensais)</TabsTrigger>
        </TabsList>
      </Tabs>

      {tipo === 'price' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Form {...formPrice}>
            <form onSubmit={formPrice.handleSubmit(onSubmitPrice)} className="space-y-4">
              {camposComuns(formPrice)}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={formPrice.control} name="num_parcelas" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de parcelas *</FormLabel>
                    <FormControl><Input type="number" min="1" max="360" placeholder="12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={formPrice.control} name="data_inicio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de início *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={formPrice.formState.isSubmitting}>
                  {formPrice.formState.isSubmitting ? 'Criando...' : 'Criar empréstimo'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              </div>
            </form>
          </Form>
          <Card className="h-fit">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Prévia — Tabela Price</p>
              {valorParcelaPrice ? (
                <>
                  <div><p className="text-xs text-muted-foreground">Parcela mensal</p><p className="text-2xl font-bold">{fmtMoeda(valorParcelaPrice)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total a receber</p><p className="text-lg font-semibold">{fmtMoeda(valorParcelaPrice * vn)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total de juros</p><p className="text-lg font-semibold text-amber-600">{fmtMoeda(valorParcelaPrice * vn - vp)}</p></div>
                </>
              ) : <p className="text-sm text-muted-foreground">Preencha os campos.</p>}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Form {...formRenovavel}>
            <form onSubmit={formRenovavel.handleSubmit(onSubmitRenovavel)} className="space-y-4">
              {camposComuns(formRenovavel)}
              <FormField control={formRenovavel.control} name="data_vencimento" render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do primeiro vencimento *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={formRenovavel.formState.isSubmitting}>
                  {formRenovavel.formState.isSubmitting ? 'Criando...' : 'Criar empréstimo'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              </div>
            </form>
          </Form>
          <Card className="h-fit">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Prévia mensal</p>
              {jurosRenovavel !== null && rvp > 0 ? (
                <>
                  <div><p className="text-xs text-muted-foreground">Juros do período</p><p className="text-2xl font-bold text-amber-600">{fmtMoeda(jurosRenovavel)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total se pagar tudo</p><p className="text-lg font-semibold">{fmtMoeda(rvp + jurosRenovavel)}</p></div>
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    Se pagar só os juros ({fmtMoeda(jurosRenovavel)}), o principal de {fmtMoeda(rvp)} rola para o mês seguinte.
                  </div>
                </>
              ) : <p className="text-sm text-muted-foreground">Preencha os campos.</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
