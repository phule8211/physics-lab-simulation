import React from 'react';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';
import { FlaskConical, AlertTriangle } from 'lucide-react';

export function ChemicalReagentRack() {
  const rackConfig = SECOND_FLOOR_STATIONS.CHEMICAL_RACK;
  const { openChemicalModal, isChemicalModalOpen, chemicalBeaker } = useLabStore();

  const totalLiquid = chemicalBeaker.hcl + chemicalBeaker.hno3 + chemicalBeaker.h2o2 + chemicalBeaker.water;

  return (
    <group
      position={rackConfig.position}
      rotation={rackConfig.rotation}
      onClick={(e) => {
        e.stopPropagation();
        openChemicalModal();
      }}
    >
      {/* 1. CHEMICAL STORAGE SAFETY CABINET BASE */}
      {/* Acid-Resistant Polypropylene Cabinet Base */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.84, 0.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Front Cabinet Doors with Acid Hazard Signage */}
      <mesh position={[0, 0.42, 0.352]}>
        <planeGeometry args={[1.44, 0.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
      </mesh>
      {/* Safety Yellow Spill Containment Lip */}
      <mesh position={[0, 0.85, 0.34]}>
        <boxGeometry args={[1.48, 0.04, 0.04]} />
        <meshStandardMaterial color="#eab308" roughness={0.4} />
      </mesh>

      {/* Heavy Stainless Steel Work Surface on Cabinet */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.03, 0.72]} />
        <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.2} />
      </mesh>

      {/* Upright Chemical Bottle Riser Shelf */}
      <mesh position={[0, 1.05, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.38, 0.3]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* =========================================================================
          2. CHEMICAL REAGENT BOTTLES
         ========================================================================= */}
      {/* BOTTLE 1: Axit Clohidric (HCl 37%) - Amber Glass Bottle, Red Cap */}
      <group position={[-0.42, 1.25, -0.16]}>
        {/* Amber Glass Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
          <meshStandardMaterial color="#78350f" transparent opacity={0.88} roughness={0.15} metalness={0.1} />
        </mesh>
        {/* Tapered Shoulder & Neck */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.03, 0.068, 0.05, 20]} />
          <meshStandardMaterial color="#78350f" transparent opacity={0.88} roughness={0.15} />
        </mesh>
        {/* Red Polyethylene Cap */}
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.035, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
        {/* Front Label: "HCl 37%" */}
        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[0.09, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* BOTTLE 2: Axit Nitric (HNO3 68%) - Dark Brown Bottle, Yellow Cap */}
      <group position={[0.0, 1.25, -0.16]}>
        {/* Dark Brown Glass Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
          <meshStandardMaterial color="#451a03" transparent opacity={0.92} roughness={0.15} metalness={0.1} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.03, 0.068, 0.05, 20]} />
          <meshStandardMaterial color="#451a03" transparent opacity={0.92} roughness={0.15} />
        </mesh>
        {/* Yellow Cap */}
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.035, 16]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
        {/* Front Label: "HNO3 68%" */}
        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[0.09, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* BOTTLE 3: Oxy Già (H2O2 30%) - Opaque White HDPE Bottle, Blue Cap */}
      <group position={[0.42, 1.25, -0.16]}>
        {/* Opaque White HDPE Body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 20]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.03, 0.068, 0.05, 20]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Blue Cap */}
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.035, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Front Label: "H2O2 30%" */}
        <mesh position={[0, 0, 0.072]}>
          <planeGeometry args={[0.09, 0.12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* =========================================================================
          3. LARGE EXPERIMENT BEAKER (CỐC THÍ NGHIỆM TO 500ML TRÊN BÀN)
         ========================================================================= */}
      <group position={[0, 0.87, 0.16]}>
        {/* Borosilicate Glass Beaker Wall */}
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 24, 1, true]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>
        {/* Beaker Glass Base */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.008, 24]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.05} />
        </mesh>
        {/* Rolled Beaker Rim with Pouring Spout */}
        <mesh position={[0, 0.11, 0]}>
          <torusGeometry args={[0.092, 0.006, 12, 24]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} roughness={0.05} />
        </mesh>

        {/* Dynamic Chemical Fluid Level inside Beaker */}
        {totalLiquid > 0 && (
          <mesh position={[0, -0.11 + Math.min(0.2, (totalLiquid / 500) * 0.2) / 2, 0]}>
            <cylinderGeometry
              args={[
                0.088,
                0.088,
                Math.max(0.005, Math.min(0.2, (totalLiquid / 500) * 0.2)),
                24,
              ]}
            />
            <meshStandardMaterial
              color={chemicalBeaker.hno3 > 0 ? '#fde047' : '#38bdf8'}
              transparent
              opacity={0.65}
              roughness={0.2}
            />
          </mesh>
        )}
      </group>

      {/* =========================================================================
          4. FLOATING OVERHEAD INTERACTIVE PROMPT
         ========================================================================= */}
      <Html position={[0, 1.8, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openChemicalModal();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isChemicalModalOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-3.5 py-2 rounded-2xl border border-amber-500/60 shadow-2xl backdrop-blur-md flex items-center space-x-2.5 whitespace-nowrap bg-slate-950/85 hover:border-amber-400 hover:shadow-amber-500/30">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-amber-400">
              <FlaskConical className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-white tracking-wide">
                  Giá Hóa Chất (HCl, HNO3, H2O2)
                </span>
                <span className="px-1 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px] font-mono border border-red-400/40">
                  Axit
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                Nhấn [E] để lấy & pha hóa chất vào cốc to ({totalLiquid}/500mL)
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

