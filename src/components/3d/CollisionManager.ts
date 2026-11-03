import { AABBBox } from '../../types/lab';
import { WALL_COLLIDERS, STATIONS } from '../../data/labConfig';
import { EXTRA_COLLIDERS } from '../../data/staircaseConfig';

// Combine all room wall colliders, machine table colliders, lab workbenches, and 2nd floor railings
export const ALL_COLLIDERS: AABBBox[] = [
  ...WALL_COLLIDERS,
  ...Object.values(STATIONS).map((st) => st.collider),
  ...EXTRA_COLLIDERS,
];

/**
 * Checks if a vertical cylinder (x, z) spanning feetY to headY with radius r intersects with an AABB box
 */
function cylinderIntersectsAABB(
  x: number,
  z: number,
  feetY: number,
  headY: number,
  radius: number,
  box: AABBBox
): boolean {
  // Check vertical Y overlap
  if (feetY >= box.max[1] || headY <= box.min[1]) {
    return false;
  }

  // Find the closest point on the AABB to the circle center
  const closestX = Math.max(box.min[0], Math.min(x, box.max[0]));
  const closestZ = Math.max(box.min[2], Math.min(z, box.max[2]));

  // Calculate distance between circle center and closest point
  const distanceX = x - closestX;
  const distanceZ = z - closestZ;
  const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;

  return distanceSquared < radius * radius;
}

export interface DynamicObstacle {
  x: number;
  y: number;
  z: number;
  radius: number;
  isEyeHeight?: boolean;
}

/**
 * Resolves entity movement using wall-sliding physics with 3D height awareness and dynamic obstacle avoidance.
 * Tries X movement, then Z movement independently to allow sliding along walls.
 */
export function resolveMovementWithCollisions(
  currentPos: [number, number, number],
  intendedPos: [number, number, number],
  radius: number = 0.45,
  isEyeHeight: boolean = true,
  dynamicObstacle?: DynamicObstacle | null
): [number, number, number] {
  let resolvedX = intendedPos[0];
  let resolvedZ = intendedPos[2];
  const entityY = currentPos[1];
  const feetY = isEyeHeight ? entityY - 1.65 : entityY;
  const headY = isEyeHeight ? entityY + 0.15 : entityY + 1.8;

  const checkCollisionAt = (testPoint: [number, number, number]) => {
    // 1. Static AABB Colliders (walls, machine tables, lab workbenches, stair railings, racks, sink, etc.)
    for (const box of ALL_COLLIDERS) {
      if (cylinderIntersectsAABB(testPoint[0], testPoint[2], feetY, headY, radius, box)) {
        return true;
      }
    }

    // 2. Dynamic Cylinder Obstacle (e.g. NPC Dũng vs Player)
    if (dynamicObstacle) {
      const obsFeet = dynamicObstacle.isEyeHeight ? dynamicObstacle.y - 1.65 : dynamicObstacle.y;
      const obsHead = dynamicObstacle.isEyeHeight ? dynamicObstacle.y + 0.15 : dynamicObstacle.y + 1.8;
      // Vertical overlap check
      if (feetY < obsHead && headY > obsFeet) {
        const dx = testPoint[0] - dynamicObstacle.x;
        const dz = testPoint[2] - dynamicObstacle.z;
        const minDist = radius + dynamicObstacle.radius;
        if (dx * dx + dz * dz < minDist * minDist) {
          return true;
        }
      }
    }

    return false;
  };

  // 1. Test X axis movement
  if (checkCollisionAt([resolvedX, entityY, currentPos[2]])) {
    resolvedX = currentPos[0];
  }

  // 2. Test Z axis movement
  if (checkCollisionAt([resolvedX, entityY, resolvedZ])) {
    resolvedZ = currentPos[2];
  }

  return [resolvedX, intendedPos[1], resolvedZ];
}
