import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';
import { Droplets, Waves } from 'lucide-react';

export function LabSinkAndFaucet() {
  const sinkConfig = SECOND_FLOOR_STATIONS.LAB_SINK;
  const { openSinkModal, isSinkModalOpen, isSinkTapRunning, sinkWaterFlowRate } = useLabStore();
  const waterStreamRef = useRef<THREE.Mesh>(null);

  // Animate flowing water stream wobble when tap is on
  useFrame(({ clock }) => {
    if (waterStreamRef.current && isSinkTapRunning) {
      const t = clock.getElapsedTime() * 15;
      const scaleX = 1 + Math.sin(t) * 0.12;
      const scaleZ = 1 + Math.cos(t) * 0.12;
      waterStreamRef.current.scale.set(scaleX, 1, scaleZ);
    }
  });

  return (
    <group
      position={sinkConfig.position}
      rotation={sinkConfig.rotation}
      onClick={(e) => {
        e.stopPropagation();
        openSinkModal();
      }}
    >
      {/* 1. SINK CABINET BASE */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.84, 0.7]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Heavy Chemical-Resistant Composite Countertop */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.42, 0.04, 0.72]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.2} />
      </mesh>

      {/* Ceramic Basin Rim & Basin Void */}
      <mesh position={[0, 0.75, 0.05]} receiveShadow>
        <boxGeometry args={[0.76, 0.22, 0.48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.05} />
      </mesh>

      {/* Inner Basin Floor */}
      <mesh position={[0, 0.65, 0.05]}>
        <planeGeometry args={[0.68, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.2} />
      </mesh>

      {/* Stainless Steel Basin Drain Grate */}
      <mesh position={[0, 0.652, 0.05]}>
        <circleGeometry args={[0.045, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* =========================================================================
          2. GOOSENECK FAUCET & ADJUSTABLE WATER VALVE (VÒI NƯỚC CỔ NGỖNG)
         ========================================================================= */}
      <group position={[0, 0.86, -0.16]}>
        {/* Faucet Base Escutcheon Plate */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.03, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.1} />
        </mesh>

        {/* Vertical Riser Pipe */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.38, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.1} />
        </mesh>

        {/* 180-Degree Gooseneck Arch Curve (Vòi cổ ngỗng uốn cong) */}
        <mesh position={[0, 0.38, 0.08]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.08, 0.014, 16, 24, Math.PI]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.1} />
        </mesh>

        {/* Spout Aerator Tip pointing straight down into sink */}
        <mesh position={[0, 0.33, 0.16]}>
          <cylinderGeometry args={[0.018, 0.016, 0.04, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Rotary Water Flow Control Valve Handle on the right side */}
        <group position={[0.04, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.01, 0.01, 0.03, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} />
          </mesh>
          {/* 4-Prong Cross Handle Valve */}
          <mesh position={[0, 0.02, 0]} rotation={[0, (sinkWaterFlowRate / 100) * Math.PI, 0]}>
            <boxGeometry args={[0.065, 0.012, 0.012]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0]} rotation={[0, (sinkWaterFlowRate / 100) * Math.PI + Math.PI / 2, 0]}>
            <boxGeometry args={[0.065, 0.012, 0.012]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.8} />
          </mesh>
        </group>

        {/* =========================================================================
            3. ANIMATED 3D FLOWING WATER STREAM (DÒNG NƯỚC CHẢY TỪ VÒI)
           ========================================================================= */}
        {isSinkTapRunning && (
          <group position={[0, 0.31, 0.16]}>
            {/* Water Column Jet */}
            <mesh ref={waterStreamRef} position={[0, -0.21, 0]}>
              <cylinderGeometry
                args={[
                  0.007 * (sinkWaterFlowRate / 100),
                  0.012 * (sinkWaterFlowRate / 100),
                  0.42,
                  16,
                ]}
              />
              <meshStandardMaterial
                color="#67e8f9"
                transparent
                opacity={0.7}
                roughness={0.05}
                metalness={0.1}
              />
            </mesh>

            {/* Splashing Ripple Pool at Basin Floor */}
            <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.01, 0.06 * (sinkWaterFlowRate / 100), 20]} />
              <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.1} />
            </mesh>
          </group>
        )}
      </group>

      {/* =========================================================================
          4. FLOATING OVERHEAD INTERACTIVE PROMPT
         ========================================================================= */}
      <Html position={[0, 1.8, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openSinkModal();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isSinkModalOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-cyan-500/60 shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/85 hover:border-cyan-400 hover:shadow-cyan-500/30">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
              <Droplets className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Bồn Nước & Vòi Cổ Ngỗng
                </span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-mono border ${
                  isSinkTapRunning
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse'
                    : 'bg-slate-700/40 text-slate-300 border-slate-600/40'
                }`}>
                  {isSinkTapRunning ? `Đang chảy ${sinkWaterFlowRate}%` : 'Đang đóng'}
                </span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">
                Nhấn [E] để mở van & điều chỉnh lưu lượng nước
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
