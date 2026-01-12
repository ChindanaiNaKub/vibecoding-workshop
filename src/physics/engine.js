// Physics Engine Setup - Matter.js
// Handles initialization and configuration of the physics world

const Matter = window.Matter;

// Engine configuration
const ENGINE_CONFIG = {
  gravity: { x: 0, y: 1 },  // Normal gravity
  timing: {
    timestamp: 0,
    timeScale: 1
  }
};

/**
 * Creates and initializes the Matter.js physics engine
 * @returns {Matter.Engine} The initialized physics engine
 */
export function createPhysicsEngine() {
  const engine = Matter.Engine.create(ENGINE_CONFIG);

  // Disable sleeping (bodies never sleep, always responsive)
  engine.enableSleeping = false;

  return engine;
}

/**
 * Starts the physics engine runner
 * @param {Matter.Engine} engine - The physics engine
 * @returns {Matter.Runner} The runner instance
 */
export function startPhysicsRunner(engine) {
  const runner = Matter.Runner.create();

  // Run at 60fps
  runner.fps = 60;

  Matter.Runner.run(runner, engine);

  return runner;
}

/**
 * Stops the physics engine runner
 * @param {Matter.Runner} runner - The runner instance
 */
export function stopPhysicsRunner(runner) {
  if (runner) {
    Matter.Runner.stop(runner);
  }
}

/**
 * Gets the physics world from the engine
 * @param {Matter.Engine} engine - The physics engine
 * @returns {Matter.World} The physics world
 */
export function getWorld(engine) {
  return engine.world;
}

/**
 * Clears all bodies and constraints from the world
 * @param {Matter.World} world - The physics world
 */
export function clearWorld(world) {
  Matter.World.clear(world, false);  // Keep engine
}
