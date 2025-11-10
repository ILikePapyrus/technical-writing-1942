# Analisi Tecnica (AT) e Linee Guida per AI Developer

| Campo               | Valore             |
| :------------------ | :----------------- |
| **Documento ID**    | AT-1942-WEB-V1.0   |
| **Riferimento AFT** | AFT-1942-WEB-V1.0  |
| **Autore**          | Gemini AI Analyst  |
| **Data Versione**   | 5 Novembre 2025    |
| **Target Audience** | AI Developer (LLM) |

---

## 1. Architettura Implementativa e Pattern di Progettazione

Questa sezione traduce l'architettura logica dell'AFT in pattern di codice specifici.

### 1.1. Struttura dei File (Confermata)

- `index.html`: Contenitore della UI e del viewport di gioco (`#game-container`).
- `style.css`: Stile, animazioni (`@keyframes` per lo sfondo) e _sprite_ (classi CSS per `.player`, `.enemy`, etc.).
- `game.js`: Tutta la logica di gioco.

### 1.2. Pattern di Rendering: DOM-Based (Non-Canvas)

L'intera renderizzazione avverrà manipolando elementi `div` nel DOM.

- **Performance:** L'aggiornamento della posizione deve _sempre_ essere eseguito tramite la proprietà CSS
  `transform: translate(x, y);` (o `translate3d`). **Non utilizzare mai** `top` o `left` all'interno del game loop,
  poiché causano _layout reflow_ e scarse prestazioni.
- **Creazione:** La creazione di nuovi elementi (`document.createElement('div')`) **non deve mai** avvenire all'interno
  del loop principale. Deve avvenire solo al momento dello _spawning_.

### 1.3. Pattern del Game Loop (Core)

Il `game.js` deve essere orchestrato da un'unica funzione `requestAnimationFrame`.

```javascript
// Esempio di struttura del Game Loop in game.js
const game = new Game();

function gameLoop(timestamp) {
  // 1. Gestione Input (lettura stato)
  game.handleInput();

  // 2. Aggiornamento Logica (collisioni, movimento, spawning)
  game.update(timestamp);

  // 3. Render (aggiornamento DOM/CSS)
  game.render();

  // 4. Richiesta prossimo frame
  requestAnimationFrame(gameLoop);
}

// Avvio
requestAnimationFrame(gameLoop);
```

### 1.4. Pattern di Gestione dello Stato: Classi ES6

L'AFT ha definito le classi (`Game`, `Player`, `Enemy`, `Projectile`). La loro interazione deve seguire questo schema:

- **`Game` (Orchestratore):** È la classe principale.
  - Contiene gli _array_ di stato: `this.enemies = []`, `this.projectiles = []`, `this.powerUps = []`.
  - Contiene l'istanza del giocatore: `this.player = new Player(...)`.
  - Contiene lo stato globale: `this.score`, `this.lives`.
  - La sua funzione `update()` orchestra le collisioni e la _garbage collection_.
- **Entità (Player, Enemy, Projectile):**
  - Ogni classe di entità deve avere:
    - Proprietà di stato: `this.x`, `this.y`, `this.width`, `this.height`.
    - Un riferimento al proprio elemento DOM: `this.element`.
    - Un flag di "morte": `this.isMarkedForDeletion = false`.
  - Il costruttore di ogni entità è responsabile della **creazione del proprio elemento DOM** e dell'aggiunta al
    `#game-container`.

### 1.5. Pattern di Gestione Input: Oggetto di Stato

Per gestire il movimento a 8 direzioni, l'input non deve essere gestito direttamente dagli eventi.

- Deve essere creato un oggetto globale (o una classe `InputHandler`) che ascolta `keydown` e `keyup`.
- Questo gestore aggiorna un semplice oggetto `keysPressed = { 'ArrowUp': false, 'ArrowDown': false, ... }`.
- La funzione `game.handleInput()` (chiamata dal loop) legge questo oggetto `keysPressed` e aggiorna di conseguenza la
  velocità (`vx`, `vy`) del giocatore.

## 2. Dettagli Implementativi Critici (Specifiche per l'AI)

### 2.1. Funzione di Collisione (AABB)

Generare una funzione _helper_ standalone (pura) per il rilevamento delle collisioni AABB. Deve essere ottimizzata.

