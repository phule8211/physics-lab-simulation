import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLabStore } from '../../../store/useLabStore';
import { CuttingSparks } from './CuttingSparks';
import { buildToolpathIndex, interpolateToolpathPoint } from '../../../data/vectorDesigns';

interface GalvoBeamProps {
  scannerY?: number;
  workpieceY?: number;
}

export function GalvoMirrorBeam({
  scannerY = 1.32,
  workpieceY = 0.96,
}: GalvoBeamProps) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const cutProgress = useLabStore((state) => state.cutProgress);
  const currentToolpaths = useLabStore((state) => state.currentToolpaths);
  const isLaserActive = isRunning && !isLidOpen;

  const beamLineRef = useRef<THREE.Line>(null);
  const mirrorXRef = useRef<THREE.Mesh>(null);
  const mirrorYRef = useRef<THREE.Mesh>(null);
  const spotPos = useRef(new THREE.Vector3(0, workpieceY, 0.1));

  const beamHeight = scannerY - workpieceY;

  const { segments, totalLength } = useMemo(
    () => buildToolpathIndex(currentToolpaths),
    [currentToolpaths]
  );

  useFrame(({ clock }) => {
    if (!isLaserActive) return;

    let scanX = 0;
    let scanZ = 0.1;

    if (totalLength > 0.001) {
      const progressFraction =
        cutProgress > 0 && cutProgress < 100
          ? cutProgress / 100
          : (clock.getElapsedTime() * 0.7) % 1;
      const pt = interpolateToolpathPoint(segments, totalLength, progressFraction);
      scanX = pt[0] * 0.09;
      scanZ = 0.1 - pt[1] * 0.06;
    } else {
      const t = clock.getElapsedTime() * 12; // High-speed galvo scanning rate
      scanX = 0.08 * Math.cos(t * 1.5);
      scanZ = 0.1 + 0.05 * Math.sin(t * 2.1);
    }

    spotPos.current.set(scanX, workpieceY, scanZ);

    // Oscillate mirrors accordingly
    if (mirrorXRef.current) {
      mirrorXRef.current.rotation.y = THREE.MathUtils.lerp(
        mirrorXRef.current.rotation.y,
        scanX * 1.8,
        0.3
      );
    }
    if (mirrorYRef.current) {
      mirrorYRef.current.rotation.x = THREE.MathUtils.lerp(
        mirrorYRef.current.rotation.x,
        (scanZ - 0.1) * 2.2,
        0.3
      );
    }

    // Update dynamic beam line geometry from lens nozzle [0, scannerY, 0.1] to spotPos
    if (beamLineRef.current) {
      const positions = (beamLineRef.current.geometry.attributes.position as THREE.BufferAttribute);
      positions.setXYZ(0, 0, scannerY, 0.1);
      positions.setXYZ(1, spotPos.current.x, spotPos.current.y, spotPos.current.z);
      positions.needsUpdate = true;
    }
  });

  if (!isLaserActive) return null;

  return (
    <group>
      {/* 1. Internal Galvo Mirror X (Micro Servo Mirror) */}
      <mesh ref={mirrorXRef} position={[0, scannerY + 0.12, 0.08]}>
        <boxGeometry args={[0.025, 0.035, 0.003]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.99} roughness={0.05} />
      </mesh>

      {/* 2. Internal Galvo Mirror Y (Micro Servo Mirror) */}
      <mesh ref={mirrorYRef} position={[0, scannerY + 0.08, 0.1]}>
        <boxGeometry args={[0.035, 0.025, 0.003]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.99} roughness={0.05} />
      </mesh>

      {/* 3. High-Speed Scanning Laser Beam Line */}
      <line ref={beamLineRef as any}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, scannerY, 0.1, 0, workpieceY, 0.1]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#f59e0b"
          linewidth={2}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* 4. Secondary F-Theta Cone Glow */}
      <mesh position={[0, workpieceY + beamHeight / 2, 0.1]}>
        <cylinderGeometry args={[0.004, 0.001, beamHeight, 8]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Incandescent Metal Annealing Spark Burst */}
      <CuttingSparks
        position={[spotPos.current.x, workpieceY + 0.002, spotPos.current.z]}
        color="#fef08a"
        count={20}
        spread={0.04}
      />

      {/* 6. Glowing Annealed Laser Track on Titanium/Brass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[spotPos.current.x, workpieceY + 0.001, spotPos.current.z]}
      >
        <circleGeometry args={[0.015, 16]} />
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

