import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Volumetric Light Shafts (Unreal Engine 5 God Rays Simulation)
 * Creates diagonal translucent light shafts emanating from high skylight windows
 * with soft additive blending and subtle atmospheric breathing animation.
 */
export function VolumetricLightShafts() {
  const beamGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (beamGroupRef.current) {
      const t = clock.getElapsedTime();
      // Gentle atmospheric breathing intensity
      const pulse = 0.85 + Math.sin(t * 0.8) * 0.12;
      beamGroupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshBasicMaterial;
          mat.opacity = (0.05 + i * 0.015) * pulse;
        }
      });
    }
  });

  return (
    <group ref={beamGroupRef} position={[4, 6.5, 2]}>
      {/* Primary Sunlight Shaft 1 */}
      <mesh
        position={[-1.5, -2.8, -1.2]}
        rotation={[0.32, 0.45, -0.42]}
      >
        <cylinderGeometry args={[0.6, 2.8, 8.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#bae6fd"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Primary Sunlight Shaft 2 */}
      <mesh
        position={[1.2, -3.0, 0.8]}
        rotation={[0.28, 0.38, -0.38]}
      >
        <cylinderGeometry args={[0.8, 3.4, 9.0, 16, 1, true]} />
        <meshBasicMaterial
          color="#e0f2fe"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Wide Soft Ambient Volumetric Cone */}
      <mesh
        position={[0, -3.2, 0]}
        rotation={[0.3, 0.4, -0.4]}
      >
        <coneGeometry args={[4.2, 9.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.035}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

