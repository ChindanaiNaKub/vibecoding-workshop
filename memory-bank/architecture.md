# Architecture — SEVER

## High-Level System Structure

```
┌─────────────────────────────────────────────────────┐
│                     React App                        │
│  ┌─────────────────────────────────────────────┐   │
│  │           State Manager (Game State)         │   │
│  │  • Turn management                           │   │
│  │  • Player actions                            │   │
│  │  • Win condition detection                   │   │
│  └─────────────────────────────────────────────┘   │
│                      ↕                              │
│  ┌─────────────────────────────────────────────┐   │
│  │         Game Controller Layer                │   │
│  │  • Orchestrates physics + rendering         │   │
│  │  • Handles user input                       │   │
│  │  • Manages turn transitions                 │   │
│  └─────────────────────────────────────────────┘   │
│           ↕                    ↕                     │
│  ┌─────────────────┐  ┌─────────────────────┐      │
│  │  Physics Engine │  │  Rendering Engine   │      │
│  │    (Matter.js)  │  │     (Canvas)        │      │
│  └─────────────────┘  └─────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

## Major Components

### 1. State Manager

**Responsibility:** Manage all game state and turn logic

**Key Responsibilities:**
- Track current player turn (Player 1 or Player 2)
- Store tether configurations (which walls, which tethers, tension values)
- Detect win conditions
- Handle state transitions (Turn → Action → Resolution → Next Turn)

**Data Structure:**
```javascript
gameState = {
  phase: 'PLAYER1_TURN' | 'PLAYER2_TURN' | 'RESOLVING' | 'GAME_OVER',
  currentPlayer: 1 | 2,
  tethers: [
    {
      id: string,              // Unique identifier
      owner: 1 | 2,            // Which player owns this tether
      bodyA: Matter.Body,      // Wall body (anchor point)
      bodyB: Matter.Body,      // Core body
      constraint: Matter.Constraint,  // Spring constraint
      reinforcementLevel: 0 | 1 | 2 | 3,  // Current strength
      stiffness: number        // Calculated stiffness value
    }
  ],
  canSever: boolean,          // False if player severed last turn
  winner: null | 1 | 2        // Game over winner
}
```

**Game Mechanics:**
- **Anchor:** Attach new tether from your wall to Core (max 5-7 per player)
- **Reinforce:** Increase stiffness of own tether (max level 3)
- **Sever:** Cut any tether (1-turn cooldown after use)
- **Single action per turn** (Anchor OR Reinforce OR Sever)

### 2. Physics Engine (Matter.js)

**Responsibility:** Simulate realistic physics for Core and tethers

**Key Responsibilities:**
- Create and manage Matter.js World, Engine, Runner
- Create Core body with heavy mass properties
- Create arena walls (static bodies)
- Create spring constraints for tethers
- Handle tether removal (sever)
- Detect collisions (Core hitting walls)

**Key Matter.js Components:**
- `Engine`: Main physics engine
- `World`: Contains all bodies
- `Bodies`: Core (circle), Walls (rectangles/segments)
- `Constraint`: Spring constraints for tethers
- `Events`: Collision detection for win condition

**Physics Configuration:**
```javascript
// Engine setup
engine = Matter.Engine.create()
world = engine.world

// Core body (heavy circle)
core = Matter.Bodies.circle(400, 300, 35, {
  density: 0.05,      // Heavy feel
  friction: 0.8,
  frictionStatic: 0.8,
  restitution: 0.2    // Low bounce
})

// Walls (static bodies)
walls = [
  Matter.Bodies.rectangle(50, 300, 30, 200, { isStatic: true }),  // Player 1
  Matter.Bodies.rectangle(750, 300, 30, 200, { isStatic: true }) // Player 2
]

// Spring constraint for tether
constraint = Matter.Constraint.create({
  bodyA: wall,
  bodyB: core,
  stiffness: 0.05,    // Weak tether
  damping: 0.1,       // Prevent oscillation
  length: 200,
  render: { visible: false }  // We render manually on Canvas
})
```

### 3. Rendering Engine (Canvas)

**Responsibility:** Visualize the game state at 60fps

**Key Responsibilities:**
- Clear and redraw Canvas each frame
- Draw arena boundaries
- Draw Core with visual weight indicators
- Draw tethers with stress visualization (color, vibration)
- Render particle effects
- Apply camera shake when needed

**Render Loop:**
```javascript
function render() {
  clearCanvas();
  applyCameraShake();
  drawArena();
  drawTethers();      // With stress colors
  drawCore();
  drawParticles();
  requestAnimationFrame(render);
}
```

### 4. Game Controller

**Responsibility:** Orchestrate physics engine, state manager, and renderer

**Key Responsibilities:**
- Initialize Matter.js and set up world
- Handle user input (mouse clicks for Anchor, Reinforce, Sever)
- Coordinate between State Manager and Physics Engine
- Trigger win condition checks after physics resolves
- Signal Rendering Engine for visual effects (shake, particles)

**Input Handling:**
- **Click on player's wall:** Anchor new tether to Core
- **Click on own tether:** Reinforce (increase stiffness)
- **Click on any tether:** Sever (with cooldown validation)
- **Action validation:**
  - Anchor: Check max tether limit (5-7 per player)
  - Reinforce: Check max reinforcement level (3)
  - Sever: Check canSever flag (1-turn cooldown)

### 5. UI Components (React)

**Responsibility:** Provide game interface and feedback

**Key Components:**
- **Turn Indicator:** Shows whose turn it is
- **Action Panel:** Buttons for Anchor/Reinforce/Sever modes
- **Game Status:** Win/lose messages, restart button
- **Instructions Overlay:** How to play

## Data Flow

### Turn Flow

```
1. PLAYER_TURN State
   ↓
2. Player selects action (Anchor/Reinforce/Sever)
   ↓
3. Game Controller validates action
   ↓
4. Physics Engine applies change
   ↓
5. RESOLVING State
   ↓
6. Physics runs until equilibrium (~2-3 seconds)
   ↓
7. State Manager checks win condition
   ↓
8. If win → GAME_OVER
   If no win → Switch to next player turn
```

### Rendering Flow

```
Game Loop (60fps)
   ↓
Read current game state
   ↓
Read physics bodies positions
   ↓
Calculate visual effects (stress, shake, particles)
   ↓
Render to Canvas
```

## Separation of Concerns

- **React** = State and UI only (no physics, no Canvas rendering)
- **Matter.js** = Physics only (no rendering, no game logic)
- **Canvas** = Rendering only (no state management, no physics logic)
- **Game Controller** = Coordination layer between all systems

This separation ensures:
- Easy testing (can mock physics for UI tests)
- Performance (Canvas runs independently of React render cycle)
- Modularity (can swap rendering tech without breaking physics)
