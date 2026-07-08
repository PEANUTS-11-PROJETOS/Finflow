const TOKEN = process.env.TELEGRAM_BOT_TOKEN!

/** Escapa caracteres reservados do parse_mode HTML do Telegram. */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Envia uma mensagem via Telegram Bot API.
 * A mensagem deve usar formatação HTML (<b>, <i>) — valores dinâmicos
 * (nomes etc.) precisam passar por escaparHtml() antes de montar o texto.
 */
export async function enviarTelegram(chatId: string, mensagem: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagem,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
