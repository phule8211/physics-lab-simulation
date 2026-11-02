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
 * Checks if a cylinder (x, z) at eye height y with radius r intersects with an AABB box
 */
function cylinderIntersectsAABB(
  x: number,
  y: number,
  z: number,
  radius: number,
  box: AABBBox
): boolean {
  // Check vertical Y overlap: player body extends from feet (y - 1.65) to top of head (y + 0.15)
  const playerFeet = y - 1.65;
  const playerHead = y + 0.15;
  if (playerFeet >= box.max[1] || playerHead <= box.min[1]) {
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

/**
 * Resolves player movement using wall-sliding physics with 3D height awareness
 * Tries X movement, then Z movement independently to allow sliding along walls.
 */
export function resolveMovementWithCollisions(
  currentPos: [number, number, number],
  intendedPos: [number, number, number],
  playerRadius: number = 0.45
): [number, number, number] {
  let resolvedX = intendedPos[0];
  let resolvedZ = intendedPos[2];
  const playerY = currentPos[1];

  // 1. Test X axis movement
  let collidesX = false;
  for (const box of ALL_COLLIDERS) {
    if (cylinderIntersectsAABB(resolvedX, playerY, currentPos[2], playerRadius, box)) {
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
    if (cylinderIntersectsAABB(resolvedX, playerY, resolvedZ, playerRadius, box)) {
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
