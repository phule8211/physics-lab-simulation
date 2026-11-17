import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useLabStore } from '../../../store/useLabStore';

interface SingleTubeFixtureProps {
  position: [number, number, number];
  length?: number;
  dimFactor: number;
}

function SingleTubeFixture({ position, length = 5.2, dimFactor }: SingleTubeFixtureProps) {
  const [posX, posY, posZ] = position;
  const ceilingY = 6.75;
  const cableHeight = ceilingY - posY;
  const isGlowing = dimFactor > 0.02;

  return (
    <group position={[posX, posY, posZ]}>
      {/* 1. Industrial Aluminum Extrusion Housing (Chassis) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, 0.08, 0.22]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.88}
          roughness={0.25}
          envMapIntensity={0.8 * dimFactor}
        />
      </mesh>

      {/* 2. Top Cable Mount End Caps */}
      {[-length / 2 + 0.5, length / 2 - 0.5].map((cableX, i) => (
        <group key={`mount-${i}`} position={[cableX, 0, 0]}>
          {/* Steel Cable Suspension Grip Bracket */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Thin Aircraft Suspension Wire going up to ceiling truss */}
          <mesh position={[0, cableHeight / 2 + 0.04, 0]}>
            <cylinderGeometry args={[0.005, 0.005, cableHeight, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 3. Dual Long Emissive LED Tubes (Runs along X-axis with Bloom glow) */}
      {[-0.05, 0.05].map((offsetZ, idx) => (
        <mesh
          key={`tube-${idx}`}
          position={[0, -0.045, offsetZ]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.022, 0.022, length - 0.12, 16]} />
          <meshStandardMaterial
            color={isGlowing ? '#ffffff' : '#334155'}
            emissive={isGlowing ? '#f8fafc' : '#000000'}
            emissiveIntensity={3.6 * dimFactor}
            toneMapped={false}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* 4. Frosted Diffuser Lens Bottom Shield */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[length - 0.08, 0.015, 0.18]} />
        <meshStandardMaterial
          color={isGlowing ? '#f8fafc' : '#1e293b'}
          emissive={isGlowing ? '#ffffff' : '#000000'}
          emissiveIntensity={1.8 * dimFactor}
          toneMapped={false}
          transparent
          opacity={0.3 + 0.55 * dimFactor}
          roughness={0.2}
        />
      </mesh>

      {/* 5. Consolidated Downward Clean Light Emitter (5500K Neutral White, Optimized single emitter) */}
      {isGlowing && (
        <pointLight
          position={[0, -0.2, 0]}
          intensity={4.2 * dimFactor}
          distance={12}
          decay={1.8}
          color="#f8fafc"
        />
      )}
    </group>
  );
}

/**
 * 4 Long LED Tube Lights distributed evenly across the 4 quadrants of the workshop:
 * - Northwest: [-4.5, 5.6, -3.2]
 * - Northeast: [ 4.5, 5.6, -3.2]
 * - Southwest: [-4.5, 5.6,  3.2]
 * - Southeast: [ 4.5, 5.6,  3.2]
 *
 * Controllable via the Aptomat (MCB) circuit breaker switch on the workshop wall.
 * Features smooth physics-based gradual dimming when switched on/off.
 */
export function FourLongLedTubeLights() {
  const isAptomatOn = useLabStore((state) => state.isAptomatOn);
  const dimFactorRef = useRef(isAptomatOn ? 1.0 : 0.0);
  const [currentDim, setCurrentDim] = useState(isAptomatOn ? 1.0 : 0.0);

  useFrame((_, delta) => {
    const target = isAptomatOn ? 1.0 : 0.0;
    const next = THREE.MathUtils.damp(dimFactorRef.current, target, 7.0, delta);
    dimFactorRef.current = next;
    // Update local state if significant change
    if (Math.abs(next - currentDim) > 0.01) {
      setCurrentDim(next);
    }
  });

  const fixtures: [number, number, number][] = [
    [-4.5, 5.6, -3.2], // Northwest quadrant (CO2 Laser & Workbenches)
    [4.5, 5.6, -3.2],  // Northeast quadrant (UV Laser & Chemical Racks)
    [-4.5, 5.6, 3.2],  // Southwest quadrant (Fiber Laser & Instrument Stations)
    [4.5, 5.6, 3.2],   // Southeast quadrant (Safety Sensor & Assembly Area)
  ];

  return (
    <group name="FourLongLedTubeLights">
      {fixtures.map((pos, idx) => (
        <SingleTubeFixture
          key={`led-tube-${idx}`}
          position={pos}
          length={5.2}
          dimFactor={currentDim}
        />
      ))}
    </group>
  );
}
