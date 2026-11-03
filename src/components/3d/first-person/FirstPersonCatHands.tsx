import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabStore, HeldItemType } from '../../../store/useLabStore';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls';

// =========================================================================
// 3D MODELS OF HELD LAB ITEMS (MÔ HÌNH 3D CÁC VẬT DỤNG TRÊN TAY MÈO)
// =========================================================================

/** 1. Laser-Cut Specimen Workpiece (Bánh răng laser) */
function HeldWorkpiece({ materialType }: { materialType: string }) {
  const isWood = materialType === 'WOOD';
  const isAcrylic = materialType === 'ACRYLIC';
  const isMetal = materialType === 'STEEL' || materialType === 'ALUMINUM';

  const baseColor = isWood
    ? '#b45309'
    : isAcrylic
    ? '#38bdf8'
    : isMetal
    ? '#cbd5e1'
    : '#f8fafc';

  return (
    <group position={[0, 0.04, -0.06]} rotation={[0.4, 0.2, -0.1]}>
      {/* Central Gear Disk */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={isMetal ? 0.9 : 0.05}
          roughness={isWood ? 0.8 : isAcrylic ? 0.15 : 0.25}
          transparent={isAcrylic}
          opacity={isAcrylic ? 0.8 : 1.0}
        />
      </mesh>
      {/* 12 Outer Gear Teeth */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <mesh
            key={`gear-tooth-${i}`}
            position={[Math.cos(angle) * 0.048, 0, Math.sin(angle) * 0.048]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.012, 0.012, 0.012]} />
            <meshStandardMaterial
              color={isWood ? '#92400e' : baseColor}
              metalness={isMetal ? 0.9 : 0.05}
              roughness={isWood ? 0.9 : 0.2}
            />
          </mesh>
        );
      })}
      {/* Center Bore Axle Hole */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.013, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** 2. Borosilicate Glass Beaker 250ml (Cốc đong chia vạch thủy tinh) */
function HeldBeaker() {
  return (
    <group position={[0, 0.05, -0.05]} rotation={[0.2, 0, 0]}>
      {/* Outer Glass Beaker Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.032, 0.028, 0.075, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.42}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>
      {/* Spout Lip at rim */}
      <mesh position={[0, 0.038, -0.03]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.008, 0.012, 8]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.4} />
      </mesh>
      {/* Glowing Chemical Solution inside */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.029, 0.026, 0.045, 18]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.2}
          transparent
          opacity={0.78}
          roughness={0.1}
        />
      </mesh>
      {/* White Graduation Milliliter Lines */}
      {[-0.02, -0.005, 0.01, 0.025].map((y, idx) => (
        <mesh key={`beaker-mark-${idx}`} position={[0.031, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[0.002, 0.018]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/** 3. Round-Bottom Test Tube (Ống nghiệm thủy tinh dung dịch) */
function HeldTestTube() {
  return (
    <group position={[0, 0.04, -0.04]} rotation={[0.4, 0.1, -0.2]}>
      {/* Glass Tube Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.11, 16]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transparent
          opacity={0.45}
          roughness={0.06}
          metalness={0.08}
          clearcoat={1.0}
        />
      </mesh>
      {/* Rounded bottom cap */}
      <mesh position={[0, -0.055, 0]}>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshPhysicalMaterial color="#f8fafc" transparent opacity={0.45} />
      </mesh>
      {/* Luminescent Emerald Solution Inside */}
      <mesh position={[0, -0.015, 0]}>
        <cylinderGeometry args={[0.0105, 0.0105, 0.07, 14]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={1.5}
          transparent
          opacity={0.82}
        />
      </mesh>
      {/* Red Rubber Stopper Cap */}
      <mesh position={[0, 0.058, 0]}>
        <cylinderGeometry args={[0.013, 0.011, 0.016, 14]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} />
      </mesh>
    </group>
  );
}

/** 4. Precision Laboratory Micropipette (Ống hút định lượng) */
function HeldPipette() {
  return (
    <group position={[0, 0.03, -0.05]} rotation={[0.45, 0.2, -0.15]}>
      {/* Main Ergonomic Pipette Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.014, 0.012, 0.12, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Digital Volume Display Window */}
      <mesh position={[0, 0.02, 0.013]}>
        <boxGeometry args={[0.018, 0.025, 0.004]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.8} />
      </mesh>
      {/* Top Thumb Plunger Push-Button */}
      <mesh position={[0, 0.068, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.016, 12]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
      {/* Lower Shaft Taper */}
      <mesh position={[0, -0.075, 0]}>
        <cylinderGeometry args={[0.008, 0.004, 0.05, 12]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Translucent Disposable Tip */}
      <mesh position={[0, -0.11, 0]}>
        <coneGeometry args={[0.004, 0.028, 12]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

/** 5. Stainless Steel Digital Caliper (Thước kẹp điện tử đo laser) */
function HeldCaliper() {
  return (
    <group position={[0, 0.04, -0.06]} rotation={[0.3, 0.4, -0.2]}>
      {/* Main Steel Scale Beam */}
      <mesh castShadow>
        <boxGeometry args={[0.016, 0.15, 0.005]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.18} />
      </mesh>
      {/* Fixed Upper Jaw */}
      <mesh position={[-0.018, 0.06, 0]}>
        <boxGeometry args={[0.024, 0.01, 0.005]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Sliding Digital LCD Module */}
      <mesh position={[0, 0.01, 0.005]} castShadow>
        <boxGeometry args={[0.034, 0.038, 0.014]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* LCD Screen Readout */}
      <mesh position={[0, 0.012, 0.013]}>
        <planeGeometry args={[0.024, 0.014]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      {/* Movable Lower Jaw */}
      <mesh position={[-0.018, 0.01, 0]}>
        <boxGeometry args={[0.024, 0.01, 0.005]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
      </mesh>
    </group>
  );
}

// =========================================================================
// SINGLE PROCEDURAL ORANGE TABBY CAT PAW COMPONENT
// =========================================================================

interface SinglePawProps {
  side: 'left' | 'right';
  tapProgress: number; // 0 to 1 (punch/reach forward)
  walkCycle: number;
  isMoving: boolean;
  heldItem: HeldItemType;
  materialType: string;
}

function SinglePaw({
  side,
  tapProgress,
  walkCycle,
  isMoving,
  heldItem,
  materialType,
}: SinglePawProps) {
  const isRight = side === 'right';
  const flipX = isRight ? 1 : -1;
  const isHolding = isRight && heldItem !== 'NONE';

  // Natural walking cadence offset between left & right paw
  const phase = isRight ? 0 : Math.PI;
  const bobY = isMoving ? Math.sin(walkCycle * 2 + phase) * 0.016 : 0;
  const bobX = isMoving ? Math.cos(walkCycle + phase) * 0.01 : 0;
  const bobZ = isMoving ? Math.sin(walkCycle + phase) * 0.022 : 0;

  // Reach / Tap / Inspect forward animation offset
  const tapZ = -tapProgress * 0.16;
  const tapY = tapProgress * 0.05;
  const tapRotX = -tapProgress * 0.3;
  const tapRotZ = isRight ? tapProgress * 0.18 : -tapProgress * 0.18;

  // Grip factor when holding an object (curls fingers inward)
  const fingerCurl = isHolding ? 0.75 : 0;

  return (
    <group
      position={[
        (isRight ? 0.20 : -0.20) + bobX,
        (isHolding ? -0.10 : -0.12) + bobY + tapY,
        (isHolding ? -0.32 : -0.34) + bobZ + tapZ,
      ]}
      rotation={[
        (isHolding ? 0.42 : 0.35) + tapRotX,
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
            3. PINK TOE BEANS & 4 FINGERS (Ngón chân co gập cầm nắm linh hoạt)
           ========================================================================= */}
        {[
          { x: -0.036 * flipX, z: -0.065, rotY: -0.25 * flipX }, // Outer toe
          { x: -0.012 * flipX, z: -0.082, rotY: -0.08 * flipX }, // Middle-outer toe
          { x: 0.012 * flipX, z: -0.082, rotY: 0.08 * flipX },  // Middle-inner toe
          { x: 0.036 * flipX, z: -0.065, rotY: 0.25 * flipX },  // Inner toe
        ].map((toe, idx) => {
          // Toe curl rotation when gripping an object
          const curlX = fingerCurl * 0.65;
          const curlZ = isRight ? -fingerCurl * 0.15 : fingerCurl * 0.15;

          return (
            <group
              key={`toe-${idx}`}
              position={[toe.x, -0.008 + (isHolding ? 0.006 : 0), toe.z + (isHolding ? 0.012 : 0)]}
              rotation={[curlX, toe.rotY, curlZ]}
            >
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
          );
        })}

        {/* Dewclaw / Thumb Bean (Ngón cái phụ kẹp giữ đồ vật) */}
        <group
          position={[0.046 * flipX, 0.01, -0.01]}
          rotation={[
            isHolding ? 0.35 : 0,
            (0.4 + (isHolding ? 0.5 : 0)) * flipX,
            0.3 * flipX,
          ]}
        >
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
          <mesh scale={[1.4, 1.05, 0.7]}>
            <sphereGeometry args={[0.022, 14, 14]} />
            <meshStandardMaterial
              color="#fb7185" // Main plump pink palm pad
              roughness={0.45}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[-0.012, 0.008, 0]} scale={[0.8, 0.8, 0.6]}>
            <sphereGeometry args={[0.014, 12, 12]} />
            <meshStandardMaterial color="#fb7185" roughness={0.45} />
          </mesh>
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

      {/* =========================================================================
          4. HELD ITEM IN RIGHT PAW (VẬT PHẨM TRÊN TAY PHẢI)
         ========================================================================= */}
      {isRight && heldItem === 'WORKPIECE' && <HeldWorkpiece materialType={materialType} />}
      {isRight && heldItem === 'BEAKER' && <HeldBeaker />}
      {isRight && heldItem === 'TEST_TUBE' && <HeldTestTube />}
      {isRight && heldItem === 'PIPETTE' && <HeldPipette />}
      {isRight && heldItem === 'CALIPER' && <HeldCaliper />}
    </group>
  );
}

// =========================================================================
// MAIN FIRST-PERSON CAT HANDS VIEWMODEL COMPONENT
// =========================================================================

export function FirstPersonCatHands() {
  const { camera } = useThree();
  const { mode, heldItem, selectedMaterial, setHeldItem } = useLabStore();
  const keys = useKeyboardControls();

  const groupRef = useRef<THREE.Group>(null);

  // Mouse sway lag trackers
  const prevCamRot = useRef(new THREE.Euler());
  const swayX = useRef(0);
  const swayY = useRef(0);

  // Animation cycle counters
  const walkCycle = useRef(0);
  const idleTime = useRef(0);
  const tapAnim = useRef(0); // 0 (idle) to 1 (full reach / inspect)

  // Listen to mouse click & keyboard hotkeys for smooth manipulation
  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Left click triggers reach / inspection action
      if (e.button === 0 && useLabStore.getState().mode === 'WALKING') {
        tapAnim.current = 1.0;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const store = useLabStore.getState();
      if (store.mode !== 'WALKING') return;

      // 1. Interaction Tap Reaction (E, F, O, C, G, Space)
      if (['KeyE', 'KeyF', 'KeyO', 'KeyC', 'KeyG', 'Space'].includes(e.code)) {
        tapAnim.current = 1.0;
      }

      // 2. Quick-slot Hotkeys for Grasping / Equipping Items:
      // '0' or 'X': Put away item (Empty hands / Tay không)
      // '1': Spur Gear Specimen (Mẫu phôi gia công)
      // '2': Beaker (Cốc đong thủy tinh)
      // '3': Test Tube (Ống nghiệm)
      // '4': Pipette (Ống hút vi tích phân)
      // '5': Caliper (Thước kẹp điện tử)
      // 'Q': Cycle next available item in lab
      if (e.code === 'Digit0' || e.code === 'KeyX') {
        store.setHeldItem('NONE');
      } else if (e.code === 'Digit1') {
        store.setHeldItem('WORKPIECE');
      } else if (e.code === 'Digit2') {
        store.setHeldItem('BEAKER');
      } else if (e.code === 'Digit3') {
        store.setHeldItem('TEST_TUBE');
      } else if (e.code === 'Digit4') {
        store.setHeldItem('PIPETTE');
      } else if (e.code === 'Digit5') {
        store.setHeldItem('CALIPER');
      } else if (e.code === 'KeyQ') {
        const itemCycle: HeldItemType[] = [
          'NONE',
          'WORKPIECE',
          'BEAKER',
          'TEST_TUBE',
          'PIPETTE',
          'CALIPER',
        ];
        const nextIndex = (itemCycle.indexOf(store.heldItem) + 1) % itemCycle.length;
        store.setHeldItem(itemCycle[nextIndex]);
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

    // Hide cat paws during machine inspection mode for full focus on machine anatomy
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
      // Smoothly return walkCycle to neutral phase
      walkCycle.current = THREE.MathUtils.damp(
        walkCycle.current,
        Math.round(walkCycle.current / Math.PI) * Math.PI,
        6,
        dt
      );
    }

    idleTime.current += dt;

    // 3. Inertial Mouse Sway Lag (Độ trễ vung tay tự nhiên khi lia chuột)
    const deltaYaw = camera.rotation.y - prevCamRot.current.y;
    const deltaPitch = camera.rotation.x - prevCamRot.current.x;
    prevCamRot.current.copy(camera.rotation);

    swayX.current = THREE.MathUtils.damp(swayX.current, -deltaYaw * 0.12, 10, dt);
    swayY.current = THREE.MathUtils.damp(swayY.current, deltaPitch * 0.12, 10, dt);

    // 4. Spring decay for tap/reach animation
    if (tapAnim.current > 0) {
      tapAnim.current = THREE.MathUtils.damp(tapAnim.current, 0, 8, dt);
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
        tapProgress={tapAnim.current * 0.6}
        walkCycle={walkCycle.current}
        isMoving={
          keys.current.forward ||
          keys.current.backward ||
          keys.current.left ||
          keys.current.right
        }
        heldItem={heldItem}
        materialType={selectedMaterial}
      />

      {/* Right Orange Tabby Paw (Main Action Paw holding equipment / workpiece) */}
      <SinglePaw
        side="right"
        tapProgress={tapAnim.current}
        walkCycle={walkCycle.current}
        isMoving={
          keys.current.forward ||
          keys.current.backward ||
          keys.current.left ||
          keys.current.right
        }
        heldItem={heldItem}
        materialType={selectedMaterial}
      />
    </group>
  );
}
