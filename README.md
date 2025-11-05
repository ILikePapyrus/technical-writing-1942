# 1942 - Arcade Shooter Game

## Overview

This is a web-based recreation of the classic 1942 arcade game, implemented using vanilla HTML5, CSS3, and JavaScript. The game features vertical scrolling shoot-em-up gameplay where the player controls a WWII fighter plane, dodging enemy projectiles while shooting down enemy aircraft. The implementation prioritizes mechanical fidelity to the original arcade game while maintaining clean, efficient code through DOM-based rendering with CSS transforms.

**Current Status**: Fully functional and playable! The game is complete with all core mechanics implemented.

## Project Structure

```
/
├── index.html              # Main HTML file with game container and UI
├── src/
│   ├── css/
│   │   └── style.css      # Game styling, sprites, and animations
│   └── js/
│       └── game.js        # Complete game logic and classes
├── docs/                  # Original planning documents
│   ├── PRD.md            # Product Requirements Document
│   ├── Analisi Tecnica.md # Technical Analysis
│   └── ...               # Other planning docs
└── README.md             # Project description
```

## How to Play

### Controls
- **Arrow Keys** or **WASD**: Move your plane in 8 directions
- **SPACE**: Shoot projectiles (hold for continuous fire)
- **L**: Execute Loop-the-Loop (grants temporary invulnerability)
- **ENTER**: Start game / Restart after game over

### Gameplay
- Shoot down enemy planes in formations
- Avoid enemy projectiles and collisions
- Destroy complete red formations to spawn power-ups
- Collect power-ups for weapon upgrades (double cannon or side options)
- You have 3 lives and 3 loops per game
- Score points by destroying enemies

## Technical Architecture

### Frontend Architecture

**Technology Stack:**
- Pure HTML5, CSS3, and Vanilla JavaScript (no frameworks)
- DOM-based rendering system (not Canvas-based)
- CSS transforms for all visual updates and animations

**Rendering Pattern:**
- All game entities (player, enemies, projectiles) are represented as `div` elements in the DOM
- Position updates use `transform: translate(x, y)` instead of `top`/`left` to avoid layout reflows
- CSS classes define sprite appearance (currently using colored geometric shapes)
- Background scrolling implemented via CSS `@keyframes` animation

**Game Loop Architecture:**
- Single `requestAnimationFrame` loop orchestrates all game logic
- Three-phase update cycle: Input Handling → Logic Update → Render
- Delta-time based updates for frame-rate independence
- No element creation during game loop (only during spawning events)

**Code Organization:**
The game uses a class-based architecture:
- `Game`: Main orchestrator class managing game state, entities, and loop
- `Player`: Player-controlled fighter with shooting and loop mechanics
- `Enemy`: Enemy aircraft with movement patterns and AI shooting
- `Projectile`: Bullets for both player and enemies
- `PowerUp`: Collectible power-ups that spawn after destroying red formations
- `InputHandler`: Keyboard input state management

**State Management:**
- ES6 classes for all game entities
- Game class maintains arrays of active entities (enemies, projectiles, powerUps)
- Entity lifecycle managed through `isMarkedForDeletion` flags
- Input state tracked via key-value object updated by event listeners

**UI Components:**
- HUD displays score, lives, and loop counter
- Start screen with game instructions
- Game over screen with final score and restart option

### Performance Considerations

**DOM Manipulation:**
- Hardware acceleration via CSS transforms
- `translate3d` used for GPU-accelerated animations
- Avoidance of layout reflows by never using `top`/`left` in game loop
- Entity cleanup through garbage collection pattern

**Game Mechanics Implementation:**

**Player System:**
- 8-directional movement with diagonal speed normalization
- Continuous shooting with cooldown system
- Loop-the-loop invulnerability mechanic (L key, limited uses)
- 3 lives system with collision detection

**Enemy System:**
- Wave-based spawning system with multiple formation patterns:
  - V-Formation
  - Line Formation
  - Red Formation (spawns power-ups when fully destroyed)
  - Scattered enemies
- Sinusoidal movement patterns
- AI shooting at intervals

**Collision Detection:**
- Axis-Aligned Bounding Box (AABB) algorithm
- Separate checks for player-enemy, player-projectile, and projectile-enemy collisions
- Collision immunity during loop-the-loop

**Power-Up System:**
- Drops from destroyed red formations
- Two types: Double cannon and Side options
- Visual pulse animation for visibility

## External Dependencies

**None - Fully Vanilla Implementation**

The project intentionally avoids all external frameworks, libraries, and build tools to maintain:
- Maximum portability
- Minimal deployment complexity
- Complete code transparency
- Direct browser compatibility without transpilation

## Development Setup

The game runs on a simple Python HTTP server on port 5000:
```bash
python -m http.server 5000
```

Open your browser and navigate to the Replit webview to play!

## Deployment

The game is ready for deployment as a static site. It requires no build process - just serve the HTML, CSS, and JS files.

## Future Enhancements

Potential improvements as suggested by the technical review:
1. Add audio and sound effects
2. Implement sprite sheets for authentic 1942 graphics
3. Add more enemy types and boss battles
4. Performance profiling and optimization for mobile devices
5. Score persistence with local storage
6. Additional power-up types

## User Preferences

Preferred communication style: Simple, everyday language.
