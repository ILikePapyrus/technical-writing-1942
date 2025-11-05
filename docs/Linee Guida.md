# ✈️ Linee Guida per l'AI Agent: Sviluppo di "1942"

Questo documento stabilisce le specifiche, gli standard e i processi che l'AI Agent deve seguire per generare il codice del progetto "1942" (Web-Based), in aderenza ai documenti `PRD-1942-WEB-V1.0`, `AFT-1942-WEB-V1.0` e `AT-1942-WEB-V1.0`.

## 1\) Sommario Esecutivo

**Scopo:** Lo scopo è generare un'implementazione fedele del gioco arcade "1942" utilizzando esclusivamente **HTML5, CSS3 e Vanilla JavaScript**, come specificato nell'architettura. Il prodotto finale sarà un gioco 2D a scorrimento verticale, giocabile da browser, con rendering basato su DOM (non Canvas).

**Vincoli e Qualità:** L'obiettivo primario è la **fedeltà meccanica** al gioco originale e l'**efficienza delle performance**. Il codice deve essere modulare, leggibile da un team umano e privo di dipendenze esterne (framework). L'obiettivo di performance è un _frame rate_ stabile (target 60 FPS). L'accessibilità minima è garantita tramite il controllo completo via tastiera.

## 2\) Architettura del Progetto

### Struttura delle Cartelle (Consigliata)

Organizzare il progetto come segue per separare codice, asset e build:

```
/1942-web/
├── /build/           # (Output della build, se usata)
├── /src/             # Codice sorgente
│   ├── /assets/      # Sprite, Audio, JSON (di configurazione)
│   │   ├── /images/
│   │   └── /audio/
│   ├── /js/          # Codice JavaScript modulare
│   │   ├── engine.js   # Core (Game class, loop)
│   │   ├── entities.js # Classi (Player, Enemy, Projectile, Pow)
│   │   ├── input.js    # Gestore Input (InputHandler)
│   │   ├── collision.js# Funzione AABB
│   │   └── config.js   # Costanti e configurazioni (es. onde)
│   ├── style.css     # Fogli di stile
│   └── index.html    # Entry point
└── README.md
```

### Organizzazione del Codice JS (Moduli)

Sebbene si utilizzi Vanilla JS senza _bundler_ (nella versione base), il codice deve essere organizzato in "moduli" (file separati) che possono essere importati in `index.html`. L'architettura è basata su Classi ES6 come definito nell'AFT e nell'AT.

- **`engine.js` (Core):** Contiene la classe `Game` principale, che orchestra il `requestAnimationFrame`, gestisce gli array di stato (nemici, proiettili) e avvia il loop.
- **`entities.js` (Entità):** Contiene le classi `Player`, `Enemy`, `Projectile`, `PowerUp`. Ogni classe gestisce il proprio stato (x, y, salute) e il riferimento al proprio elemento DOM.
- **`input.js` (Input):** Contiene la classe `InputHandler` che gestisce gli eventi `keydown`/`keyup` e aggiorna un oggetto di stato (`keysPressed`), come da AFT.
- **`config.js` (Configurazione):** Contiene costanti (es. `GAME_WIDTH`, `PLAYER_SPEED`) e le definizioni delle ondate (Wave definitions) in formato JSON.

### API Interne (Esempio di Interazione)

L'interazione tra moduli avviene tramite la classe `Game` (che funge da _message bus_ implicito).

- _Input -\> Player:_ `inputHandler` aggiorna `keysPressed`. `game.handleInput()` legge `keysPressed` e chiama `game.player.move(vx, vy)`.
- _Player -\> Engine:_ `player.shoot()` chiama `game.spawnProjectile(x, y, 'player')`.
- _Engine -\> Entity:_ `game.update()` chiama `enemy.update()` e `projectile.update()` su ogni entità negli array.

### Naming Convention

