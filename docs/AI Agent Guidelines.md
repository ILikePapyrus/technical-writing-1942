```markdown
# ✈️ AI Agent Guidelines: "1942" Development

This document establishes the specifications, standards, and processes that the AI Agent must follow to generate the code for the "1942" (Web-Based) project, in adherence to the `PRD-1942-WEB-V1.0`, `AFT-1942-WEB-V1.0`, and `AT-1942-WEB-V1.0` documents.

## 1\) Executive Summary

**Purpose:** The purpose is to generate a faithful implementation of the "1942" arcade game using exclusively **HTML5, CSS3, and Vanilla JavaScript**, as specified in the architecture. The final product will be a 2D vertical scrolling game, playable in the browser, with DOM-based rendering (not Canvas).

**Constraints and Quality:** The primary goal is **mechanical fidelity** to the original game and **performance efficiency**. The code must be modular, readable by a human team, and free from external dependencies (frameworks). The performance target is a stable _frame rate_ (target 60 FPS). Minimum accessibility is guaranteed through full keyboard control.

## 2\) Project Architecture

### Folder Structure (Recommended)

Organize the project as follows to separate code, assets, and build:
```

/1942-web/
├── /build/ \# (Build output, if used)
├── /src/ \# Source code
│ ├── /assets/ \# Sprites, Audio, JSON (for configuration)
│ │ ├── /images/
│ │ └── /audio/
│ ├── /js/ \# Modular JavaScript code
│ │ ├── engine.js \# Core (Game class, loop)
│ │ ├── entities.js \# Classes (Player, Enemy, Projectile, Pow)
│ │ ├── input.js \# Input Manager (InputHandler)
│ │ ├── collision.js\# AABB Function
│ │ └── config.js \# Constants and configurations (e.g., waves)
│ ├── style.css \# Stylesheets
│ └── index.html \# Entry point
└── README.md

````

### JS Code Organization (Modules)

Although Vanilla JS is used without a *bundler* (in the basic version), the code must be organized into "modules" (separate files) that can be imported into `index.html`. The architecture is based on ES6 Classes as defined in the AFT and AT.

- **`engine.js` (Core):** Contains the main `Game` class, which orchestrates `requestAnimationFrame`, manages state arrays (enemies, projectiles), and starts the loop.
- **`entities.js` (Entities):** Contains the `Player`, `Enemy`, `Projectile`, `PowerUp` classes. Each class manages its own state (x, y, health) and the reference to its DOM element.
- **`input.js` (Input):** Contains the `InputHandler` class that manages `keydown`/`keyup` events and updates a state object (`keysPressed`), as per AFT.
- **`config.js` (Configuration):** Contains constants (e.g., `GAME_WIDTH`, `PLAYER_SPEED`) and wave definitions in JSON format.

### Internal APIs (Interaction Example)

Interaction between modules occurs via the `Game` class (which acts as an implicit *message bus*).

- *Input -> Player:* `inputHandler` updates `keysPressed`. `game.handleInput()` reads `keysPressed` and calls `game.player.move(vx, vy)`.
- *Player -> Engine:* `player.shoot()` calls `game.spawnProjectile(x, y, 'player')`.
- *Engine -> Entity:* `game.update()` calls `enemy.update()` and `projectile.update()` on every entity in the arrays.

### Naming Convention

- **File:** `kebab-case.js` (e.g., `game-engine.js`).
- **JS Classes:** `PascalCase` (e.g., `Player`, `InputHandler`).
- **JS Variables/Functions:** `camelCase` (e.g., `updateScore`, `isColliding`).
- **CSS IDs/Classes:** `kebab-case` (e.g., `#game-container`, `.enemy-type-a`).

## 3\) Development Standards and Style

### JavaScript Guidelines

