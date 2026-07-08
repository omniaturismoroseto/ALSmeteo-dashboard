// service-worker.js
// Versione minima: serve SOLO a soddisfare il requisito tecnico dei browser
// per rendere la pagina installabile come app. Niente intercettazione delle
// richieste di rete: farlo (anche solo per "passare alla rete") aggiunge un
// passaggio in più ad ogni singola richiesta, incluse quelle che Firestore
// tiene aperte per leggere i dati — rallentando tutto senza alcun beneficio,
// dato che comunque non facciamo caching.

self.addEventListener("install", (evento) => {
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  self.clients.claim();
});

// Nessun listener "fetch": le richieste passano dirette alla rete, come se
// il service worker non ci fosse — è lì solo per il requisito di installabilità.
