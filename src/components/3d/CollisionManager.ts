import { AABBBox } from '../../types/lab';
import { WALL_COLLIDERS, STATIONS } from '../../data/labConfig';

// Combine all room wall colliders and machine table colliders
export const ALL_COLLIDERS: AABBBox[] = [
  ...WALL_COLLIDERS,
  ...Object.values(STATIONS).map((st) => st.collider),
];

/**
 * Checks if a circle at (x, z) with radius r intersects with an AABB box
 */
function circleIntersectsAABB(
  x: number,
  z: number,
  radius: number,
  box: AABBBox
): boolean {
  // Find the closest point on the AABB to the circle center
  const closestX = Math.max(box.min[0], Math.min(x, box.max[0]));
  const closestZ = Math.max(box.min[2], Math.min(z, box.max[2]));

  // Calculate distance between circle center and closest point
  const distanceX = x - closestX;
  const distanceZ = z - closestZ;
  const distanceSquared = distanceX * distanceX + distanceZ * distanceZ;

  return distanceSquared < radius * radius;
}

/**
 * Resolves player movement using wall-sliding physics
 * Tries X movement, then Z movement independently to allow sliding along walls.
 */
export function resolveMovementWithCollisions(
  currentPos: [number, number, number],
  intendedPos: [number, number, number],
  playerRadius: number = 0.45
): [number, number, number] {
  let resolvedX = intendedPos[0];
  let resolvedZ = intendedPos[2];

  // 1. Test X axis movement
  let collidesX = false;
  for (const box of ALL_COLLIDERS) {
    if (circleIntersectsAABB(resolvedX, currentPos[2], playerRadius, box)) {
      collidesX = true;
      break;
    }
  }
  if (collidesX) {
    // Cancel X motion (sliding along Z)
    resolvedX = currentPos[0];
  }

  // 2. Test Z axis movement
  let collidesZ = false;
  for (const box of ALL_COLLIDERS) {
    if (circleIntersectsAABB(resolvedX, resolvedZ, playerRadius, box)) {
      collidesZ = true;
      break;
    }
  }
  if (collidesZ) {
    // Cancel Z motion (sliding along X)
    resolvedZ = currentPos[2];
  }

  return [resolvedX, intendedPos[1], resolvedZ];
}

