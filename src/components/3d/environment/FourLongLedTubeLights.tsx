import React from 'react';
import * as THREE from 'three';

interface SingleTubeFixtureProps {
  position: [number, number, number];
  length?: number;
}

function SingleTubeFixture({ position, length = 5.2 }: SingleTubeFixtureProps) {
  const [posX, posY, posZ] = position;
  const ceilingY = 6.75;
  const cableHeight = ceilingY - posY;

  return (
    <group position={[posX, posY, posZ]}>
      {/* 1. Industrial Aluminum Extrusion Housing (Chassis) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, 0.08, 0.22]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.88}
          roughness={0.25}
          envMapIntensity={0.8}
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
            color="#ffffff"
            emissive="#f8fafc"
            emissiveIntensity={3.6}
            toneMapped={false}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* 4. Frosted Diffuser Lens Bottom Shield */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[length - 0.08, 0.015, 0.18]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#ffffff"
          emissiveIntensity={1.8}
          toneMapped={false}
          transparent
          opacity={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* 5. Distributed Downward Clean Light Emitters (5500K Neutral White) */}
      {[-length / 4, length / 4].map((lightX, i) => (
        <pointLight
          key={`emitter-${i}`}
          position={[lightX, -0.2, 0]}
          intensity={2.4}
          distance={11}
          decay={1.8}
          color="#f8fafc"
        />
      ))}
    </group>
  );
}

/**
 * 4 Long LED Tube Lights distributed evenly across the 4 quadrants of the workshop:
 * - Northwest: [-4.5, 5.6, -3.2]
 * - Northeast: [ 4.5, 5.6, -3.2]
 * - Southwest: [-4.5, 5.6,  3.2]
 * - Southeast: [ 4.5, 5.6,  3.2]
 */
export function FourLongLedTubeLights() {
  const fixtures: [number, number, number][] = [
    [-4.5, 5.6, -3.2], // Northwest quadrant (CO2 Laser & Workbenches)
    [4.5, 5.6, -3.2],  // Northeast quadrant (UV Laser & Chemical Racks)
    [-4.5, 5.6, 3.2],  // Southwest quadrant (Fiber Laser & Instrument Stations)
    [4.5, 5.6, 3.2],   // Southeast quadrant (Safety Sensor & Assembly Area)
  ];

  return (
    <group name="FourLongLedTubeLights">
      {fixtures.map((pos, idx) => (
        <SingleTubeFixture key={`led-tube-${idx}`} position={pos} length={5.2} />
      ))}
    </group>
  );
}
