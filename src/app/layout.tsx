// src/app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// NOVO — para os números-herói (R$ grandes em cards de carteira / cobrança)
const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Finflow',
  description: 'Gestão de empréstimos para credores',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-br"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
