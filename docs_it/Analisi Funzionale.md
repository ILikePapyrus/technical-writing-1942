# Analisi Funzionale e Tecnica (AFT)

| Campo               | Valore             |
| :------------------ | :----------------- |
| **Documento ID**    | AFT-1942-WEB-V1.0  |
| **Riferimento PRD** | PRD-1942-WEB-V1.0  |
| **Autore**          | Gemini AI Analyst  |
| **Data Versione**   | 5 Novembre 2025    |
| **Target Audience** | AI Developer (LLM) |

---

## 1. Obiettivo del Documento

Questa analisi traduce i requisiti del PRD in specifiche tecniche e funzionali attuabili.
Serve come guida prescrittiva per l'LLM, descrivendo l'architettura software,
i pattern di progettazione e le logiche di implementazione necessarie per costruire il gioco "1942" in
**HTML, CSS e Vanilla JavaScript**.

## 2. Architettura della Soluzione

Come da PRD, l'implementazione deve evitare framework esterni. La logica sarà suddivisa in tre file principali:
`index.html`, `style.css`, `game.js`.

### 2.1. Componente HTML (`index.html`)

L'HTML definirà la struttura statica. Sarà minimale e conterrà:

- Un _wrapper_ generale (`<div id="game-wrapper">`).
- L'interfaccia utente (`<div id="ui-hud">`) per punteggio, vite e loop.
- Il contenitore principale del gioco (`<div id="game-container">`).
  Questo elemento funge da **viewport** e "mondo" di gioco.
- L'elemento del giocatore (`<div id="player">`) posizionato all'interno del `game-container`.
- Tutti gli altri elementi (nemici, proiettili, POW) saranno generati dinamicamente tramite JS e aggiunti al `game-container`.

### 2.2. Componente CSS (`style.css`)

Il CSS gestirà tutto il rendering visivo e le animazioni di base.

- **Rendering degli Sprite:** L'approccio preferito, come da PRD, è la **manipolazione del DOM**.
  Tutti gli elementi di gioco (giocatore, nemici, proiettili) saranno `div` stilizzati.
  - `#game-container` avrà `position: relative;` e `overflow: hidden;`.
  - `#player`, `.enemy`, `.projectile` avranno `position: absolute;`.
    La loro posizione sarà aggiornata da JS modificando `style.transform = 'translate(x, y)'`
    (preferibile a `top`/`left` per performance di rendering).
- **Scorrimento Verticale:** Sarà implementato tramite un'animazione CSS `@keyframes`.
  L'elemento `body` o `#game-container` avrà un `background-image` (placeholder) e
  l'animazione ne modificherà il `background-position-y` in modo continuo e ciclico per simulare il movimento.
- **Asset Placeholder:** Gli sprite saranno forme CSS:
  - **Giocatore:** Un rettangolo con un colore distintivo (es. blu).
  - **Nemici:** Rettangoli più piccoli (es. verdi, rossi per le formazioni).
  - **Proiettili:** Piccoli cerchi o rettangoli sottili (es. bianchi per il player, arancioni per i nemici).

### 2.3. Componente JavaScript (`game.js`) - Architettura Core

Questo file conterrà l'intera logica di gioco.
Si raccomanda un **approccio orientato agli oggetti (OOP) leggero** tramite **Classi ES6** per una gestione pulita delle entità.

- **Pattern di Progettazione: Game Loop**

  - Il cuore del gioco sarà un _game loop_ centrale, gestito da `requestAnimationFrame(gameLoop)`.
  - Questo loop chiamerà, in ordine, tre funzioni principali ad ogni _tick_:
    1. `handleInput()`: Controlla lo stato degli input utente.
    2. `update()`: Aggiorna la logica di gioco (movimento, collisioni, spawn).
    3. `render()`: Aggiorna il DOM (posizione degli elementi) in base allo stato.

