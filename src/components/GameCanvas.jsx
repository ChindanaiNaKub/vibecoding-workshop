// GameCanvas Component
// Renders the game on Canvas and manages the render loop

import { createPhysicsEngine, startPhysicsRunner, getWorld } from '../physics/engine.js';
import { createArenaBodies, addBodiesToWorld, ARENA_WIDTH, ARENA_HEIGHT } from '../physics/bodies.js';
import { createTether, addTetherToWorld, generateTetherId } from '../physics/constraints.js';

function GameCanvas() {
  const canvasRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const runnerRef = React.useRef(null);
  const bodiesRef = React.useRef(null);
  const tethersRef = React.useRef([]);

  // Initialize physics engine
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create physics engine
    const engine = createPhysicsEngine();
    engineRef.current = engine;
    const world = getWorld(engine);

    // Create arena bodies
    const { core, wall1, wall2 } = createArenaBodies();
    bodiesRef.current = { core, wall1, wall2 };
    addBodiesToWorld(world, core, wall1, wall2);

    // Create a test tether from wall1 to core
    const testTether = createTether(wall1, core, 0, generateTetherId(1));
    tethersRef.current.push(testTether);
    addTetherToWorld(world, testTether);

    // Start physics runner
    const runner = startPhysicsRunner(engine);
    runnerRef.current = runner;

    // Render loop
    let animationFrameId;
    function render() {
      // Clear canvas
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw arena boundary (circular)
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, 250, 0, Math.PI * 2);
      ctx.stroke();

      // Draw walls
      ctx.fillStyle = '#8B4513';  // Rust color
      // Wall 1 (Player 1 - Left)
      ctx.fillRect(wall1.position.x - WALL_WIDTH / 2, wall1.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);
      // Wall 2 (Player 2 - Right)
      ctx.fillRect(wall2.position.x - WALL_WIDTH / 2, wall2.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);

      // Draw tethers
      tethersRef.current.forEach(tether => {
        const { bodyA, bodyB } = tether;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bodyA.position.x, bodyA.position.y);
        ctx.lineTo(bodyB.position.x, bodyB.position.y);
        ctx.stroke();
      });

      // Draw Core
      ctx.fillStyle = '#8B4513';  // Rust color
      ctx.beginPath();
      ctx.arc(core.position.x, core.position.y, 35, 0, Math.PI * 2);
      ctx.fill();

      // Draw rivets on Core
      ctx.fillStyle = '#5a3a1a';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const rivetX = core.position.x + Math.cos(angle) * 20;
        const rivetY = core.position.y + Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.arc(rivetX, rivetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Continue render loop
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (runnerRef.current) {
        window.Matter.Runner.stop(runnerRef.current);
      }
    };
  }, []);

  return React.createElement('canvas', {
    ref: canvasRef,
    width: ARENA_WIDTH,
    height: ARENA_HEIGHT,
    style: { border: '2px solid #8B4513' }
  });
}
