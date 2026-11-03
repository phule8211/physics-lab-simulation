import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { MachineId } from '../../../types/lab';
import { useLabStore } from '../../../store/useLabStore';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

interface MachinePowerSwitchProps {
  stationId: MachineId;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

/**
 * 3D Heavy-Duty Industrial Master Power Disconnect Switch (Công Tắc Nguồn Máy Tầng 1)
 * Features:
 * - High-visibility yellow/red safety rotary lock switch knob
 * - Dual-color status pilot lamp (Bright Green = ON, Red = OFF)
 * - Click interaction with audio relay feedback and state toggle in useLabStore
 * - Hover elevation and floating technical status label
 */
export function MachinePowerSwitch({
  stationId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
}: MachinePowerSwitchProps) {
  const [hovered, setHovered] = useState(false);
  const isPowered = useLabStore((state) => state.machinePower[stationId] ?? true);
  const toggleMachinePower = useLabStore((state) => state.toggleMachinePower);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        toggleMachinePower(stationId);
      }}
    >
      {/* 1. Industrial NEMA Enclosure Faceplate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.28, 0.04]} />
        <meshStandardMaterial
          color={hovered ? '#334155' : '#1e293b'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Outer Yellow Safety Hazard Border Trim */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[0.235, 0.295, 0.03]} />
        <meshStandardMaterial color="#eab308" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* 4 Corner Machine Screws */}
      {[
        [-0.09, 0.11],
        [0.09, 0.11],
        [-0.09, -0.11],
        [0.09, -0.11],
      ].map(([sx, sy], i) => (
        <mesh key={`screw-${i}`} position={[sx, sy, 0.021]}>
          <cylinderGeometry args={[0.008, 0.008, 0.004, 8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
      ))}

      {/* Engraved Header Nameplate */}
      <mesh position={[0, 0.09, 0.021]}>
        <planeGeometry args={[0.18, 0.036]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <SafeText
        position={[0, 0.09, 0.023]}
        fontSize={0.016}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
      >
        MAIN POWER
      </SafeText>

      {/* 2. Rotary Switch Dial Base Ring with Angle Gauge */}
      <group position={[0, -0.015, 0.022]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.055, 0.058, 0.015, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Dial Face Label "0 - OFF" (Left) and "1 - ON" (Right) */}
        <SafeText position={[-0.042, -0.002, 0.01]} fontSize={0.014} color="#ef4444" anchorX="center" anchorY="middle">
          OFF
        </SafeText>
        <SafeText position={[0.042, -0.002, 0.01]} fontSize={0.014} color="#22c55e" anchorX="center" anchorY="middle">
          ON
        </SafeText>

        {/* Rotary Switch Knob: Red heavy-duty handle rotated by state */}
        <group rotation={[0, 0, isPowered ? -Math.PI / 4 : Math.PI / 4]}>
          {/* Central knob cylinder */}
          <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.024, 20]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* T-Bar Grip Lever */}
          <mesh position={[0, 0, 0.032]}>
            <boxGeometry args={[0.024, 0.082, 0.018]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.15} />
          </mesh>
          {/* Pointer indicator line on knob */}
          <mesh position={[0, 0.038, 0.042]}>
            <boxGeometry args={[0.006, 0.022, 0.004]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* 3. Pilot Status Indicator Lamp (Đèn Báo Nguồn LED) */}
      <group position={[0, -0.095, 0.022]}>
        {/* Metal bezel ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.02, 0.008, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Lens Dome */}
        <mesh position={[0, 0, 0.006]}>
          <sphereGeometry args={[0.014, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={isPowered ? '#22c55e' : '#ef4444'}
            emissive={isPowered ? '#22c55e' : '#ef4444'}
            emissiveIntensity={isPowered ? 3.0 : 1.2}
            toneMapped={false}
          />
        </mesh>
        {/* Point light casting subtle glow when powered */}
        <pointLight
          position={[0, 0, 0.03]}
          intensity={isPowered ? 0.35 : 0.08}
          distance={0.8}
          color={isPowered ? '#22c55e' : '#ef4444'}
        />
      </group>

      {/* 4. Hover Floating HUD Tooltip */}
      {hovered && (
        <group position={[0, 0.22, 0.08]}>
          <mesh>
            <boxGeometry args={[0.42, 0.09, 0.01]} />
            <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.006]}>
            <boxGeometry args={[0.43, 0.1, 0.008]} />
            <meshBasicMaterial color={isPowered ? '#22c55e' : '#ef4444'} />
          </mesh>
          <SafeText
            position={[0, 0.016, 0.008]}
            fontSize={0.026}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {isPowered ? '⚡ NGUỒN: ĐANG BẬT' : '⛔ NGUỒN: ĐANG TẮT'}
          </SafeText>
          <SafeText
            position={[0, -0.02, 0.008]}
            fontSize={0.018}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            [Click chuột để {isPowered ? 'Tắt' : 'Bật'} nguồn]
          </SafeText>
        </group>
      )}
    </group>
  );
}
