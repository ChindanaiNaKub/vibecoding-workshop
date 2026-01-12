// Tether Constraint Helpers
// Functions to create and manage spring constraints (tethers)

const Matter = window.Matter;

// Tether configuration
export const TETHER_CONFIG = {
  // Stiffness values for each reinforcement level (0-3)
  stiffness: {
    0: 0.05,  // Weak tether
    1: 0.10,  // Medium tether
    2: 0.15,  // Strong tether
    3: 0.20   // Maximum strength
  },
  damping: 0.1,        // Prevents oscillation
  defaultLength: 200   // Rest length of tether
};

/**
 * Creates a tether (spring constraint) between two bodies
 * @param {Matter.Body} bodyA - First body (usually wall)
 * @param {Matter.Body} bodyB - Second body (usually Core)
 * @param {number} reinforcementLevel - 0-3, higher is stronger
 * @param {string} id - Unique identifier for the tether
 * @returns {Object} Tether object with constraint and metadata
 */
export function createTether(bodyA, bodyB, reinforcementLevel = 0, id) {
  const constraint = Matter.Constraint.create({
    bodyA,
    bodyB,
    stiffness: TETHER_CONFIG.stiffness[reinforcementLevel],
    damping: TETHER_CONFIG.damping,
    length: TETHER_CONFIG.defaultLength,
    render: { visible: false }  // We render manually on Canvas
  });

  return {
    id: id || `tether-${Date.now()}-${Math.random()}`,
    bodyA,
    bodyB,
    constraint,
    reinforcementLevel,
    stiffness: TETHER_CONFIG.stiffness[reinforcementLevel]
  };
}

/**
 * Reinforces an existing tether (increases stiffness)
 * @param {Object} tether - The tether object to reinforce
 * @returns {Object|null} Updated tether or null if already at max level
 */
export function reinforceTether(tether) {
  const maxLevel = 3;

  if (tether.reinforcementLevel >= maxLevel) {
    return null;  // Already at max strength
  }

  const newLevel = tether.reinforcementLevel + 1;
  const newStiffness = TETHER_CONFIG.stiffness[newLevel];

  // Update the constraint stiffness
  tether.constraint.stiffness = newStiffness;
  tether.reinforcementLevel = newLevel;
  tether.stiffness = newStiffness;

  return tether;
}

/**
 * Removes a tether from the physics world
 * @param {Matter.World} world - The physics world
 * @param {Matter.Engine} engine - The physics engine
 * @param {Object} tether - The tether object to remove
 */
export function severTether(world, engine, tether) {
  Matter.World.remove(world, tether.constraint);
}

/**
 * Adds a tether to the physics world
 * @param {Matter.World} world - The physics world
 * @param {Object} tether - The tether object to add
 */
export function addTetherToWorld(world, tether) {
  Matter.World.add(world, tether.constraint);
}

/**
 * Gets the current tension on a tether based on extension
 * @param {Object} tether - The tether object
 * @returns {number} Tension value (0-1, where 1 is maximum tension)
 */
export function getTetherTension(tether) {
  const constraint = tether.constraint;
  const currentLength = Matter.Constraint.currentLength(constraint);
  const restLength = constraint.length || TETHER_CONFIG.defaultLength;

  // Calculate extension ratio
  const extension = Math.max(0, currentLength - restLength);
  const tensionRatio = Math.min(1, extension / restLength);

  return tensionRatio;
}

/**
 * Generates unique tether ID
 * @param {number} playerId - The player who owns this tether
 * @returns {string} Unique tether ID
 */
export function generateTetherId(playerId) {
  return `tether-p${playerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