- **Standard:** Adhere to ES6+ (Classes, `let`/`const`, Arrow Functions).
- **Performance:**
  1.  **Always `requestAnimationFrame`:** The *game loop* must be driven by `requestAnimationFrame`, as per AFT and AT.
  2.  **Always `transform`:** Updating the position of DOM elements must *always* use `style.transform = 'translate(x, y)'`. **Never use** `top`/`left` in the loop, as per AT.
  3.  **No DOM in Loop:** Avoid creating/removing DOM elements *inside* the loop. Use the "Garbage Collection" pattern (flag `isMarkedForDeletion`) defined in the AT.
  4.  **No Reading in Loop:** Do not read DOM properties (e.g., `element.offsetWidth`) in the loop. Dimensions should be read once during initialization.

### CSS Conventions

- **Structure:** Use BEM (Block, Element, Modifier), albeit in a light form (e.g., `.enemy`, `.enemy--red`).
- **Sprites:** Game elements (`.player`, `.enemy`) must be `position: absolute` inside a `#game-container` with `position: relative` and `overflow: hidden`.
- **Scrolling:** The background animation must use `@keyframes` that cyclically modify `background-position-y`.

### Semantic HTML

- Use `index.html` for the basic structure: a `main` for the game, `aside` or `header` for the HUD (Score, Lives).
- The game must be launchable and playable (pause/start) using only the keyboard.

## 4\) Assets and Resources

### Types and Formats

- **Images:** PNG-24 (with transparency) for *sprite sheets*. WEBP is an acceptable alternative. SVG for UI elements (if sprites are not used).
- **Audio:** OGG (for Firefox/Chrome) and MP3 (for Safari/fallback). Loading must be asynchronous.

### Sprite Sheet Specifications

- Sprites (Player, Enemies) must be grouped into a single *atlas* (sprite sheet) to reduce HTTP requests.
- A JSON metadata file must be provided for the atlas.

#### Example: Sprite Sheet Metadata (`atlas.json`)

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
````

### Audio

- Sound effects (shooting, explosion, power-up) must be short.
- Background music must be _loopable_ (able to repeat without interruption).
- Plan for separate volume channels (Music, Effects) even if the UI doesn't implement them immediately.

## 5\) Gameplay and Implementation Mechanics

### Feature Mapping (PRD -\> AFT)

- **Player Movement:** (PRD 3.2) -\> Implemented via `InputHandler` that modifies the `keysPressed` state and `Player.update()` which reads the state.
- **Continuous Shooting:** (PRD 3.2) -\> Managed by `InputHandler` (flag `isShooting`) and a _cooldown_ in the `game.spawnProjectile` loop.
- **Loop-the-Loop:** (PRD 3.2) -\> `Player.doLoop()` method that sets `isInvulnerable = true` and starts a `setTimeout` to reset the state.
- **Enemy Waves:** (PRD 3.3) -\> Implemented via a "Spawning System" based on time (`gameTime`) that reads a configuration array (see 5.3).
- **Power-Up (POW):** (PRD 3.4) -\> Generated when a formation (identified by `formationId`) is destroyed.

### Physics and Collision Detection

- **Method:** Use **AABB (Axis-Aligned Bounding Box)**, as specified in the AT. The `isColliding(rect1, rect2)` function is mandatory.
- **Update Loop (Fixed Timestep):** To ensure consistent physics (movement and collisions) independent of the _frame rate_ of rendering, a _Fixed Timestep_ is recommended for game logic, separate from rendering.

#### Example: Game Loop with Fixed Timestep (from `engine.js`)

```javascript
let lastTime = 0;
let accumulator = 0;
const FIXED_TIMESTEP = 1000 / 60; // 60 logic updates per second

function gameLoop(timestamp) {
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // 1. Input Handling (always)
  game.handleInput();

  // 2. Logic Update (Fixed Step)
  // Executes logic (physics, collisions) in fixed steps
  while (accumulator >= FIXED_TIMESTEP) {
    game.update(FIXED_TIMESTEP); // Pass the fixed timestep
    accumulator -= FIXED_TIMESTEP;
  }

  // 3. Render (Variable)
  // Passes interpolation (alpha) for smooth rendering (optional)
  // const alpha = accumulator / FIXED_TIMESTEP;
  game.render(/* alpha */);

  requestAnimationFrame(gameLoop);
}
```

