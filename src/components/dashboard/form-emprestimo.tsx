'use client'
import { useState } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { criarEmprestimo } from '@/app/(dashboard)/emprestimos/actions'
import { criarCliente } from '@/app/(dashboard)/clientes/actions'
import { fmtMoeda } from '@/lib/utils'
import type { Cliente } from '@/types'
import { UserPlus } from 'lucide-react'

const INPUT_CLS = "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

const schemaPrice = z.object({
  valor_principal:  z.coerce.number().positive('Informe o valor'),
  taxa_juros:       z.coerce.number().min(0),
  num_parcelas:     z.coerce.number().int().min(1).max(360),
  data_inicio:      z.string().min(1, 'Informe a data'),
  taxa_mora_diaria: z.coerce.number().min(0).max(100).optional().nullable(),
  observacoes:      z.string().optional(),
})

const schemaRenovavel = z.object({
  valor_principal:  z.coerce.number().positive('Informe o valor'),
  taxa_juros:       z.coerce.number().min(0),
  data_vencimento:  z.string().min(1, 'Informe o vencimento'),
  taxa_mora_diaria: z.coerce.number().min(0).max(100).optional().nullable(),
  observacoes:      z.string().optional(),
})

const schemaNovoCliente = z.object({
  nome:     z.string().min(2, 'Nome obrigatório'),
  cpf:      z.string().optional(),
  telefone: z.string().optional(),
  email:    z.string().email('Email inválido').optional().or(z.literal('')),
})

type PriceValues        = z.infer<typeof schemaPrice>
type RenovavelValues    = z.infer<typeof schemaRenovavel>
type NovoClienteValues  = z.infer<typeof schemaNovoCliente>

interface Props {
  clientes: Pick<Cliente, 'id' | 'nome'>[]
}

