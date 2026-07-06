// service-worker.js
// Versione minima: non fa caching aggressivo (i dati meteo devono sempre
// essere freschi, mai da cache), serve solo a soddisfare il requisito
// tecnico dei browser per rendere la pagina installabile come app.

self.addEventListener("install", (evento) => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  self.clients.claim();
});

// Passa sempre alla rete: nessun dato meteo va mai servito da cache.
self.addEventListener("fetch", (evento) => {
  evento.respondWith(fetch(evento.request));
});
