const CACHE = 'finflow-v1'

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(['/', '/dashboard', '/clientes', '/emprestimos'])
       .catch(() => {}) // ignora falhas — rotas protegidas redirecionam
    )
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Não intercepta chamadas de API ou Supabase
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return

  // Network-first: tenta buscar ao vivo; se offline, usa cache
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
