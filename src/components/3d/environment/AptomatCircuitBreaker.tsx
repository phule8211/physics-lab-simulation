import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';
import { Zap, Power } from 'lucide-react';

interface BaseBreakerBoxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isOn: boolean;
  onToggle: () => void;
  title: string;
  subTitle: string;
  tagLabel: string;
  code: string;
}

function BaseIndustrialBreakerBox({
  position = [-2.4, 1.55, -7.88],
  rotation = [0, 0, 0],
  isOn,
  onToggle,
  title,
  subTitle,
  tagLabel,
  code,
}: BaseBreakerBoxProps) {
  const [hovered, setHovered] = useState(false);
  const leverRef = useRef<THREE.Group>(null);
  const targetAngle = isOn ? -0.45 : 0.45;

  useFrame((_, delta) => {
    if (leverRef.current) {
      leverRef.current.rotation.x = THREE.MathUtils.damp(
        leverRef.current.rotation.x,
        targetAngle,
        15,
        delta
      );
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
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
        onToggle();
      }}
    >
      {/* 1. Cabinet body */}
      <mesh castShadow receiveShadow position={[0, 0, 0.06]}>
        <boxGeometry args={[0.34, 0.46, 0.12]} />
        <meshStandardMaterial
          color={hovered ? '#e2e8f0' : '#cbd5e1'}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* Outer beveled frame rim */}
      <mesh position={[0, 0, 0.125]}>
        <boxGeometry args={[0.36, 0.48, 0.02]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Recessed DIN Rail compartment */}
      <mesh position={[0, 0.02, 0.122]}>
        <boxGeometry args={[0.28, 0.36, 0.02]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* DIN Rail */}
      <mesh position={[0, 0.04, 0.134]}>
        <boxGeometry args={[0.26, 0.035, 0.008]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 2. Main Breaker Body */}
      <group position={[-0.04, 0.04, 0.17]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.15, 0.075]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* Status indicator window (Red = ON; Green = OFF) */}
        <mesh position={[0, 0.045, 0.038]}>
          <planeGeometry args={[0.04, 0.015]} />
          <meshBasicMaterial color={isOn ? '#ef4444' : '#22c55e'} />
        </mesh>

        {/* Operating Toggle Lever */}
        <group ref={leverRef} position={[0, 0.01, 0.038]}>
          <mesh position={[0, 0, 0.022]} castShadow>
            <boxGeometry args={[0.08, 0.028, 0.025]} />
            <meshStandardMaterial
              color={isOn ? '#dc2626' : '#475569'}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.085, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} />
          </mesh>
        </group>

        {/* Technical Label Print on Breaker Face */}
        <mesh position={[0, -0.045, 0.038]}>
          <planeGeometry args={[0.08, 0.025]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
      </group>

      {/* Auxiliary 1P Breaker */}
      <group position={[0.065, 0.04, 0.17]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.15, 0.075]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        <mesh position={[0, isOn ? 0.02 : -0.01, 0.045]}>
          <boxGeometry args={[0.025, 0.02, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* 3. Pilot Lights & Labels */}
      <group position={[0, 0.17, 0.125]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
          <meshStandardMaterial
            color={isOn ? '#22c55e' : '#ef4444'}
            emissive={isOn ? '#22c55e' : '#ef4444'}
            emissiveIntensity={isOn ? 3.0 : 2.0}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          position={[0, 0, 0.04]}
          color={isOn ? '#22c55e' : '#ef4444'}
          intensity={0.6}
          distance={0.8}
        />
      </group>

      {/* High Voltage Label */}
      <group position={[0, -0.15, 0.125]}>
        <mesh>
          <planeGeometry args={[0.18, 0.045]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.17, 0.038]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.4} />
        </mesh>
      </group>

      {/* Protective Transparent Door */}
      <mesh position={[0.15, 0, 0.22]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.32, 0.44, 0.01]} />
        <meshPhysicalMaterial
          color="#94a3b8"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1.0}
        />
      </mesh>

      {/* 4. Floating 3D Interactive HUD */}
      <Html position={[0, 0.38, 0.12]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none"
        >
          <div
            className={`glass-panel px-3.5 py-2 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/90 ${
              isOn
                ? 'border-emerald-500/70 hover:border-emerald-400 hover:shadow-emerald-500/30'
                : 'border-rose-500/70 hover:border-rose-400 hover:shadow-rose-500/30'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                isOn
                  ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-400 animate-pulse'
                  : 'bg-rose-500/20 border-rose-500/70 text-rose-400'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  {title}
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {code}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isOn
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isOn ? 'BẬT (ON)' : 'NGẮT (OFF)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Nhấn để {isOn ? 'Ngắt điện' : 'Đóng điện'} {tagLabel}
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

/**
 * Aptomat 1: Điều khiển 4 Đèn LED Dài Xưởng
 */
export function AptomatCircuitBreaker(props: { position?: [number, number, number]; rotation?: [number, number, number] }) {
  const { isAptomatOn, toggleAptomat } = useLabStore();
  return (
    <BaseIndustrialBreakerBox
      position={props.position || [-2.4, 1.55, -7.88]}
      rotation={props.rotation}
      isOn={isAptomatOn}
      onToggle={toggleAptomat}
      title="Aptomat 4 Đèn Dài"
      subTitle="4 cụm đèn LED tuýp xưởng"
      tagLabel="4 đèn LED dài"
      code="CB-01"
    />
  );
}

/**
 * Aptomat 2: Điều khiển 8 Đèn Âm Trần (Cleanroom Troffer)
 * Đặt ngay bên cạnh Aptomat 1 trên tường phía Bắc
 */
export function CeilingLampsAptomatBreaker(props: { position?: [number, number, number]; rotation?: [number, number, number] }) {
  const { isCeilingLampsAptomatOn, toggleCeilingLampsAptomat } = useLabStore();
  return (
    <BaseIndustrialBreakerBox
      position={props.position || [-1.95, 1.55, -7.88]}
      rotation={props.rotation}
      isOn={isCeilingLampsAptomatOn}
      onToggle={toggleCeilingLampsAptomat}
      title="Aptomat 8 Đèn Trần"
      subTitle="8 cụm đèn âm trần cleanroom"
      tagLabel="8 đèn âm trần"
      code="CB-02"
    />
  );
}
