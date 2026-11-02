import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../../store/useLabStore';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { CuttingSparks } from './CuttingSparks';

interface CO2BeamProps {
  gantryZ: number;
  carriageX: number;
  bedY?: number;
}

export function CO2LaserBeam({ gantryZ, carriageX, bedY = 0.84 }: CO2BeamProps) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const selectedMaterial = useLabStore((state) => state.selectedMaterial);
  const plasmaMesh = useRef<THREE.Mesh>(null);

  const matInteraction = MATERIALS_CATALOG[selectedMaterial]?.interactions.CO2_LASER;
  const sparkColor = matInteraction?.sparkColor || '#fbbf24';
  const isBlocked = matInteraction?.status === 'BLOCKED_REFLECTIVE';
  const isIneffective = matInteraction?.status === 'INEFFECTIVE';

  // Safety Interlock Check: If lid is open, laser power is completely cut off!
  const isLaserActive = isRunning && !isLidOpen;

  useFrame(({ clock }) => {
    if (isLaserActive && plasmaMesh.current) {
      // Dynamic plasma tube pulsing
      const mat = plasmaMesh.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 2.2 + Math.sin(clock.getElapsedTime() * 18) * 0.4;
    }
  });

  if (!isLaserActive) return null;

  // Vector lengths
  const lenBeam1 = Math.max(0.01, gantryZ - (-0.7)); // From mirror 1 to mirror 2 along Z
  const lenBeam2 = Math.max(0.01, 1.1 - carriageX);  // From mirror 2 to mirror 3 along X
  const lenBeam3 = 1.05 - bedY;                     // From mirror 3 to focal spot along Y

  return (
    <group>
      {/* 1. Beam Segment 1: Mirror 1 (rear right) -> Mirror 2 (gantry end) */}
      <mesh
        position={[1.1, 1.05, -0.7 + lenBeam1 / 2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.003, 0.003, lenBeam1, 8]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 2. Beam Segment 2: Mirror 2 (gantry end) -> Mirror 3 (carriage head) */}
      <mesh
        position={[1.1 - lenBeam2 / 2, 1.05, gantryZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.003, 0.003, lenBeam2, 8]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Beam Segment 3: Mirror 3 -> Downward through ZnSe Lens */}
      <mesh position={[carriageX, 1.05 - 0.08, gantryZ]}>
        <cylinderGeometry args={[0.004, 0.004, 0.16, 8]} />
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Optical Focusing Cone (ZnSe lens converging beam to focal spot) */}
      <mesh position={[carriageX, bedY + (lenBeam3 - 0.16) / 2, gantryZ]}>
        <cylinderGeometry
          args={[0.004, 0.0008, lenBeam3 - 0.16, 12]}
        />
        <meshBasicMaterial
          color="#ff0000"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Cutting Point Sparks & Incandescent Plume (Color matches material absorption) */}
      <CuttingSparks
        position={[carriageX, bedY + 0.005, gantryZ]}
        color={sparkColor}
        count={isBlocked ? 40 : 28}
        spread={isBlocked ? 0.12 : 0.06}
      />

      {/* Dangerous Reflective Bounce Ray if cutting metals with CO2 10.6um */}
      {isBlocked && (
        <mesh
          position={[carriageX + 0.08, bedY + 0.12, gantryZ + 0.08]}
          rotation={[0.5, 0, 0.4]}
        >
          <cylinderGeometry args={[0.003, 0.003, 0.28, 8]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 6. Burn kerf glow on the workpiece */}
      {!isIneffective && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[carriageX, bedY + 0.002, gantryZ]}
        >
          <circleGeometry args={[0.02, 16]} />
          <meshBasicMaterial
            color={sparkColor}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

