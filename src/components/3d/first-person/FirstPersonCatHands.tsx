import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabStore } from '../../../store/useLabStore';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls';

interface SinglePawProps {
  side: 'left' | 'right';
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  tapProgress: number; // 0 to 1 (punch/reach forward)
  walkCycle: number;
  isMoving: boolean;
}

/**
 * Procedural Stylized Orange Tabby Cat Paw (Bàn chân mèo mướp cam siêu dễ thương):
 * - Orange ginger fur with darker tabby stripes
 * - Fluffy white socks (đốm trắng ở đầu bàn chân)
 * - Soft baby-pink paw beans & heart-shaped palm pad (đệm thịt hồng mềm)
 * - Semi-retracted cute claws (móng vuốt nhỏ)
 */
function SinglePaw({ side, tapProgress, walkCycle, isMoving }: SinglePawProps) {
  const isRight = side === 'right';
  const flipX = isRight ? 1 : -1;

  // Natural walking cadence offset between left & right paw
  const phase = isRight ? 0 : Math.PI;
  const bobY = isMoving ? Math.sin(walkCycle * 2 + phase) * 0.018 : 0;
  const bobX = isMoving ? Math.cos(walkCycle + phase) * 0.012 : 0;
  const bobZ = isMoving ? Math.sin(walkCycle + phase) * 0.025 : 0;

  // Reach / Tap forward animation offset
  const tapZ = -tapProgress * 0.18;
  const tapY = tapProgress * 0.06;
  const tapRotX = -tapProgress * 0.35;
  const tapRotZ = isRight ? tapProgress * 0.2 : -tapProgress * 0.2;

  return (
    <group
      position={[
        (isRight ? 0.21 : -0.21) + bobX,
        -0.12 + bobY + tapY,
        -0.34 + bobZ + tapZ,
      ]}
      rotation={[
        0.35 + tapRotX,
        isRight ? -0.32 : 0.32,
        (isRight ? -0.18 : 0.18) + tapRotZ,
      ]}
    >
      {/* =========================================================================
          1. FOREARM (Cẳng tay mèo cam thon mượt với vằn lông mướp)
         ========================================================================= */}
      <group position={[0, -0.06, 0.14]} rotation={[0.45, 0, 0]}>
        {/* Main Orange Forearm */}
        <mesh castShadow>
          <cylinderGeometry args={[0.042, 0.048, 0.28, 18]} />
          <meshStandardMaterial
            color="#ea580c" // Warm ginger orange
            roughness={0.88}
            metalness={0.02}
          />
        </mesh>

        {/* Tabby Darker Stripes (3 subtle rings around the forearm) */}
        {[-0.07, 0.0, 0.07].map((stripeY, i) => (
          <mesh key={`stripe-${i}`} position={[0, stripeY, 0]}>
            <cylinderGeometry args={[0.0435, 0.0455, 0.022, 18]} />
            <meshStandardMaterial
              color="#9a3412" // Deep reddish-brown tabby stripe
              roughness={0.9}
              metalness={0.02}
            />
          </mesh>
        ))}

        {/* Inner Wrist Fluffy White Accent Patch */}
        <mesh position={[0, -0.09, -0.02]}>
          <capsuleGeometry args={[0.025, 0.06, 8, 12]} />
          <meshStandardMaterial color="#fffbeb" roughness={0.92} />
        </mesh>
      </group>

      {/* =========================================================================
          2. WRIST CARPUS & WHITE PAW MITTEN (Cổ tay & Bàn chân búp măng trắng)
         ========================================================================= */}
      <group position={[0, -0.01, 0.02]}>
        {/* White "Sock" mitten transition */}
        <mesh castShadow>
          <sphereGeometry args={[0.048, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.85} />
        </mesh>

        {/* Orange fur cap on upper wrist */}
        <mesh position={[0, 0.022, 0.015]}>
          <sphereGeometry args={[0.042, 14, 14]} />
          <meshStandardMaterial color="#ea580c" roughness={0.88} />
        </mesh>

        {/* Plump Metacarpal Main Paw Body */}
        <mesh position={[0, -0.005, -0.03]} scale={[1.15, 0.85, 1.25]} castShadow>
          <sphereGeometry args={[0.044, 16, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.85} />
        </mesh>

        {/* =========================================================================
            3. PINK TOE BEANS & 4 FINGERS (4 Ngón chân đệm thịt hồng)
           ========================================================================= */}
        {/* 4 Plump Round Toes */}
        {[
          { x: -0.036 * flipX, z: -0.065, rotY: -0.25 * flipX }, // Outer toe
          { x: -0.012 * flipX, z: -0.082, rotY: -0.08 * flipX }, // Middle-outer toe
          { x: 0.012 * flipX, z: -0.082, rotY: 0.08 * flipX },  // Middle-inner toe
          { x: 0.036 * flipX, z: -0.065, rotY: 0.25 * flipX },  // Inner toe
        ].map((toe, idx) => (
          <group key={`toe-${idx}`} position={[toe.x, -0.008, toe.z]} rotation={[0, toe.rotY, 0]}>
            {/* White fluffy toe cap */}
            <mesh castShadow scale={[1.0, 0.85, 1.1]}>
              <sphereGeometry args={[0.017, 14, 14]} />
              <meshStandardMaterial color="#ffffff" roughness={0.85} />
            </mesh>

            {/* Soft Baby Pink Toe Bean Pad (Đệm thịt hồng dưới ngón) */}
            <mesh position={[0, -0.011, 0.003]} rotation={[-Math.PI / 2, 0, 0]}>
              <sphereGeometry args={[0.011, 12, 12]} />
              <meshStandardMaterial
                color="#fb7185" // Soft rose-pink toe bean
                roughness={0.45}
                metalness={0.05}
              />
            </mesh>

            {/* Little Cute Semi-retracted Claw Tip */}
            <mesh position={[0, -0.002, -0.016]} rotation={[0.4, 0, 0]}>
              <coneGeometry args={[0.0035, 0.012, 8]} />
              <meshStandardMaterial
                color="#fef08a"
                roughness={0.3}
                metalness={0.2}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        ))}

        {/* Dewclaw / Thumb Bean (Ngón cái phụ bên hông) */}
        <group position={[0.046 * flipX, 0.01, -0.01]} rotation={[0, 0.4 * flipX, 0.3 * flipX]}>
          <mesh scale={[0.9, 0.8, 1.0]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.009, 0]}>
            <sphereGeometry args={[0.008, 10, 10]} />
            <meshStandardMaterial color="#fb7185" roughness={0.45} />
          </mesh>
        </group>

        {/* Main Heart-shaped Palm Bean Pad (Đệm thịt chính giữa bàn chân) */}
        <group position={[0, -0.022, -0.028]} rotation={[-Math.PI / 2.2, 0, 0]}>
          {/* Central main heart pad */}
          <mesh scale={[1.4, 1.05, 0.7]}>
            <sphereGeometry args={[0.022, 14, 14]} />
            <meshStandardMaterial
              color="#fb7185" // Main plump pink palm pad
              roughness={0.45}
              metalness={0.05}
            />
          </mesh>
          {/* Left lobe of heart pad */}
          <mesh position={[-0.012, 0.008, 0]} scale={[0.8, 0.8, 0.6]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#fb7185" roughness={0.45} />
          </mesh>
          {/* Right lobe of heart pad */}
          <mesh position={[0.012, 0.008, 0]} scale={[0.8, 0.8, 0.6]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#fb7185" roughness={0.45} />
          </mesh>
        </group>

        {/* Sensory Carpal Pad on wrist (Đệm phụ ở cổ tay) */}
        <mesh position={[0, -0.02, 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.009, 10, 10]} />
          <meshStandardMaterial color="#fda4af" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * First-Person Cat Hands Viewmodel:
 * Renders pair of cute animated orange cat paws attached to the player's camera.
 * Features:
 * - Idle breathing & micro-twitch
 * - Inertial mouse sway & spring lag
 * - Walk / sprint bobbing cadence
 * - Click & interaction reach / tap forward animation
 * - Automatically hides during machine inspection mode for full focus
 */
export function FirstPersonCatHands() {
  const { camera } = useThree();
  const mode = useLabStore((state) => state.mode);
  const keys = useKeyboardControls();

  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef(new THREE.Vector3());
  const currentRot = useRef(new THREE.Euler());

  // Mouse sway lag trackers
  const prevCamRot = useRef(new THREE.Euler());
  const swayX = useRef(0);
  const swayY = useRef(0);

  // Animation cycle counters
  const walkCycle = useRef(0);
  const idleTime = useRef(0);
  const tapAnim = useRef(0); // 0 (idle) to 1 (full reach)

  // Listen to mouse click / interaction tap
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Trigger paw punch / reach on left click
      if (e.button === 0 && useLabStore.getState().mode === 'WALKING') {
        tapAnim.current = 1.0;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger paw punch/reach when pressing interaction keys (E, F, O, C, G)
      if (['KeyE', 'KeyF', 'KeyO', 'KeyC', 'KeyG', 'Space'].includes(e.code) && useLabStore.getState().mode === 'WALKING') {
        tapAnim.current = 1.0;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);

    // Hide cat paws during machine inspection mode or modal dialogues
    const isVisible = mode === 'WALKING';
    groupRef.current.visible = isVisible;
    if (!isVisible) return;

    // 1. Position & orient root with camera
    groupRef.current.position.copy(camera.position);
    groupRef.current.quaternion.copy(camera.quaternion);

    // 2. Determine player walking movement
    const isMoving =
      keys.current.forward ||
      keys.current.backward ||
      keys.current.left ||
      keys.current.right;
    const isSprinting = keys.current.sprint;

    const moveSpeed = isSprinting ? 12 : 7.5;
    if (isMoving) {
      walkCycle.current += dt * moveSpeed;
    } else {
      // Gently return walkCycle to neutral
      walkCycle.current = THREE.MathUtils.damp(walkCycle.current, Math.round(walkCycle.current / Math.PI) * Math.PI, 6, dt);
    }

    idleTime.current += dt;

    // 3. Inertial Mouse Sway Lag (Độ trễ vung tay khi quay camera)
    const deltaYaw = camera.rotation.y - prevCamRot.current.y;
    const deltaPitch = camera.rotation.x - prevCamRot.current.x;
    prevCamRot.current.copy(camera.rotation);

    swayX.current = THREE.MathUtils.damp(swayX.current, -deltaYaw * 0.12, 10, dt);
    swayY.current = THREE.MathUtils.damp(swayY.current, deltaPitch * 0.12, 10, dt);

    // 4. Spring decay for tap/reach animation
    if (tapAnim.current > 0) {
      tapAnim.current = THREE.MathUtils.damp(tapAnim.current, 0, 9, dt);
    }

    // Idle breathing floating
    const breatheY = Math.sin(idleTime.current * 1.8) * 0.005;
    const breatheX = Math.cos(idleTime.current * 0.9) * 0.003;

    // Apply sway & breathe to viewmodel container
    groupRef.current.translateX(swayX.current + breatheX);
    groupRef.current.translateY(swayY.current + breatheY);
  });

  return (
    <group ref={groupRef} name="FirstPersonCatHands">
      {/* Left Orange Tabby Paw */}
      <SinglePaw
        side="left"
        targetPos={currentPos.current}
        targetRot={currentRot.current}
        tapProgress={tapAnim.current * 0.65}
        walkCycle={walkCycle.current}
        isMoving={
          keys.current.forward ||
          keys.current.backward ||
          keys.current.left ||
          keys.current.right
        }
      />

      {/* Right Orange Tabby Paw (Main Action Paw) */}
      <SinglePaw
        side="right"
        targetPos={currentPos.current}
        targetRot={currentRot.current}
        tapProgress={tapAnim.current}
        walkCycle={walkCycle.current}
        isMoving={
          keys.current.forward ||
          keys.current.backward ||
          keys.current.left ||
          keys.current.right
        }
      />
    </group>
  );
}
