/**
 * Mobile Virtual Controls Input State
 * Designed for high-frequency (60-120 FPS) direct reading in Three.js render loops
 * without triggering React re-render cascades.
 */

export interface MobileInputState {
  // Analog movement vector from virtual thumbstick
  // x: -1 (full left) to +1 (full right)
  // y: -1 (full backward) to +1 (full forward)
  move: { x: number; y: number };

  // Accumulated camera look deltas from right-side touch dragging
  lookDelta: { dx: number; dy: number };

  // One-shot triggers
  jump: boolean;

  // Toggle states
  sprint: boolean;
}

export const mobileInputState: MobileInputState = {
  move: { x: 0, y: 0 },
  lookDelta: { dx: 0, dy: 0 },
  jump: false,
  sprint: false,
};

export function setMobileMove(x: number, y: number) {
  mobileInputState.move.x = x;
  mobileInputState.move.y = y;
}

export function addMobileLookDelta(dx: number, dy: number) {
  mobileInputState.lookDelta.dx += dx;
  mobileInputState.lookDelta.dy += dy;
}

export function triggerMobileJump() {
  mobileInputState.jump = true;
}

export function setMobileSprint(sprint: boolean) {
  mobileInputState.sprint = sprint;
}

export function toggleMobileSprintState(): boolean {
  mobileInputState.sprint = !mobileInputState.sprint;
  return mobileInputState.sprint;
}

export function resetMobileInput() {
  mobileInputState.move.x = 0;
  mobileInputState.move.y = 0;
  mobileInputState.lookDelta.dx = 0;
  mobileInputState.lookDelta.dy = 0;
  mobileInputState.jump = false;
}