```javascript
/**
 * Rileva la collisione tra due rettangoli (AABB).
 * @param {object} rect1 - {x, y, width, height}
 * @param {object} rect2 - {x, y, width, height}
 * @returns {boolean} True se c'è collisione.
 */
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}
```

### 2.2. Logica di Garbage Collection (Fondamentale)

La stabilità del gioco dipende da una corretta _garbage collection_ (GC) degli elementi DOM e degli array.

- Quando un'entità viene distrutta (collisione, uscita schermo), **non rimuoverla immediatamente dall'array** (causa
  errori nei cicli `for`).
- **Pattern Corretto:**
  1. Impostare il flag: `enemy.isMarkedForDeletion = true`.
  2. Rimuovere l'elemento dal DOM: `enemy.element.remove()`.
  3. Alla _fine_ del ciclo `game.update()`, filtrare gli array per rimuovere tutti gli elementi contrassegnati:
     ```javascript
     // Dentro game.update(), dopo i cicli di collisione
     this.enemies = this.enemies.filter((enemy) => !enemy.isMarkedForDeletion);
     this.projectiles = this.projectiles.filter((p) => !p.isMarkedForDeletion);
     ```

### 2.3. Sistema di Spawning (Basato sul Tempo)

Non usare `setInterval`. Lo spawner deve essere legato al _timestamp_ del `gameLoop`.

- La classe `Game` deve avere `this.gameTime = 0`.
- L'`update(timestamp)` calcola il `deltaTime` e lo aggiunge a `gameTime`.
- Un array di configurazione delle ondate (come da AFT) sarà letto, e i nemici verranno spawnati quando `gameTime`
  supera il loro `delay`.

## 3. 🤖 Linee Guida per l'AI Companion (Regole di Ingaggio)

Per generare codice di alta qualità, l'interazione con l'AI (tu) deve seguire queste regole.

### 3.1. Prompting Efficace (Regole Base)

1. **Sii Specifico e Atomico:** Non chiedere "Genera il gioco". Chiedi richieste granulari.
   - **NO:** "Crea i nemici."
   - **SÌ:** "Genera la classe JS `Enemy` (per `game.js`) secondo l'AFT. Deve avere un costruttore `(game, x, y, type)`
     e un metodo `update()` che ne incrementa `this.y` (velocità fissa). Il costruttore deve creare un `div`,
     assegnargli la classe `enemy`, e appenderlo al `game.gameContainer`."
2. **Definisci il Contesto:** Specifica sempre il file di destinazione e (se necessario) la classe o funzione in cui il
   codice deve essere integrato.
   - **Esempio:** "Nel file `game.js`, all'interno del metodo `update()` della classe `Game`, aggiungi il ciclo per il
     rilevamento delle collisioni tra `this.player.projectiles` e `this.enemies`."
3. **Definisci l'Output:** Concludi i prompt specificando il formato.
   - **Esempio:** "Formato output: Blocco di codice JavaScript Vanilla ES6 con commenti JSDoc per il metodo."
4. **Iterazione (Refactoring):** È preferibile chiedere una bozza e poi raffinarla.
   - **Esempio 1:** "Genera la classe `Player`."
   - **Esempio 2:** "Ora, modifica il metodo `update()` della classe `Player` per aggiungere il _clamping_ (non deve
     uscire dai bordi del `game.width`)."

### 3.2. Disclaimer e QA (Controllo Qualità Obbligatorio)

- **Revisione Umana (Sempre):** Il codice generato dall'AI è un **draft** (bozza). Deve sempre essere sottoposto a \*
  \*revisione incrociata\*\* da uno sviluppatore umano prima di essere integrato nel branch principale.
- **Fokus sulla Performance:** L'AI deve evitare la creazione di `event listener` o la manipolazione del DOM (
  lettura/scrittura) _all'interno_ delle funzioni del `gameLoop` (`update`, `render`).
  - La lettura delle dimensioni (es. `element.offsetWidth`) va fatta una volta sola, all'inizializzazione.
  - Gli _event listener_ vanno registrati _una sola volta_ all'avvio del gioco.
- **Verifica di Sicurezza ed Efficienza:**
  - Verificare che la **Garbage Collection** (sezione 2.2) sia implementata correttamente. La mancata rimozione di
    elementi dal DOM o dagli array è un bug critico che porta a un _memory leak_.
  - Verificare che non ci siano riferimenti a librerie o framework esterni (requisito PRD).
