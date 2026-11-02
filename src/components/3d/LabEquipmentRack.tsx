import React from 'react';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';
import { TestTubes, Pipette } from 'lucide-react';

export function LabEquipmentRack() {
  const rackConfig = SECOND_FLOOR_STATIONS.EQUIPMENT_RACK;
  const { openEquipmentModal, isEquipmentModalOpen, collectedEquipment } = useLabStore();

  return (
    <group
      position={rackConfig.position}
      rotation={rackConfig.rotation}
      onClick={(e) => {
        e.stopPropagation();
        openEquipmentModal();
      }}
    >
      {/* 1. STAINLESS STEEL INDUSTRIAL LAB SHELF TOWER */}
      {/* Main Table Counter Base */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.84, 0.7]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Heavy Stainless Steel Worktop */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.03, 0.72]} />
        <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* Upright Chrome Storage Rack Frames */}
      {[-0.68, 0.68].map((rx) => (
        <group key={`upright_${rx}`} position={[rx, 1.35, -0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 1.0, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Tier 1 Glassware Shelf (at Y = 1.25) */}
      <mesh position={[0, 1.25, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.018, 0.32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Tier 2 Pipette Shelf (at Y = 1.65) */}
      <mesh position={[0, 1.65, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.018, 0.32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* =========================================================================
          2. DỤNG CỤ: CỐC THÍ NGHIỆM TO (LARGE GLASS BEAKERS)
         ========================================================================= */}
      {/* 3 Different sizes of Glass Beakers on Worktop */}
      {[-0.45, -0.22, 0.0].map((bx, idx) => {
        const h = 0.16 + idx * 0.04;
        const r = 0.065 + idx * 0.018;
        return (
          <group key={`beaker_${idx}`} position={[bx, 0.865 + h / 2, 0.15]}>
            {/* Cylinder Glass Wall */}
            <mesh castShadow>
              <cylinderGeometry args={[r, r, h, 20, 1, true]} />
              <meshStandardMaterial
                color="#e0f2fe"
                transparent
                opacity={0.35}
                roughness={0.05}
                metalness={0.1}
              />
            </mesh>
            {/* Base */}
            <mesh position={[0, -h / 2, 0]}>
              <cylinderGeometry args={[r, r, 0.006, 20]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.05} />
            </mesh>
            {/* Rim */}
            <mesh position={[0, h / 2, 0]}>
              <torusGeometry args={[r + 0.002, 0.004, 8, 20]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} roughness={0.05} />
            </mesh>
          </group>
        );
      })}

      {/* =========================================================================
          3. DỤNG CỤ: GIÁ CẮM TUÝP THÍ NGHIỆM NHỎ (TEST TUBES IN RACK)
         ========================================================================= */}
      <group position={[0.38, 0.865, 0.15]}>
        {/* Wooden Test Tube Rack Stand */}
        {/* Base */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.32, 0.015, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Middle Perforated Support Shelf */}
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.32, 0.012, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Top Retainer Shelf */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.32, 0.012, 0.12]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* 6 Slender Glass Test Tubes (Tuýp thí nghiệm nhỏ) */}
        {[-0.12, -0.07, -0.02, 0.03, 0.08, 0.13].map((tx, ti) => (
          <group key={`tube_${ti}`} position={[tx, 0.1, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.17, 16]} />
              <meshStandardMaterial
                color="#e0f2fe"
                transparent
                opacity={0.45}
                roughness={0.05}
                metalness={0.1}
              />
            </mesh>
            {/* Colorful fluid samples in test tubes */}
            <mesh position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.011, 0.011, 0.07, 16]} />
              <meshStandardMaterial
                color={['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'][ti]}
                transparent
                opacity={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================================================
          4. DỤNG CỤ: ỐNG HÚT DUNG DỊCH (MICROPIPETTE & PASTEUR PIPETTES)
         ========================================================================= */}
      {/* Pipette Stand on Tier 2 */}
      <group position={[0, 1.66, -0.15]}>
        {/* Acrylic Carousel Rack Base */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.24, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.015, 24]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.6} />
        </mesh>
        {/* 3 Micropipettes hanging from carousel */}
        {[-0.08, 0, 0.08].map((px, pi) => (
          <group key={`pip_${pi}`} position={[px, 0.12, 0]}>
            {/* Pipette Body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.012, 0.01, 0.2, 12]} />
              <meshStandardMaterial color={['#0284c7', '#059669', '#d97706'][pi]} roughness={0.3} />
            </mesh>
            {/* Digital volume window */}
            <mesh position={[0, 0.04, 0.011]}>
              <planeGeometry args={[0.015, 0.025]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Plunger Button on Top */}
            <mesh position={[0, 0.11, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.02, 12]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.2} />
            </mesh>
            {/* Disposable Tip */}
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.005, 0.001, 0.06, 12]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =========================================================================
          5. FLOATING OVERHEAD INTERACTIVE PROMPT
         ========================================================================= */}
      <Html position={[0, 2.05, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openEquipmentModal();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isEquipmentModalOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-lab-cyan/60 shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/85 hover:border-lab-cyan hover:shadow-lab-cyan/30">
            <div className="w-6 h-6 rounded-full bg-lab-cyan/20 border border-lab-cyan/60 flex items-center justify-center text-lab-cyan">
              <TestTubes className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Giá Dụng Cụ Thí Nghiệm
                </span>
                <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-400/40">
                  Thủy Tinh
                </span>
              </div>
              <span className="text-[10px] text-lab-cyan font-mono">
                Nhấn [E] để lấy: Cốc to, Tuýp nhỏ, Ống hút
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