- **File:** `kebab-case.js` (es. `game-engine.js`).
- **Classi JS:** `PascalCase` (es. `Player`, `InputHandler`).
- **Variabili/Funzioni JS:** `camelCase` (es. `updateScore`, `isColliding`).
- **ID/Classi CSS:** `kebab-case` (es. `#game-container`, `.enemy-type-a`).

## 3\) Standard di Sviluppo e Stile

### Linee guida JavaScript

- **Standard:** Aderire a ES6+ (Classi, `let`/`const`, Arrow Functions).
- **Performance:**
  1.  **Sempre `requestAnimationFrame`:** Il _game loop_ deve essere guidato da `requestAnimationFrame`, come da AFT e AT.
  2.  **Sempre `transform`:** L'aggiornamento della posizione degli elementi DOM deve _sempre_ usare `style.transform = 'translate(x, y)'`. **Non usare mai** `top`/`left` nel loop, come da AT.
  3.  **No DOM in Loop:** Evitare la creazione/rimozione di elementi DOM _all'interno_ del loop. Usare il pattern di "Garbage Collection" (flag `isMarkedForDeletion`) definito nell'AT.
  4.  **No Lettura in Loop:** Non leggere proprietà DOM (es. `element.offsetWidth`) nel loop. Le dimensioni vanno lette una volta all'inizializzazione.

### Convenzioni CSS

- **Struttura:** Usare BEM (Blocco, Elemento, Modificatore) sebbene in forma leggera (es. `.enemy`, `.enemy--red`).
- **Sprite:** Gli elementi di gioco (`.player`, `.enemy`) devono essere `position: absolute` all'interno di un contenitore `#game-container` con `position: relative` e `overflow: hidden`.
- **Scorrimento:** L'animazione dello sfondo deve usare `@keyframes` che modificano `background-position-y` in modo ciclico.

### HTML Semantico

- Usare `index.html` per la struttura base: un `main` per il gioco, `aside` o `header` per l'HUD (Score, Lives).
- Il gioco deve essere avviabile e giocabile (pausa/start) usando solo la tastiera.

## 4\) Asset e Risorse

### Tipi e Formati

- **Immagini:** PNG-24 (con trasparenza) per gli _sprite sheet_. WEBP è un'alternativa accettabile. SVG per elementi UI (se non si usano sprite).
- **Audio:** OGG (per Firefox/Chrome) e MP3 (per Safari/fallback). Il caricamento deve essere asincrono.

### Specifiche Sprite Sheet

- Gli _sprite_ (Player, Nemici) devono essere raggruppati in un unico _atlas_ (sprite sheet) per ridurre le richieste HTTP.
- Deve essere fornito un file JSON di metadati per l'atlas.

#### Esempio: Sprite Sheet Metadata (`atlas.json`)

```json
{
  "frames": {
    "player_idle": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "player_hit": {
      "frame": { "x": 32, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    },
    "enemy_small_green": {
      "frame": { "x": 64, "y": 0, "w": 24, "h": 24 },
      "sourceSize": { "w": 24, "h": 24 }
    }
  },
  "meta": {
    "image": "sprites.png",
    "format": "PNG",
    "size": { "w": 128, "h": 128 }
  }
}
```

### Audio

- Gli effetti sonori (sparo, esplosione, power-up) devono essere brevi.
- La musica di sottofondo deve essere _loopable_ (in grado di ripetersi senza interruzioni).
- Prevedere canali di volume separati (Musica, Effetti) anche se l'UI non li implementa subito.

## 5\) Gameplay e Meccaniche Implementative

### Mappatura Feature (PRD -\> AFT)

- **Movimento Giocatore:** (PRD 3.2) -\> Implementato tramite `InputHandler` che modifica lo stato `keysPressed` e `Player.update()` che legge lo stato.
- **Sparo Continuo:** (PRD 3.2) -\> Gestito da `InputHandler` (flag `isShooting`) e un _cooldown_ nello `spawnProjectile` del `Game loop`.
- **Loop-the-Loop:** (PRD 3.2) -\> Metodo `Player.doLoop()` che imposta `isInvulnerable = true` e avvia un `setTimeout` per resettare lo stato.
- **Ondate Nemici:** (PRD 3.3) -\> Implementato tramite un "Sistema di Spawning" basato sul tempo (`gameTime`) che legge un array di configurazione (vedi 5.3).
- **Power-Up (POW):** (PRD 3.4) -\> Generato quando una formazione (identificata da `formationId`) è distrutta.

