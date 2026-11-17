import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';

interface SafetyGearVisualizerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

export function SafetyGearVisualizer({
  position = [-2.5, 0, 5.8],
  rotation = [0, 0, 0],
}: SafetyGearVisualizerProps) {
  const rootRef = useRef<THREE.Group>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);

  // Store state
  const activeStationId = useLabStore((s) => s.activeStationId);
  const hoveredStationId = useLabStore((s) => s.hoveredStationId);
  const isCuttingJob = useLabStore((s) => s.isCuttingJob);
  const interlockTriggered = useLabStore((s) => s.interlockTriggered);
  const operatorPPE = useLabStore((s: any) => s.operatorPPE) ?? {
    gogglesWavelength: '1064nm',
    glovesESD: true,
    hardhat: true,
    coatCleanroom: true,
  };

  const isESDGloves = operatorPPE?.glovesESD !== false;

  // Determine current laser hazard wavelength requirement
  const currentStation = activeStationId || hoveredStationId;
  const isClass4LaserActive = isCuttingJob && currentStation !== 'COATING_STATION' && currentStation !== 'SENSOR_STATION';

  // Check optical safety compliance
  const isPPECompliant = useMemo(() => {
    if (!currentStation) return true;
    if (currentStation === 'CO2_LASER' && operatorPPE?.gogglesWavelength !== '10.6um' && operatorPPE?.gogglesWavelength !== 'all-wavelength') {
      return false;
    }
    if (currentStation === 'UV_LASER' && operatorPPE?.gogglesWavelength !== '355nm' && operatorPPE?.gogglesWavelength !== 'all-wavelength') {
      return false;
    }
    if (currentStation === 'FIBER_LASER' && operatorPPE?.gogglesWavelength !== '1064nm' && operatorPPE?.gogglesWavelength !== 'all-wavelength') {
      return false;
    }
    return true;
  }, [currentStation, operatorPPE]);

  // Materials
  const stainlessSteelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.92,
        roughness: 0.18,
      }),
    []
  );

  const signBoardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f172a',
        metalness: 0.2,
        roughness: 0.4,
      }),
    []
  );

  const testPlateMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        metalness: 0.98,
        roughness: 0.08,
      }),
    []
  );

  // Animated Beacon & LED pulsing
  useFrame((state) => {
    if (beaconLightRef.current) {
      const time = state.clock.getElapsedTime();
      if (!isPPECompliant && isClass4LaserActive) {
        // Flashing amber/red warning beacon
        const flash = Math.sin(time * 12) > 0 ? 1.5 : 0.1;
        beaconLightRef.current.intensity = flash * 2.0;
        beaconLightRef.current.color.set('#ef4444');
      } else {
        // Calm steady emerald cleanroom beacon
        beaconLightRef.current.intensity = 0.6;
        beaconLightRef.current.color.set('#10b981');
      }
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} name="SafetyGearVisualizer">
      {/* =======================================================================
          1. STAINLESS STEEL INDUSTRIAL STAND (Base, Upright Pillar, Arms)
         ======================================================================= */}
      {/* Heavy Circular Weighted Floor Base */}
      <mesh position={[0, 0.02, 0]} material={stainlessSteelMaterial}>
        <cylinderGeometry args={[0.32, 0.35, 0.04, 32]} />
      </mesh>

      {/* Vertical Support Column */}
      <mesh position={[0, 0.9, 0]} material={stainlessSteelMaterial}>
        <cylinderGeometry args={[0.035, 0.035, 1.76, 24]} />
      </mesh>

      {/* Top Warning Signboard Frame */}
      <mesh position={[0, 1.82, 0]} material={stainlessSteelMaterial}>
        <boxGeometry args={[0.72, 0.38, 0.03]} />
      </mesh>
      {/* High-Contrast Signboard Faceplate */}
      <mesh position={[0, 1.82, 0.016]} material={signBoardMaterial}>
        <boxGeometry args={[0.68, 0.34, 0.005]} />
      </mesh>

      {/* Signboard Text Annotations */}
      <SafeText
        position={[0, 1.92, 0.02]}
        fontSize={0.032}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        MANDATORY PPE STATION
      </SafeText>
      <SafeText
        position={[0, 1.85, 0.02]}
        fontSize={0.02}
        color="#facc15"
        anchorX="center"
        anchorY="middle"
      >
        CLASS 4 LASER SAFETY COMPLIANCE
      </SafeText>
      <SafeText
        position={[0, 1.78, 0.02]}
        fontSize={0.016}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        ISO 11553-1 / ANSI Z136.1 / EN 207 OD7+
      </SafeText>

      {/* Top Safety Status Beacon Dome */}
      <group position={[0, 2.05, 0]}>
        <mesh
          material={
            new THREE.MeshStandardMaterial({
              color: isPPECompliant ? '#10b981' : '#ef4444',
              emissive: isPPECompliant ? '#10b981' : '#ef4444',
              emissiveIntensity: 1.8,
              toneMapped: false,
              transparent: true,
              opacity: 0.85,
            })
          }
        >
          <cylinderGeometry args={[0.045, 0.055, 0.09, 16]} />
        </mesh>
        <pointLight
          ref={beaconLightRef}
          distance={4.0}
          decay={2}
          color={isPPECompliant ? '#10b981' : '#ef4444'}
        />
      </group>

      {/* =======================================================================
          2. GOGGLE DISPLAY STORAGE RACK (Gold 10.6um, Amber 355nm, Green 1064nm)
         ======================================================================= */}
      {/* Horizontal Hanging Arm */}
      <mesh position={[0, 1.48, 0.06]} rotation={[0, 0, Math.PI / 2]} material={stainlessSteelMaterial}>
        <cylinderGeometry args={[0.012, 0.012, 0.62, 16]} />
      </mesh>

      {/* Goggle 1: CO2 Laser 10.6 µm (Gold reflective dielectric lens) */}
      <group position={[-0.2, 1.42, 0.1]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 })}>
          <boxGeometry args={[0.13, 0.038, 0.035]} />
        </mesh>
        <mesh
          position={[0, 0, 0.018]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#fef08a',
              metalness: 0.85,
              roughness: 0.08,
              transparent: true,
              opacity: 0.65,
            })
          }
        >
          <boxGeometry args={[0.11, 0.03, 0.005]} />
        </mesh>
        <SafeText position={[0, -0.03, 0]} fontSize={0.013} color="#fef08a" anchorX="center">
          CO2 10.6µm
        </SafeText>
      </group>

      {/* Goggle 2: UV Laser 355 nm (Amber/Orange optical filter) */}
      <group position={[0, 1.42, 0.1]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 })}>
          <boxGeometry args={[0.13, 0.038, 0.035]} />
        </mesh>
        <mesh
          position={[0, 0, 0.018]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#f97316',
              emissive: '#ea580c',
              emissiveIntensity: 0.2,
              transparent: true,
              opacity: 0.72,
              roughness: 0.08,
            })
          }
        >
          <boxGeometry args={[0.11, 0.03, 0.005]} />
        </mesh>
        <SafeText position={[0, -0.03, 0]} fontSize={0.013} color="#f97316" anchorX="center">
          UV 355nm
        </SafeText>
      </group>

      {/* Goggle 3: Fiber Laser 1064 nm (Emerald green optical filter) */}
      <group position={[0.2, 1.42, 0.1]}>
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6 })}>
          <boxGeometry args={[0.13, 0.038, 0.035]} />
        </mesh>
        <mesh
          position={[0, 0, 0.018]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#10b981',
              emissive: '#059669',
              emissiveIntensity: 0.25,
              transparent: true,
              opacity: 0.7,
              roughness: 0.08,
            })
          }
        >
          <boxGeometry args={[0.11, 0.03, 0.005]} />
        </mesh>
        <SafeText position={[0, -0.03, 0]} fontSize={0.013} color="#10b981" anchorX="center">
          FIBER 1064nm
        </SafeText>
      </group>

      {/* =======================================================================
          3. ESD WRIST STRAP & FOOTWEAR CONTINUITY TESTER
         ======================================================================= */}
      <group position={[0, 1.1, 0.05]}>
        {/* Tester Chassis Box */}
        <mesh material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 })}>
          <boxGeometry args={[0.28, 0.22, 0.09]} />
        </mesh>

        {/* Stainless Steel Hand Touch Test Electrode */}
        <mesh position={[0, 0.01, 0.048]} material={testPlateMaterial}>
          <cylinderGeometry args={[0.045, 0.045, 0.008, 24]} />
        </mesh>

        {/* Status LEDs */}
        {/* Green PASS LED */}
        <mesh
          position={[-0.07, 0.065, 0.048]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#22c55e',
              emissive: '#22c55e',
              emissiveIntensity: 2.2,
              toneMapped: false,
            })
          }
        >
          <sphereGeometry args={[0.009, 12, 12]} />
        </mesh>
        <SafeText position={[-0.07, 0.088, 0.048]} fontSize={0.012} color="#22c55e" anchorX="center">
          PASS
        </SafeText>

        {/* Red FAIL LED */}
        <mesh
          position={[0.07, 0.065, 0.048]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#ef4444',
              emissive: '#ef4444',
              emissiveIntensity: 0.3,
            })
          }
        >
          <sphereGeometry args={[0.009, 12, 12]} />
        </mesh>
        <SafeText position={[0.07, 0.088, 0.048]} fontSize={0.012} color="#94a3b8" anchorX="center">
          HIGH RES
        </SafeText>

        {/* LCD Resistance Value Display */}
        <mesh
          position={[0, -0.06, 0.048]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#064e3b',
              emissive: '#064e3b',
              emissiveIntensity: 0.8,
            })
          }
        >
          <planeGeometry args={[0.2, 0.035]} />
        </mesh>
        <SafeText
          position={[0, -0.06, 0.05]}
          fontSize={0.015}
          color="#34d399"
          anchorX="center"
          anchorY="middle"
        >
          {isESDGloves ? '0.85 MΩ [ESD OK]' : 'OVER-LIMIT [INSULATED]'}
        </SafeText>
      </group>

      {/* =======================================================================
          4. CLEANROOM GLOVE DISPENSER CADDY (ESD Blue vs Kevlar Yellow)
         ======================================================================= */}
      <group position={[0, 0.65, 0.04]}>
        {/* Support Shelf */}
        <mesh material={stainlessSteelMaterial}>
          <boxGeometry args={[0.48, 0.018, 0.22]} />
        </mesh>

        {/* Blue ESD Nitrile Glove Box */}
        <group position={[-0.12, 0.08, 0]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.5 })}>
            <boxGeometry args={[0.18, 0.13, 0.14]} />
          </mesh>
          <SafeText
            position={[0, 0.02, 0.072]}
            fontSize={0.016}
            color="#ffffff"
            anchorX="center"
          >
            ESD NITRILE
          </SafeText>
          <SafeText
            position={[0, -0.02, 0.072]}
            fontSize={0.011}
            color="#bae6fd"
            anchorX="center"
          >
            10^6 - 10^9 Ω
          </SafeText>
        </group>

        {/* Yellow Kevlar/Nomex Thermal Glove Box */}
        <group position={[0.12, 0.08, 0]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.6 })}>
            <boxGeometry args={[0.18, 0.13, 0.14]} />
          </mesh>
          <SafeText
            position={[0, 0.02, 0.072]}
            fontSize={0.016}
            color="#0f172a"
            anchorX="center"
          >
            KEVLAR HEAT
          </SafeText>
          <SafeText
            position={[0, -0.02, 0.072]}
            fontSize={0.011}
            color="#713f12"
            anchorX="center"
          >
            500°C SHIELD
          </SafeText>
        </group>
      </group>

      {/* =======================================================================
          5. LIVE OPERATOR PPE STATUS HOLOGRAPHIC FLOATING HUD BADGE
         ======================================================================= */}
      <group position={[0, 2.3, 0]}>
        <mesh
          material={
            new THREE.MeshStandardMaterial({
              color: '#030712',
              transparent: true,
              opacity: 0.82,
              roughness: 0.2,
            })
          }
        >
          <planeGeometry args={[0.82, 0.28]} />
        </mesh>
        <SafeText
          position={[0, 0.09, 0.005]}
          fontSize={0.024}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          OPERATOR PPE STATUS
        </SafeText>
        <SafeText
          position={[-0.35, 0.03, 0.005]}
          fontSize={0.018}
          color="#f1f5f9"
          anchorX="left"
          anchorY="middle"
        >
          • Goggles: OD7+ @ {operatorPPE?.gogglesWavelength || '1064nm'}
        </SafeText>
        <SafeText
          position={[-0.35, -0.03, 0.005]}
          fontSize={0.018}
          color={isESDGloves ? '#38bdf8' : '#eab308'}
          anchorX="left"
          anchorY="middle"
        >
          • Gloves: {isESDGloves ? 'ESD Anti-Static' : 'Nomex Thermal Shield'}
        </SafeText>
        <SafeText
          position={[-0.35, -0.09, 0.005]}
          fontSize={0.018}
          color={isPPECompliant ? '#34d399' : '#f87171'}
          anchorX="left"
          anchorY="middle"
        >
          • Compliance: {isPPECompliant ? 'PASS (READY FOR LASER JOB)' : 'WARNING: WAVELENGTH MISMATCH!'}
        </SafeText>
      </group>
    </group>
  );
}

export default SafetyGearVisualizer;
