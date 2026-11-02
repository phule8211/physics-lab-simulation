import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../../store/useLabStore';

interface SparksProps {
  position: [number, number, number];
  color?: string;
  count?: number;
  spread?: number;
}

export function CuttingSparks({
  position,
  color = '#f59e0b',
  count = 24,
  spread = 0.08,
}: SparksProps) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize particle positions and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // Random burst velocity upwards and outwards
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 0.8;
      vel[i * 3] = Math.cos(angle) * speed * spread * 10;
      vel[i * 3 + 1] = (0.5 + Math.random() * 1.2) * speed;
      vel[i * 3 + 2] = Math.sin(angle) * speed * spread * 10;
    }

    return [pos, vel];
  }, [count, spread]);

  const lifetimes = useMemo(() => new Float32Array(count).fill(0), [count]);

  useFrame((_, delta) => {
    if (!isRunning || !pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      lifetimes[i] += dt * 3;

      if (lifetimes[i] > 1.0) {
        // Reset spark back to origin
        lifetimes[i] = Math.random() * 0.2;
        posAttr.setXYZ(i, 0, 0, 0);

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.7;
        velocities[i * 3] = Math.cos(angle) * speed * spread * 12;
        velocities[i * 3 + 1] = (0.4 + Math.random() * 1.0) * speed;
        velocities[i * 3 + 2] = Math.sin(angle) * speed * spread * 12;
      } else {
        // Move spark along velocity with gravity
        velocities[i * 3 + 1] -= 3.5 * dt; // Gravity

        const x = posAttr.getX(i) + velocities[i * 3] * dt;
        const y = Math.max(0, posAttr.getY(i) + velocities[i * 3 + 1] * dt);
        const z = posAttr.getZ(i) + velocities[i * 3 + 2] * dt;

        posAttr.setXYZ(i, x, y, z);
      }
    }

    posAttr.needsUpdate = true;
  });

  if (!isRunning) return null;

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color={color}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Incandescent contact glow sphere */}
      <mesh position={[0, 0.005, 0]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