- **Classi Principali:**
  - `class Game`: Gestore principale. Inizializza il gioco, avvia il loop,
    gestisce lo stato (punteggio, vite) e contiene gli array di entità (`enemies`, `projectiles`).
  - `class Player`: Gestisce lo stato del giocatore (posizione `x`, `y`, `isInvulnerable`, `loopCount`, `powerUpState`).
  - `class Enemy`: Classe base per i nemici (posizione `x`, `y`, `health`, `type`).
  - `class Projectile`: Gestisce i proiettili (posizione `x`, `y`, `direction` [player/enemy]).

## 3. Analisi Funzionale Dettagliata (Logica di Gioco)

### 3.1. Gestione Input Utente

- L'input (Tasti Freccia, WASD, Spazio, L) deve essere gestito tramite `addEventListener('keydown', ...)` e `keyup`.
- **Logica di Movimento (8 direzioni):** Per consentire il movimento diagonale (es. Alto + Destra),
  non si deve reagire direttamente al singolo evento `keydown`. Si deve utilizzare un oggetto di stato
  (es. `keysPressed = { 'ArrowUp': false, 'ArrowRight': false }`).
  - `keydown` imposta la chiave corrispondente a `true`.
  - `keyup` imposta la chiave a `false`.
  - La funzione `handleInput()` del _game loop_ legge questo oggetto e calcola il vettore di movimento del giocatore.
- **Sparo (Spazio):** Deve supportare lo sparo continuo. Un flag `isShooting` nell'oggetto `keysPressed` permetterà al
  `gameLoop` di generare proiettili a intervalli regolari (gestiti da un _cooldown_) finché il tasto è premuto.
- **Loop (L):** `keydown` su 'L' attiva la mossa speciale _solo se_ `player.loopCount > 0` e `player.isLooping == false`.

### 3.2. Logica del Giocatore (Classe `Player`)

- **Movimento:** La funzione `update()` aggiorna `player.x` e `player.y` in base all'input,
  assicurandosi che il giocatore non esca dai bordi del `#game-container` (clamping).
- **Loop-the-Loop:** Quando attivato:
  1. Imposta `player.isInvulnerable = true` e `player.canShoot = false`.
  2. Applica una classe CSS (es. `.looping`) per un'animazione visiva.
  3. Avvia un `setTimeout` (es. 1500ms).
  4. Al termine del timeout: `player.isInvulnerable = false`, `player.canShoot = true`, rimuove la classe CSS.
- **Stato Power-Up:** Avrà una proprietà `powerUpState` (es. 0=Base, 1=Doppio Canone, 2=Scorta).
  La funzione di sparo controllerà questo stato per generare 1 o 2 proiettili (o attivare le scorte).

### 3.3. Logica dei Nemici e Spawning

- **Movimento:** I nemici si muovono verticalmente verso il basso (`y` aumenta).
  Le formazioni predefinite richiedono una logica di _scripting_.
- **Spawner (Critico):** Deve essere implementato un **sistema di spawning basato sul tempo (o sullo scorrimento)**.
  - Si definisce un array di "ondate"
    (es. `const wave1 = [{ type: 'small', x: 50, delay: 1000 }, { type: 'small', x: 100, delay: 1100 }]`).
  - Il `gameLoop` controlla il tempo trascorso dall'inizio del livello e genera i nemici
    (creando nuove istanze della classe `Enemy`) quando il loro `delay` è raggiunto.
- **Formazioni Rosse (per POW):** Lo spawner deve "taggare" i nemici appartenenti a una formazione speciale (es. `new Enemy(..., formationId: 'red_A')`).

### 3.4. Gestione Proiettili e Garbage Collection

- Tutti i proiettili attivi (sia del giocatore che dei nemici) saranno tenuti in un array (es. `game.projectiles = []`).
- La funzione `update()` del _game loop_ cicla su questo array e aggiorna la `y` di ogni proiettile.
- **Garbage Collection:** È fondamentale rimuovere gli elementi che escono dallo schermo per evitare il sovraccarico del DOM e degli array.
  - Nell'`update()` loop: se `projectile.y < 0` o `projectile.y > gameContainer.height`
    (o `enemy.y > gameContainer.height`), l'oggetto deve essere rimosso dall'array di gestione _e_ il suo elemento DOM
    deve essere eliminato (`element.remove()`).