function ClienteSelect({
  clientes,
  value,
  onChange,
  onAdd,
}: {
  clientes: Pick<Cliente, 'id' | 'nome'>[]
  value: string
  onChange: (id: string) => void
  onAdd: (cliente: Pick<Cliente, 'id' | 'nome'>) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<NovoClienteValues>({
    resolver: zodResolver(schemaNovoCliente),
    defaultValues: { nome: '', cpf: '', telefone: '', email: '' },
  })

  async function onSubmit(values: NovoClienteValues) {
    const result = await criarCliente(values)
    if (result?.error) {
      toast.error('Erro ao cadastrar cliente')
      return
    }
    toast.success('Cliente cadastrado!')
    setDialogOpen(false)
    form.reset()
    if (result.id && result.nome) {
      onAdd({ id: result.id, nome: result.nome })
      onChange(result.id)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Cliente *</label>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Novo cliente
        </button>
      </div>

      <select value={value} onChange={e => onChange(e.target.value)} className={INPUT_CLS}>
        <option value="">Selecione o cliente</option>
        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar novo cliente</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo *</FormLabel>
                  <Input placeholder="João da Silva" {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="cpf" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <Input placeholder="000.000.000-00" {...field} />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telefone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <Input placeholder="(11) 99999-9999" {...field} />
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" placeholder="joao@email.com" {...field} />
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-1">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function FormEmprestimo({ clientes: clientesIniciais }: Props) {
  const router = useRouter()
  const [tipo, setTipo] = useState<'price' | 'renovavel'>('price')
  const [clientePrice, setClientePrice] = useState('')
  const [clienteRenovavel, setClienteRenovavel] = useState('')
  const [clientes, setClientes] = useState(clientesIniciais)

  function onAdd(cliente: Pick<Cliente, 'id' | 'nome'>) {
    setClientes(prev => [...prev, cliente].sort((a, b) => a.nome.localeCompare(b.nome)))
  }

  const formPrice = useForm<PriceValues>({
    resolver: zodResolver(schemaPrice) as unknown as Resolver<PriceValues>,
    defaultValues: {
      valor_principal: '' as unknown as number,
      taxa_juros:      '' as unknown as number,
      num_parcelas:    '' as unknown as number,
      data_inicio: '',
      observacoes: '',
    },
  })

  const formRenovavel = useForm<RenovavelValues>({
    resolver: zodResolver(schemaRenovavel) as unknown as Resolver<RenovavelValues>,
    defaultValues: {
      valor_principal: '' as unknown as number,
      taxa_juros:      '' as unknown as number,
      data_vencimento: '',
      observacoes: '',
    },
  })

  const [vp, vt, vn] = useWatch({ control: formPrice.control, name: ['valor_principal', 'taxa_juros', 'num_parcelas'] })
  const valorParcelaPrice = (() => {
    if (!vp || Number(vp) <= 0 || !vn || Number(vn) <= 0) return null
    const t = Number(vt ?? 0) / 100
    if (t === 0) return Number(vp) / Number(vn)
    return (Number(vp) * t * Math.pow(1 + t, Number(vn))) / (Math.pow(1 + t, Number(vn)) - 1)
  })()

  const [rvp, rtr] = useWatch({ control: formRenovavel.control, name: ['valor_principal', 'taxa_juros'] })
  const jurosRenovavel = (rvp && Number(rvp) > 0 && rtr != null) ? Number(rvp) * (Number(rtr) / 100) : null

  const nomeClientePrice     = clientes.find(c => c.id === clientePrice)?.nome
  const nomeClienteRenovavel = clientes.find(c => c.id === clienteRenovavel)?.nome

  async function onSubmitPrice(values: PriceValues) {
    if (!clientePrice) { toast.error('Selecione um cliente'); return }
    const result = await criarEmprestimo({ ...values, tipo: 'price' as const, cliente_id: clientePrice })
    if (result?.error) { toast.error(typeof result.error === 'string' ? result.error : 'Verifique os campos.'); return }
    toast.success('Empréstimo criado!')
    router.push(`/emprestimos/${result.id}`)
    router.refresh()
  }

  async function onSubmitRenovavel(values: RenovavelValues) {
    if (!clienteRenovavel) { toast.error('Selecione um cliente'); return }
    const result = await criarEmprestimo({ ...values, tipo: 'renovavel' as const, cliente_id: clienteRenovavel })
    if (result?.error) { toast.error(typeof result.error === 'string' ? result.error : 'Verifique os campos.'); return }
    toast.success('Empréstimo renovável criado!')
    router.push(`/emprestimos/${result.id}`)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Tabs value={tipo} onValueChange={v => setTipo(v as 'price' | 'renovavel')}>
        <TabsList>
          <TabsTrigger value="price">Parcelas fixas (Tabela Price)</TabsTrigger>
          <TabsTrigger value="renovavel">Renovável (juros mensais)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── TABELA PRICE ── */}
      {tipo === 'price' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <ClienteSelect
              clientes={clientes}
              value={clientePrice}
              onChange={setClientePrice}
              onAdd={onAdd}
            />

            <Form {...formPrice}>
              <form onSubmit={formPrice.handleSubmit(onSubmitPrice)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={formPrice.control} name="valor_principal" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor principal (R$) *</FormLabel>
                      <input type="number" step="0.01" min="0" placeholder="1000.00"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={formPrice.control} name="taxa_juros" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de juros (% a.m.) *</FormLabel>
                      <input type="number" step="0.01" min="0" placeholder="5.00"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={formPrice.control} name="num_parcelas" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de parcelas *</FormLabel>
                      <input type="number" min="1" max="360" placeholder="12"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={formPrice.control} name="data_inicio" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de início *</FormLabel>
                      <input type="date"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={formPrice.control} name="taxa_mora_diaria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Juros de mora (% ao dia)
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">opcional</span>
                      </FormLabel>
                      <input type="number" step="0.001" min="0" max="100" placeholder="0.033"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={formPrice.control} name="observacoes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <input type="text" placeholder="Anotações..."
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
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
          </div>

          <Card className="h-fit">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Prévia — Tabela Price</p>
              {nomeClientePrice && (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-semibold">{nomeClientePrice}</p>
                </div>
              )}
              {valorParcelaPrice ? (
                <>
                  <div><p className="text-xs text-muted-foreground">Parcela mensal</p><p className="text-2xl font-bold">{fmtMoeda(valorParcelaPrice)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total a receber</p><p className="text-lg font-semibold">{fmtMoeda(valorParcelaPrice * Number(vn))}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total de juros</p><p className="text-lg font-semibold text-amber-600">{fmtMoeda(valorParcelaPrice * Number(vn) - Number(vp))}</p></div>
                </>
              ) : <p className="text-sm text-muted-foreground">Preencha os campos.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── RENOVÁVEL ── */}
      {tipo === 'renovavel' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <ClienteSelect
              clientes={clientes}
              value={clienteRenovavel}
              onChange={setClienteRenovavel}
              onAdd={onAdd}
            />

            <Form {...formRenovavel}>
              <form onSubmit={formRenovavel.handleSubmit(onSubmitRenovavel)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={formRenovavel.control} name="valor_principal" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor principal (R$) *</FormLabel>
                      <input type="number" step="0.01" min="0" placeholder="1000.00"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={formRenovavel.control} name="taxa_juros" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de juros (% a.m.) *</FormLabel>
                      <input type="number" step="0.01" min="0" placeholder="5.00"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={formRenovavel.control} name="data_vencimento" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do primeiro vencimento *</FormLabel>
                    <input type="date"
                      name={field.name} onBlur={field.onBlur}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value)}
                      className={INPUT_CLS}
                    />
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField control={formRenovavel.control} name="taxa_mora_diaria" render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Juros de mora (% ao dia)
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">opcional</span>
                      </FormLabel>
                      <input type="number" step="0.001" min="0" max="100" placeholder="0.033"
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={formRenovavel.control} name="observacoes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <input type="text" placeholder="Anotações..."
                        name={field.name} onBlur={field.onBlur}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        className={INPUT_CLS}
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={formRenovavel.formState.isSubmitting}>
                    {formRenovavel.formState.isSubmitting ? 'Criando...' : 'Criar empréstimo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                </div>
              </form>
            </Form>
          </div>

          <Card className="h-fit">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Prévia mensal</p>
              {nomeClienteRenovavel && (
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-semibold">{nomeClienteRenovavel}</p>
                </div>
              )}
              {jurosRenovavel !== null && Number(rvp) > 0 ? (
                <>
                  <div><p className="text-xs text-muted-foreground">Juros do período</p><p className="text-2xl font-bold text-amber-600">{fmtMoeda(jurosRenovavel)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Total se pagar tudo</p><p className="text-lg font-semibold">{fmtMoeda(Number(rvp) + jurosRenovavel)}</p></div>
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    Se pagar só os juros ({fmtMoeda(jurosRenovavel)}), o principal de {fmtMoeda(Number(rvp))} rola para o mês seguinte.
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
