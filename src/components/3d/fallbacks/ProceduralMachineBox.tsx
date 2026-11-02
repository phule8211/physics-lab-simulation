import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { MachineId } from '../../../types/lab';
import { useLabStore } from '../../../store/useLabStore';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { buildToolpathIndex, interpolateToolpathPoint, computeBoundingBox } from '../../../data/vectorDesigns';
import { CO2LaserBeam } from '../visual-effects/CO2LaserBeam';
import { UVLaserBeam } from '../visual-effects/UVLaserBeam';
import { GalvoMirrorBeam } from '../visual-effects/GalvoMirrorBeam';
import { SprayCoatingBooth } from './SprayCoatingBooth';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

interface StationProps {
  id: MachineId;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function ProceduralStation({ id, position, rotation = [0, 0, 0] }: StationProps) {
  const isHovered = useLabStore((state) => state.hoveredStationId === id);
  const isSelected = useLabStore((state) => state.activeStationId === id);

  return (
    <group position={position} rotation={rotation}>
      {/* Visual outline/highlight ring on floor when hovered */}
      {isHovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[2.0, 2.15, 32]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Render the specific machine model based on ID */}
      {id === 'CO2_LASER' && <CO2LaserMachine isSelected={isSelected} />}
      {id === 'UV_LASER' && <UVLaserMachine isSelected={isSelected} />}
      {id === 'FIBER_LASER' && <FiberLaserMachine isSelected={isSelected} />}
      {id === 'SENSOR_STATION' && <SensorStationBench isSelected={isSelected} />}
      {id === 'COATING_STATION' && <SprayCoatingBooth />}
    </group>
  );
}

/**
 * 1. CO2 LASER CUTTER MESH WITH HINGED CANOPY, INTERLOCK SENSOR, MATERIAL BED & VECTOR CUT TOOLPATH
 */
function CO2LaserMachine({ isSelected }: { isSelected: boolean }) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const selectedMaterial = useLabStore((state) => state.selectedMaterial);
  const isCuttingJob = useLabStore((state) => state.isCuttingJob);
  const cutProgress = useLabStore((state) => state.cutProgress);
  const setCutProgress = useLabStore((state) => state.setCutProgress);
  const currentToolpaths = useLabStore((state) => state.currentToolpaths);
  const currentDesignName = useLabStore((state) => state.currentDesignName);
  const processMode = useLabStore((state) => state.processMode);
  const isFraming = useLabStore((state) => state.isFraming);

  const gantryRef = useRef<THREE.Group>(null);
  const carriageRef = useRef<THREE.Group>(null);
  const lidPivotRef = useRef<THREE.Group>(null);
  const leftStrutRef = useRef<THREE.Group>(null);
  const rightStrutRef = useRef<THREE.Group>(null);

  const [coords, setCoords] = useState({ x: 0, z: 0 });

  const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;
  const matInteraction = matConfig.interactions.CO2_LASER;

