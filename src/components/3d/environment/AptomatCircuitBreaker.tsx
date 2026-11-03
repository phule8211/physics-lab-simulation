import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';
import { Zap, Power, ShieldAlert } from 'lucide-react';

interface AptomatCircuitBreakerProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Industrial Aptomat / MCB (Miniature Circuit Breaker) Switch Box:
 * Mounted on the wall to control the 4 Long Industrial LED Tube Lights
 * and main workshop lighting grid.
 */
export function AptomatCircuitBreaker({
  position = [-2.4, 1.55, -7.88], // On North Wall beside the entrance airlock door
  rotation = [0, 0, 0],
}: AptomatCircuitBreakerProps) {
  const { isAptomatOn, toggleAptomat } = useLabStore();
  const [hovered, setHovered] = useState(false);

  // Smooth animated lever angle
  const leverRef = useRef<THREE.Group>(null);
  const targetAngle = isAptomatOn ? -0.45 : 0.45; // -0.45 rad (Up = ON), 0.45 rad (Down = OFF)

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
        toggleAptomat();
      }}
    >
      {/* =========================================================================
          1. INDUSTRIAL MODULAR DISTRIBUTION ENCLOSURE (HỘP TỦ ĐIỆN GẮN TƯỜNG)
         ========================================================================= */}
      {/* Base mounting backplate / cabinet body */}
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

      {/* Galvanized DIN Rail 35mm */}
      <mesh position={[0, 0.04, 0.134]}>
        <boxGeometry args={[0.26, 0.035, 0.008]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* =========================================================================
          2. MAIN APTOMAT / MCB BREAKER MODULE (APTOMAT TỔNG 3P C63)
         ========================================================================= */}
      <group position={[-0.04, 0.04, 0.17]}>
        {/* Main Breaker Body (Standard White Polycarbonate MCB housing) */}
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.15, 0.075]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.05} />
        </mesh>

        {/* Status indicator window (Red = I / Closed Circuit / ON; Green = O / Tripped / OFF) */}
        <mesh position={[0, 0.045, 0.038]}>
          <planeGeometry args={[0.04, 0.015]} />
          <meshBasicMaterial color={isAptomatOn ? '#ef4444' : '#22c55e'} />
        </mesh>

        {/* Operating Toggle Lever (Cần gạt đóng/ngắt Aptomat) */}
        <group ref={leverRef} position={[0, 0.01, 0.038]}>
          {/* Lever handle bar */}
          <mesh position={[0, 0, 0.022]} castShadow>
            <boxGeometry args={[0.08, 0.028, 0.025]} />
            <meshStandardMaterial
              color={isAptomatOn ? '#dc2626' : '#475569'}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
          {/* Lever hinge pin */}
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

      {/* Auxiliary 1P Breaker (Sub-circuit for Control Relays) */}
      <group position={[0.065, 0.04, 0.17]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, 0.15, 0.075]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
        </mesh>
        {/* Smaller sub-lever */}
        <mesh position={[0, isAptomatOn ? 0.02 : -0.01, 0.045]}>
          <boxGeometry args={[0.025, 0.02, 0.02]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* =========================================================================
          3. PILOT LIGHTS & SAFETY LABELS
         ========================================================================= */}
      {/* Power Pilot Indicator LED Lamp */}
      <group position={[0, 0.17, 0.125]}>
        {/* Pilot Lamp Bezel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing Pilot Lens */}
        <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.008, 16]} />
          <meshStandardMaterial
            color={isAptomatOn ? '#22c55e' : '#ef4444'}
            emissive={isAptomatOn ? '#22c55e' : '#ef4444'}
            emissiveIntensity={isAptomatOn ? 3.0 : 2.0}
            toneMapped={false}
          />
        </mesh>
        {/* Subtle point light cast onto the box */}
        <pointLight
          position={[0, 0, 0.04]}
          color={isAptomatOn ? '#22c55e' : '#ef4444'}
          intensity={0.6}
          distance={0.8}
        />
      </group>

      {/* Danger High Voltage Triangle Warning Plaque */}
      <group position={[0, -0.15, 0.125]}>
        <mesh>
          <planeGeometry args={[0.18, 0.045]} />
          <meshStandardMaterial color="#eab308" roughness={0.3} />
        </mesh>
        {/* Black accent border */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[0.17, 0.038]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.4} />
        </mesh>
      </group>

      {/* Semi-transparent Smoky Polycarbonate Protective Door (Slightly Ajar) */}
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

      {/* =========================================================================
          4. FLOATING 3D INTERACTIVE HUD BILLBOARD
         ========================================================================= */}
      <Html position={[0, 0.38, 0.12]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleAptomat();
          }}
          className="cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none"
        >
          <div
            className={`glass-panel px-3.5 py-2 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/90 ${
              isAptomatOn
                ? 'border-emerald-500/70 hover:border-emerald-400 hover:shadow-emerald-500/30'
                : 'border-rose-500/70 hover:border-rose-400 hover:shadow-rose-500/30'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                isAptomatOn
                  ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-400 animate-pulse'
                  : 'bg-rose-500/20 border-rose-500/70 text-rose-400'
              }`}
            >
              <Zap className="w-4 h-4" />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Aptomat Tổng MCB 63A
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    isAptomatOn
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isAptomatOn ? 'BẬT (ON)' : 'NGẮT (OFF)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Nhấn để {isAptomatOn ? 'Ngắt điện' : 'Đóng điện'} 4 đèn LED xưởng
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
