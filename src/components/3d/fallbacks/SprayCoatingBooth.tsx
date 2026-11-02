import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../../../store/useLabStore';
import { COATING_FINISHES } from '../../../data/coatingFinishes';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { computeBoundingBox } from '../../../data/vectorDesigns';

/**
 * Spray Mist Particle Emitter:
 * Emits a high-velocity particle cone from the spray nozzle towards the workpiece
 */
function SprayMistParticles({
  sprayOrigin,
  sprayTarget,
  color,
  active,
}: {
  sprayOrigin: [number, number, number];
  sprayTarget: [number, number, number];
  color: string;
  active: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 48;

  const [positions, velocities, lifetimes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const life = new Float32Array(count);

    const dir = new THREE.Vector3(
      sprayTarget[0] - sprayOrigin[0],
      sprayTarget[1] - sprayOrigin[1],
      sprayTarget[2] - sprayOrigin[2]
    ).normalize();

    for (let i = 0; i < count; i++) {
      pos[i * 3] = sprayOrigin[0];
      pos[i * 3 + 1] = sprayOrigin[1];
      pos[i * 3 + 2] = sprayOrigin[2];

      // Spray dispersion cone
      const spread = 0.22;
      vel[i * 3] = dir.x * 2.2 + (Math.random() - 0.5) * spread;
      vel[i * 3 + 1] = dir.y * 2.2 + (Math.random() - 0.5) * spread;
      vel[i * 3 + 2] = dir.z * 2.2 + (Math.random() - 0.5) * spread;

      life[i] = Math.random();
    }

    return [pos, vel, life];
  }, [sprayOrigin, sprayTarget]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const dt = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      if (!active) {
        // Hide particles off-screen when inactive
        posAttr.setXYZ(i, 0, -20, 0);
        continue;
      }

      lifetimes[i] += dt * 3.5;

      if (lifetimes[i] > 1.0) {
        lifetimes[i] = 0;
        posAttr.setXYZ(i, sprayOrigin[0], sprayOrigin[1], sprayOrigin[2]);
      } else {
        const x = posAttr.getX(i) + velocities[i * 3] * dt;
        const y = posAttr.getY(i) + velocities[i * 3 + 1] * dt;
        const z = posAttr.getZ(i) + velocities[i * 3 + 2] * dt;
        posAttr.setXYZ(i, x, y, z);
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.035}
        transparent
        opacity={active ? 0.75 : 0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function SprayCoatingBooth() {
  const {
    selectedCoatingFinish,
    coatingCoverage,
    curingProgress,
    isSpraying,
    isCuring,
    isTurntableRotating,
    setCoatingCoverage,
    setCuringProgress,
    selectedMaterial,
    currentToolpaths,
    currentDesignName,
    activeStationId,
    startSpraying,
    stopSpraying,
    startCuring,
    stopCuring,
    resetCoating,
    toggleTurntable,
  } = useLabStore();

  const turntableRef = useRef<THREE.Group>(null);
  const finishConfig = COATING_FINISHES[selectedCoatingFinish] || COATING_FINISHES.CLEAR_GLOSS;
  const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;
  const isWafer = selectedMaterial === 'SILICON';

  const bbox = useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);

  // Local coordinates relative to station position [0, 0, -12.5]
  const sprayNozzle: [number, number, number] = [0.85, 1.15, 0.9];
  const workpieceCenter: [number, number, number] = [0, 0.94, 0];

  // Dynamic animation frame: Turntable rotation + Spray coverage progression + Curing progression
  useFrame((_, delta) => {
    // 1. Turntable rotation
    if (turntableRef.current && isTurntableRotating) {
      turntableRef.current.rotation.y += delta * 0.65;
    }

    // 2. Hold spray progression
    if (isSpraying && coatingCoverage < 100) {
      setCoatingCoverage(coatingCoverage + delta * 24.0);
    }

    // 3. UV Curing progression
    if (isCuring && curingProgress < 100) {
      setCuringProgress(curingProgress + delta * 25.0);
    }
  });

  // Interpolated surface color and roughness based on coating coverage
  const t = coatingCoverage / 100;
  const blendedColor = useMemo(() => {
    const c1 = new THREE.Color(matConfig.color);
    const c2 = new THREE.Color(finishConfig.color);
    return c1.lerp(c2, t);
  }, [matConfig.color, finishConfig.color, t]);

  const blendedRoughness = matConfig.roughness * (1 - t) + finishConfig.roughness * t;
  const blendedMetalness = matConfig.metalness * (1 - t) + finishConfig.metalness * t;

  return (
    <group position={[0, 0, 0]}>
      {/* =========================================================================
          1. WATER CURTAIN SPRAY BOOTH CHAMBER (Back wall, Exhaust Hood & Cascade)
         ========================================================================= */}
      <group position={[0, 0, -2.4]}>
        {/* Stainless Steel Back Wall Structure */}
        <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 4.5, 0.3]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Cascading Water Curtain Face (Reflective water sheet) */}
        <mesh position={[0, 1.8, 0.16]} receiveShadow>
          <planeGeometry args={[4.2, 3.4]} />
          <meshStandardMaterial
            color="#0284c7"
            metalness={0.3}
            roughness={0.08}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Water Basin Reservoir at bottom */}
        <mesh position={[0, 0.2, 0.35]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.4, 0.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Top Heavy Exhaust Hood & Louvers */}
        <mesh position={[0, 4.0, 0.4]} castShadow>
          <boxGeometry args={[4.6, 0.8, 1.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Dual Stainless Exhaust Ventilation Ducts going up to ceiling */}
        {[-1.2, 1.2].map((x) => (
          <mesh key={`duct-${x}`} position={[x, 4.4, 0.4]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.8, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}

        {/* Side Clear Tempered Glass Baffles */}
        {[-2.25, 2.25].map((x) => (
          <mesh key={`baffle-${x}`} position={[x, 1.8, 0.8]} castShadow>
            <boxGeometry args={[0.08, 3.4, 1.6]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.1}
            />
          </mesh>
        ))}

        {/* Booth Signboard */}
        <group position={[0, 3.8, 1.02]}>
          <Text
            fontSize={0.16}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            WATER-WASH SPRAY COATING BOOTH
          </Text>
        </group>
      </group>

      {/* =========================================================================
          2. MOTORIZED ROTATING TURNTABLE PLATFORM
         ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Base Sturdy Pedestal */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.48, 0.76, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Safety Yellow Striped Hazard Border on Floor around Turntable */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
          <ringGeometry args={[1.2, 1.35, 48]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Motorized Rotating Disc with Spoke Arms */}
        <group ref={turntableRef} position={[0, 0.78, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.7, 0.7, 0.04, 64]} />
            <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.18} />
          </mesh>

          {/* 4 Radial Workpiece Support Slats */}
          {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map((ang, aIdx) => (
            <mesh key={`slat-${aIdx}`} rotation={[0, ang, 0]} position={[0, 0.03, 0]} castShadow>
              <boxGeometry args={[1.3, 0.02, 0.04]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* =====================================================================
              THE WORKPIECE (Blends color and roughness as it gets coated)
             ===================================================================== */}
          <group position={[0, 0.05, 0]}>
            {isWafer ? (
              <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.55, 0.55, 0.025, 48]} />
                <meshStandardMaterial
                  color={blendedColor}
                  roughness={blendedRoughness}
                  metalness={blendedMetalness}
                  emissive={finishConfig.emissive && curingProgress > 20 ? finishConfig.emissive : undefined}
                  emissiveIntensity={
                    finishConfig.emissive && curingProgress > 20
                      ? finishConfig.emissiveIntensity! * (curingProgress / 100)
                      : 0
                  }
                />
              </mesh>
            ) : (
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.1, 0.04, 0.75]} />
                <meshStandardMaterial
                  color={blendedColor}
                  roughness={blendedRoughness}
                  metalness={blendedMetalness}
                  emissive={finishConfig.emissive && curingProgress > 20 ? finishConfig.emissive : undefined}
                  emissiveIntensity={
                    finishConfig.emissive && curingProgress > 20
                      ? finishConfig.emissiveIntensity! * (curingProgress / 100)
                      : 0
                  }
                />
              </mesh>
            )}

            {/* Carved toolpaths visible on surface */}
            <group position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              {currentToolpaths.map((stroke, sIdx) => {
                if (stroke.length < 2) return null;
                const pointsFlat: number[] = [];
                stroke.forEach(([px, py]) => {
                  pointsFlat.push(px * 0.45, py * 0.28, 0);
                });
                return (
                  <line key={`coat-stroke-${sIdx}`}>
                    <bufferGeometry>
                      <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(pointsFlat), 3]}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial
                      color={coatingCoverage > 80 ? finishConfig.color : '#0f172a'}
                      linewidth={2}
                    />
                  </line>
                );
              })}
            </group>
          </group>
        </group>
      </group>

      {/* =========================================================================
          3. PNEUMATIC SPRAY GUN & ROBOTIC/ARTICULATED MOUNT
         ========================================================================= */}
      <group position={sprayNozzle}>
        {/* Support Arm Column */}
        <mesh position={[0, -0.6, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Spray Gun Body angled towards turntable */}
        <group rotation={[0.2, 0.8, -0.1]}>
          {/* Main Chrome Body */}
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.16, 0.22]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Paint Gravity Cup on Top */}
          <mesh position={[0, 0.16, 0.04]} castShadow>
            <cylinderGeometry args={[0.06, 0.04, 0.18, 24]} />
            <meshStandardMaterial color={finishConfig.color} roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Chrome Spray Air Cap & Fluid Nozzle */}
          <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.035, 0.08, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Pressure Gauge */}
          <mesh position={[0.05, 0.05, 0.02]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>

      {/* Realistic Spray Mist Particles firing towards workpiece */}
      <SprayMistParticles
        sprayOrigin={sprayNozzle}
        sprayTarget={workpieceCenter}
        color={finishConfig.color}
        active={isSpraying}
      />

      {/* =========================================================================
          4. OVERHEAD UV CURING & IR BAKING HEATER ARRAY
         ========================================================================= */}
      <group position={[0, 2.6, 0]}>
        {/* Suspended Aluminum Fixture Body */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.12, 1.2]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* 4 Suspension Wire Cables */}
        {[-0.8, 0.8].map((x) =>
          [-0.5, 0.5].map((z) => (
            <mesh key={`wire-${x}-${z}`} position={[x, 0.95, z]}>
              <cylinderGeometry args={[0.005, 0.005, 1.9, 8]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))
        )}

        {/* Dual High-Power UV LED Array Strip Panels */}
        <mesh position={[0, -0.065, 0]}>
          <planeGeometry args={[1.6, 1.0]} />
          <meshStandardMaterial
            color={isCuring ? '#a855f7' : '#334155'}
            emissive={isCuring ? '#c084fc' : '#000000'}
            emissiveIntensity={isCuring ? 2.5 : 0}
            roughness={0.2}
          />
        </mesh>

        {/* UV Curing Overhead Point Light Glow */}
        {isCuring && (
          <pointLight
            position={[0, -0.2, 0]}
            color="#c084fc"
            intensity={4.5}
            distance={5.0}
            decay={2}
          />
        )}
      </group>

      {/* =========================================================================
          5. TOUCHSCREEN CONTROL CONSOLE & FORMULATION TERMINAL
         ========================================================================= */}
      <group position={[2.4, 0, 1.2]} rotation={[0, -0.6, 0]}>
        {/* Angled Stand Pedestal */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.35, 1.1, 0.35]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Angled Touchscreen Display Terminal */}
        <group position={[0, 1.15, 0]} rotation={[-0.4, 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.75, 0.5, 0.08]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Screen Face */}
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.7, 0.45]} />
            <meshStandardMaterial
              color="#090d16"
              emissive="#06b6d4"
              emissiveIntensity={0.15}
              roughness={0.2}
            />
          </mesh>

          {/* Console Text Information */}
          <group position={[0, 0.12, 0.05]}>
            <Text fontSize={0.035} color="#38bdf8" anchorX="center" anchorY="middle">
              COATING CONTROL CONSOLE
            </Text>
            <Text
              position={[0, -0.07, 0]}
              fontSize={0.026}
              color="#f8fafc"
              anchorX="center"
              anchorY="middle"
            >
              {`SƠN: ${finishConfig.name.slice(0, 24)}...`}
            </Text>
            <Text
              position={[0, -0.13, 0]}
              fontSize={0.028}
              color={coatingCoverage >= 100 ? '#34d399' : '#fbbf24'}
              anchorX="center"
              anchorY="middle"
            >
              {`ĐỘ PHỦ: ${coatingCoverage.toFixed(0)}% • SẤY UV: ${curingProgress.toFixed(0)}%`}
            </Text>
          </group>
        </group>
      </group>
    </group>
  );
}
