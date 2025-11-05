# Product Requirements Document (PRD) - English Translation

## ✈️ Project: "1942" Arcade Game Reimplementation (Web-Based)

| Field                 | Value                                                           |
|:----------------------|:-----------------------------------------------------------------|
| **Document ID** | PRD-1942-WEB-V1.0                                                |
| **Author** | Gemini AI Analyst                                                |
| **Version Date** | November 5, 2025                                                  |
| **Product** | Reimplementation of "1942" (Vertical Scrolling Shoot 'Em Up)      |
| **Target Audience** | AI Developer (LLM) for code generation                           |
| **Target Technologies** | HTML5, CSS3, JavaScript (Vanilla JS, no Frameworks allowed)      |

---

## 1. Project Goal

The goal is to generate a faithful and fully playable implementation of the classic arcade game **"1942"** (Capcom, 1984)
directly in the browser. The priority is **mechanical fidelity** and **code efficiency** in JavaScript to manage
the *game loop*, collision detection, and element rendering (via CSS or Canvas, preferably through
DOM/CSS manipulation for simplicity and visibility of the generated code).

---

## 2. Architecture and Technology Stack

The solution must be implemented using the standard web stack.

### 2.1. Technical Requirements

- **HTML:** Basic game structure (container, UI for score/lives). Must include a main **`div`** element
  for the *game screen*.
- **CSS:** Styling for the game area, aircraft *sprites* (player/enemies/bullets), and vertical scrolling animation (Background Scrolling).
- **JavaScript (Vanilla JS):** All game logic, input handling, *game loop* (`requestAnimationFrame`),
  collision detection, and state management.

---

## 3. Game Functionality (Game Mechanics)

### 3.1. Game Area and Scrolling

- **Orientation:** **Vertical** scrolling from top to bottom (simulating forward flight).
- **Background:** The background (ocean/land) must scroll continuously from bottom to top to give a sense of
  movement.
- **Dimensions:** The game area must have a vertical aspect ratio (e.g., 4:3 or 3:4) to replicate the
  arcade experience. (Suggestion for the AI: $400px$ wide by $600px$ high).

### 3.2. The Player (Super Ace, P-38 Lightning)

- **Control:** The player's aircraft (named "Super Ace") must be controllable in **8 directions** using
  the arrow keys (or WASD).
- **Shooting:** Pressing a key (e.g., **`Space`**), the aircraft fires single or double bullets in rapid succession
  in a vertical direction (upwards). Shooting must be **continuous** while the key is held down.
- **Special Move: Loop-the-Loop:** Pressing a dedicated key (e.g., **`L`**), the player performs an evasive *loop*.
    - **Effect:** The aircraft becomes **invulnerable** (temporarily invisible to collisions/bullets).
    - **Limitation:** The player **cannot shoot** during the *loop*.
    - **Count:** The player has a limited number of *loops* per level (default: 3).

### 3.3. Enemies

- **Types:** Minimum of 3 distinct enemy aircraft types (e.g., small fighters, medium fighters, formation bombers).
- **Movement:** Enemies must appear from the top boundary of the game area and move downwards, often in
  **predefined formations** (e.g., V-shape or serpentine).
- **Enemy Fire:** Enemies shoot bullets downwards.
- **Collisions:**
    - Collision with player's bullet: The enemy aircraft is destroyed (after 1 or more hits depending on the type).
    - Collision with player's aircraft: The player loses a life.
    - Off-screen exit: If an enemy leaves the bottom boundary, it disappears.

### 3.4. Power-Up (POW)

- **Generation:** When a **complete red formation** of enemy aircraft is destroyed, a *power-up*
  called **"POW"** appears (represented as a red P).
- **Collection:** The player must fly over the "POW" element to activate it.
- **Primary Effects (Implement at least 2 types):**
    1. **Double Cannon:** Increases firepower (e.g., fires two side-by-side bullets instead of one).
    2. **Escorts (Options):** Two smaller aircraft appear on the sides of the "Super Ace" and fire in sync,
       increasing coverage. (These "options" can be destroyed by enemy bullets or collisions).

### 3.5. Game Cycle and Win/Loss Conditions

- **Lives:** The player starts with a limited number of lives (default: 3).
- **Loss of Life:** Occurs upon collision with an enemy aircraft or enemy bullet (except during the *loop*).
- **Game Over:** When the life counter reaches zero.
- **Score:** A visible counter must track points (e.g., 50 points for the smallest enemy).

---

## 4. User Interface (UI) Requirements

### 4.1. Status Display

The user interface, positioned above or next to the game area, must display in real-time:

| Metric   | Location                                     |
|:----------|:---------------------------------------------|
| **Score** | Player's current score.                      |
| **Lives** | Remaining lives (aircraft icons or number). |
| **Loop** | Number of remaining special *loops*.         |

### 4.2. Graphic Assets

- The AI must use basic geometric shapes, colors, or minimal CSS *placeholders* to represent the **Super
  Ace**, **Enemies**, and **Bullets**. The graphics must be functional for collision logic (e.g., the
  Super Ace's *hitbox* area is only the central fuselage, not the outer wings).

---

## 5. Acceptance Criteria

The generated code will be accepted if:

- **Mechanical Adherence:** The basic mechanics (movement, shooting, collision, invulnerability *loop*) are
  implemented and function as described.
- **Stable Game Loop:** The JavaScript *game loop* correctly manages state updates and rendering without
  *flickering* or noticeable lag.
- **Code Structure:** The code is well-commented, logical, and follows the separation between HTML (structure),
  CSS (appearance), and JS (logic).
- **Absence of Frameworks:** No external *frameworks* or libraries were used (Vanilla JS only).

**Next Step for the AI:** Analyze this PRD and begin generating the **HTML, CSS, and JS** structure for
a minimalist but complete implementation of the *game loop* and player collisions.