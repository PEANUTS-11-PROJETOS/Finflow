import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EVOLUTION_URL      = Deno.env.get('EVOLUTION_API_URL')!
const EVOLUTION_KEY      = Deno.env.get('EVOLUTION_API_KEY')!
const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE')!

// Número do Supabase (11989408375) é configurado via EVOLUTION_INSTANCE no Railway

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const hoje    = new Date().toISOString().split('T')[0]
    const em3dias = new Date(Date.now() + 3 * 86_400_000).toISOString().split('T')[0]

    // Trial: 30 dias. Cutoff = data a partir da qual o trial ainda está ativo
    const trialCutoff = new Date(Date.now() - 30 * 86_400_000).toISOString()

    // Credores elegíveis: ativo com vencimento futuro OU trial dentro dos 30 dias
    const { data: credores, error: errCredores } = await supabase
      .from('credores')
      .select('id, nome, telefone')
      .eq('whatsapp_notificacoes', true)
      .eq('ativo', true)
      .not('telefone', 'is', null)
      .or(`and(plano.eq.ativo,data_vencimento.gte.${hoje}),and(plano.eq.trial,created_at.gte.${trialCutoff})`)

    if (errCredores) throw errCredores
    if (!credores?.length) {
      return json({ enviados: 0, motivo: 'Nenhum credor elegível com WhatsApp ativo' })
    }

    let enviados = 0

    for (const credor of credores) {
      const { data: parcelas } = await supabase
        .from('parcelas')
        .select(`
          id, valor, vencimento,
          emprestimos!inner (
            clientes!inner ( nome )
          )
        `)
        .eq('credor_id', credor.id)
        .in('vencimento', [hoje, em3dias])
        .eq('pago', false)

      if (!parcelas?.length) continue

      type ParcelaRow = {
        id: string
        valor: number
        vencimento: string
        emprestimos: { clientes: { nome: string } }
      }

      const rows     = parcelas as unknown as ParcelaRow[]
      const deHoje   = rows.filter(p => p.vencimento === hoje)
      const de3dias  = rows.filter(p => p.vencimento === em3dias)

      if (!deHoje.length && !de3dias.length) continue

      let msg = `🌅 Bom dia, ${credor.nome}!\n\n`

      if (deHoje.length) {
        msg += `📅 *Vencem hoje:*\n`
        for (const p of deHoje) {
          msg += `• ${p.emprestimos.clientes.nome} → ${fmtR$(p.valor)}\n`
        }
        const totalHoje = deHoje.reduce((s, p) => s + p.valor, 0)
        msg += `*Total hoje: ${fmtR$(totalHoje)}*\n\n`
      }

      if (de3dias.length) {
        const data3 = fmtData(em3dias)
        msg += `⏰ *Vencem em 3 dias (${data3}):*\n`
        for (const p of de3dias) {
          msg += `• ${p.emprestimos.clientes.nome} → ${fmtR$(p.valor)}\n`
        }
        msg += '\n'
      }

      // Footer que deixa claro que é envio automático (one-way)
      msg += `_Envio automático FinFlow — não responda esta mensagem._`

      const numero = normalizar(credor.telefone as string)

      const res = await fetch(
        `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_KEY,
          },
          body: JSON.stringify({ number: numero, text: msg }),
        },
      )

      if (res.ok) {
        enviados++
      } else {
        const body = await res.text()
        console.error(`Falha ao enviar para credor ${credor.id}: ${res.status} ${body}`)
      }
    }

    return json({ enviados, total: credores.length })
  } catch (err) {
    console.error(err)
    return json({ error: String(err) }, 500)
  }
})

function fmtR$(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fmtData(d: string): string {
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function normalizar(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
