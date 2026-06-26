import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finflow',
    short_name: 'Finflow',
    description: 'Gestão de empréstimos para credores · by Peanuts Labs',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F5F1E8',
    theme_color: '#232830',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
