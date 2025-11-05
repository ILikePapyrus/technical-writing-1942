Eccellente. Agendo come analista e PM (Product Manager), ho redatto il **Product Requirements Document (PRD)** per l'implementazione del gioco arcade "1942" tramite LLM. Il documento è strutturato per fornire all'AI tutti i dettagli necessari per generare una base di codice **HTML/CSS/JS** funzionale e aderente ai requisiti.

---

# Product Requirements Document (PRD)

## ✈️ Progetto: Riproposizione del Gioco Arcade "1942" (Web-Based)

| Campo                 | Valore                                                           |
| :-------------------- | :--------------------------------------------------------------- |
| **Documento ID**      | PRD-1942-WEB-V1.0                                                |
| **Autore**            | Gemini AI Analyst                                                |
| **Data Versione**     | 5 Novembre 2025                                                  |
| **Prodotto**          | Riproposizione di "1942" (Shoot 'Em Up a Scorrimento Verticale)  |
| **Target Audience**   | AI Developer (LLM) per la generazione di codice                  |
| **Tecnologie Target** | HTML5, CSS3, JavaScript (Vanilla JS, non sono ammessi Framework) |

---

## 1. Obiettivo del Progetto

L'obiettivo è generare un'implementazione fedele e completamente giocabile del classico arcade **"1942"** (Capcom, 1984) direttamente nel browser. La priorità è la **fedeltà meccanica** e l'**efficienza del codice** in JavaScript per gestire il _game loop_, la collisione e il rendering degli elementi (attraverso CSS o Canvas, preferibilmente tramite manipolazione DOM/CSS per semplicità e visibilità del codice generato).

---

## 2. Architettura e Stack Tecnologico

La soluzione deve essere implementata utilizzando lo stack web standard.

### 2.1. Requisiti Tecnici

- **HTML:** Struttura base del gioco (container, UI per punteggio/vite). Deve includere un elemento **`div`** principale per il _game screen_.
- **CSS:** Styling per l'area di gioco, i _sprite_ degli aerei (player/nemici/proiettili), e l'animazione di scorrimento verticale (Background Scrolling).
- **JavaScript (Vanilla JS):** Tutta la logica di gioco, gestione degli input, _game loop_ (`requestAnimationFrame`), rilevamento delle collisioni, e gestione dello stato.

---

## 3. Funzionalità di Gioco (Game Mechanics)

### 3.1. Area di Gioco e Scorrimento

- **Orientamento:** Scorrimento **verticale** dall'alto verso il basso (simulando il volo in avanti).
- **Background:** Il background (oceano/terra) deve scorrere continuamente dal basso verso l'alto per dare un senso di movimento.
- **Dimensioni:** L'area di gioco deve avere un rapporto d'aspetto verticale (es. 4:3 o 3:4) per replicare l'esperienza arcade. (Suggerimento per l'AI: $400px$ di larghezza per $600px$ di altezza).

### 3.2. Il Giocatore (Super Ace, P-38 Lightning)

- **Controllo:** L'aereo del giocatore (chiamato "Super Ace") deve essere controllabile nelle **8 direzioni** tramite i tasti freccia (o WASD).
- **Sparo:** Premendo un tasto (es. **`Spazio`**), l'aereo spara proiettili singoli o doppi in rapida successione in direzione verticale (in alto). Lo sparo deve essere **continuo** tenendo premuto il tasto.
- **Mossa Speciale: Loop-the-Loop:** Premendo un tasto dedicato (es. **`L`**), il giocatore esegue un _loop_ evasivo.
  - **Effetto:** L'aereo diventa **invulnerabile** (temporaneamente invisibile alle collisioni/proiettili).
  - **Limitazione:** Il giocatore **non può sparare** durante il _loop_.
  - **Conteggio:** Il giocatore ha un numero limitato di _loop_ per livello (default: 3).

### 3.3. Nemici

- **Tipi:** Minimo 3 tipi di aerei nemici distinti (es. caccia piccoli, medi, bombardieri in formazione).
- **Movimento:** I nemici devono apparire dal limite superiore dell'area di gioco e muoversi verso il basso, spesso in **formazioni predefinite** (es. a V o a serpentina).
- **Sparo Nemico:** I nemici sparano proiettili verso il basso.
- **Collisioni:**
  - Scontro con proiettile del giocatore: L'aereo nemico viene distrutto (dopo 1 o più colpi a seconda del tipo).
  - Scontro con l'aereo del giocatore: Il giocatore perde una vita.
  - Uscita dallo schermo: Se un nemico lascia il limite inferiore, scompare.

### 3.4. Power-Up (POW)

- **Generazione:** Quando una **formazione rossa completa** di aerei nemici viene distrutta, appare un _power-up_ chiamato **"POW"** (rappresentato come una P rossa).
- **Raccolta:** Il giocatore deve volare sopra l'elemento "POW" per attivarlo.
- **Effetti Primari (Implementare almeno 2 tipi):**
  1.  **Doppio Canone:** Aumenta la potenza di fuoco (es. spara due proiettili affiancati invece di uno).
  2.  **Scorta (Options):** Due aerei più piccoli appaiono ai lati del "Super Ace" e sparano in sincrono, aumentando la copertura. (Queste "opzioni" possono essere distrutte da proiettili o collisioni nemiche).

### 3.5. Ciclo di Gioco e Condizioni di Vittoria/Sconfitta

- **Vite:** Il giocatore inizia con un numero limitato di vite (default: 3).
- **Perdita di Vita:** Avviene per collisione con aereo nemico o proiettile nemico (tranne durante il _loop_).
- **Game Over:** Quando il contatore delle vite raggiunge zero.
- **Punteggio:** Un contatore visibile deve tracciare i punti (es. 50 punti per il nemico più piccolo).

---

## 4. Requisiti di Interfaccia Utente (UI)

### 4.1. Visualizzazione dello Stato

L'interfaccia utente, posizionata sopra o a lato dell'area di gioco, deve mostrare in tempo reale:

| Metrica   | Ubicazione                                |
| :-------- | :---------------------------------------- |
| **Score** | Punteggio attuale del giocatore.          |
| **Lives** | Vite rimanenti (icone di aerei o numero). |
| **Loop**  | Numero di _loop_ speciali rimanenti.      |

### 4.2. Assets Grafici

- L'AI deve utilizzare forme geometriche di base, colori o _placeholder_ minimali in CSS per rappresentare il **Super Ace**, i **Nemici** e i **Proiettili**. La grafica deve essere funzionale alla logica di collisione (es. l'area di _hitbox_ del Super Ace è solo la fusoliera centrale, non le ali esterne).

---

## 5. Criteri di Accettazione

Il codice generato sarà accettato se:

- **Aderenza Meccanica:** Le meccaniche di base (movimento, sparo, collisione, _loop_ di invulnerabilità) sono implementate e funzionano come descritto.
- **Game Loop Stabile:** Il _game loop_ in JavaScript gestisce correttamente l'aggiornamento degli stati e il rendering senza _flickering_ o ritardi evidenti.
- **Struttura del Codice:** Il codice è ben commentato, logico e segue la separazione tra HTML (struttura), CSS (aspetto) e JS (logica).
- **Assenza di Framework:** Non è stato utilizzato alcun _framework_ o libreria esterna (solo Vanilla JS).

**Prossimo Passo per l'AI:** Analizzare questo PRD e iniziare a generare la struttura **HTML, CSS e JS** per un'implementazione minimalista ma completa del _game loop_ e delle collisioni del giocatore.
