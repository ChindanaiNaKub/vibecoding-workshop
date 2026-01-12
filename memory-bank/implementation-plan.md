# Implementation Plan — SEVER

## Overview

This document outlines the step-by-step implementation plan for SEVER, a turn-based physics strategy game. The plan is organized into 5 phases, from foundation to polish.

**Tech Stack:** JavaScript + React + Matter.js + Canvas (single HTML entry point)

---

## Finalized Game Mechanics

| Action | Description | Limits |
|--------|-------------|--------|
| **Anchor** | Attach new tether from your wall to the Core | Max 5-7 tethers per player |
| **Reinforce** | Increase stiffness of an existing tether | Max 3 reinforcement levels per tether |
| **Sever** | Cut a tether (yours or enemy's) | 1-turn cooldown after severing |

- **Single action per turn** (Anchor OR Reinforce OR Sever)
- **Starting state:** Pre-configured with 2-3 tethers per player
- **Arena:** 800x600 canvas, circular arena with ~250px radius
- **Core:** Heavy circular body (radius: 35px, starts at center)

---

## Phase 1: Foundation

### Files to Create
- `index.html` - Single entry point with CDN imports
- `src/app.js` - React app initialization
- `src/components/GameCanvas.jsx` - Canvas component
- `src/physics/engine.js` - Matter.js setup
- `src/physics/bodies.js` - Body creation helpers
- `src/physics/constraints.js` - Tether constraint helpers

### Steps
1. Create `index.html` with CDN imports for React, ReactDOM, Matter.js
2. Set up basic React app structure in `src/app.js`
3. Create GameCanvas component with useRef for canvas element
4. Initialize Matter.js engine in `src/physics/engine.js`
5. Set up requestAnimationFrame render loop in GameCanvas

### Verification
- Open `index.html` in browser
- See blank canvas with no console errors
- Verify React mounts successfully

---

## Phase 2: Core Physics

### Goal
Have a visible Core that responds to physics with realistic tether mechanics.

### Steps
1. Create arena with two static wall bodies (left and right)
2. Create Core body with high density for heavy feel
3. Add Core to Matter.js world
4. Render Core and walls on Canvas
5. Verify Core falls and settles (test physics feel)
6. Create first tether (spring constraint) between wall and Core
7. Visualize tether as line on Canvas
8. Test severing: Remove constraint, verify Core moves realistically

### Physics Tuning
- **Core density:** Start at 0.05, adjust for "heavy" feel
- **Spring stiffness:** Start at 0.05 (weak) to 0.2 (strong)
- **Spring damping:** 0.1 to prevent oscillation

### Verification
- See Core at center of arena
- See two walls at left and right edges
- Create tether, see Core move toward wall
- Sever tether, see Core react realistically

---

## Phase 3: Game Logic

### Files to Create
- `src/game/state.js` - Game state management
- `src/game/actions.js` - Action handlers (Anchor, Reinforce, Sever)
- `src/game/controller.js` - Main game controller

### Steps
1. Implement turn-based state machine (PLAYER1_TURN → RESOLVING → PLAYER2_TURN)
2. Create pre-configured starting tethers (2-3 per player)
3. Implement Anchor action:
   - Click on player's wall → Create new tether to Core
   - Validate max tether limit (5-7 per player)
4. Implement Reinforce action:
   - Click on own tether → Increase stiffness
   - Track reinforcement level (0-3)
5. Implement Sever action:
   - Click on any tether → Remove constraint
   - Track sever cooldown (set canSever = false for next turn)
6. Implement win detection:
   - Matter.Events.on(engine, 'collisionStart')
   - Check if Core collides with wall
   - Set winner and phase to GAME_OVER
7. Implement turn switching:
   - After action completes, switch currentPlayer
   - Reset canSever flag if previous action wasn't sever

### Verification
- Game starts with 2-3 tethers per player
- Click wall → new tether appears
- Click own tether → stiffness increases (Core moves more)
- Click any tether → tether disappears, can't sever next turn
- Push Core into wall → game over, winner declared
- Turn indicator switches correctly

---

## Phase 4: Visual Feedback (The "Juice")

### Files to Create
- `src/render/effects.js` - Visual effect helpers
- `src/render/particles.js` - Particle system

### Steps

#### 1. Stress Visualization
- Calculate tension on each tether (extension from rest length)
- Map tension to color: green (low) → yellow (med) → red (high)
- Add line vibration: Jitter line position based on tension

#### 2. Camera Shake
- On sever events: Set shake intensity to 0.5
- On wall impact: Set shake intensity to 1.0
- Apply random offset to canvas context
- Decay shake over time (multiply by 0.9 each frame)

#### 3. Particle Effects
- Create particle array in render loop
- On sever: Emit 10-15 particles at tether attachment point
- On wall impact: Emit 20-30 particles at collision point
- Update particles with gravity and fade out

#### 4. Industrial Horror Styling
- Color palette: Rust (#8B4513), dark grays, warning yellows
- Core: Draw with "rivets" or rust texture
- Tethers: Draw as cables, not thin lines

### Verification
- Tethers change color (green → yellow → red) based on tension
- High-tension tethers vibrate visibly
- Screen shakes when tether is severed
- Particles emit on sever and wall impact
- Visual style matches Industrial Horror aesthetic

---

## Phase 5: Polish & UI

### Files to Create
- `src/components/TurnIndicator.jsx`
- `src/components/ActionPanel.jsx`
- `src/components/GameStatus.jsx`
- `src/styles.css`

### Steps
1. Build React UI components (TurnIndicator, ActionPanel, GameStatus)
2. Add current player indicator (prominent, clear)
3. Add "can't sever" cooldown indicator
4. Add game over screen with winner announcement
5. Add restart button
6. Apply Industrial Horror CSS styling
7. Test in multiple browsers (Chrome, Firefox, Safari)
8. Performance optimization (if needed)

### Verification
- UI clearly shows current player
- Sever cooldown is indicated when active
- Game over screen shows winner clearly
- Restart button resets game properly
- Works in Chrome, Firefox, Safari

---

## File Structure Reference

```
/
├── index.html                    # Entry point
├── src/
│   ├── app.js                    # React app root
│   ├── components/
│   │   ├── GameCanvas.jsx        # Canvas rendering
│   │   ├── TurnIndicator.jsx     # Current player display
│   │   ├── ActionPanel.jsx       # Action mode selector
│   │   └── GameStatus.jsx        # Win/lose display
│   ├── game/
│   │   ├── state.js              # Game state management
│   │   ├── actions.js            # Action handlers
│   │   └── controller.js         # Main coordinator
│   ├── physics/
│   │   ├── engine.js             # Matter.js setup
│   │   ├── bodies.js             # Body creation
│   │   └── constraints.js        # Tether helpers
│   └── render/
│       ├── effects.js            # Visual effects
│       └── particles.js          # Particle system
└── styles.css                    # Global styles
```
