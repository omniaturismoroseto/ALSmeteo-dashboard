// accesso-staff.js
//
// Controlla che chi ha fatto il login sia davvero dello staff, e non un
// utente qualsiasi del progetto Firebase.
//
// PERCHE' SERVE
// Queste pagine vivono nello stesso progetto Firebase dell'app segnalazioni,
// e Firebase ha un solo elenco utenti per progetto: per Auth un cittadino
// iscritto alle segnalazioni e' identico a un bagnino. Fino a ieri le pagine
// controllavano solo "ha fatto il login", mai "chi e'" — quindi chiunque
// avesse un account nel progetto entrava nella plancia e nella gestione lidi.
//
// COME SI AUTORIZZA UNA PERSONA
// Nella console Firebase, Firestore, collezione `staff`: si crea un
// documento il cui ID e' l'uid della persona. Il contenuto non viene letto,
// bastano un paio di campi per ricordarsi di chi e':
//     staff/aBcD1234...   { nome: "Marco", aggiuntoIl: "2026-11-06" }
// Cancellare il documento toglie l'accesso. L'uid lo mostra la schermata di
// blocco qui sotto: chi non e' autorizzato lo legge e lo gira a chi gestisce.
//
// ATTENZIONE — QUESTO DA SOLO NON PROTEGGE I DATI
// Questo e' codice che gira nel browser: uno che sa usare gli strumenti per
// sviluppatori lo aggira. Serve a far trovare una porta chiusa e un messaggio
// chiaro a chi non deve entrare, e a dire nero su bianco qual e' la regola.
// La barriera vera sono le regole Firestore, che girano sui server di Google
// e nessuno puo' aggirare. Finche' non ci sono anche quelle, i dati (numeri
// di telefono dei lidi compresi) restano leggibili da qualunque account del
// progetto. Il blocco va messo sulle collezioni di questa app:
//
//     function eStaff() {
//       return request.auth != null
//         && exists(/databases/$(database)/documents/staff/$(request.auth.uid));
//     }
//     match /destinatariLidi/{id} { allow read: if eStaff(); allow write: if false; }
//     match /richiesteLidi/{id}   { allow read: if eStaff(); allow write: if false; }
//     ... idem per le altre collezioni meteo ...
//     match /staff/{uid}          { allow read: if request.auth.uid == uid;
//                                   allow write: if false; }
//
// (le Cloud Function usano l'Admin SDK e scavalcano le regole, quindi
//  continuano a scrivere come prima: `allow write: if false` blocca solo i
//  browser.)

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Restituisce true se la pagina puo' andare avanti, false se ha gia' mostrato
// la schermata di blocco e il chiamante deve fermarsi.
export async function accessoConsentito(db, auth, utente) {
  if (!utente) return true; // slegato: ci pensa gia' la schermata di login

  try {
    const scheda = await getDoc(doc(db, "staff", utente.uid));
    if (scheda.exists()) return true;
    mostraBlocco(auth, utente);
    return false;
  } catch (errore) {
    // Lettura fallita: quasi sempre perche' le regole Firestore non prevedono
    // ancora la collezione `staff`, e Firestore nega tutto cio' che non e'
    // esplicitamente permesso. In quel caso NON si chiude fuori nessuno: se
    // bloccassimo qui, pubblicare questo file prima di aggiornare le regole
    // lascerebbe tutto lo staff fuori dalla plancia, di colpo e tutti insieme.
    // Meglio lasciar passare e lamentarsi forte in console: tanto, finche' le
    // regole non ci sono, questo controllo non starebbe proteggendo nulla
    // comunque — la protezione vera e' la' dentro, non qui.
    console.warn(
      "[accesso-staff] Non riesco a leggere staff/" + utente.uid + ": " +
      (errore && errore.code ? errore.code : errore) +
      "\nL'accesso viene lasciato passare. Probabilmente le regole Firestore " +
      "non contemplano ancora la collezione `staff` — vedi le istruzioni in " +
      "cima a accesso-staff.js. Finche' non sono a posto, qualunque account " +
      "del progetto puo' leggere i dati di questa app."
    );
    return true;
  }
}

function mostraBlocco(auth, utente) {
  document.querySelectorAll("[data-blocco-staff]").forEach((n) => n.remove());

  const velo = document.createElement("div");
  velo.setAttribute("data-blocco-staff", "");
  velo.style.cssText =
    "position:fixed; inset:0; z-index:9999; background:#0A1C24; color:#E6EDF0;" +
    "display:flex; align-items:center; justify-content:center; padding:1.5rem;" +
    "font-family:'Space Grotesk', system-ui, sans-serif; text-align:center;";

  const scheda = document.createElement("div");
  scheda.style.cssText = "max-width:380px; display:flex; flex-direction:column; gap:0.9rem;";

  const titolo = document.createElement("h2");
  titolo.textContent = "Accesso non autorizzato";
  titolo.style.cssText = "margin:0; font-size:1.05rem; text-transform:uppercase; letter-spacing:0.02em;";

  const spiegazione = document.createElement("p");
  spiegazione.textContent =
    "Questo account esiste, ma non e' fra quelli abilitati alla plancia meteo. " +
    "Se ti serve l'accesso, gira il codice qui sotto a chi gestisce il servizio.";
  spiegazione.style.cssText = "margin:0; font-size:0.85rem; color:#9FB3BD; line-height:1.5;";

  const chi = document.createElement("div");
  chi.textContent = utente.email || "(nessuna email)";
  chi.style.cssText = "font-size:0.8rem; color:#9FB3BD;";

  // L'uid serve a chi autorizza: e' l'ID del documento da creare in staff/
  const codice = document.createElement("code");
  codice.textContent = utente.uid;
  codice.style.cssText =
    "font-family:'IBM Plex Mono', monospace; font-size:0.75rem; color:#C99B4A;" +
    "border:1px solid #1E3A47; border-radius:6px; padding:0.5rem; word-break:break-all;" +
    "user-select:all;";

  const esci = document.createElement("button");
  esci.textContent = "esci";
  esci.style.cssText =
    "align-self:center; background:transparent; border:1px solid #1E3A47; color:#9FB3BD;" +
    "font-family:'IBM Plex Mono', monospace; font-size:0.72rem; padding:0.4rem 1rem;" +
    "border-radius:20px; cursor:pointer;";
  esci.addEventListener("click", () => {
    velo.remove();
    signOut(auth);
  });

  scheda.append(titolo, spiegazione, chi, codice, esci);
  velo.appendChild(scheda);
  document.body.appendChild(velo);
}