  // Build G-code toolpath index & compute framing bounding box
  const bbox = useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);
  const { segments, totalLength } = useMemo(() => {
    return buildToolpathIndex(currentToolpaths);
  }, [currentToolpaths]);

  useFrame(({ clock }, delta) => {
    // 1. Smooth Canopy Lid Opening / Closing Kinematics
    if (lidPivotRef.current) {
      const targetLidAngle = isLidOpen ? -1.15 : 0; // -66 degrees open
      lidPivotRef.current.rotation.x = THREE.MathUtils.lerp(
        lidPivotRef.current.rotation.x,
        targetLidAngle,
        delta * 7
      );
    }

    // 2. Gas Strut Piston Extension & Rotation
    const lidAngle = lidPivotRef.current ? Math.abs(lidPivotRef.current.rotation.x) : 0;
    if (leftStrutRef.current && rightStrutRef.current) {
      const strutScale = 1.0 + lidAngle * 0.45;
      leftStrutRef.current.scale.set(1, strutScale, 1);
      rightStrutRef.current.scale.set(1, strutScale, 1);
    }

    // 3. Exact Vector G-Code Toolpath Interpolation
    if (isCuttingJob && !isLidOpen) {
      if (cutProgress < 100) {
        setCutProgress(Math.min(100, cutProgress + delta * 12.0));
      }

      const pt = interpolateToolpathPoint(segments, totalLength, cutProgress / 100);
      const targetX = pt[0] * 0.65;
      const targetZ = -pt[1] * 0.38;

      if (gantryRef.current) gantryRef.current.position.z = targetZ;
      if (carriageRef.current) carriageRef.current.position.x = targetX;
      setCoords({ x: targetX, z: targetZ });
    } else if (isFraming && !isLidOpen) {
      // Rapid frame trace around the 4 corners of the bounding box
      const t = (clock.getElapsedTime() * 1.5) % 1;
      let fx = 0, fz = 0;
      if (t < 0.25) {
        const u = t / 0.25;
        fx = bbox.minX + (bbox.maxX - bbox.minX) * u;
        fz = bbox.minY;
      } else if (t < 0.5) {
        const u = (t - 0.25) / 0.25;
        fx = bbox.maxX;
        fz = bbox.minY + (bbox.maxY - bbox.minY) * u;
      } else if (t < 0.75) {
        const u = (t - 0.5) / 0.25;
        fx = bbox.maxX - (bbox.maxX - bbox.minX) * u;
        fz = bbox.maxY;
      } else {
        const u = (t - 0.75) / 0.25;
        fx = bbox.minX;
        fz = bbox.maxY - (bbox.maxY - bbox.minY) * u;
      }
      const targetX = fx * 0.65;
      const targetZ = -fz * 0.38;
      if (gantryRef.current) gantryRef.current.position.z = targetZ;
      if (carriageRef.current) carriageRef.current.position.x = targetX;
      setCoords({ x: targetX, z: targetZ });
    } else if (isRunning && !isLidOpen) {
      // Idle demo toolpath
      const t = clock.getElapsedTime() * 0.8;
      const idleX = Math.sin(t) * 0.2;
      const idleZ = Math.cos(t * 0.8) * 0.15;

      if (gantryRef.current) gantryRef.current.position.z = idleZ;
      if (carriageRef.current) carriageRef.current.position.x = idleX;
      setCoords({ x: idleX, z: idleZ });
    }
  });

  return (
    <group>
      {/* Heavy Steel Machine Base & Stand */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.8, 1.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 4 Rubber Vibration Damper Feet */}
      {[-1.2, 1.2].map((x) =>
        [-0.75, 0.75].map((z) => (
          <mesh key={`foot-${x}-${z}`} position={[x, 0.05, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Honeycomb Cutting Bed */}
      <mesh position={[0, 0.82, 0]} receiveShadow>
        <boxGeometry args={[2.2, 0.04, 1.4]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* =========================================================================
          DYNAMIC WORKPIECE ON BED (Reflects selected material)
         ========================================================================= */}
      <group position={[0, 0.845, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[1.6, 0.015, 1.0]} />
          <meshStandardMaterial
            color={matConfig.color}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            transparent={matConfig.transparent}
            opacity={matConfig.opacity}
          />
        </mesh>

        {/* Real-Time Carved Kerf / Engraving Vector Paths */}
        {cutProgress > 0.5 && (
          <group position={[0, 0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {currentToolpaths.map((stroke, sIdx) => {
              if (stroke.length < 2) return null;
              const pointsFlat: number[] = [];
              stroke.forEach(([px, py]) => {
                pointsFlat.push(px * 0.65, py * 0.38, 0);
              });
              return (
                <line key={`kerf-${sIdx}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(pointsFlat), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial
                    color={
                      cutProgress < 100
                        ? '#f59e0b'
                        : processMode === 'CUT'
                        ? '#020617'
                        : '#1e293b'
                    }
                    linewidth={processMode === 'CUT' ? 3 : 2}
                  />
                </line>
              );
            })}

            {/* Design Title Tag on Workpiece Surface */}
            <SafeText
              position={[0, -0.42, 0.001]}
              fontSize={0.035}
              color={cutProgress < 100 ? '#f59e0b' : '#475569'}
              anchorX="center"
              anchorY="bottom"
            >
              {`G-CODE: ${currentDesignName.toUpperCase()} [${processMode === 'CUT' ? 'CẮT' : 'KHẮC'} ${cutProgress.toFixed(0)}%]`}
            </SafeText>
          </group>
        )}

        {/* Dynamic Framing Bounding Box on Workpiece Surface */}
        {isFraming && (
          <group position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array([
                      bbox.minX * 0.65, bbox.minY * 0.38, 0,
                      bbox.maxX * 0.65, bbox.minY * 0.38, 0,
                      bbox.maxX * 0.65, bbox.maxY * 0.38, 0,
                      bbox.minX * 0.65, bbox.maxY * 0.38, 0,
                      bbox.minX * 0.65, bbox.minY * 0.38, 0,
                    ]),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#ef4444" linewidth={3} />
            </line>
          </group>
        )}
      </group>

      {/* Rear CO2 Glass Tube Enclosure Chamber */}
      <mesh position={[0, 1.05, -0.7]} castShadow>
        <boxGeometry args={[2.5, 0.35, 0.3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Glowing CO2 Glass Plasma Tube inside chamber */}
      <mesh position={[0, 1.05, -0.7]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 16]} />
        <meshStandardMaterial
          color="#d946ef"
          emissive="#d946ef"
          emissiveIntensity={isRunning && !isLidOpen ? 2.5 : 0.1}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* High-Voltage Electrodes on Tube Ends */}
      {[-1.0, 1.0].map((x) => (
        <mesh key={`electrode-${x}`} position={[x, 1.05, -0.7]}>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      ))}

      {/* Gantry Beam Group (Moves along Z axis) */}
      <group ref={gantryRef} position={[0, 0.95, coords.z]}>
        {/* Gantry Crossbeam */}
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.08, 0.1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Mirror 2 Housing on Gantry Right Edge */}
        <mesh position={[1.1, 0.1, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>

        {/* Laser Carriage Head (Moves along X axis on Gantry) */}
        <group ref={carriageRef} position={[coords.x, 0, 0]}>
          {/* Carriage mount bracket */}
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>

          {/* Mirror 3 Housing (45 deg angle) */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} />
          </mesh>

          {/* Golden ZnSe Lens Barrel & Nozzle */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.02, 0.14, 16]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.15} />
          </mesh>
        </group>
      </group>

      {/* Real-Time Optical 3-Mirror Laser Beam System & Sparks */}
      <CO2LaserBeam gantryZ={coords.z} carriageX={coords.x} bedY={0.85} />

      {/* Red Aiming Pilot Diode Guide Laser Beam during Framing */}
      {isFraming && !isLidOpen && (
        <group position={[coords.x, 0, coords.z]}>
          <mesh position={[0, 0.895, 0]}>
            <cylinderGeometry args={[0.0015, 0.0015, 0.09, 8]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, 0.852, 0]}>
            <sphereGeometry args={[0.006, 12, 12]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          OPTICAL SAFETY INTERLOCK MICROSWITCH SENSOR (Front-Right Frame)
         ========================================================================= */}
      <group position={[1.22, 0.88, 0.7]}>
        {/* Switch Body */}
        <mesh castShadow>
          <boxGeometry args={[0.05, 0.06, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>

        {/* Interlock Status LED Indicator */}
        <mesh position={[0, 0.035, 0]}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshStandardMaterial
            color={isLidOpen ? '#ef4444' : '#10b981'}
            emissive={isLidOpen ? '#ef4444' : '#10b981'}
            emissiveIntensity={isLidOpen ? 3.0 : 1.8}
          />
        </mesh>

        {/* Floating text label for the interlock switch */}
        <SafeText
          position={[0, 0.09, 0]}
          fontSize={0.035}
          color={isLidOpen ? '#ef4444' : '#10b981'}
          anchorX="center"
          anchorY="bottom"
        >
          {isLidOpen ? 'INTERLOCK [TRIPPED]' : 'INTERLOCK [ARMED]'}
        </SafeText>
      </group>

      {/* =========================================================================
          HINGED CANOPY LID MECHANISM (Pivots along rear hinge Z = -0.7, Y = 1.35)
         ========================================================================= */}
      <group ref={lidPivotRef} position={[0, 1.35, -0.7]}>
        {/* Canopy Window Box (Offset forward from hinge) */}
        <mesh position={[0, -0.15, 0.72]} castShadow>
          <boxGeometry args={[2.5, 0.42, 1.55]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Protective Aluminum Perimeter Frame */}
        <mesh position={[0, -0.36, 0.72]}>
          <boxGeometry args={[2.52, 0.04, 1.57]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Heavy Front Ergonomic Chrome Handle Bar */}
        <group position={[0, -0.34, 1.53]}>
          {/* Main horizontal grip */}
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 1.4, 16]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.95} roughness={0.1} />
          </mesh>
          {/* Left bracket */}
          <mesh position={[-0.6, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
          {/* Right bracket */}
          <mesh position={[0.6, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
        </group>

        {/* Interlock Magnet Contact on front-right lid rim */}
        <mesh position={[1.22, -0.36, 1.4]}>
          <boxGeometry args={[0.04, 0.03, 0.06]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
      </group>

      {/* Left Gas Lift Damper Strut */}
      <group ref={leftStrutRef} position={[-1.26, 0.9, -0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.25, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.99} roughness={0.05} />
        </mesh>
      </group>

      {/* Right Gas Lift Damper Strut */}
      <group ref={rightStrutRef} position={[1.26, 0.9, -0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.25, 12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.99} roughness={0.05} />
        </mesh>
      </group>

      {/* Digital DSP Controller Screen & Buttons */}
      <group position={[1.25, 0.88, 0.6]} rotation={[-0.4, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.25, 0.18, 0.04]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.02, 0.025]}>
          <planeGeometry args={[0.18, 0.1]} />
          <meshBasicMaterial color={isCuttingJob ? '#10b981' : '#06b6d4'} />
        </mesh>
        <mesh position={[0.08, -0.05, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
      </group>

      {/* Floating 3D Station Identifier */}
      <SafeText
        position={[0, 2.1, 0]}
        fontSize={0.2}
        color="#06b6d4"
        anchorX="center"
        anchorY="bottom"
      >
        MÁY CẮT LASER CO2 (10.6 µm)
      </SafeText>
    </group>
  );
}

/**
 * 2. UV LASER COLD ENGRAVER MESH WITH VERTICAL SLIDING DOOR & WAFER STAGE
 */
function UVLaserMachine({ isSelected }: { isSelected: boolean }) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const selectedMaterial = useLabStore((state) => state.selectedMaterial);
  const isCuttingJob = useLabStore((state) => state.isCuttingJob);
  const cutProgress = useLabStore((state) => state.cutProgress);
  const setCutProgress = useLabStore((state) => state.setCutProgress);
  const currentToolpaths = useLabStore((state) => state.currentToolpaths);
  const currentDesignName = useLabStore((state) => state.currentDesignName);
  const processMode = useLabStore((state) => state.processMode);

  const doorRef = useRef<THREE.Group>(null);
  const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.SILICON;

  useFrame((_, delta) => {
    // Vertical Sliding Protective Viewport Door Kinematics
    if (doorRef.current) {
      const targetY = isLidOpen ? 1.72 : 1.25; // Slides vertically upwards
      doorRef.current.position.y = THREE.MathUtils.lerp(
        doorRef.current.position.y,
        targetY,
        delta * 7
      );
    }

    if (isRunning && !isLidOpen) {
      if (cutProgress < 100) {
        setCutProgress(Math.min(100, cutProgress + delta * 12.0));
      }
    }
  });

  return (
    <group>
      {/* Cleanroom Vibration-Isolated Base Table */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 1.6]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Enclosed UV Shielding Chamber Structure */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 1.3]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Interior Chamber Lighting */}
      <pointLight
        position={[0, 1.5, 0]}
        intensity={isLidOpen ? 1.5 : 0.8}
        color="#a855f7"
        distance={2.5}
      />

      {/* High-Precision Semiconductor Wafer Stage */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* =========================================================================
          DYNAMIC SPECIMEN ON WAFER STAGE (Silicon Wafer or Chosen Material)
         ========================================================================= */}
      <group position={[0, 0.98, 0]}>
        {selectedMaterial === 'SILICON' ? (
          // Mirror-Polished Silicon Wafer Disc
          <mesh receiveShadow castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.005, 32]} />
            <meshStandardMaterial
              color="#1e1b4b"
              metalness={0.98}
              roughness={0.03}
            />
          </mesh>
        ) : (
          // Substrate chip of the selected material
          <mesh receiveShadow castShadow>
            <boxGeometry args={[0.3, 0.008, 0.3]} />
            <meshStandardMaterial
              color={matConfig.color}
              metalness={matConfig.metalness}
              roughness={matConfig.roughness}
              transparent={matConfig.transparent}
              opacity={matConfig.opacity}
            />
          </mesh>
        )}

        {/* Photochemical Cold Ablation Etched Custom Vector Paths */}
        {cutProgress > 0.5 && (
          <group position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {currentToolpaths.map((stroke, sIdx) => {
              if (stroke.length < 2) return null;
              const pointsFlat: number[] = [];
              stroke.forEach(([px, py]) => {
                pointsFlat.push(px * 0.12, py * 0.12, 0);
              });
              return (
                <line key={`uv-kerf-${sIdx}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(pointsFlat), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial
                    color={cutProgress < 100 ? '#c084fc' : '#a855f7'}
                    linewidth={1.5}
                  />
                </line>
              );
            })}

            {/* Design Title Tag on UV Wafer Surface */}
            <SafeText
              position={[0, -0.15, 0.001]}
              fontSize={0.016}
              color={cutProgress < 100 ? '#c084fc' : '#8b5cf6'}
              anchorX="center"
              anchorY="bottom"
            >
              {`UV-CHIP: ${currentDesignName.toUpperCase()} [${cutProgress.toFixed(0)}%]`}
            </SafeText>
          </group>
        )}
      </group>

      {/* DPSS 355nm UV Laser Head inside chamber */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.2, 16]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Integrated UV Laser Beam Effect */}
      <UVLaserBeam position={[0, 1.45, 0]} waferY={0.985} />

      {/* =========================================================================
          VERTICAL SLIDING SHIELDING DOOR (Slides vertically along guide rails)
         ========================================================================= */}
      <group ref={doorRef} position={[0, 1.25, 0.66]}>
        {/* Dark UV Protective Green Glass Viewport */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.5, 0.03]} />
          <meshStandardMaterial
            color="#065f46"
            roughness={0.1}
            metalness={0.3}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Viewport Frame */}
        <mesh>
          <boxGeometry args={[1.24, 0.54, 0.02]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Door Pull Handle */}
        <mesh position={[0, -0.22, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 16]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.9} />
        </mesh>
      </group>

      {/* Vertical Guide Rails on left & right */}
      {[-0.64, 0.64].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 1.45, 0.66]}>
          <boxGeometry args={[0.03, 0.8, 0.04]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
      ))}

      {/* Industrial 3-Tier Status Tower Light (Red/Amber/Green) */}
      <group position={[0.85, 1.7, -0.5]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={isLidOpen ? 2.5 : 0.1}
          />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#10b981"
            emissiveIntensity={isRunning && !isLidOpen ? 2.0 : 0.2}
          />
        </mesh>
      </group>

      {/* Floating 3D Station Identifier */}
      <SafeText
        position={[0, 2.1, 0]}
        fontSize={0.2}
        color="#8b5cf6"
        anchorX="center"
        anchorY="bottom"
      >
        MÁY KHẮC LASER UV (355 nm)
      </SafeText>
    </group>
  );
}

/**
 * 3. FIBER / GALVO LASER ENGRAVER MESH WITH SWING FIXTURE CLAMP & M6 BREADBOARD
 */
function FiberLaserMachine({ isSelected }: { isSelected: boolean }) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const isLidOpen = useLabStore((state) => state.isLidOpen);
  const selectedMaterial = useLabStore((state) => state.selectedMaterial);
  const cutProgress = useLabStore((state) => state.cutProgress);
  const setCutProgress = useLabStore((state) => state.setCutProgress);
  const currentToolpaths = useLabStore((state) => state.currentToolpaths);
  const currentDesignName = useLabStore((state) => state.currentDesignName);
  const processMode = useLabStore((state) => state.processMode);

  const clampRef = useRef<THREE.Group>(null);
  const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.STEEL;

  useFrame((_, delta) => {
    // Swing Fixture Clamp Kinematics
    if (clampRef.current) {
      const targetClampAngle = isLidOpen ? -0.85 : 0; // Rotates up when opened
      clampRef.current.rotation.z = THREE.MathUtils.lerp(
        clampRef.current.rotation.z,
        targetClampAngle,
        delta * 7
      );
    }

    if (isRunning && !isLidOpen) {
      if (cutProgress < 100) {
        setCutProgress(Math.min(100, cutProgress + delta * 15.0));
      }
    }
  });

  return (
    <group>
      {/* Aluminum Profile Workbench with Honeycomb Storage */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.9, 1.4]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* M6 Optical Breadboard Tabletop (Anodized Aluminum with Holes pattern) */}
      <mesh position={[0, 0.92, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.05, 1.1]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Precision Column Z-Axis (Vertical tower with ruler scale) */}
      <mesh position={[-0.45, 1.4, -0.25]} castShadow>
        <boxGeometry args={[0.15, 1.0, 0.15]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Manual Height Adjusting Wheel on Top */}
      <mesh position={[-0.45, 1.95, -0.25]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>

      {/* Galvo Head Armature & Scanning Enclosure */}
      <mesh position={[0, 1.5, -0.05]} castShadow>
        <boxGeometry args={[0.2, 0.22, 0.45]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* F-Theta Scan Lens Cone */}
      <mesh position={[0, 1.32, 0.1]}>
        <cylinderGeometry args={[0.07, 0.05, 0.12, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* =========================================================================
          DYNAMIC SPECIMEN CARD ON BREADBOARD (Titanium / Brass / Selected Material)
         ========================================================================= */}
      <group position={[0, 0.95, 0.1]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.25, 0.01, 0.18]} />
          <meshStandardMaterial
            color={matConfig.color}
            metalness={matConfig.metalness}
            roughness={matConfig.roughness}
            transparent={matConfig.transparent}
            opacity={matConfig.opacity}
          />
        </mesh>

        {/* Real-Time Annealed / Engraved Custom Vector Paths */}
        {cutProgress > 0.5 && (
          <group position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {currentToolpaths.map((stroke, sIdx) => {
              if (stroke.length < 2) return null;
              const pointsFlat: number[] = [];
              stroke.forEach(([px, py]) => {
                pointsFlat.push(px * 0.09, py * 0.06, 0);
              });
              return (
                <line key={`fiber-kerf-${sIdx}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(pointsFlat), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial
                    color={cutProgress < 100 ? '#f59e0b' : '#0f172a'}
                    linewidth={1.5}
                  />
                </line>
              );
            })}

            {/* Design Title Tag on Metal Specimen */}
            <SafeText
              position={[0, -0.072, 0.001]}
              fontSize={0.012}
              color={cutProgress < 100 ? '#f59e0b' : '#475569'}
              anchorX="center"
              anchorY="bottom"
            >
              {`CNC: ${currentDesignName.toUpperCase()} [${cutProgress.toFixed(0)}%]`}
            </SafeText>
          </group>
        )}
      </group>

      {/* Precision Fixture Clamp Bar (Pivots open to load specimen) */}
      <group ref={clampRef} position={[-0.15, 0.96, 0.1]}>
        <mesh position={[0.15, 0.015, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.03]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} />
        </mesh>
      </group>

      {/* Integrated High-Speed Vector Scanning Beam & Spark Burst */}
      <GalvoMirrorBeam scannerY={1.32} workpieceY={0.955} />

      {/* Floor Foot Pedal Switch */}
      <mesh position={[0, 0.03, 0.6]} castShadow>
        <boxGeometry args={[0.15, 0.05, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Floating 3D Station Identifier */}
      <SafeText
        position={[0, 2.15, 0]}
        fontSize={0.2}
        color="#f59e0b"
        anchorX="center"
        anchorY="bottom"
      >
        MÁY KHẮC LASER FIBER (1064 nm)
      </SafeText>
    </group>
  );
}

/**
 * 4. SAFETY SENSORS TEST BENCH MESH WITH LIVE TELEMETRY BADGES & FAULT ALARM BEACON
 */
function SensorStationBench({ isSelected }: { isSelected: boolean }) {
  const isRunning = useLabStore((state) => state.isMachineRunning);
  const sampleTemperature = useLabStore((state) => state.sampleTemperature);
  const chillerFlowRate = useLabStore((state) => state.chillerFlowRate);
  const smokeDensity = useLabStore((state) => state.smokeDensity);
  const isAlarmBuzzerActive = useLabStore((state) => state.isAlarmBuzzerActive);

  const turbine = useRef<THREE.Group>(null);
  const smokeLed = useRef<THREE.Mesh>(null);
  const alarmBeacon = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (isRunning) {
      if (turbine.current) {
        // Speed proportional to flow rate
        const speed = Math.max(0, chillerFlowRate) * 3.5;
        turbine.current.rotation.y = t * speed;
      }
      if (smokeLed.current) {
        const mat = smokeLed.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = smokeDensity > 60 ? 3.0 + Math.sin(t * 18) * 2.0 : 1.0 + Math.sin(t * 4) * 0.5;
      }
    }
    if (alarmBeacon.current) {
      const beaconMat = alarmBeacon.current.material as THREE.MeshStandardMaterial;
      if (isAlarmBuzzerActive) {
        beaconMat.emissiveIntensity = Math.sin(t * 20) > 0 ? 4.0 : 0.2;
      } else {
        beaconMat.emissiveIntensity = 0.1;
      }
    }
  });

  const isTempTripped = sampleTemperature > 95;
  const isFlowTripped = chillerFlowRate < 2.0;
  const isSmokeTripped = smokeDensity > 60;

  return (
    <group>
      {/* Electronics Workbench Table */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 1.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ESD Anti-Static Blue Rubber Mat */}
      <mesh position={[0, 0.91, 0]} receiveShadow>
        <boxGeometry args={[2.0, 0.02, 1.2]} />
        <meshStandardMaterial color="#0284c7" roughness={0.7} />
      </mesh>

      {/* =========================================================================
          SENSOR 1 (LEFT): NON-CONTACT IR THERMAL PYROMETER (MLX90614)
         ========================================================================= */}
      <group position={[-0.65, 1.0, 0.1]}>
        {/* Sensor Body Aluminum Block */}
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.14, 0.16]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Germanium Optical Filter Lens Cone */}
        <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Dynamic IR Field-of-View Cone */}
        <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.13, 0.28, 16]} />
          <meshBasicMaterial
            color={isTempTripped ? '#ef4444' : '#f59e0b'}
            wireframe
            transparent
            opacity={isRunning ? (isTempTripped ? 0.8 : 0.4) : 0.1}
          />
        </mesh>
        {/* Mounting Standoff Pillar */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Dedicated Angled Telemetry Nameplate */}
        <group position={[0, 0.25, 0]} rotation={[-0.32, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.14, 0.015]} />
            <meshStandardMaterial color="#0b1120" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.40, 0.12]} />
            <meshBasicMaterial color={isTempTripped ? '#450a0a' : '#030712'} />
          </mesh>
          <SafeText position={[0, 0.032, 0.012]} fontSize={0.034} color="#94a3b8" anchorX="center" anchorY="middle">
            IR THERMAL MLX90614
          </SafeText>
          <SafeText
            position={[0, -0.024, 0.012]}
            fontSize={0.048}
            color={isTempTripped ? '#ef4444' : sampleTemperature > 60 ? '#f59e0b' : '#10b981'}
            anchorX="center"
            anchorY="middle"
          >
            {`${sampleTemperature.toFixed(1)} °C ${isTempTripped ? '⚠️ TRIP' : '[OK]'}`}
          </SafeText>
        </group>
      </group>

      {/* =========================================================================
          SENSOR 2 (CENTER): CHILLER WATER FLOW SENSOR WITH HALL TURBINE
         ========================================================================= */}
      <group position={[0, 1.0, 0.1]}>
        {/* Acrylic Transparent Tube */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.065, 0.065, 0.42, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.45}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        {/* Rotating Impeller Turbine */}
        <group ref={turbine}>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={`blade-${i}`} rotation={[0, (i * Math.PI) / 2, 0]}>
              <boxGeometry args={[0.08, 0.016, 0.01]} />
              <meshStandardMaterial color={isFlowTripped ? '#dc2626' : '#ef4444'} />
            </mesh>
          ))}
        </group>
        {/* Hall Effect Pickup Block */}
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* Mounting Standoff Pillar */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Dedicated Angled Telemetry Nameplate */}
        <group position={[0, 0.28, 0]} rotation={[-0.32, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.14, 0.015]} />
            <meshStandardMaterial color="#0b1120" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.40, 0.12]} />
            <meshBasicMaterial color={isFlowTripped ? '#450a0a' : '#030712'} />
          </mesh>
          <SafeText position={[0, 0.032, 0.012]} fontSize={0.034} color="#94a3b8" anchorX="center" anchorY="middle">
            CHILLER FLOW (HALL)
          </SafeText>
          <SafeText
            position={[0, -0.024, 0.012]}
            fontSize={0.048}
            color={isFlowTripped ? '#ef4444' : chillerFlowRate < 3.0 ? '#f59e0b' : '#38bdf8'}
            anchorX="center"
            anchorY="middle"
          >
            {`${chillerFlowRate.toFixed(1)} L/min ${isFlowTripped ? '⚠️ TRIP' : '[OK]'}`}
          </SafeText>
        </group>
      </group>

      {/* =========================================================================
          SENSOR 3 (RIGHT): PHOTOELECTRIC OPTICAL SMOKE DETECTOR (TYNDALL)
         ========================================================================= */}
      <group position={[0.65, 1.0, 0.1]}>
        {/* Smoke Chamber Outer Disk */}
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Labyrinth Baffle Cap */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.092, 0.092, 0.02, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Optical Sensor Status Indicator LED */}
        <mesh ref={smokeLed} position={[0, 0.05, 0.05]}>
          <sphereGeometry args={[0.014, 16, 16]} />
          <meshStandardMaterial
            color={isSmokeTripped ? '#ef4444' : '#10b981'}
            emissive={isSmokeTripped ? '#ef4444' : '#10b981'}
            emissiveIntensity={isRunning ? 2.5 : 0.2}
          />
        </mesh>
        {/* Mounting Standoff Pillar */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        {/* Dedicated Angled Telemetry Nameplate */}
        <group position={[0, 0.25, 0]} rotation={[-0.32, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.14, 0.015]} />
            <meshStandardMaterial color="#0b1120" roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <planeGeometry args={[0.40, 0.12]} />
            <meshBasicMaterial color={isSmokeTripped ? '#450a0a' : '#030712'} />
          </mesh>
          <SafeText position={[0, 0.032, 0.012]} fontSize={0.034} color="#94a3b8" anchorX="center" anchorY="middle">
            TYNDALL SMOKE SENSOR
          </SafeText>
          <SafeText
            position={[0, -0.024, 0.012]}
            fontSize={0.048}
            color={isSmokeTripped ? '#ef4444' : smokeDensity > 30 ? '#f59e0b' : '#10b981'}
            anchorX="center"
            anchorY="middle"
          >
            {`${smokeDensity.toFixed(0)} ppm ${isSmokeTripped ? '⚠️ TRIP' : '[OK]'}`}
          </SafeText>
        </group>
      </group>

      {/* =========================================================================
          CENTRAL DIGITAL MULTI-METER CONSOLE & FLASHING ALARM BEACON
         ========================================================================= */}
      <group position={[0, 1.25, -0.3]}>
        {/* Console Box */}
        <mesh>
          <boxGeometry args={[0.85, 0.42, 0.22]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* LCD Screen Display */}
        <mesh position={[0, 0, 0.112]}>
          <planeGeometry args={[0.72, 0.32]} />
          <meshBasicMaterial color={isAlarmBuzzerActive ? '#450a0a' : '#022c22'} />
        </mesh>
        <SafeText
          position={[0, 0.08, 0.115]}
          fontSize={0.055}
          color={isFlowTripped ? '#ef4444' : '#10b981'}
          anchorX="center"
          anchorY="middle"
        >
          {`CHILLER: ${chillerFlowRate.toFixed(1)} L/min [${chillerFlowRate >= 2.0 ? 'NORMAL' : 'FAULT: LOW FLOW'}]`}
        </SafeText>
        <SafeText
          position={[0, 0.0, 0.115]}
          fontSize={0.055}
          color={isTempTripped ? '#ef4444' : '#06b6d4'}
          anchorX="center"
          anchorY="middle"
        >
          {`TEMP: ${sampleTemperature.toFixed(1)} °C [${sampleTemperature <= 95 ? 'NORMAL' : 'FAULT: OVERHEAT'}]`}
        </SafeText>
        <SafeText
          position={[0, -0.08, 0.115]}
          fontSize={0.055}
          color={isSmokeTripped ? '#ef4444' : '#a855f7'}
          anchorX="center"
          anchorY="middle"
        >
          {`SMOKE: ${smokeDensity.toFixed(0)} ppm [${smokeDensity <= 60 ? 'NORMAL' : 'FAULT: HEAVY SMOKE'}]`}
        </SafeText>

        {/* Flashing Emergency Alarm Strobe Beacon */}
        <group position={[0, 0.25, 0]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.06, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          <mesh ref={alarmBeacon} position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={isAlarmBuzzerActive ? 4.0 : 0.1}
              transparent
              opacity={0.9}
            />
          </mesh>
          {isAlarmBuzzerActive && (
            <pointLight position={[0, 0.15, 0]} intensity={4.0} color="#ef4444" distance={5} />
          )}
        </group>
      </group>

      {/* Floating 3D Station Identifier */}
      <SafeText
        position={[0, 2.15, 0]}
        fontSize={0.2}
        color={isAlarmBuzzerActive ? '#ef4444' : '#10b981'}
        anchorX="center"
        anchorY="bottom"
      >
        CỤM CẢM BIẾN AN TOÀN XƯỞNG
      </SafeText>
    </group>
  );
}
