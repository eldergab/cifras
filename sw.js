// Service worker das Cifras. Se mudar os arquivos do app, troque o número da versão.
const V = "cifras-v1";
const BASE = ["./", "index.html", "indice.json", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  if (url.pathname.endsWith(".txt")) {
    // Cifras: usa a cópia guardada na hora e atualiza em segundo plano
    e.respondWith(
      caches.open(V).then(async c => {
        const guardada = await c.match(req);
        const rede = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
        return guardada || (await rede) || new Response("Cifra indisponível offline.", { status: 504 });
      })
    );
    return;
  }

  // App e índice: tenta a rede primeiro (pega novidades) e cai no cache se estiver offline
  e.respondWith(
    fetch(req)
      .then(r => { const copia = r.clone(); caches.open(V).then(c => c.put(req, copia)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
