# Librerie di terze parti, copiate qui dentro

Prima stavano su CDN pubblici (cdnjs e unpkg) e venivano caricate senza
`integrity`: il browser prendeva per buono qualunque cosa il CDN gli
rispondesse. Se uno di quei CDN venisse compromesso, il codice ostile
finirebbe dentro pagine dove lo staff e' autenticato — con in mano il
token e le Cloud Function privilegiate.

Tenendo i file qui si toglie il CDN dalla catena di fiducia invece di
limitarsi a controllarlo, non c'e' nessun hash da aggiornare a ogni
cambio di versione, e l'app funziona anche senza rete — utile per una
PWA che si usa in spiaggia con il segnale ballerino.

## Cosa c'e'

| file | pacchetto npm | versione |
|---|---|---|
| `leaflet/leaflet.js`      | leaflet  | 1.9.4 |
| `leaflet/leaflet.css`     | leaflet  | 1.9.4 |
| `leaflet/images/*.png`    | leaflet  | 1.9.4 |
| `chartjs/chart.umd.js`    | chart.js | 4.4.1 |

I file sono identici byte per byte a quelli pubblicati su npm: non sono
stati modificati. `leaflet.css` cerca le icone in `images/` accanto a se'
stesso, per questo la cartella va tenuta dov'e'.

## Verificare che non siano stati toccati

    sha256sum vendor/leaflet/leaflet.js vendor/leaflet/leaflet.css vendor/chartjs/chart.umd.js

    db49d009c841f5ca34a888c96511ae936fd9f5533e90d8b2c4d57596f4e5641a  vendor/leaflet/leaflet.js
    a7837102824184820dfa198d1ebcd109ff6d0ff9a2672a074b9a1b4d147d04c6  vendor/leaflet/leaflet.css
    74401d738dd3e03ee5dfb3b6841210fe2c4ead8a960c4011ca4ba0b78a9fd8f3  vendor/chartjs/chart.umd.js

## Aggiornare una libreria

    npm pack leaflet@<versione>
    tar -xzf leaflet-<versione>.tgz
    cp package/dist/leaflet.js package/dist/leaflet.css vendor/leaflet/
    cp package/dist/images/*.png vendor/leaflet/images/

Poi riapri le pagine che la usano e controlla che mappe e grafici si
vedano ancora. Non servono altre modifiche: i percorsi restano gli stessi.

Non sono inclusi i file `.map`: con gli strumenti per sviluppatori aperti
il browser prova a cercarli e riceve un 404 innocuo. Se danno fastidio,
copia anche `leaflet.js.map` e `chart.umd.js.map` dagli stessi pacchetti.
