// Body Creation Helpers
// Functions to create game objects (Core, Walls) in Matter.js

const Matter = window.Matter;

// Game configuration constants
export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;
export const ARENA_CENTER_X = ARENA_WIDTH / 2;
export const ARENA_CENTER_Y = ARENA_HEIGHT / 2;

export const CORE_RADIUS = 35;
export const WALL_WIDTH = 30;
export const WALL_HEIGHT = 200;

// Physics properties for "heavy" feel
export const CORE_PHYSICS = {
  density: 0.05,      // Heavy mass
  friction: 0.8,
  frictionStatic: 0.8,
  restitution: 0.2,   // Low bounce
  label: 'core'
};

/**
 * Creates the Core body - a heavy circular body at the center of the arena
 * @returns {Matter.Body} The Core body
 */
export function createCore() {
  const core = Matter.Bodies.circle(
    ARENA_CENTER_X,
    ARENA_CENTER_Y,
    CORE_RADIUS,
    CORE_PHYSICS
  );

  return core;
}

/**
 * Creates Player 1's wall (left side)
 * @returns {Matter.Body} Player 1's wall body
 */
export function createPlayer1Wall() {
  const wall = Matter.Bodies.rectangle(
    50,                     // X position (left side)
    ARENA_CENTER_Y,         // Y position (centered)
    WALL_WIDTH,
    WALL_HEIGHT,
    {
      isStatic: true,
      label: 'wall-player1'
    }
  );

  return wall;
}

/**
 * Creates Player 2's wall (right side)
 * @returns {Matter.Body} Player 2's wall body
 */
export function createPlayer2Wall() {
  const wall = Matter.Bodies.rectangle(
    ARENA_WIDTH - 50,       // X position (right side)
    ARENA_CENTER_Y,         // Y position (centered)
    WALL_WIDTH,
    WALL_HEIGHT,
    {
      isStatic: true,
      label: 'wall-player2'
    }
  );

  return wall;
}

/**
 * Creates all arena bodies (walls and Core)
 * @returns {Object} Object containing core and walls
 */
export function createArenaBodies() {
  const core = createCore();
  const wall1 = createPlayer1Wall();
  const wall2 = createPlayer2Wall();

  return { core, wall1, wall2 };
}

/**
 * Adds bodies to the physics world
 * @param {Matter.World} world - The physics world
 * @param {...Matter.Body} bodies - Bodies to add
 */
export function addBodiesToWorld(world, ...bodies) {
  Matter.World.add(world, bodies);
}
