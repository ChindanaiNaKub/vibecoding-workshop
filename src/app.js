// SEVER - Turn-Based Physics Strategy Game
// Main React App Entry Point

// Helper function: Calculate distance from point to line segment
function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// Import GameCanvas component
// Note: Using direct function reference since we're using script tags
function GameCanvas() {
  const canvasRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const runnerRef = React.useRef(null);
  const bodiesRef = React.useRef(null);
  const tethersRef = React.useRef([]);
  const winnerRef = React.useRef(null);  // Tracks winner: 1 or 2
  const currentPlayerRef = React.useRef(1);  // Tracks current player: 1 or 2
  const tetherCountRef = React.useRef({ 1: 2, 2: 2 });  // Track tether count per player

  // Initialize physics engine
  React.useEffect(() => {
    const Matter = window.Matter;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Canvas dimensions
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    const WALL_WIDTH = 30;
    const WALL_HEIGHT = 200;
    const CORE_RADIUS = 35;

    // Create physics engine
    const engine = Matter.Engine.create();
    engineRef.current = engine;

    // Create Core body
    const core = Matter.Bodies.circle(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CORE_RADIUS,
      {
        density: 0.05,
        friction: 0.8,
        restitution: 0.2,
        label: 'core'
      }
    );

    // Create walls
    const wall1 = Matter.Bodies.rectangle(
      50, CANVAS_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT,
      { isStatic: true, label: 'wall-player1' }
    );

    const wall2 = Matter.Bodies.rectangle(
      CANVAS_WIDTH - 50, CANVAS_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT,
      { isStatic: true, label: 'wall-player2' }
    );

    bodiesRef.current = { core, wall1, wall2 };
    Matter.World.add(engine.world, [core, wall1, wall2]);

    // Create test tethers from both walls to core (tug-of-war setup)
    const tether1 = Matter.Constraint.create({
      bodyA: wall1,
      bodyB: core,
      stiffness: 0.05,
      damping: 0.1,
      length: 200
    });
    tethersRef.current.push(tether1);
    Matter.World.add(engine.world, tether1);

    const tether2 = Matter.Constraint.create({
      bodyA: wall2,
      bodyB: core,
      stiffness: 0.05,
      damping: 0.1,
      length: 200
    });
    tethersRef.current.push(tether2);
    Matter.World.add(engine.world, tether2);

    // Start physics runner
    const runner = Matter.Runner.create();
    runner.fps = 60;
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;

    // Win condition: Detect when Core hits a wall
    Matter.Events.on(engine, 'collisionStart', function(event) {
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        // Check if Core is involved in collision
        const coreBody = (bodyA.label === 'core') ? bodyA : (bodyB.label === 'core') ? bodyB : null;
        if (!coreBody) continue;

        // Check which wall was hit
        const otherBody = (bodyA === coreBody) ? bodyB : bodyA;
        if (otherBody.label === 'wall-player1') {
          winnerRef.current = 2;  // Player 2 wins if Core hits Player 1's wall
          console.log('Player 2 Wins!');
        } else if (otherBody.label === 'wall-player2') {
          winnerRef.current = 1;  // Player 1 wins if Core hits Player 2's wall
          console.log('Player 1 Wins!');
        }
      }
    });

    // Reset game to initial state
    function resetGame() {
      // Reset Core position
      Matter.Body.setPosition(core, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
      Matter.Body.setVelocity(core, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(core, 0);

      // Remove all existing tethers
      tethersRef.current.forEach(t => Matter.World.remove(engine.world, t));
      tethersRef.current = [];

      // Recreate initial tethers
      const tether1 = Matter.Constraint.create({
        bodyA: wall1,
        bodyB: core,
        stiffness: 0.05,
        damping: 0.1,
        length: 200
      });
      tethersRef.current.push(tether1);
      Matter.World.add(engine.world, tether1);

      const tether2 = Matter.Constraint.create({
        bodyA: wall2,
        bodyB: core,
        stiffness: 0.05,
        damping: 0.1,
        length: 200
      });
      tethersRef.current.push(tether2);
      Matter.World.add(engine.world, tether2);

      // Reset winner, current player, and tether counts
      winnerRef.current = null;
      currentPlayerRef.current = 1;
      tetherCountRef.current = { 1: 2, 2: 2 };
      console.log('Game reset!');
    }

    // Click handler for anchoring, severing tethers, or restarting
    function handleCanvasClick(event) {
      // If game is over, reset on any click
      if (winnerRef.current) {
        resetGame();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Check if click is on a wall (for anchoring)
      // Wall 1 (Player 1): x from 35-65, y from 200-400
      if (clickX >= 35 && clickX <= 65 && clickY >= 200 && clickY <= 400) {
        if (currentPlayerRef.current === 1 && tetherCountRef.current[1] < 7) {
          // Create new tether from wall1 to core
          const newTether = Matter.Constraint.create({
            bodyA: wall1,
            bodyB: core,
            stiffness: 0.05,
            damping: 0.1,
            length: 200
          });
          tethersRef.current.push(newTether);
          Matter.World.add(engine.world, newTether);
          tetherCountRef.current[1]++;
          console.log('Player 1 anchored new tether!');
          // Switch turns
          currentPlayerRef.current = 2;
          console.log(`Player ${currentPlayerRef.current}'s turn`);
          return;
        }
      }

      // Wall 2 (Player 2): x from 735-765, y from 200-400
      if (clickX >= 735 && clickX <= 765 && clickY >= 200 && clickY <= 400) {
        if (currentPlayerRef.current === 2 && tetherCountRef.current[2] < 7) {
          // Create new tether from wall2 to core
          const newTether = Matter.Constraint.create({
            bodyA: wall2,
            bodyB: core,
            stiffness: 0.05,
            damping: 0.1,
            length: 200
          });
          tethersRef.current.push(newTether);
          Matter.World.add(engine.world, newTether);
          tetherCountRef.current[2]++;
          console.log('Player 2 anchored new tether!');
          // Switch turns
          currentPlayerRef.current = 1;
          console.log(`Player ${currentPlayerRef.current}'s turn`);
          return;
        }
      }

      // Check each tether for click (for severing)
      for (let i = tethersRef.current.length - 1; i >= 0; i--) {
        const t = tethersRef.current[i];
        const x1 = t.bodyA.position.x;
        const y1 = t.bodyA.position.y;
        const x2 = t.bodyB.position.x;
        const y2 = t.bodyB.position.y;

        const distance = pointToLineDistance(clickX, clickY, x1, y1, x2, y2);

        // If click is within 10px of tether, sever it
        if (distance < 10) {
          Matter.World.remove(engine.world, t);
          tethersRef.current.splice(i, 1);
          // Decrease tether count for the owner (based on which wall)
          const owner = (t.bodyA === wall1) ? 1 : 2;
          tetherCountRef.current[owner]--;
          console.log('Tether severed!');
          // Switch turns after severing
          currentPlayerRef.current = currentPlayerRef.current === 1 ? 2 : 1;
          console.log(`Player ${currentPlayerRef.current}'s turn`);
          break;  // Only sever one tether per click
        }
      }
    }

    canvas.addEventListener('click', handleCanvasClick);

    // Render loop
    let animationFrameId;
    function render() {
      // Clear canvas
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw turn indicator (if game not over)
      if (!winnerRef.current) {
        const playerColor = currentPlayerRef.current === 1 ? '#CD853F' : '#4682B4';  // Peru/SteelBlue
        ctx.fillStyle = playerColor;
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`PLAYER ${currentPlayerRef.current}'S TURN`, CANVAS_WIDTH / 2, 40);
      }

      // Draw arena boundary (circular)
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 250, 0, Math.PI * 2);
      ctx.stroke();

      // Draw walls
      ctx.fillStyle = '#8B4513';  // Rust color
      ctx.fillRect(wall1.position.x - WALL_WIDTH / 2, wall1.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);
      ctx.fillRect(wall2.position.x - WALL_WIDTH / 2, wall2.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);

      // Draw tethers (color-coded by owner, stress visualization)
      ctx.lineWidth = 3;
      tethersRef.current.forEach(t => {
        // Base color based on which wall the tether is attached to
        const baseColor = (t.bodyA === wall1) ? '#CD853F' : '#4682B4';  // Peru for P1, SteelBlue for P2

        // Calculate stress (how much tether is stretched beyond rest length)
        const bodyAPos = t.bodyA.position;
        const bodyBPos = t.bodyB.position;
        const dx = bodyBPos.x - bodyAPos.x;
        const dy = bodyBPos.y - bodyAPos.y;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        const restLength = t.length || 200;
        const stretchRatio = Math.max(0, (currentLength - restLength) / restLength);  // 0 = no stretch, 1+ = stretched

        // Blend base color with white based on stress (max stress = 50% white blend)
        const stressBlend = Math.min(0.5, stretchRatio * 0.5);
        ctx.strokeStyle = baseColor;

        // Apply stress glow by drawing again with white and transparency
        if (stretchRatio > 0.1) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${stressBlend})`;
          ctx.lineWidth = 3 + (stressBlend * 4);  // Thicker when stressed
        }

        ctx.beginPath();
        ctx.moveTo(t.bodyA.position.x, t.bodyA.position.y);
        ctx.lineTo(t.bodyB.position.x, t.bodyB.position.y);
        ctx.stroke();

        // Reset line width for next tether
        ctx.lineWidth = 3;
      });

      // Draw Core
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(core.position.x, core.position.y, CORE_RADIUS, 0, Math.PI * 2);
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

      // Draw winner announcement if game over
      if (winnerRef.current) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';  // Gold color
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`PLAYER ${winnerRef.current} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Courier New';
        ctx.fillText('Click to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      }

      // Continue render loop
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
    };
  }, []);

  return React.createElement('canvas', {
    ref: canvasRef,
    width: 800,
    height: 600,
    style: { border: '2px solid #8B4513' }
  });
}

// Main App component
function App() {
  return React.createElement('div', {
      style: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#1a1a1a'
      }
    },
    React.createElement(GameCanvas)
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
