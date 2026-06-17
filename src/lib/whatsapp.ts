const BASE_URL = process.env.EVOLUTION_API_URL!
const API_KEY  = process.env.EVOLUTION_API_KEY!
const INSTANCE = process.env.EVOLUTION_INSTANCE!

export async function enviarWhatsapp(telefone: string, mensagem: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/message/sendText/${INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: API_KEY,
      },
      body: JSON.stringify({
        number: `55${telefone}`,
        text: mensagem,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
