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

// GameCanvas component
function GameCanvas() {
  const canvasRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const runnerRef = React.useRef(null);
  const bodiesRef = React.useRef(null);
  const tethersRef = React.useRef([]);
  const winnerRef = React.useRef(null);
  const currentPlayerRef = React.useRef(1);
  const tetherCountRef = React.useRef({ 1: 2, 2: 2 });

  // NEW: Reinforcement levels tracking
  const reinforcementLevelsRef = React.useRef({});

  // NEW: Sever cooldown tracking
  const canSeverRef = React.useRef({ 1: true, 2: true });
  const [canSever, setCanSever] = React.useState({ 1: true, 2: true });

  // NEW: Camera shake state
  const [shakeIntensity, setShakeIntensity] = React.useState(0);

  // UI State
  const [showInstructions, setShowInstructions] = React.useState(true);
  const [hoverState, setHoverState] = React.useState({ type: null, player: null, tetherId: null });
  const [particles, setParticles] = React.useState([]);
  const [actionFeedback, setActionFeedback] = React.useState(null);

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

    // Helper to generate unique tether ID
    let tetherIdCounter = 0;
    function createTetherId() {
      return `tether_${Date.now()}_${tetherIdCounter++}`;
    }

    // Create initial tethers with IDs
    const tether1 = Matter.Constraint.create({
      bodyA: wall1,
      bodyB: core,
      stiffness: 0.05,
      damping: 0.1,
      length: 200
    });
    tether1.id = createTetherId();
    tether1.owner = 1;
    tethersRef.current.push(tether1);
    Matter.World.add(engine.world, tether1);
    reinforcementLevelsRef.current[tether1.id] = 0;

    const tether2 = Matter.Constraint.create({
      bodyA: wall2,
      bodyB: core,
      stiffness: 0.05,
      damping: 0.1,
      length: 200
    });
    tether2.id = createTetherId();
    tether2.owner = 2;
    tethersRef.current.push(tether2);
    Matter.World.add(engine.world, tether2);
    reinforcementLevelsRef.current[tether2.id] = 0;

    // Start physics runner
    const runner = Matter.Runner.create();
    runner.fps = 60;
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;

    // Win condition detection with camera shake
    Matter.Events.on(engine, 'collisionStart', function(event) {
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;

        const coreBody = (bodyA.label === 'core') ? bodyA : (bodyB.label === 'core') ? bodyB : null;
        if (!coreBody) continue;

        const otherBody = (bodyA === coreBody) ? bodyB : bodyA;
        if (otherBody.label === 'wall-player1') {
          winnerRef.current = 2;
          setShakeIntensity(1.5); // Strong shake on wall impact
        } else if (otherBody.label === 'wall-player2') {
          winnerRef.current = 1;
          setShakeIntensity(1.5); // Strong shake on wall impact
        }
      }
    });

    // Reset game
    function resetGame() {
      Matter.Body.setPosition(core, { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
      Matter.Body.setVelocity(core, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(core, 0);

      tethersRef.current.forEach(t => Matter.World.remove(engine.world, t));
      tethersRef.current = [];
      reinforcementLevelsRef.current = {};

      const tether1 = Matter.Constraint.create({
        bodyA: wall1,
        bodyB: core,
        stiffness: 0.05,
        damping: 0.1,
        length: 200
      });
      tether1.id = createTetherId();
      tether1.owner = 1;
      tethersRef.current.push(tether1);
      Matter.World.add(engine.world, tether1);
      reinforcementLevelsRef.current[tether1.id] = 0;

      const tether2 = Matter.Constraint.create({
        bodyA: wall2,
        bodyB: core,
        stiffness: 0.05,
        damping: 0.1,
        length: 200
      });
      tether2.id = createTetherId();
      tether2.owner = 2;
      tethersRef.current.push(tether2);
      Matter.World.add(engine.world, tether2);
      reinforcementLevelsRef.current[tether2.id] = 0;

      winnerRef.current = null;
      currentPlayerRef.current = 1;
      tetherCountRef.current = { 1: 2, 2: 2 };
      canSeverRef.current = { 1: true, 2: true };
      setCanSever({ 1: true, 2: true });
    }

    // ENHANCED: Add particles with direction, size, and trails
    function addParticles(x, y, color, count = 10, angle = null, size = 3) {
      const newParticles = [];
      for (let i = 0; i < count; i++) {
        let vx, vy;
        if (angle !== null) {
          // Directional burst
          const spread = (Math.random() - 0.5) * 1.5;
          const speed = 3 + Math.random() * 5;
          vx = Math.cos(angle + spread) * speed;
          vy = Math.sin(angle + spread) * speed;
        } else {
          // Radial burst
          vx = (Math.random() - 0.5) * 8;
          vy = (Math.random() - 0.5) * 8;
        }

        newParticles.push({
          x, y,
          vx, vy,
          life: 1.0,
          maxLife: 1.0,
          color,
          size: size + Math.random() * 2,
          trail: [] // Trail array
        });
      }
      setParticles(prev => [...prev, ...newParticles]);
    }

    // Switch turn with sever cooldown management
    function switchTurn() {
      const nextPlayer = currentPlayerRef.current === 1 ? 2 : 1;
      currentPlayerRef.current = nextPlayer;
      // Re-enable sever for the player whose turn is starting
      const newCanSever = { ...canSeverRef.current };
      newCanSever[nextPlayer] = true;
      canSeverRef.current = newCanSever;
      setCanSever(newCanSever);
    }

    // Click handler
    function handleCanvasClick(event) {
      if (showInstructions) {
        setShowInstructions(false);
        return;
      }

      if (winnerRef.current) {
        resetGame();
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const currentPlayer = currentPlayerRef.current;

      // Check wall clicks for anchoring
      if (clickX >= 35 && clickX <= 65 && clickY >= 200 && clickY <= 400) {
        if (currentPlayer === 1 && tetherCountRef.current[1] < 7) {
          const newTether = Matter.Constraint.create({
            bodyA: wall1,
            bodyB: core,
            stiffness: 0.05,
            damping: 0.1,
            length: 200
          });
          newTether.id = createTetherId();
          newTether.owner = 1;
          tethersRef.current.push(newTether);
          Matter.World.add(engine.world, newTether);
          reinforcementLevelsRef.current[newTether.id] = 0;
          tetherCountRef.current[1]++;
          addParticles(50, clickY, '#CD853F', 15, null, 4);
          setActionFeedback({ text: 'Tether Anchored!', x: 150, y: 80, life: 60 });
          switchTurn();
          return;
        }
      }

      if (clickX >= 735 && clickX <= 765 && clickY >= 200 && clickY <= 400) {
        if (currentPlayer === 2 && tetherCountRef.current[2] < 7) {
          const newTether = Matter.Constraint.create({
            bodyA: wall2,
            bodyB: core,
            stiffness: 0.05,
            damping: 0.1,
            length: 200
          });
          newTether.id = createTetherId();
          newTether.owner = 2;
          tethersRef.current.push(newTether);
          Matter.World.add(engine.world, newTether);
          reinforcementLevelsRef.current[newTether.id] = 0;
          tetherCountRef.current[2]++;
          addParticles(750, clickY, '#4682B4', 15, null, 4);
          setActionFeedback({ text: 'Tether Anchored!', x: 650, y: 80, life: 60 });
          switchTurn();
          return;
        }
      }

      // Check tether clicks for reinforcing or severing
      for (let i = tethersRef.current.length - 1; i >= 0; i--) {
        const t = tethersRef.current[i];
        const x1 = t.bodyA.position.x;
        const y1 = t.bodyA.position.y;
        const x2 = t.bodyB.position.x;
        const y2 = t.bodyB.position.y;

        const distance = pointToLineDistance(clickX, clickY, x1, y1, x2, y2);

        if (distance < 10) {
          const owner = t.owner;
          const currentLevel = reinforcementLevelsRef.current[t.id] || 0;
          const color = owner === 1 ? '#CD853F' : '#4682B4';

          // Check if clicking own tether -> REINFORCE
          if (owner === currentPlayer) {
            if (currentLevel < 3) {
              // Increase reinforcement level
              const newLevel = currentLevel + 1;
              reinforcementLevelsRef.current[t.id] = newLevel;

              // Stiffness multipliers: 1.0 → 1.5 → 2.0 → 2.5
              const newStiffness = 0.05 * (1 + newLevel * 0.5);
              t.stiffness = newStiffness;

              // Golden spark particles for reinforce
              addParticles(clickX, clickY, '#FFD700', 20, null, 5);
              setActionFeedback({ text: `Reinforced to Lv${newLevel}!`, x: clickX, y: clickY - 20, life: 60 });
              switchTurn();
            } else {
              // Max level feedback
              setActionFeedback({ text: 'Max Reinforce!', x: clickX, y: clickY - 20, life: 30 });
            }
            return;
          }

          // Clicking enemy tether -> SEVER (if cooldown allows)
          if (canSeverRef.current[currentPlayer]) {
            // Calculate tether angle for directional particles
            const angle = Math.atan2(y2 - y1, x2 - x1);

            Matter.World.remove(engine.world, t);
            tethersRef.current.splice(i, 1);
            delete reinforcementLevelsRef.current[t.id];
            tetherCountRef.current[owner]--;

            // Directional particles along tether
            addParticles(clickX, clickY, color, 25, angle, 4);
            setActionFeedback({ text: 'Tether Severed!', x: clickX, y: clickY - 20, life: 60 });

            // Trigger camera shake
            setShakeIntensity(0.5);

            // Set sever cooldown
            const newCanSever = { ...canSeverRef.current };
            newCanSever[currentPlayer] = false;
            canSeverRef.current = newCanSever;
            setCanSever(newCanSever);

            switchTurn();
          } else {
            // Cooldown feedback
            setActionFeedback({ text: 'Sever Cooldown!', x: clickX, y: clickY - 20, life: 30 });
          }
          return;
        }
      }
    }

    // Mouse move handler for hover effects
    function handleMouseMove(event) {
      if (showInstructions || winnerRef.current) {
        setHoverState({ type: null, player: null, tetherId: null });
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const currentPlayer = currentPlayerRef.current;

      // Check wall hover
      if (mouseX >= 35 && mouseX <= 65 && mouseY >= 200 && mouseY <= 400) {
        if (currentPlayer === 1 && tetherCountRef.current[1] < 7) {
          setHoverState({ type: 'wall', player: 1, tetherId: null });
          return;
        }
      }

      if (mouseX >= 735 && mouseX <= 765 && mouseY >= 200 && mouseY <= 400) {
        if (currentPlayer === 2 && tetherCountRef.current[2] < 7) {
          setHoverState({ type: 'wall', player: 2, tetherId: null });
          return;
        }
      }

      // Check tether hover
      for (const t of tethersRef.current) {
        const x1 = t.bodyA.position.x;
        const y1 = t.bodyA.position.y;
        const x2 = t.bodyB.position.x;
        const y2 = t.bodyB.position.y;
        const distance = pointToLineDistance(mouseX, mouseY, x1, y1, x2, y2);

        if (distance < 10) {
          const owner = t.owner;
          setHoverState({ type: 'tether', player: owner, tetherId: t.id });
          return;
        }
      }

      setHoverState({ type: null, player: null, tetherId: null });
    }

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleMouseMove);

    // Update particles with trail effect
    function updateParticles() {
      setParticles(prev => {
        const updated = prev.map(p => {
          // Add current position to trail
          const newTrail = [...p.trail, { x: p.x, y: p.y }];
          if (newTrail.length > 5) newTrail.shift(); // Keep last 5 positions

          return {
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.98, // Slight deceleration
            vy: p.vy * 0.98,
            life: p.life - 0.02,
            trail: newTrail
          };
        }).filter(p => p.life > 0);

        return updated;
      });
    }

    // Update action feedback
    function updateActionFeedback() {
      setActionFeedback(prev => {
        if (!prev) return null;
        const updated = { ...prev, life: prev.life - 1 };
        return updated.life > 0 ? updated : null;
      });
    }

    // Update shake intensity (decay)
    function updateShake() {
      setShakeIntensity(prev => {
        if (prev < 0.01) return 0;
        return prev * 0.9;
      });
    }

    // Render loop
    let animationFrameId;
    function render() {
      // Apply camera shake
      let shakeX = 0, shakeY = 0;
      if (shakeIntensity > 0.01) {
        shakeX = (Math.random() - 0.5) * shakeIntensity * 15;
        shakeY = (Math.random() - 0.5) * shakeIntensity * 15;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-shakeX, -shakeY, canvas.width, canvas.height);

      // Draw instructions overlay
      if (showInstructions) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('SEVER', CANVAS_WIDTH / 2, 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Courier New';
        ctx.fillText('A Turn-Based Physics Strategy Game', CANVAS_WIDTH / 2, 100);

        ctx.font = '16px Courier New';
        ctx.textAlign = 'left';
        const instructions = [
          '',
          'GOAL: Push the heavy Core into the opponent\'s wall!',
          '',
          'ACTIONS (each turn, do ONE):',
          '',
          '  🎯 ANCHOR: Click YOUR wall to attach a new tether',
          '     (max 7 tethers per player)',
          '',
          '  💪 REINFORCE: Click YOUR tether to strengthen it',
          '     (max 3 levels, makes tether stiffer)',
          '',
          '  ✂️ SEVER: Click ANY tether to cut it',
          '     (1-turn cooldown after use)',
          '',
          'Players take turns. Watch the tether tension -',
          'when tethers are stretched and you sever at the',
          'right moment, the Core will snap toward the enemy!',
          '',
          'Player 1 (ORANGE) ← vs → Player 2 (BLUE)',
          '',
          'Click anywhere to START'
        ];

        let y = 140;
        instructions.forEach(line => {
          ctx.fillText(line, CANVAS_WIDTH / 2 - 180, y);
          y += 22;
        });

        ctx.restore();
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Draw arena boundary
      ctx.strokeStyle = '#4a4a4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 250, 0, Math.PI * 2);
      ctx.stroke();

      // Draw turn indicator
      if (!winnerRef.current) {
        const playerColor = currentPlayerRef.current === 1 ? '#CD853F' : '#4682B4';
        ctx.fillStyle = playerColor;
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`PLAYER ${currentPlayerRef.current}'S TURN`, CANVAS_WIDTH / 2, 35);

        ctx.font = '14px Courier New';
        ctx.fillStyle = '#888';
        ctx.fillText(`P1 Tethers: ${tetherCountRef.current[1]}/7`, 120, 35);
        ctx.fillText(`P2 Tethers: ${tetherCountRef.current[2]}/7`, 680, 35);

        // Show sever cooldown indicator
        if (!canSever[currentPlayerRef.current]) {
          ctx.fillStyle = '#ff6666';
          ctx.font = 'bold 14px Courier New';
          ctx.fillText('SEVER COOLDOWN', CANVAS_WIDTH / 2, 55);
        }
      }

      // Draw walls with player colors
      ctx.fillStyle = '#CD853F';
      ctx.fillRect(wall1.position.x - WALL_WIDTH / 2, wall1.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);
      ctx.fillStyle = '#4682B4';
      ctx.fillRect(wall2.position.x - WALL_WIDTH / 2, wall2.position.y - WALL_HEIGHT / 2, WALL_WIDTH, WALL_HEIGHT);

      // Draw wall labels
      ctx.font = 'bold 12px Courier New';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('P1', 50, 190);
      ctx.fillText('P1', 50, 415);
      ctx.fillText('P2', 750, 190);
      ctx.fillText('P2', 750, 415);

      // Draw hover hints on walls
      if (hoverState.type === 'wall' && hoverState.player === currentPlayerRef.current) {
        const hintX = hoverState.player === 1 ? 50 : 750;
        const hintColor = hoverState.player === 1 ? '#CD853F' : '#4682B4';
        ctx.fillStyle = hintColor;
        ctx.font = 'bold 14px Courier New';
        ctx.fillText('CLICK TO', hintX, 170);
        ctx.fillText('ANCHOR', hintX, 155);

        // Glow effect
        ctx.strokeStyle = hintColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hintX, 300, 110, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw tethers with stress visualization and reinforcement levels
      tethersRef.current.forEach(t => {
        const baseColor = (t.bodyA === wall1) ? '#CD853F' : '#4682B4';
        const reinforcementLevel = reinforcementLevelsRef.current[t.id] || 0;

        const bodyAPos = t.bodyA.position;
        const bodyBPos = t.bodyB.position;
        const dx = bodyBPos.x - bodyAPos.x;
        const dy = bodyBPos.y - bodyAPos.y;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        const restLength = t.length || 200;
        const stretchRatio = Math.max(0, (currentLength - restLength) / restLength);

        // Base thickness increases with reinforcement
        let baseThickness = 4 + reinforcementLevel * 1.5;

        ctx.strokeStyle = baseColor;
        ctx.lineWidth = baseThickness;

        if (stretchRatio > 0.1) {
          const stressBlend = Math.min(0.6, stretchRatio);
          ctx.strokeStyle = `rgba(255, 255, 255, ${stressBlend})`;
          ctx.lineWidth = baseThickness + (stressBlend * 3);
        }

        ctx.beginPath();
        ctx.moveTo(t.bodyA.position.x, t.bodyA.position.y);
        ctx.lineTo(t.bodyB.position.x, t.bodyB.position.y);
        ctx.stroke();

        // Draw reinforcement level indicators (dots along tether)
        if (reinforcementLevel > 0) {
          ctx.fillStyle = '#FFD700'; // Gold dots for reinforcement
          for (let i = 0; i < reinforcementLevel; i++) {
            const tPos = (i + 1) / (reinforcementLevel + 1);
            const dotX = bodyAPos.x + dx * tPos;
            const dotY = bodyAPos.y + dy * tPos;
            ctx.beginPath();
            ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw hover highlight on tethers
      if (hoverState.type === 'tether' && hoverState.tetherId) {
        const hoveredTether = tethersRef.current.find(t => t.id === hoverState.tetherId);
        if (hoveredTether) {
          const isOwnTether = hoveredTether.owner === currentPlayerRef.current;
          const canSeverTether = canSever[currentPlayerRef.current];

          ctx.strokeStyle = isOwnTether ? '#FFD700' : (canSeverTether ? '#ffffff' : '#666666');
          ctx.lineWidth = 8;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(hoveredTether.bodyA.position.x, hoveredTether.bodyA.position.y);
          ctx.lineTo(hoveredTether.bodyB.position.x, hoveredTether.bodyB.position.y);
          ctx.stroke();
          ctx.globalAlpha = 1.0;

          // Draw action hint at top
          ctx.font = 'bold 14px Courier New';
          ctx.textAlign = 'center';

          if (isOwnTether) {
            ctx.fillStyle = '#FFD700';
            const level = reinforcementLevelsRef.current[hoveredTether.id] || 0;
            if (level < 3) {
              ctx.fillText(`CLICK TO REINFORCE (Lv ${level} → ${level + 1})`, CANVAS_WIDTH / 2, 55);
            } else {
              ctx.fillText('MAX REINFORCEMENT', CANVAS_WIDTH / 2, 55);
            }
          } else {
            ctx.fillStyle = canSeverTether ? '#ff6666' : '#999999';
            ctx.fillText(canSeverTether ? 'CLICK TO SEVER' : 'SEVER COOLDOWN', CANVAS_WIDTH / 2, 55);
          }
        }
      }

      // Draw Core with more detail
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(core.position.x, core.position.y, CORE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Core border
      ctx.strokeStyle = '#5a3a1a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw rivets
      ctx.fillStyle = '#5a3a1a';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const rivetX = core.position.x + Math.cos(angle) * 20;
        const rivetY = core.position.y + Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.arc(rivetX, rivetY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw "CORE" label
      ctx.fillStyle = '#ccc';
      ctx.font = 'bold 10px Courier New';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CORE', core.position.x, core.position.y);
      ctx.textBaseline = 'alphabetic';

      // Draw particles with trails
      particles.forEach(p => {
        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.globalAlpha = p.life * 0.3;
          ctx.stroke();
        }

        // Draw particle
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Add flicker effect
        if (Math.random() > 0.7) {
          ctx.globalAlpha = p.life * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;

      // Draw action feedback
      if (actionFeedback) {
        ctx.globalAlpha = Math.min(1, actionFeedback.life / 20);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(actionFeedback.text, actionFeedback.x, actionFeedback.y);
        ctx.globalAlpha = 1.0;
      }

      // Draw winner announcement
      if (winnerRef.current) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`PLAYER ${winnerRef.current} WINS!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Courier New';
        ctx.fillText('Click to play again', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        ctx.textBaseline = 'alphabetic';
      }

      ctx.restore(); // Restore from camera shake

      updateParticles();
      updateActionFeedback();
      updateShake();
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
    };
  }, [showInstructions, canSever]);

  return React.createElement('canvas', {
    ref: canvasRef,
    width: 800,
    height: 600,
    style: {
      border: '3px solid #4a4a4a',
      borderRadius: '8px',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      cursor: showInstructions ? 'pointer' : 'crosshair'
    }
  });
}

// Main App component
function App() {
  return React.createElement('div', {
      style: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Courier New, monospace'
      }
    },
    React.createElement('h1', {
      style: {
        color: '#8B4513',
        margin: '0 0 20px 0',
        fontSize: '24px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }
    }, '⚙️ SEVER - Digital Judo ⚙️'),
    React.createElement(GameCanvas)
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
