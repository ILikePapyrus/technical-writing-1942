# Functional and Technical Analysis (FTA)

| Field               | Value              |
|:--------------------|:-------------------|
| **Document ID** | AFT-1942-WEB-V1.0  |
| **PRD Reference** | PRD-1942-WEB-V1.0  |
| **Author** | Gemini AI Analyst  |
| **Version Date** | November 5, 2025   |
| **Target Audience** | AI Developer (LLM) |

---

## 1. Document Objective

This analysis translates the PRD requirements into actionable technical and functional specifications.
It serves as a prescriptive guide for the LLM, describing the software architecture,
design patterns, and implementation logic necessary to build the game "1942" in
**HTML, CSS, and Vanilla JavaScript**.

## 2. Solution Architecture

As per the PRD, the implementation must avoid external frameworks. The logic will be split into three main files:
`index.html`, `style.css`, `game.js`.

### 2.1. HTML Component (`index.html`)

The HTML will define the static structure. It will be minimal and contain:

- A general _wrapper_ (`<div id="game-wrapper">`).
- The User Interface (`<div id="ui-hud">`) for score, lives, and loop count.
- The main game container (`<div id="game-container">`).
  This element acts as the **viewport** and the game "world".
- The player element (`<div id="player">`) positioned inside the `game-container`.
- All other elements (enemies, projectiles, POW) will be generated dynamically via JS and added to the `game-container`.

### 2.2. CSS Component (`style.css`)

The CSS will handle all visual rendering and basic animations.

- **Sprite Rendering:** The preferred approach, as per the PRD, is **DOM manipulation**.
  All game elements (player, enemies, projectiles) will be styled `div` elements.
    - `#game-container` will have `position: relative;` and `overflow: hidden;`.
    - `#player`, `.enemy`, `.projectile` will have `position: absolute;`.
      Their position will be updated by JS modifying `style.transform = 'translate(x, y)'`
      (preferable to `top`/`left` for rendering performance).
- **Vertical Scrolling:** This will be implemented using a CSS `@keyframes` animation.
  The `body` or `#game-container` element will have a `background-image` (placeholder) and
  the animation will continuously and cyclically modify its `background-position-y` to simulate movement.
- **Placeholder Assets:** Sprites will be CSS shapes:
    - **Player:** A rectangle with a distinct color (e.g., blue).
    - **Enemies:** Smaller rectangles (e.g., green, red for formations).
    - **Projectiles:** Small circles or thin rectangles (e.g., white for the player, orange for enemies).

### 2.3. JavaScript Component (`game.js`) - Core Architecture

This file will contain the entire game logic.
A **lightweight Object-Oriented Programming (OOP) approach** using **ES6 Classes** is recommended for clean entity management.

- **Design Pattern: Game Loop**

    - The heart of the game will be a central _game loop_, managed by `requestAnimationFrame(gameLoop)`.
    - This loop will call, in order, three main functions on every _tick_:
        1. `handleInput()`: Checks the state of user inputs.
        2. `update()`: Updates game logic (movement, collisions, spawning).
        3. `render()`: Updates the DOM (element positions) based on the state.

- **Main Classes:**
    - `class Game`: Main manager. Initializes the game, starts the loop,
      manages the state (score, lives), and holds the entity arrays (`enemies`, `projectiles`).
    - `class Player`: Manages the player's state (position `x`, `y`, `isInvulnerable`, `loopCount`, `powerUpState`).
    - `class Enemy`: Base class for enemies (position `x`, `y`, `health`, `type`).
    - `class Projectile`: Manages projectiles (position `x`, `y`, `direction` [player/enemy]).

## 3. Detailed Functional Analysis (Game Logic)

### 3.1. User Input Handling

- Input (Arrow Keys, WASD, Space, L) must be managed using `addEventListener('keydown', ...)` and `keyup`.
- **Movement Logic (8 directions):** To allow for diagonal movement (e.g., Up + Right),
  the game must not react directly to the individual `keydown` event. A state object must be used
  (e.g., `keysPressed = { 'ArrowUp': false, 'ArrowRight': false }`).
    - `keydown` sets the corresponding key to `true`.
    - `keyup` sets the key to `false`.
    - The `handleInput()` function in the _game loop_ reads this object and calculates the player's movement vector.
- **Shooting (Space):** Must support continuous firing. An `isShooting` flag in the `keysPressed` object will allow the
  `gameLoop` to generate projectiles at regular intervals (managed by a _cooldown_) as long as the key is pressed.
- **Loop (L):** `keydown` on 'L' activates the special move _only if_ `player.loopCount > 0` and `player.isLooping == false`.

### 3.2. Player Logic (`Player` Class)

- **Movement:** The `update()` function updates `player.x` and `player.y` based on input,
  ensuring the player does not exit the boundaries of the `#game-container` (clamping).
