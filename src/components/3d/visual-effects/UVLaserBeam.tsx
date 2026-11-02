import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../../store/useLabStore';

interface UVBeamProps {
  position?: [number, number, number];
  waferY?: number;
}

export function UVLaserBeam({ position = [0, 1.45, 0], waferY = 0.985 }: UVBeamProps) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const spotRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const isLaserActive = isRunning && !isLidOpen;
  const beamLength = position[1] - waferY;

  useFrame(({ clock }) => {
    if (isLaserActive) {
      const t = clock.getElapsedTime();
      // High frequency pulsing at 40 kHz (visualized by rapid micro-oscillation)
      if (spotRef.current) {
        const scale = 1 + Math.sin(t * 50) * 0.3;
        spotRef.current.scale.set(scale, scale, scale);
      }
      if (beamRef.current) {
        const mat = beamRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.85 + Math.sin(t * 30) * 0.15;
      }
    }
  });

  if (!isLaserActive) return null;

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 1. LBO Crystal SHG & THG internal green/violet conversion glow */}
      <mesh position={[0, position[1] + 0.05, 0]}>
        <boxGeometry args={[0.04, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={2.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 2. Ultra-fine Deep-Violet 355nm UV Beam */}
      <mesh
        ref={beamRef}
        position={[0, waferY + beamLength / 2, 0]}
      >
        <cylinderGeometry args={[0.0012, 0.0012, beamLength, 8]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Outer UV Ionization Aura (Cone glow) */}
      <mesh position={[0, waferY + beamLength / 2, 0]}>
        <cylinderGeometry args={[0.003, 0.003, beamLength, 8]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Photochemical Cold Ablation Micro-Spot (Zero-HAZ Ionization Glow) */}
      <mesh ref={spotRef} position={[0, waferY + 0.002, 0]}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Concentric ionization ring on the Silicon Wafer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, waferY + 0.001, 0]}>
        <ringGeometry args={[0.006, 0.016, 24]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

