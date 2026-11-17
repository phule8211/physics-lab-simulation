import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';
import { MachineId } from '../../../types/lab';

interface LabEngineerNPCProps {
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

export function LabEngineerNPC({
  position = [-2.2, 0, -1.8],
  rotation = [0, Math.PI / 3.5, 0],
}: LabEngineerNPCProps) {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Read active laser station from store to dynamically set goggle optical filter
  const activeStationId = useLabStore((s) => s.activeStationId);
  const hoveredStationId = useLabStore((s) => s.hoveredStationId);
  const isMachineRunning = useLabStore((s) => s.isMachineRunning);
  const isCuttingJob = useLabStore((s) => s.isCuttingJob);

  const effectiveStation = activeStationId || hoveredStationId || 'FIBER_LASER';

  // Dynamic OD7+ Goggle Optical Filter Color Configuration
  const goggleOpticalConfig = useMemo(() => {
    switch (effectiveStation) {
      case 'CO2_LASER':
        return {
          wavelengthLabel: '10.6 µm (CO2)',
          color: '#fef08a', // Gold/Clear reflective dielectric
          emissive: '#eab308',
          emissiveIntensity: 0.15,
          opacity: 0.55,
          metalness: 0.85,
          roughness: 0.08,
          specularShield: 'GOLD OD7+ @ 10600nm',
        };
      case 'UV_LASER':
        return {
          wavelengthLabel: '355 nm (UV)',
          color: '#f97316', // High-contrast amber/orange blocking UV
          emissive: '#ea580c',
          emissiveIntensity: 0.35,
          opacity: 0.72,
          metalness: 0.2,
          roughness: 0.05,
          specularShield: 'AMBER OD7+ @ 355nm',
        };
      case 'COATING_STATION':
        return {
          wavelengthLabel: '395 nm (UV-CURE)',
          color: '#eab308', // Deep yellow/amber
          emissive: '#ca8a04',
          emissiveIntensity: 0.25,
          opacity: 0.7,
          metalness: 0.25,
          roughness: 0.06,
          specularShield: 'AMBER OD6+ @ 395nm',
        };
      case 'FIBER_LASER':
      default:
        return {
          wavelengthLabel: '1064 nm (NIR)',
          color: '#10b981', // Rich emerald green blocking near-IR
          emissive: '#059669',
          emissiveIntensity: 0.28,
          opacity: 0.7,
          metalness: 0.25,
          roughness: 0.05,
          specularShield: 'EMERALD OD7+ @ 1064nm',
        };
    }
  }, [effectiveStation]);

  // Cleanroom materials
  const bunnySuitMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f8fafc', // ISO Class 5 Cleanroom White Tyvek fabric
        roughness: 0.82,
        metalness: 0.05,
      }),
    []
  );

  const cleanroomBlueTrim = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0284c7', // Nitrile blue for gloves and ESD sole trims
        roughness: 0.45,
        metalness: 0.1,
      }),
    []
  );

  const hardhatMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff', // High-gloss cleanroom safety hardhat
        roughness: 0.18,
        metalness: 0.15,
      }),
    []
  );

  const goggleFrameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0f172a', // Matte black wraparound safety frame
        roughness: 0.55,
        metalness: 0.2,
      }),
    []
  );

  const clipboardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#334155', // Anodized aluminum clipboard
        roughness: 0.3,
        metalness: 0.8,
      }),
    []
  );

  // Per-frame inverse kinematic procedural head tracking
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const currentYaw = useRef(0);
  const currentPitch = useRef(0);
  const worldHeadPos = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!headRef.current || !rootRef.current || !chestRef.current) return;

    const time = state.clock.getElapsedTime();
    const camera = state.camera;

    // Get world position of NPC head
    headRef.current.getWorldPosition(worldHeadPos.current);

    // Compute vector from NPC head to camera
    const toCamera = new THREE.Vector3().subVectors(camera.position, worldHeadPos.current);
    const distanceToPlayer = toCamera.length();

    // Idle breathing displacement
    const breathe = Math.sin(time * 1.6) * 0.008;
    chestRef.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.8);

    // Subtle right arm clipboard adjustment
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = 0.85 + Math.sin(time * 0.8) * 0.04;
    }

    // Head tracking logic: within 4.5m, engineer looks at player
    if (distanceToPlayer < 4.5) {
      // Transform direction vector into local NPC space
      const localDir = toCamera.clone();
      const invRootQuat = rootRef.current.quaternion.clone().invert();
      localDir.applyQuaternion(invRootQuat);

      // Compute yaw (horizontal angle) and pitch (vertical angle)
      const yaw = Math.atan2(localDir.x, localDir.z);
      const pitch = -Math.atan2(localDir.y, Math.hypot(localDir.x, localDir.z));

      // Natural biomechanical angle clamps
      targetYaw.current = THREE.MathUtils.clamp(yaw, -Math.PI * 0.42, Math.PI * 0.42);
      targetPitch.current = THREE.MathUtils.clamp(pitch, -Math.PI * 0.22, Math.PI * 0.22);
    } else {
      // Return to neutral lab inspection pose
      targetYaw.current = Math.sin(time * 0.3) * 0.12;
      targetPitch.current = 0.05;
    }

    // Smooth damping
    currentYaw.current = THREE.MathUtils.damp(currentYaw.current, targetYaw.current, 5.0, delta);
    currentPitch.current = THREE.MathUtils.damp(currentPitch.current, targetPitch.current, 5.0, delta);

    headRef.current.rotation.set(currentPitch.current, currentYaw.current, 0, 'YXZ');
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} name="LabEngineerNPC">
      {/* =======================================================================
          1. CLEANROOM BOOTIES & LEGS (Ground up to pelvis)
         ======================================================================= */}
      {/* Left Bootie */}
      <group position={[-0.14, 0, 0]}>
        {/* Blue ESD Sole */}
        <mesh position={[0, 0.02, 0.03]} material={cleanroomBlueTrim}>
          <boxGeometry args={[0.11, 0.04, 0.26]} />
        </mesh>
        {/* White Bootie Upper */}
        <mesh position={[0, 0.1, 0.01]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.065, 0.075, 0.16, 16]} />
        </mesh>
        {/* Left Lower Leg & Calf */}
        <mesh position={[0, 0.32, 0]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.07, 0.065, 0.36, 16]} />
        </mesh>
        {/* Left Thigh */}
        <mesh position={[0, 0.65, 0]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.085, 0.075, 0.42, 16]} />
        </mesh>
      </group>

      {/* Right Bootie */}
      <group position={[0.14, 0, 0]}>
        {/* Blue ESD Sole */}
        <mesh position={[0, 0.02, 0.03]} material={cleanroomBlueTrim}>
          <boxGeometry args={[0.11, 0.04, 0.26]} />
        </mesh>
        {/* White Bootie Upper */}
        <mesh position={[0, 0.1, 0.01]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.065, 0.075, 0.16, 16]} />
        </mesh>
        {/* Right Lower Leg & Calf */}
        <mesh position={[0, 0.32, 0]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.07, 0.065, 0.36, 16]} />
        </mesh>
        {/* Right Thigh */}
        <mesh position={[0, 0.65, 0]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.085, 0.075, 0.42, 16]} />
        </mesh>
      </group>

      {/* =======================================================================
          2. PELVIS & TORSO
         ======================================================================= */}
      {/* Pelvis Coverall */}
      <mesh position={[0, 0.88, 0]} material={bunnySuitMaterial}>
        <cylinderGeometry args={[0.19, 0.175, 0.18, 16]} />
      </mesh>

      {/* Torso & Chest Group (with breathing scaling) */}
      <group ref={chestRef} position={[0, 1.15, 0]}>
        <mesh material={bunnySuitMaterial}>
          <boxGeometry args={[0.38, 0.46, 0.22]} />
        </mesh>

        {/* Front cleanroom zipper placket */}
        <mesh position={[0, 0, 0.112]} material={cleanroomBlueTrim}>
          <boxGeometry args={[0.02, 0.44, 0.005]} />
        </mesh>

        {/* Radiation Dosimeter / Cleanroom Engineer ID Badge */}
        <group position={[-0.1, 0.12, 0.115]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })}>
            <boxGeometry args={[0.075, 0.09, 0.006]} />
          </mesh>
          <mesh position={[0, 0.02, 0.004]} material={cleanroomBlueTrim}>
            <boxGeometry args={[0.065, 0.025, 0.002]} />
          </mesh>
          <SafeText
            position={[0, -0.018, 0.005]}
            fontSize={0.014}
            color="#0f172a"
            anchorX="center"
            anchorY="middle"
          >
            LAB ENG.
          </SafeText>
        </group>
      </group>

      {/* =======================================================================
          3. ARMS & METROLOGY CLIPBOARD
         ======================================================================= */}
      {/* Left Arm: Holding Clipboard */}
      <group position={[-0.24, 1.32, 0]}>
        {/* Shoulder */}
        <mesh position={[-0.04, -0.12, 0.04]} rotation={[0.4, 0, -0.2]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.065, 0.06, 0.26, 16]} />
        </mesh>
        {/* Forearm angled forward holding clipboard */}
        <group position={[-0.08, -0.24, 0.12]} rotation={[1.1, 0.35, -0.4]}>
          <mesh position={[0, -0.12, 0]} material={bunnySuitMaterial}>
            <cylinderGeometry args={[0.055, 0.05, 0.24, 16]} />
          </mesh>
          {/* Blue Nitrile Glove */}
          <mesh position={[0, -0.24, 0]} material={cleanroomBlueTrim}>
            <boxGeometry args={[0.06, 0.035, 0.08]} />
          </mesh>

          {/* Electronic Metrology Clipboard / QC Tablet */}
          <group position={[0.06, -0.24, 0.06]} rotation={[-0.3, 0.4, -0.1]}>
            <mesh material={clipboardMaterial}>
              <boxGeometry args={[0.22, 0.32, 0.012]} />
            </mesh>
            {/* Screen */}
            <mesh
              position={[0, 0, 0.007]}
              material={
                new THREE.MeshStandardMaterial({
                  color: '#0284c7',
                  emissive: '#0284c7',
                  emissiveIntensity: 0.6,
                  roughness: 0.1,
                })
              }
            >
              <planeGeometry args={[0.19, 0.27]} />
            </mesh>
            <SafeText
              position={[0, 0.08, 0.009]}
              fontSize={0.018}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              METROLOGY QC
            </SafeText>
            <SafeText
              position={[0, 0.03, 0.009]}
              fontSize={0.013}
              color="#38bdf8"
              anchorX="center"
              anchorY="middle"
            >
              KERF TOL: ±0.015mm
            </SafeText>
            <SafeText
              position={[0, -0.02, 0.009]}
              fontSize={0.013}
              color="#a7f3d0"
              anchorX="center"
              anchorY="middle"
            >
              {goggleOpticalConfig.specularShield}
            </SafeText>
          </group>
        </group>
      </group>

      {/* Right Arm: Resting naturally at side */}
      <group ref={rightArmRef} position={[0.24, 1.32, 0]}>
        {/* Shoulder */}
        <mesh position={[0.04, -0.12, 0]} rotation={[-0.1, 0, 0.15]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.065, 0.06, 0.26, 16]} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0.08, -0.32, 0.02]} rotation={[0.2, 0, 0.1]} material={bunnySuitMaterial}>
          <cylinderGeometry args={[0.055, 0.05, 0.24, 16]} />
        </mesh>
        {/* Right Nitrile Glove */}
        <mesh position={[0.09, -0.45, 0.03]} material={cleanroomBlueTrim}>
          <boxGeometry args={[0.055, 0.035, 0.08]} />
        </mesh>
      </group>

      {/* =======================================================================
          4. HEAD, HARDHAT, HOOD & DYNAMIC OD7+ GOGGLES (With Inverse Kinematics)
         ======================================================================= */}
      {/* Neck */}
      <mesh position={[0, 1.42, 0]} material={bunnySuitMaterial}>
        <cylinderGeometry args={[0.085, 0.095, 0.12, 16]} />
      </mesh>

      {/* Procedural Head Pivot */}
      <group ref={headRef} position={[0, 1.54, 0]}>
        {/* Cleanroom Hood Cowl Head Base */}
        <mesh material={bunnySuitMaterial}>
          <sphereGeometry args={[0.13, 20, 20]} />
        </mesh>

        {/* Surgical Face Mask */}
        <mesh position={[0, -0.04, 0.11]} rotation={[-0.1, 0, 0]} material={cleanroomBlueTrim}>
          <boxGeometry args={[0.14, 0.075, 0.05]} />
        </mesh>

        {/* Industrial Safety Hardhat */}
        <group position={[0, 0.06, 0]}>
          {/* Hardhat Dome */}
          <mesh material={hardhatMaterial}>
            <sphereGeometry args={[0.148, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          </mesh>
          {/* Hardhat Safety Front Brim */}
          <mesh position={[0, -0.015, 0.09]} rotation={[0.25, 0, 0]} material={hardhatMaterial}>
            <boxGeometry args={[0.18, 0.012, 0.14]} />
          </mesh>
          {/* Hardhat Lamp Clip */}
          <mesh position={[0, 0.03, 0.145]} material={clipboardMaterial}>
            <boxGeometry args={[0.03, 0.03, 0.015]} />
          </mesh>
        </group>

        {/* =====================================================================
            DYNAMIC OD7+ OPTICAL SAFETY GOGGLES (Matching Laser Station Wavelength)
           ===================================================================== */}
        <group position={[0, 0.018, 0.115]}>
          {/* Matte Black Wraparound Safety Frame */}
          <mesh material={goggleFrameMaterial}>
            <boxGeometry args={[0.175, 0.048, 0.032]} />
          </mesh>
          {/* Top Brow Shield */}
          <mesh position={[0, 0.024, 0.005]} material={goggleFrameMaterial}>
            <boxGeometry args={[0.18, 0.008, 0.045]} />
          </mesh>
          {/* Left Opaque Radiation Side Shield */}
          <mesh position={[-0.088, 0, -0.015]} material={goggleFrameMaterial}>
            <boxGeometry args={[0.008, 0.044, 0.05]} />
          </mesh>
          {/* Right Opaque Radiation Side Shield */}
          <mesh position={[0.088, 0, -0.015]} material={goggleFrameMaterial}>
            <boxGeometry args={[0.008, 0.044, 0.05]} />
          </mesh>

          {/* Left Dielectric Laser Filter Lens */}
          <mesh
            position={[-0.042, 0, 0.017]}
            material={
              new THREE.MeshStandardMaterial({
                color: goggleOpticalConfig.color,
                emissive: goggleOpticalConfig.emissive,
                emissiveIntensity: goggleOpticalConfig.emissiveIntensity,
                transparent: true,
                opacity: goggleOpticalConfig.opacity,
                metalness: goggleOpticalConfig.metalness,
                roughness: goggleOpticalConfig.roughness,
              })
            }
          >
            <boxGeometry args={[0.065, 0.038, 0.006]} />
          </mesh>

          {/* Right Dielectric Laser Filter Lens */}
          <mesh
            position={[0.042, 0, 0.017]}
            material={
              new THREE.MeshStandardMaterial({
                color: goggleOpticalConfig.color,
                emissive: goggleOpticalConfig.emissive,
                emissiveIntensity: goggleOpticalConfig.emissiveIntensity,
                transparent: true,
                opacity: goggleOpticalConfig.opacity,
                metalness: goggleOpticalConfig.metalness,
                roughness: goggleOpticalConfig.roughness,
              })
            }
          >
            <boxGeometry args={[0.065, 0.038, 0.006]} />
          </mesh>

          {/* Elastic Goggle Strap around head */}
          <mesh position={[0, 0, -0.08]} material={goggleFrameMaterial}>
            <torusGeometry args={[0.135, 0.008, 8, 24]} />
          </mesh>

          {/* Wavelength Rating Micro-Badge */}
          <SafeText
            position={[0, 0.045, 0.02]}
            fontSize={0.02}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            {goggleOpticalConfig.wavelengthLabel}
          </SafeText>
        </group>
      </group>
    </group>
  );
}

export default LabEngineerNPC;