### 3.5. Rilevamento delle Collisioni (Collision Detection)

Questa è la logica più critica e dispendiosa. Deve essere eseguita ad ogni `update()`.

- **Metodo:** Verrà utilizzato il rilevamento **AABB (Axis-Aligned Bounding Box)**.
- **Implementazione:** Si crea una funzione helper: `isColliding(rect1, rect2)`.
  - Questa funzione prenderà le coordinate `(x, y, width, height)` di due entità.
  - Restituirà `true` se i rettangoli si sovrappongono. (Sarà più efficiente se le classi `Player`, `Enemy` etc.
    espongono un metodo `getBoundingBox()`).
- **Cicli di Controllo (ad ogni frame):**
  1. **Proiettili Giocatore vs Nemici:** Ciclare su ogni proiettile del giocatore e confrontarlo con _ogni_ nemico.
     Se `isColliding()` è `true`: distruggere il proiettile, decrementare la vita del nemico,
     (se vita nemico <= 0, distruggere nemico, aumentare score).
  2. **Proiettili Nemici vs Giocatore:** Ciclare su ogni proiettile nemico e confrontarlo con il giocatore.
     Se `isColliding()` e `!player.isInvulnerable`: distruggere proiettile, il giocatore perde una vita.
  3. **Nemici vs Giocatore:** Ciclare su ogni nemico e confrontarlo con il giocatore.
     Se `isColliding()` e `!player.isInvulnerable`: il giocatore perde una vita (e il nemico, opzionalmente, viene distrutto).
  4. **Giocatore vs POW:** Ciclare sui POW e confrontarli con il giocatore.
     Se `isColliding()`: distruggere il POW, applicare il `powerUpState` al giocatore.

### 3.6. Logica Power-Up (POW)

- Quando un nemico (taggato con `formationId`) viene distrutto,
  si controlla se tutti gli altri nemici con lo stesso `formationId` sono stati distrutti.
- Se sì, si genera un'istanza di `POW` (che scende lentamente) nella posizione dell'ultimo nemico distrutto.

## 4. Prodotto Finale (Esperienza Utente)

L'utente aprirà il file `index.html` in un browser.

1. **Avvio:** Il gioco inizia immediatamente. L'utente vedrà l'HUD con Score=0, Lives=3, Loop=3.
   Vedrà il suo "aereo" (un `div` blu) in basso al centro. Lo sfondo (oceano/terra) scorrerà verticalmente.
2. **Gameplay:**
   - Usando i tasti freccia, l'aereo si muove fluidamente (anche in diagonale).
   - Tenendo premuto Spazio, l'aereo spara raffiche continue di proiettili (rettangoli bianchi).
   - Dall'alto dello schermo appaiono `div` nemici (verdi/rossi) che scendono e sparano (proiettili arancioni).
   - Colpendo i nemici, questi scompaiono e lo score nell'HUD aumenta.
   - Se un proiettile nemico o un aereo nemico tocca il `div` del giocatore, le Vite nell'HUD diminuiscono.
   - Premendo 'L', l'aereo esegue un'animazione (es. lampeggia) e per 1.5 secondi i proiettili nemici gli passano
     attraverso senza danno.
3. **Fine:** Se le Vite arrivano a 0, il gioco si ferma (il `gameLoop` cessa) e appare un messaggio "Game Over".

## 5. Istruzioni per l'AI Developer (LLM)

Generare i tre file (`index.html`, `style.css`, `game.js`) seguendo l'architettura e i pattern definiti in questo documento.
Il focus primario è sull'implementazione robusta del **Game Loop (`requestAnimationFrame`)**,
delle **Classi ES6** per le entità, e della **logica di collisione AABB** per un prototipo funzionale.
Il codice JS deve essere pesantemente commentato per spiegare la logica del loop,
la gestione dello stato e il rilevamento delle collisioni.

---
