import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';
import { MessageSquareText, Sparkles } from 'lucide-react';

export function NpcInstructorDung() {
  const npcConfig = SECOND_FLOOR_STATIONS.NPC_DUNG;
  const { openNpcDialog, isNpcDialogOpen, hoveredStationId } = useLabStore();
  const groupRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);

  // Subtle breathing animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (chestRef.current) {
      chestRef.current.position.y = 1.05 + Math.sin(t * 1.8) * 0.008;
      chestRef.current.rotation.x = Math.sin(t * 1.8) * 0.015;
    }
  });

  const isHovered = hoveredStationId === 'npc_dung';

  return (
    <group
      ref={groupRef}
      position={npcConfig.position}
      rotation={npcConfig.rotation}
      onClick={(e) => {
        e.stopPropagation();
        openNpcDialog();
      }}
    >
      {/* =========================================================================
          1. 3D STYLIZED CHARACTER MODEL: KS. NGUYỄN VĂN DŨNG
         ========================================================================= */}
      {/* Shoes (Oxford Leather Brown) */}
      {[-0.1, 0.1].map((sx) => (
        <mesh key={`shoe_${sx}`} position={[sx, 0.05, 0.03]} castShadow>
          <boxGeometry args={[0.09, 0.08, 0.22]} />
          <meshStandardMaterial color="#2d1810" roughness={0.35} metalness={0.1} />
        </mesh>
      ))}

      {/* Navy Blue Slacks (Quần âu tối màu) */}
      {[-0.1, 0.1].map((lx) => (
        <mesh key={`leg_${lx}`} position={[lx, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.72, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      ))}

      {/* Torso & White Laboratory Coat (Áo Blouse trắng nghiên cứu) */}
      <group ref={chestRef} position={[0, 1.05, 0]}>
        {/* Main Torso */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.38, 0.44, 0.24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>

        {/* Lower Lab Coat Flaps extending over thighs */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <boxGeometry args={[0.41, 0.32, 0.26]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>

        {/* Inner Collared Shirt & Dark Tie */}
        <mesh position={[0, 0.25, 0.122]}>
          <planeGeometry args={[0.12, 0.16]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.18, 0.124]}>
          <boxGeometry args={[0.035, 0.2, 0.005]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>

        {/* Chest Engineer ID Badge: "KS. NGUYỄN VĂN DŨNG" */}
        <group position={[-0.11, 0.22, 0.125]}>
          {/* Badge Lanyard Clip */}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.02, 0.015, 0.008]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
          {/* Badge Card */}
          <mesh castShadow>
            <boxGeometry args={[0.065, 0.085, 0.004]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
          </mesh>
          {/* Cyan Photo Header */}
          <mesh position={[0, 0.025, 0.003]}>
            <planeGeometry args={[0.055, 0.025]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Left Arm with White Sleeve */}
        <group position={[-0.24, 0.18, 0]}>
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, -0.12]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.36, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          {/* Hand holding a clipboard */}
          <mesh position={[0, -0.34, 0.04]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.5} />
          </mesh>
          {/* Metal Clipboard */}
          <mesh position={[0.02, -0.32, 0.1]} rotation={[-0.4, 0.2, 0]} castShadow>
            <boxGeometry args={[0.18, 0.26, 0.01]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group position={[0.24, 0.18, 0]}>
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, 0.12]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.36, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.34, 0]}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.5} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.1, 16]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.5} />
        </mesh>

        {/* Head */}
        <group position={[0, 0.52, 0]}>
          {/* Face */}
          <mesh castShadow>
            <sphereGeometry args={[0.11, 24, 24]} />
            <meshStandardMaterial color="#fcd34d" roughness={0.4} />
          </mesh>
          {/* Neat Professional Dark Hair */}
          <mesh position={[0, 0.04, -0.02]}>
            <sphereGeometry args={[0.114, 20, 20]} />
            <meshStandardMaterial color="#171717" roughness={0.7} />
          </mesh>
          {/* Stylish Transparent Laser Safety Goggles (Kính bảo hộ laser) */}
          <group position={[0, 0.02, 0.08]}>
            <mesh>
              <boxGeometry args={[0.16, 0.04, 0.05]} />
              <meshStandardMaterial color="#06b6d4" transparent opacity={0.55} roughness={0.1} metalness={0.2} />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <boxGeometry args={[0.17, 0.015, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          </group>
        </group>
      </group>

      {/* =========================================================================
          2. FLOATING OVERHEAD INTERACTIVE PROMPT
         ========================================================================= */}
      <Html position={[0, 2.05, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openNpcDialog();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isNpcDialogOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-lab-cyan/60 shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/85 hover:border-lab-cyan hover:shadow-lab-cyan/30">
            <div className="w-6 h-6 rounded-full bg-lab-cyan/20 border border-lab-cyan/60 flex items-center justify-center text-lab-cyan">
              <MessageSquareText className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  KS. Nguyễn Văn Dũng
                </span>
                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-400/40">
                  Cố vấn
                </span>
              </div>
              <span className="text-[10px] text-lab-cyan font-mono flex items-center space-x-1">
                <span>Nhấn [E] để trò chuyện & hỏi đáp máy</span>
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
