# Product Requirements Document (PRD) - English Translation

## ✈️ Project: "1942" Arcade Game Reimplementation (Web-Based)

| Field                   | Value                                                        |
| :---------------------- | :----------------------------------------------------------- |
| **Document ID**         | PRD-1942-WEB-V1.0                                            |
| **Author**              | Gemini AI                                                    |
| **Version Date**        | November 5, 2025                                             |
| **Product**             | Reimplementation of "1942" (Vertical Scrolling Shoot 'Em Up) |
| **Target Audience**     | AI Developer (LLM) for code generation                       |
| **Target Technologies** | HTML5, CSS3, JavaScript (Vanilla JS, no Frameworks allowed)  |

---

## 1. Project Goal

The goal is to generate a faithful and fully playable implementation of the classic arcade game **"1942"** (Capcom, 1984)
directly in the browser. The priority is **code efficiency** in JavaScript to manage
the _game loop_, collision detection, and element rendering (via CSS for simplicity and visibility of the generated code).

---

## 2. Architecture and Technology Stack

The solution must be implemented using the standard web stack HTML, CSS and JavaScript.

### 2.1. Technical Requirements

- **HTML:** Basic game structure (container, UI for score/lives). Must include a main **`div`** element
  for the **game screen**.
- **CSS:** Styling for the game area, aircraft _sprites_ (player/enemies/bullets), and vertical scrolling animation (Background Scrolling).
- **JavaScript (Vanilla JS):** All game logic, input handling, _game loop_ (`requestAnimationFrame`),
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

- **Control:** The player's aircraft must be controllable in **all the directions** using
  the arrow keys (or WASD).
- **Shooting:** Pressing a key (e.g., **`Space`**), the aircraft fires single or double bullets (If power up is activated) in rapid succession in a vertical direction (upwards). Shooting must be **continuous** while the key is held down.
- **Special Move: Loop-the-Loop:** Pressing a dedicated key (e.g., **`L`**), the player performs an evasive _loop_.
  - **Effect:** The aircraft becomes **invulnerable** (temporarily invisible to collisions/bullets).
  - **Limitation:** The player **cannot shoot** during the _loop_.
  - **Count:** The player has a limited number of _loops_ per level (default: 3).

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

- **Generation:** When a **complete red formation** of enemy aircraft is destroyed, a _power-up_
  called **"POW"** appears (represented as a red P).
- **Collection:** The player must fly over the "POW" element to activate it.
- **Primary Effects (Implement at least 2 types):**
  1. **Double Cannon:** Increases firepower (e.g., fires two side-by-side bullets instead of one).
  2. **Escorts:** Two smaller aircraft appear on the sides of the "Super Ace" and fire in sync,
     increasing coverage. (The escorts can be destroyed by enemy bullets or enemy collisions).

### 3.5. Game Cycle and Win/Loss Conditions

- **Lives:** The player starts with a limited number of lives (default: 3).
- **Loss of Life:** Occurs upon collision with an enemy aircraft or enemy bullet (except during the _loop_).
- **Game Over:** When the life counter reaches zero.
- **Score:** A visible counter must track points (50 points for the smallest enemy).

---

## 4. User Interface (UI) Requirements

### 4.1. Status Display

The user interface is positioned above or next to the game area, must display in real-time:

| Metric    | Location                                    |
| :-------- | :------------------------------------------ |
| **Score** | The score of the player.                    |
| **Lives** | Remaining lives (aircraft icons or number). |
| **Loop**  | Number of remaining special _loops_.        |

### 4.2. Graphic Assets

- The AI must use basic geometric shapes, colors, or minimal CSS _placeholders_ to represent the **Super
  Ace**, **Enemies**, and **Bullets**. The graphics must be functional for collision logic (e.g., the
  Super Ace's _hitbox_ area is only the central fuselage, not the outer wings).

---

## 5. Acceptance Criteria

The generated code will be accepted if:

- **Mechanical Adherence:** The basic mechanics (movement, shooting, collision, invulnerability _loop_) are
  implemented and function as described.
- **Stable Game Loop:** The JavaScript _game loop_ correctly manages state updates and rendering without
  _flickering_ or noticeable lag.
- **Code Structure:** The code is well-commented, logical, and follows the separation between HTML (structure),
  CSS (appearance), and JS (logic).
- **Absence of Frameworks:** No external _frameworks_ or libraries were used (Vanilla JS only).

**Next Step for the AI:** Analyze this PRD and begin generating the **HTML, CSS, and JS** structure for
a minimalist but complete implementation of the _game loop_ and player collisions.
