import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enviarTelegram, escaparHtml } from '@/lib/telegram'
import { estadoConta } from '@/lib/planos'
import { fmtMoeda } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const hoje     = new Date()
  const em3dias  = new Date(hoje)
  em3dias.setDate(hoje.getDate() + 3)

  const hojeStr    = hoje.toISOString().split('T')[0]
  const em3diasStr = em3dias.toISOString().split('T')[0]

  // Credores com notificações habilitadas e Telegram conectado.
  // Trial e ativo recebem; expirados são filtrados no loop via estadoConta.
  const { data: credores } = await supabase
    .from('credores')
    .select('id, nome, telegram_chat_id, plano, created_at, data_vencimento')
    .eq('whatsapp_notificacoes', true)
    .not('telegram_chat_id', 'is', null)

  if (!credores?.length) {
    return NextResponse.json({ ok: true, enviados: 0 })
  }

  let enviados = 0

  for (const credor of credores) {
    // Não notifica contas expiradas (trial vencido ou plano lapso)
    if (estadoConta(credor.plano, credor.created_at, credor.data_vencimento) === 'expirado') continue

    const { data: parcelas } = await supabase
      .from('parcelas')
      .select('vencimento, valor, emprestimos(clientes(nome))')
      .eq('credor_id', credor.id)
      .eq('pago', false)
      .eq('rolado', false)
      .gte('vencimento', hojeStr)
      .lte('vencimento', em3diasStr)
      .order('vencimento', { ascending: true })

    if (!parcelas?.length) continue

    const hoje_list   = parcelas.filter(p => p.vencimento === hojeStr)
    const proximas    = parcelas.filter(p => p.vencimento > hojeStr)
    const totalHoje   = hoje_list.reduce((s, p) => s + p.valor, 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function nomeCliente(p: any): string {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emp = p.emprestimos as any
      const cli = Array.isArray(emp) ? emp[0]?.clientes : emp?.clientes
      return (Array.isArray(cli) ? cli[0]?.nome : cli?.nome) ?? 'Cliente'
    }

    let msg = `📊 <b>Resumo FinFlow — ${hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</b>\n\n`

    if (hoje_list.length) {
      msg += `<b>Vencendo hoje:</b>\n`
      msg += hoje_list.map(p => `• ${escaparHtml(nomeCliente(p))} — ${fmtMoeda(p.valor)}`).join('\n')
      msg += `\n\n💰 Total hoje: <b>${fmtMoeda(totalHoje)}</b>\n`
    } else {
      msg += `✅ Nenhum vencimento hoje.\n`
    }

    if (proximas.length) {
      msg += `\n<b>Próximos 3 dias:</b>\n`
      msg += proximas.map(p => {
        const venc = new Date(p.vencimento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        return `• ${escaparHtml(nomeCliente(p))} — ${fmtMoeda(p.valor)} (${venc})`
      }).join('\n')
    }

    msg += `\n\n<i>FinFlow · Gestão de Empréstimos</i>`

    const ok = await enviarTelegram(credor.telegram_chat_id!, msg)
    if (ok) enviados++
  }

  return NextResponse.json({ ok: true, enviados, total: credores.length })
}