### Physics e Collision Detection

- **Metodo:** Usare **AABB (Axis-Aligned Bounding Box)**, come specificato nell'AT. La funzione `isColliding(rect1, rect2)` è obbligatoria.
- **Loop di Update (Fixed Timestep):** Per garantire una fisica coerente (movimento e collisioni) indipendente dal _frame rate_ di rendering, si consiglia un _Fixed Timestep_ per la logica di gioco, separato dal rendering.

#### Esempio: Game Loop con Fixed Timestep (da `engine.js`)

```javascript
let lastTime = 0;
let accumulator = 0;
constFIXED_TIMESTEP = 1000 / 60; // 60 aggiornamenti logici al secondo

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // 1. Gestione Input (sempre)
  game.handleInput();

  // 2. Aggiornamento Logica (Fixed Step)
  // Esegue la logica (fisica, collisioni) in passi fissi
  while (accumulator >= FIXED_TIMESTEP) {
    game.update(FIXED_TIMESTEP); // Passa il timestep fisso
    accumulator -= FIXED_TIMESTEP;
  }

  // 3. Render (Variabile)
  // Passa l'interpolazione (alpha) per un rendering fluido (opzionale)
  // const alpha = accumulator / FIXED_TIMESTEP;
  game.render(/* alpha */);

  requestAnimationFrame(gameLoop);
}
```

### Specifiche per Wave Generation (JSON)

Le ondate di nemici (AFT 3.3) devono essere definite in un file JSON esterno (`config.js` o `/assets/waves.json`).

#### Esempio: `waves.json`

```json
{
  "level_1": [
    { "time": 1000, "type": "small_green", "x": 100, "path": "straight" },
    { "time": 1100, "type": "small_green", "x": 150, "path": "straight" },
    { "time": 1200, "type": "small_green", "x": 200, "path": "straight" },

    // Formazione 'red_A' che rilascia un POW
    {
      "time": 3000,
      "type": "red_bomber",
      "x": 50,
      "path": "sine_wave",
      "formationId": "red_A"
    },
    {
      "time": 3000,
      "type": "red_bomber",
      "x": 350,
      "path": "sine_wave",
      "formationId": "red_A"
    },
    {
      "time": 3200,
      "type": "red_bomber",
      "x": 150,
      "path": "sine_wave",
      "formationId": "red_A"
    }
  ]
}
```

### Esempio: Struttura Classe Entità (da `entities.js`)

Come da AT 1.4, ogni entità gestisce il proprio DOM.

```javascript
class Enemy {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 32; // Da config
    this.height = 32; // Da config
    this.health = 1;
    this.isMarkedForDeletion = false;

    // Creazione DOM (solo nel costruttore)
    this.element = document.createElement("div");
    this.element.className = `enemy enemy-${type}`;
    this.game.gameContainer.appendChild(this.element);
  }

  // Aggiorna la logica (posizione, stato)
  update(deltaTime) {
    this.y += 2; // Esempio di velocità

    // Se esce dallo schermo
    if (this.y > this.game.height) {
      this.markForDeletion();
    }
  }

  // Aggiorna il DOM (rendering)
  render() {
    // Usa 'transform' per performance
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  markForDeletion() {
    this.isMarkedForDeletion = true;
    // Rimuove il DOM
    this.element.remove();
  }
}
```

## 6\) Task Breakdown e Milestone

Elenco granulare dei task per l'implementazione (Stime in Story Point, SP).

