# Tech Stack — SEVER

## Chosen Language

**JavaScript (ES6+)**

Required for browser-based deployment and React/Matter.js integration.

## Libraries & Frameworks

### Physics Engine
**Matter.js**
- Purpose: Realistic 2D physics simulation
- Used for: Weight, tension, spring constraints, collision detection
- Key requirement: Tuned for heavy, realistic feel (not floaty)

### UI Framework
**React**
- Purpose: Game state management and UI components
- Used for: Turn management, player actions, game state rendering
- Integration: Will wrap Canvas component and manage physics engine lifecycle

### Rendering
**HTML5 Canvas**
- Purpose: High-performance 2D rendering
- Used for: Game loop rendering, tether visualization, particle effects
- Note: React will manage DOM UI; Canvas handles game rendering

## Tools

### Version Control
**Git** — Source control and collaboration

### Deployment
**Single HTML/JS Entry Point** — No build step initially for rapid prototyping

## Platform Target

**Web Browser** (Desktop first, mobile responsive later)

- Modern browsers with ES6+ support
- Canvas API support required
- No server-side dependencies (client-side only)

## Reasons for Choices

### Why Matter.js?
- Built-in spring constraint system perfect for tether mechanics
- Robust collision detection for wall impacts
- Well-documented and battle-tested
- Lightweight (~70KB)

### Why React?
- Declarative state management for turn-based logic
- Easy to reason about game state transitions
- Large ecosystem for future UI enhancements
- Familiar to most developers

### Why Canvas?
- 60fps rendering performance
- Direct control over visual effects (particles, shake, line vibration)
- Proven pattern for game rendering (React manages UI, Canvas handles game loop)

### Why Single Entry Point?
- Easiest deployment (host anywhere, even GitHub Pages)
- No build complexity for MVP
- Faster iteration during prototyping
- Can add build step later if needed