### Specifications for Wave Generation (JSON)

Enemy waves (AFT 3.3) must be defined in an external JSON file (`config.js` or `/assets/waves.json`).

#### Example: `waves.json`

```json
{
  "level_1": [
    { "time": 1000, "type": "small_green", "x": 100, "path": "straight" },
    { "time": 1100, "type": "small_green", "x": 150, "path": "straight" },
    { "time": 1200, "type": "small_green", "x": 200, "path": "straight" },

    // Formation 'red_A' that drops a POW
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

### Example: Entity Class Structure (from `entities.js`)

As per AT 1.4, each entity manages its own DOM.

```javascript
class Enemy {
  constructor(game, x, y, type) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 32; // From config
    this.height = 32; // From config
    this.health = 1;
    this.isMarkedForDeletion = false;

    // DOM Creation (only in the constructor)
    this.element = document.createElement("div");
    this.element.className = `enemy enemy-${type}`;
    this.game.gameContainer.appendChild(this.element);
  }

  // Updates logic (position, state)
  update(deltaTime) {
    this.y += 2; // Example speed

    // If it goes off-screen
    if (this.y > this.game.height) {
      this.markForDeletion();
    }
  }

  // Updates the DOM (rendering)
  render() {
    // Uses 'transform' for performance
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  markForDeletion() {
    this.isMarkedForDeletion = true;
    // Removes the DOM
    this.element.remove();
  }
}
```

## 6\) Task Breakdown and Milestone

Granular list of tasks for implementation (Estimates in Story Points, SP).

| Milestone       | Task            | Description                                                         | Estimate (SP) | "Done" Criteria                                                                  |
| :-------------- | :-------------- | :------------------------------------------------------------------ | :------------ | :------------------------------------------------------------------------------- |
| **M1: Setup**   | Project Setup   | Create file structure (HTML, CSS, JS), Linter setup.                | 1             | `index.html` loads `style.css` and `game.js`.                                    |
| **M1: Setup**   | Base Engine     | Implement `Game` class and _Game Loop_ (Fixed Timestep).            | 3             | Empty screen, `requestAnimationFrame` loop active.                               |
| **M2: Player**  | Player Entity   | Create `Player` class, DOM rendering.                               | 2             | The Player (div) appears on the screen.                                          |
| **M2: Player**  | Input Handler   | Implement `InputHandler` for key state (8 directions).              | 3             | Player moves in 8 directions, restricted to boundaries (clamping).               |
| **M2: Player**  | Player Shooting | Implement shooting (Space key) and `Projectile` class.              | 3             | Player fires projectile `div`s that move upwards.                                |
| **M3: Enemies** | Enemy Entity    | Create base `Enemy` class (rendering and basic movement).           | 2             | Enemy appears and moves downwards.                                               |
| **M3: Enemies** | Spawner         | Implement time-based spawner (from JSON config).                    | 5             | Enemies appear according to the `waves.json` definition.                         |
| **M4: Core**    | Collisions      | Implement AABB function and logic (Player-\>Enemy, Enemy-\>Player). | 5             | Projectiles destroy enemies; Player loses lives.                                 |
| **M4: Core**    | Game State      | Implement Lives, Score, Game Over (PRD 3.5).                        | 3             | HUD updates, game ends at 0 lives.                                               |
| **M5: Feature** | Loop-the-Loop   | Implement special move (temporary invulnerability).                 | 3             | Pressing 'L' makes the player invulnerable.                                      |
| **M5: Feature** | Power-Up (POW)  | Implement generation logic (red formations) and POW collection.     | 5             | Destroying red formations spawns a POW; collecting it grants (e.g.) double shot. |
| **M6: Polish**  | Audio           | Add loading and playback of sound effects and music.                | 3             | Shooting, explosions, and background music function.                             |

## 7\) Testing and Quality

- **Unit Test:** Pure logic (e.g., `isColliding()`, `InputHandler` state management) must be testable (e.g., with Vitest/Jest).
- **Integration Test:** The _game loop_ and class interaction (e.g., "Player's shot destroys an Enemy") must be validated.
- **Manual QA Checklist:**
  1.  Does the game achieve 60 FPS (check with devtools)?
  2.  Is AABB collision accurate?
  3.  Is Input (8 directions, continuous shooting) responsive?
  4.  Does garbage collection work (is the number of DOM elements stable)?
  5.  Are all PRD features (Loop, POW) implemented?
- **Code Review:** (Policy) PRs (Pull Requests) must pass the Linter, tests (if present), and must not introduce performance regressions (verified via profiling).

## 8\) Tooling and CI/CD

- **Linting:** Mandatory. Use **ESLint** (with `eslint:recommended` ruleset) and **Prettier** for formatting.
- **Build Tool (Optional):** For development, use a lightweight server (e.g., `http-server`). For production, **Vite** is recommended for _minification_ and _bundling_.
- **CI/CD:** Configure (e.g., GitHub Actions) for:
  1.  `lint` (Style check)
  2.  `test` (Unit test execution)
  3.  `build` (Vite build execution)
  4.  `deploy` (Deploy to static host, e.g., GitHub Pages or Netlify).

## 9\) Error Handling and Logging

- **Development:** Use `console.log` and `console.warn` for status and events (e.g., "Enemy [ID] spawned", "Player Collision").
- **Production:** The build code must remove `console.log` statements. Handle critical errors (e.g., asset loading failure) with `try...catch` and a message to the user.
- **Fallback:** If an asset (image/audio) fails to load, the game must not crash (log the error and continue without that asset).

## 10\) Security and Privacy

- **Input:** Validate (though not critical in this context).
- **No Eval:** Never use `eval()` or `innerHTML` with user input.
- **Privacy:** The game must not collect or transmit any personally identifiable information (PII). The score (if saved) must be local (`localStorage`).

## 11\) Delivery and Documentation

The mandatory _deliverables_ for project completion are:

1.  Source code (`/src/`).
2.  Production build (`/build/` or equivalent).
3.  `README.md`: With installation instructions (e.g., `npm install`) and execution (e.g., `npm run dev`, `npm run build`).
4.  `CHANGELOG.md`: (Simplified) Track of changes (e.g., "v1.1: Added POW logic").
5.  `LICENSE`: (e.g., MIT).
6.  _Asset Manifest_: (List of assets and their licenses).

## 12\) Final Checklist (CI/Agent Validation)

This JSON can be used to automatically validate the build.

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

## 🤖 10 Golden Rules for the AI Agent

1.  **Follow the AT:** The Technical Analysis (AT) is your source of truth for implementation; its patterns (e.g., GC, rendering) are mandatory.
2.  **Vanilla JS:** Never use jQuery, React, or other frameworks (as per PRD).
3.  **`transform` for Movement:** Never use `top/left` to animate sprites (as per AT).
4.  **No DOM in Loop:** Do not create (`createElement`) or search (`querySelector`) elements in the `gameLoop` (as per AT).
5.  **GC via Filter:** Use the `isMarkedForDeletion` pattern and `.filter()` for garbage collection (as per AT).
6.  **Separate Input State:** Manage `keydown`/`keyup` input in a state object (`keysPressed`), do not act directly on the event (as per AFT).
7.  **ES6 Classes:** Structure all JS code using the ES6 Classes defined in the AFT (`Game`, `Player`, `Enemy`).
8.  **AABB Collision:** Use the `isColliding(rect1, rect2)` function defined in the AT.
9.  **External Config:** Move logic (e.g., enemy speed, waves) to configuration files/objects (JSON/JS) instead of _hard-coding_ it.
10. **Comment Logic:** Comment _why_ the logic is implemented in a certain way (e.g., "// Performs GC", "// Applies invulnerability for Loop").
