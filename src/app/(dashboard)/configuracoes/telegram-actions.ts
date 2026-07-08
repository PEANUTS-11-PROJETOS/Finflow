'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { enviarTelegram, escaparHtml } from '@/lib/telegram'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!

type UpdateMsg = { message?: { text?: string; chat?: { id: number } } }

/**
 * Confirma a conexão: procura no Telegram a mensagem "/start <credorId>"
 * gerada pelo botão de conectar e grava o chat_id do credor.
 */
export async function verificarConexaoTelegram(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  let updates: UpdateMsg[]
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getUpdates`, { cache: 'no-store' })
    const json = await res.json()
    if (!json.ok) return { error: 'Não foi possível consultar o Telegram. Tente novamente.' }
    updates = json.result as UpdateMsg[]
  } catch {
    return { error: 'Falha ao conectar no Telegram.' }
  }

  // Do mais recente para o mais antigo, acha o /start com o ID deste credor
  const match = [...updates].reverse().find(
    u => u.message?.text === `/start ${user.id}` && u.message.chat?.id,
  )
  if (!match) {
    return { error: 'Não encontramos o "Iniciar". Abra o bot, aperte Iniciar e tente de novo.' }
  }

  const chatId = String(match.message!.chat!.id)

  const { data: credor } = await supabase
    .from('credores')
    .select('nome')
    .eq('id', user.id)
    .single()

  const { error } = await supabase
    .from('credores')
    .update({ telegram_chat_id: chatId, whatsapp_notificacoes: true })
    .eq('id', user.id)

  if (error) return { error: error.message }

  const primeiroNome = credor?.nome ? escaparHtml(credor.nome.split(' ')[0]) : ''
  await enviarTelegram(
    chatId,
    `✅ <b>FinFlow conectado${primeiroNome ? ', ' + primeiroNome : ''}!</b>\n\n` +
      `Você vai receber o resumo diário dos vencimentos por aqui todo dia às 8h.\n\n` +
      `<i>FinFlow · Gestão de Empréstimos</i>`,
  )

  revalidatePath('/configuracoes')
  return { success: true }
}

/** Envia uma mensagem de teste ao chat conectado. */
export async function enviarTesteTelegram(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data: credor } = await supabase
    .from('credores')
    .select('telegram_chat_id')
    .eq('id', user.id)
    .single()

  if (!credor?.telegram_chat_id) return { error: 'Telegram não conectado.' }

  const ok = await enviarTelegram(
    credor.telegram_chat_id,
    `🔔 <b>Teste de notificação</b>\n\nEstá funcionando! É assim que você vai receber os resumos diários.\n\n<i>FinFlow</i>`,
  )
  return ok ? { success: true } : { error: 'Não foi possível enviar. Reconecte o Telegram.' }
}

/** Remove o vínculo do Telegram. */
export async function desconectarTelegram(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('credores')
    .update({ telegram_chat_id: null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/configuracoes')
  return { success: true }
}
