# SEVER — Digital Judo

A turn-based physics strategy game where two players compete on a circular arena by attaching, reinforcing, and severing tethers that control a heavy central Core. The goal is to manipulate the physics so the Core impacts the opponent's wall.

**Core Fantasy:** "Digital Judo" — use the opponent's own force against them by severing the right tether at the perfect moment.

**Aesthetic:** "Industrial Horror" — snapping steel cables, heavy rusted metal, structural tension visualized through vibrating lines, camera shake, and particle effects.

![Game Preview](https://img.shields.io/badge/status-Playable-success) ![Phase](https://img.shields.io/badge/phase-5%2F5%20Complete-brightgreen)

---

## Features

### Core Gameplay
- **Turn-Based Strategy**: Players alternate turns, with three possible actions
- **Physics-Based Combat**: Realistic weight, tension, and spring constraint simulation via Matter.js
- **Win Condition**: Push the heavy Core into the opponent's wall to win instantly

### Three Actions
1. **🎯 Anchor** — Click your wall to attach a new tether (max 7 per player)
2. **💪 Reinforce** — Click your own tethers to strengthen them (max 3 levels)
3. **✂️ Sever** — Click any tether to cut it (1-turn cooldown after use)

### Visual Effects
- Stress visualization: Tethers glow white when stretched
- Reinforcement indicators: Gold dots show tether strength level
- Camera shake on sever and wall impact
- Directional particle effects with trails
- Industrial Horror aesthetic with rust and rivets

---

## How to Run

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (to avoid CORS issues)

### Option 1: Python (Simplest)
```bash
cd /path/to/vibecoding-workshop
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 2: Node.js
```bash
cd /path/to/vibecoding-workshop
npx serve
```

### Option 3: VS Code Live Server
1. Install the "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

---

## How to Play

### Objective
Push the heavy Core into the opponent's wall by strategically anchoring, reinforcing, and severing tethers.

### Controls
- **Click your wall** → Anchor a new tether
- **Click your own tethers** → Reinforce (strengthen)
- **Click any tether** → Sever (cut)

### Strategy Tips
1. **Watch the tension** — Tethers glow white when stretched
2. **Timing is everything** — Sever when tethers are under high tension to snap the Core toward the enemy
3. **Reinforce wisely** — Strengthened tethers pull harder (stiffness: 1.0x → 1.5x → 2.0x → 2.5x)
4. **Sever cooldown** — After severing, you can't sever again for one turn
5. **Use physics** — The Core is heavy; momentum matters!

### Game Rules
- Single action per turn (Anchor OR Reinforce OR Sever)
- Maximum 7 tethers per player
- Maximum 3 reinforcement levels per tether
- 1-turn cooldown after severing
- Core hitting opponent's wall = instant win

---

## Tech Stack

- **Physics Engine**: [Matter.js](https://brm.io/matter-js/) — Realistic 2D physics
- **UI Framework**: [React](https://reactjs.org/) — Game state management
- **Rendering**: HTML5 Canvas — 60fps game loop
- **Deployment**: Single HTML/JS entry point (no build step required)

---

## Project Structure

```
vibecoding-workshop/
├── index.html              # Entry point with CDN imports
├── README.md               # This file
├── CLAUDE.md               # Project instructions for Claude Code
├── src/
│   └── app.js              # Main game (React + Matter.js + Canvas)
├── memory-bank/            # Project documentation
│   ├── architecture.md     # System design and component responsibilities
│   ├── implementation-plan.md  # 5-phase build plan
│   ├── progress.md         # Development log
│   └── tech-stack.md       # Technology choices
├── game-design-document.md # Core fantasy and target players
└── project-identity.md     # Original project vision
```

---

## Development Status

**Current Version:** 1.0 (Feature-Complete)

All 5 phases of the implementation plan are complete:
- ✅ Phase 1: Foundation — Project structure, Matter.js integration
- ✅ Phase 2: Core Physics — Arena, Core, tethers with realistic physics
- ✅ Phase 3: Game Logic — Turn-based gameplay, all three actions, win detection
- ✅ Phase 4: Visual Feedback — Stress visualization, reinforcement indicators
- ✅ Phase 5: Polish — Camera shake, enhanced particles, UI improvements

---

## Architecture

The game uses a **separation of concerns** architecture:

```
React (UI) → Game Controller → Matter.js (Physics) + Canvas (Rendering)
```

- **React**: State and UI only (no physics, no Canvas rendering)
- **Matter.js**: Physics only (no rendering, no game logic)
- **Canvas**: Rendering only (no state management, no physics logic)
- **Game Controller**: Coordination layer between all systems

This separation ensures:
- Easy testing (can mock physics for UI tests)
- Performance (Canvas runs independently of React render cycle)
- Modularity (can swap rendering tech without breaking physics)

---

## Credits

**Game Design & Development:** Built with Claude Code (Anthropic's AI-powered CLI)

**Inspiration:** "Digital Judo" — Turn-based physics strategy with industrial horror aesthetic

---

## License

This project is open for educational purposes. Feel free to learn from the code, experiment with physics, and create your own variations!

---

## Future Enhancements (Optional)

While the game is feature-complete per the implementation plan, possible future additions could include:

- Sound design (industrial clanks, cable snaps, impact sounds)
- AI opponent (single-player mode)
- Multiplayer networking (online play)
- Additional arenas (different wall configurations, obstacles)
- Power-ups (temporary boosters)
- Tournament mode (best-of-3 matches)
- Replay system (save and review matches)

---

**Enjoy the game, and may the best strategist win! ⚙️**