| Milestone       | Task           | Descrizione                                                             | Stima (SP) | Criteri "Done"                                                                             |
| :-------------- | :------------- | :---------------------------------------------------------------------- | :--------- | :----------------------------------------------------------------------------------------- |
| **M1: Setup**   | Setup Progetto | Creare struttura file (HTML, CSS, JS), setup Linter.                    | 1          | `index.html` carica `style.css` e `game.js`.                                               |
| **M1: Setup**   | Motore Base    | Implementare `Game` class e _Game Loop_ (Fixed Timestep).               | 3          | Schermo vuoto, loop `requestAnimationFrame` attivo.                                        |
| **M2: Player**  | Player Entity  | Creare classe `Player`, rendering DOM.                                  | 2          | Il Player (div) appare sullo schermo.                                                      |
| **M2: Player**  | Input Handler  | Implementare `InputHandler` per stato tasti (8 direzioni).              | 3          | Il Player si muove nelle 8 direzioni, bloccato ai bordi (clamping).                        |
| **M2: Player**  | Sparo Player   | Implementare sparo (tasto Spazio) e classe `Projectile`.                | 3          | Il Player spara `div` proiettili che si muovono verso l'alto.                              |
| **M3: Nemici**  | Enemy Entity   | Creare classe base `Enemy` (rendering e movimento base).                | 2          | Il nemico appare e si muove verso il basso.                                                |
| **M3: Nemici**  | Spawner        | Implementare spawner basato sul tempo (da config JSON).                 | 5          | I nemici appaiono secondo la definizione `waves.json`.                                     |
| **M4: Core**    | Collisioni     | Implementare funzione AABB e logica (Player-\>Nemico, Nemico-\>Player). | 5          | I proiettili distruggono i nemici; il Player perde vite.                                   |
| **M4: Core**    | Stato Gioco    | Implementare Vite, Score, Game Over (PRD 3.5).                          | 3          | L'HUD si aggiorna, il gioco termina a 0 vite.                                              |
| **M5: Feature** | Loop-the-Loop  | Implementare mossa speciale (invulnerabilità temporanea).               | 3          | Premendo 'L' il player è invulnerabile.                                                    |
| **M5: Feature** | Power-Up (POW) | Implementare logica generazione (formazioni rosse) e raccolta POW.      | 5          | Distruggendo formazioni rosse appare un POW; raccogliendolo si ottiene (es.) doppio sparo. |
| **M6: Polish**  | Audio          | Aggiungere caricamento e riproduzione effetti sonori e musica.          | 3          | Sparo, esplosioni e musica di sottofondo funzionano.                                       |

## 7\) Testing e Qualità

- **Unit Test:** La logica pura (es. `isColliding()`, gestione stato `InputHandler`) deve essere testabile (es. con Vitest/Jest).
- **Integration Test:** Il _game loop_ e l'interazione delle classi (es. "lo sparo del Player distrugge un Nemico") devono essere validati.
- **Manual QA Checklist:**
  1.  Il gioco raggiunge i 60 FPS (verificare con i devtools)?
  2.  La collisione AABB è precisa?
  3.  L'Input (8 direzioni, sparo continuo) è reattivo?
  4.  La _garbage collection_ funziona (il n. di DOM element è stabile)?
  5.  Tutte le feature del PRD (Loop, POW) sono implementate?
- **Code Review:** (Policy) I PR (Pull Request) devono passare il Linter, i test (se presenti) e non devono introdurre regressioni di performance (verificate tramite profiling).

## 8\) Tooling e CI/CD

- **Linting:** Obbligatorio. Usare **ESLint** (con ruleset `eslint:recommended`) e **Prettier** per la formattazione.
- **Build Tool (Opzionale):** Per lo sviluppo, usare un server leggero (es. `http-server`). Per la produzione, **Vite** è consigliato per _minification_ e _bundling_.
- **CI/CD:** Configurare (es. GitHub Actions) per:
  1.  `lint` (Controllo stile)
  2.  `test` (Esecuzione unit test)
  3.  `build` (Esecuzione build Vite)
  4.  `deploy` (Deploy su host statico, es. GitHub Pages o Netlify).

