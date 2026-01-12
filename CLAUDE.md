# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SEVER is a browser-based 1v1 turn-based physics strategy game. Players compete on a circular arena by attaching, reinforcing, and severing tethers (spring constraints) that control a heavy central Core. The goal is to manipulate the physics so the Core impacts the opponent's wall.

**Core Fantasy:** "Digital Judo" — use the opponent's own force against them by severing the right tether at the perfect moment.

**Aesthetic:** "Industrial Horror" — snapping steel cables, heavy rusted metal, structural tension visualized through vibrating lines, camera shake, and particle effects.

---

## Tech Stack

- **Physics Engine:** Matter.js — for realistic weight, tension, and spring constraint simulation
- **UI Framework:** React — for game state management and UI components
- **Rendering:** HTML5 Canvas — for game loop rendering
- **Deployment:** Single HTML/JS entry point (no build step initially)

---

## Architecture (Planned)

The game uses a **separation of concerns** architecture:

- **React** = State and UI only (no physics, no Canvas rendering)
- **Matter.js** = Physics only (no rendering, no game logic)
- **Canvas** = Rendering only (no state management, no physics logic)
- **Game Controller** = Coordination layer between all systems

**Key architectural principle:** Canvas runs independently of React render cycle for 60fps performance.

See `memory-bank/architecture.md` for detailed component responsibilities, data flow diagrams, and turn flow.

---

## Core Mechanics

### Actions
- **Anchor:** Attach a new tether from your wall to the Core
- **Reinforce:** Strengthen an existing tether to increase tension
- **Sever:** Cut a tether (yours or enemy's), causing physics to resolve remaining forces

### Physics Constraints
- The Core must feel HEAVY — use Matter.js `density` and `friction` properties carefully
- Tethers are spring constraints with tension limits
- When a tether is severed, the simulation should remain stable (no physics explosions)

### Win Condition
- Core impacts the opponent's wall = instant win

---

## Development Principles

### 1. Plan Before Coding
Do not write code until the physics interaction model is defined. Think in vectors, not variables.

### 2. MVP with Soul
The first prototype should be ugly, but the physics must feel perfect. Prioritize the "Snap" mechanic over visual polish.

### 3. Physics-First Thinking
- You despise "floaty" physics — tune for mass and friction
- Think in vectors and forces
- Protect the "Cinema" of the experience above all else

### 4. Vibe Coding
Write modular, readable code ready for rapid iteration. Explain complex vector math and physics logic clearly in comments.

---

## Visual Effects (The "Juice")

To sell the "Industrial Horror" aesthetic, implement:
1. **Stress Visualization:** Tethers vibrate and change color as tension approaches breaking point
2. **Camera Shake:** Screen shakes when tethers are severed or the Core impacts walls
3. **Particle Sparks:** Particle effects at sever points and wall impacts

---

## Implementation Phases

The project is organized into 5 phases (see `memory-bank/implementation-plan.md` for detailed steps):

1. **Foundation** — Set up project structure, Matter.js integration, basic Canvas renderer
2. **Core Physics** — Create arena, Core, basic tethers, prototype sever mechanic
3. **Game Loop** — Turn-based state machine, player actions, win detection
4. **Visual Feedback** — Stress visualization, camera shake, particle effects
5. **Polish** — Sound design, UI/UX improvements, performance optimization, deployment

---

## Memory-Bank System

**CRITICAL:** Before planning or coding, always read the memory-bank files:
- `memory-bank/architecture.md` — System structure, component responsibilities, data flow
- `memory-bank/implementation-plan.md` — Step-by-step build plan (5 phases)
- `memory-bank/tech-stack.md` — Technology choices and rationale
- `memory-bank/game-design-document.md` — Core loop, player experience, project goals
- `memory-bank/progress.md` — Development log and current status

**After major decisions or features:** Update the relevant memory-bank file to maintain project knowledge.

---

## Development Workflow

1. **Read memory-bank** before starting any work
2. **ENTER PLAN MODE** for new features or architecture changes
3. **Update memory-bank/progress.md** after completing milestones
4. **Keep physics heavy** — tune Matter.js for mass, not floatiness

---

## Key Reference Documents

- `project-identity.md` — Original project identity and "AI Role" definition
- `game-design-document.md` — Original GDD with game fantasy and target players
