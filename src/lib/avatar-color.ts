// src/lib/avatar-color.ts
// Cor de fundo determinística para avatars de cliente, baseada no nome.
// Paleta harmônica — todos os tons compartilham chroma baixo (~0.04) e luminância clara (~0.85).

const PALETTE = [
  'oklch(0.85 0.05 30)',   // pêssego
  'oklch(0.85 0.05 70)',   // areia
  'oklch(0.85 0.05 110)',  // limão pálido
  'oklch(0.85 0.05 150)',  // sálvia clara
  'oklch(0.85 0.05 200)',  // azul-céu
  'oklch(0.82 0.04 260)',  // lilás
  'oklch(0.82 0.04 320)',  // rosa-velho
  'oklch(0.83 0.05 10)',   // coral
]

export function avatarColor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function iniciais(nome: string | null | undefined): string {
  if (!nome) return '?'
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}
