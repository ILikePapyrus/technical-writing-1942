# Technical Analysis (TA) and Guidelines for AI Developer

| Field               | Value              |
| :------------------ | :----------------- |
| **Document ID**     | AT-1942-WEB-V1.0   |
| **AFT Reference**   | AFT-1942-WEB-V1.0  |
| **Author**          | Gemini AI          |
| **Version Date**    | November 5, 2025   |
| **Target Audience** | AI Developer (LLM) |

---

## 1. Implementative Architecture and Design Patterns

This section translates the logical architecture of the AFT into specific code patterns.

### 1.1. File Structure (Confirmed)

- `index.html`: UI container and game viewport (`#game-container`).
- `style.css`: Styling, animations (`@keyframes` for background), and _sprites_ (CSS classes for `.player`, `.enemy`, etc.).
- `game.js`: All game logic.

### 1.2. Rendering Pattern: DOM-Based (Non-Canvas)

The entire rendering will be done by manipulating `div` elements in the DOM.

- **Performance:** Position updates must _always_ be executed using the CSS property
  `transform: translate(x, y);` (or `translate3d`). **Never use** `top` or `left` inside the game loop,
  as they cause _layout reflow_ and poor performance.
- **Creation:** The creation of new elements (`document.createElement('div')`) **must never** occur inside
  the main loop. It must only happen at the time of _spawning_.

### 1.3. Game Loop Pattern (Core)

`game.js` must be orchestrated by a single `requestAnimationFrame` function.

```javascript
// Game Loop structure example in game.js
const game = new Game();

function gameLoop(timestamp) {
  // 1. Input Handling (state reading)
  game.handleInput();

  // 2. Logic Update (collisions, movement, spawning)
  game.update(timestamp);

  // 3. Render (DOM/CSS update)
  game.render();

  // 4. Request next frame
  requestAnimationFrame(gameLoop);
}

// Start
requestAnimationFrame(gameLoop);
```

### 1.4. State Management Pattern: ES6 Classes

The AFT defined the classes (`Game`, `Player`, `Enemy`, `Projectile`). Their interaction must follow this scheme:

- **`Game` (Orchestrator):** This is the main class.
  - Contains state _arrays_: `this.enemies = []`, `this.projectiles = []`, `this.powerUps = []`.
  - Contains the player instance: `this.player = new Player(...)`.
  - Contains the global state: `this.score`, `this.lives`.
  - Its `update()` function orchestrates collisions and _garbage collection_.
- **Entities (Player, Enemy, Projectile):**
  - Each entity class must have:
    - State properties: `this.x`, `this.y`, `this.width`, `this.height`.
    - A reference to its DOM element: `this.element`.
    - A "death" flag: `this.isMarkedForDeletion = false`.
  - The constructor of each entity is responsible for **creating its own DOM element** and appending it to the
    `#game-container`.

### 1.5. Input Management Pattern: State Object

To manage 8-direction movement, input must not be handled directly by events.

- A global object (or an `InputHandler` class) must be created that listens for `keydown` and `keyup`.
- This handler updates a simple object `keysPressed = { 'ArrowUp': false, 'ArrowDown': false, ... }`.
- The `game.handleInput()` function (called by the loop) reads this `keysPressed` object and updates the player's
  velocity (`vx`, `vy`) accordingly.

## 2\. Critical Implementation Details (Specs for the AI)

### 2.1. Collision Function (AABB)

Generate a standalone (pure) _helper_ function for AABB collision detection. It must be optimized.

```javascript
/**
 * Detects collision between two rectangles (AABB).
 * @param {object} rect1 - {x, y, width, height}
 * @param {object} rect2 - {x, y, width, height}
 * @returns {boolean} True if there is a collision.
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

### 2.2. Garbage Collection Logic (Fundamental)

Game stability depends on the correct _garbage collection_ (GC) of DOM elements and arrays.

- When an entity is destroyed (collision, screen exit), **do not immediately remove it from the array** (causes
  errors in `for` loops).
- **Correct Pattern:**
  1.  Set the flag: `enemy.isMarkedForDeletion = true`.
  2.  Remove the element from the DOM: `enemy.element.remove()`.
  3.  At the _end_ of the `game.update()` cycle, filter the arrays to remove all marked elements:
      ```javascript
      // Inside game.update(), after collision loops
      this.enemies = this.enemies.filter((enemy) => !enemy.isMarkedForDeletion);
      this.projectiles = this.projectiles.filter((p) => !p.isMarkedForDeletion);
      ```

### 2.3. Spawning System (Time-Based)

Do not use `setInterval`. The spawner must be tied to the `gameLoop` _timestamp_.

- The `Game` class must have `this.gameTime = 0`.
- The `update(timestamp)` calculates the `deltaTime` and adds it to `gameTime`.
- A wave configuration array (as per AFT) will be read, and enemies will be spawned when `gameTime`
  exceeds their `delay`.

## 3\. 🤖 Guidelines for the AI Companion (Rules of Engagement)

To generate high-quality code, interaction with the AI (you) must follow these rules.

### 3.1. Effective Prompting (Basic Rules)

1.  **Be Specific and Atomic:** Do not ask to "Generate the game." Ask for granular requests.
    - **NO:** "Create the enemies."
    - **YES:** "Generate the `Enemy` JS class (for `game.js`) according to the AFT. It must have a constructor `(game, x, y, type)`
      and an `update()` method that increments `this.y` (fixed speed). The constructor must create a `div`,
      assign it the class `enemy`, and append it to the `game.gameContainer`."
2.  **Define Context:** Always specify the target file and (if necessary) the class or function where the
    code should be integrated.
    - **Example:** "In the file `game.js`, inside the `update()` method of the `Game` class, add the loop for
      collision detection between `this.player.projectiles` and `this.enemies`."
3.  **Define Output:** Conclude prompts by specifying the format.
    - **Example:** "Output format: Vanilla ES6 JavaScript code block with JSDoc comments for the method."
4.  **Iteration (Refactoring):** It is preferable to ask for a draft and then refine it.
    - **Example 1:** "Generate the `Player` class."
    - **Example 2:** "Now, modify the `update()` method of the `Player` class to add _clamping_ (it must not
      exit the bounds of `game.width`)."

### 3.2. Disclaimer and QA (Mandatory Quality Control)

- **Human Review (Always):** The code generated by the AI is a **draft**. It must always be subjected to \*
  _cross-review_\* by a human developer before being integrated into the main branch.
- **Focus on Performance:** The AI must avoid creating `event listeners` or manipulating the DOM (
  reading/writing) _inside_ the `gameLoop` functions (`update`, `render`).
  - Reading dimensions (e.g., `element.offsetWidth`) should be done only once, at initialization.
  - _Event listeners_ should be registered _only once_ when the game starts.
- **Security and Efficiency Check:**
  - Verify that **Garbage Collection** (section 2.2) is implemented correctly. Failure to remove
    elements from the DOM or arrays is a critical bug that leads to a _memory leak_.
  - Verify that there are no references to external libraries or frameworks (PRD requirement).
