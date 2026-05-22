import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const { nome, email } = await req.json()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: `"FinFlow by Peanuts Labs" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: '🔔 Novo usuário aguardando aprovação — FinFlow',
      html: `
        <div style="font-family:sans-serif;max-width:480px">
          <h2 style="color:#111">Novo cadastro no FinFlow</h2>
          <p style="font-size:11px;color:#999">FinFlow · by Peanuts Labs</p>
          <p>Um novo usuário se cadastrou e está aguardando sua aprovação:</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;color:#666">Nome</td><td style="padding:8px;font-weight:600">${nome}</td></tr>
            <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px">${email}</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_URL}/admin" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">
            Acessar painel admin
          </a>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