## 9\) Error Handling e Logging

- **Sviluppo:** Usare `console.log` e `console.warn` per lo stato e gli eventi (es. "Nemico [ID] spawnato", "Collisione Player").
- **Produzione:** Il codice di build deve rimuovere i `console.log`. Gestire errori critici (es. fallimento caricamento asset) con `try...catch` e un messaggio all'utente.
- **Fallback:** Se un asset (immagine/audio) non carica, il gioco non deve bloccarsi (registrare l'errore e continuare senza quell'asset).

## 10\) Sicurezza e Privacy

- **Input:** Validare (sebbene non critico in questo contesto).
- **No Eval:** Non usare mai `eval()` o `innerHTML` con input utente.
- **Privacy:** Il gioco non deve raccogliere o trasmettere alcun dato personale (PII). Il punteggio (se salvato) deve essere locale (`localStorage`).

## 11\) Consegna e Documentazione

I _deliverable_ obbligatori per il completamento del progetto sono:

1.  Codice sorgente (`/src/`).
2.  Build di produzione (`/build/` o equivalente).
3.  `README.md`: Con istruzioni di installazione (es. `npm install`) ed esecuzione (es. `npm run dev`, `npm run build`).
4.  `CHANGELOG.md`: (Semplificato) Traccia delle modifiche (es. "v1.1: Aggiunta logica POW").
5.  `LICENSE`: (es. MIT).
6.  _Asset Manifest_: (Elenco degli asset e loro licenze).

## 12\) Checklist Finale (Validazione CI/Agent)

Questo JSON può essere usato per validare automaticamente la build.

```json
{
  "project": "1942-web",
  "checks": [
    { "id": "README_EXISTS", "path": "README.md", "status": "pending" },
    { "id": "LINT_PASS", "command": "npm run lint", "status": "pending" },
    { "id": "BUILD_PASS", "command": "npm run build", "status": "pending" },
    {
      "id": "BUILD_OUTPUT_EXISTS",
      "path": "build/index.html",
      "status": "pending"
    },
    { "id": "CORE_JS_EXISTS", "path": "src/js/engine.js", "status": "pending" },
    { "id": "ASSETS_EXIST", "path": "src/assets/images", "status": "pending" },
    { "id": "PERF_TARGET_MET", "test": "checkFPS > 45", "status": "pending" },
    {
      "id": "NO_FRAMEWORKS",
      "validation": "checkDependencies",
      "status": "pending"
    }
  ]
}
```

---

## 🤖 10 Regole d'Oro per l'AI Agent

1.  **Segui l'AT:** L'Analisi Tecnica è la tua fonte di verità per l'implementazione; i suoi pattern (es. GC, rendering) sono obbligatori.
2.  **Vanilla JS:** Non usare _mai_ jQuery, React, o altri framework (come da PRD).
3.  **`transform` per il Movimento:** Non usare _mai_ `top/left` per animare gli sprite (come da AT).
4.  **No DOM in Loop:** Non creare (`createElement`) o cercare (`querySelector`) elementi nel `gameLoop` (come da AT).
5.  **GC tramite Filtro:** Usa il pattern `isMarkedForDeletion` e `.filter()` per la garbage collection (come da AT).
6.  **Stato Input Separato:** Gestisci l'input `keydown`/`keyup` in un oggetto di stato (`keysPressed`), non agire direttamente sull'evento (come da AFT).
7.  **Classi ES6:** Struttura tutto il codice JS usando le Classi ES6 definite nell'AFT (`Game`, `Player`, `Enemy`).
8.  **Collisione AABB:** Usa la funzione `isColliding(rect1, rect2)` definita nell'AT.
9.  **Config Esterna:** Sposta la logica (es. velocità nemici, onde) in file/oggetti di configurazione (JSON/JS) invece di _hard-codarla_.
10. **Commenta la Logica:** Commenta _perché_ la logica è implementata in un certo modo (es. "// Esegue il GC", "// Applica invulnerabilità per Loop").