- **Loop-the-Loop:** When activated:
    1. Sets `player.isInvulnerable = true` and `player.canShoot = false`.
    2. Applies a CSS class (e.g., `.looping`) for a visual animation.
    3. Starts a `setTimeout` (e.g., 1500ms).
    4. At the end of the timeout: `player.isInvulnerable = false`, `player.canShoot = true`, removes the CSS class.
- **Power-Up State:** It will have a `powerUpState` property (e.g., 0=Base, 1=Double Cannon, 2=Escort).
  The shooting function will check this state to generate 1 or 2 projectiles (or activate escorts).

### 3.3. Enemy and Spawning Logic

- **Movement:** Enemies move vertically downwards (`y` increases).
  Predefined formations require _scripting_ logic.
- **Spawner (Critical):** A **time-based (or scroll-based) spawning system** must be implemented.
    - An array of "waves" is defined
      (e.g., `const wave1 = [{ type: 'small', x: 50, delay: 1000 }, { type: 'small', x: 100, delay: 1100 }]`).
    - The `gameLoop` checks the elapsed time since the start of the level and generates enemies
      (creating new instances of the `Enemy` class) when their `delay` is reached.
- **Red Formations (for POW):** The spawner must "tag" enemies belonging to a special formation (e.g., `new Enemy(..., formationId: 'red_A')`).

### 3.4. Projectile Management and Garbage Collection

- All active projectiles (both player and enemy) will be held in an array (e.g., `game.projectiles = []`).
- The `update()` function of the _game loop_ iterates over this array and updates the `y` of each projectile.
- **Garbage Collection:** It is crucial to remove elements that leave the screen to avoid DOM and array overload.
    - In the `update()` loop: if `projectile.y < 0` or `projectile.y > gameContainer.height`
      (or `enemy.y > gameContainer.height`), the object must be removed from the management array _and_ its DOM element
      must be deleted (`element.remove()`).

### 3.5. Collision Detection

This is the most critical and computationally expensive logic. It must be executed on every `update()`.

- **Method:** **AABB (Axis-Aligned Bounding Box)** detection will be used.
- **Implementation:** A helper function will be created: `isColliding(rect1, rect2)`.
    - This function will take the coordinates `(x, y, width, height)` of two entities.
    - It will return `true` if the rectangles overlap. (It will be more efficient if the `Player`, `Enemy`, etc. classes
      expose a `getBoundingBox()` method).
- **Check Cycles (per frame):**
    1. **Player Projectiles vs. Enemies:** Loop over every player projectile and compare it with _every_ enemy.
       If `isColliding()` is `true`: destroy the projectile, decrement the enemy's health,
       (if enemy health <= 0, destroy the enemy, increase score).
    2. **Enemy Projectiles vs. Player:** Loop over every enemy projectile and compare it with the player.
       If `isColliding()` and `!player.isInvulnerable`: destroy the projectile, the player loses a life.
    3. **Enemies vs. Player:** Loop over every enemy and compare it with the player.
       If `isColliding()` and `!player.isInvulnerable`: the player loses a life (and the enemy, optionally, is destroyed).
    4. **Player vs. POW:** Loop over POWs and compare them with the player.
       If `isColliding()`: destroy the POW, apply the `powerUpState` to the player.

### 3.6. Power-Up Logic (POW)

- When an enemy (tagged with `formationId`) is destroyed,
  it checks if all other enemies with the same `formationId` have been destroyed.
- If yes, a `POW` instance (which slowly descends) is generated at the position of the last destroyed enemy.

## 4. Final Product (User Experience)

The user will open the `index.html` file in a browser.

1. **Startup:** The game starts immediately. The user will see the HUD with Score=0, Lives=3, Loop=3.
   They will see their "plane" (a blue `div`) at the bottom center. The background (ocean/land) will scroll vertically.
2. **Gameplay:**
    - Using the arrow keys, the plane moves smoothly (including diagonally).
    - Holding down Space, the plane fires continuous bursts of projectiles (white rectangles).
    - Enemy `div`s (green/red) appear from the top of the screen, descending and shooting (orange projectiles).
    - Hitting enemies makes them disappear and increases the score in the HUD.
    - If an enemy projectile or enemy plane touches the player's `div`, Lives in the HUD decrease.
    - Pressing 'L', the plane performs an animation (e.g., flashes) and for 1.5 seconds, enemy projectiles pass
       through it without damage.
3. **End:** If Lives reach 0, the game stops (the `gameLoop` ceases) and a "Game Over" message appears.

## 5. Instructions for the AI Developer (LLM)

Generate the three files (`index.html`, `style.css`, `game.js`) following the architecture and patterns defined in this document.
The primary focus is on the robust implementation of the **Game Loop (`requestAnimationFrame`)**,
**ES6 Classes** for entities, and the **AABB collision logic** for a functional prototype.
The JS code must be heavily commented to explain the loop logic,
state management, and collision detection.

---