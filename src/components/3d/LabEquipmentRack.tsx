import React from 'react';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';
import { TestTubes, Pipette, FlaskConical, Sparkles } from 'lucide-react';

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
      {/* =========================================================================
          1. HEAVY-DUTY CLEANROOM STAINLESS STEEL WORKSTATION FRAME
         ========================================================================= */}
      {/* Main Base Cabinet (Dark Slate Epoxy Coated) */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.84, 0.76]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Front Dual Storage Cabinet Doors with Chrome Pull Handles */}
      <mesh position={[0, 0.42, 0.382]}>
        <planeGeometry args={[1.54, 0.78]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.6} />
      </mesh>
      {[-0.15, 0.15].map((hx) => (
        <mesh key={`handle_${hx}`} position={[hx, 0.48, 0.39]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.14, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
        </mesh>
      ))}

      {/* Heavy 316 Stainless Steel Worktop with Drip Lip */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.64, 0.04, 0.8]} />
        <meshStandardMaterial color="#64748b" metalness={0.94} roughness={0.18} />
      </mesh>
      {/* Blue Anti-static Chemical Work Mat on Countertop */}
      <mesh position={[0, 0.872, 0.08]}>
        <boxGeometry args={[1.45, 0.005, 0.52]} />
        <meshStandardMaterial color="#0284c7" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Upright Chrome Storage Rack Support Columns */}
      {[-0.74, 0.74].map((rx) => (
        <group key={`upright_${rx}`} position={[rx, 1.45, -0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.018, 0.018, 1.2, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* Tier 1 Glassware Shelf (at Y = 1.25) */}
      <mesh position={[0, 1.25, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.02, 0.36]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Under-shelf 1 LED Task Light Strip */}
      <mesh position={[0, 1.238, -0.22]}>
        <boxGeometry args={[1.44, 0.005, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>

      {/* Tier 2 Pipette & Equipment Shelf (at Y = 1.68) */}
      <mesh position={[0, 1.68, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.52, 0.02, 0.36]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Under-shelf 2 LED Task Light Strip */}
      <mesh position={[0, 1.668, -0.22]}>
        <boxGeometry args={[1.44, 0.005, 0.04]} />
        <meshStandardMaterial color="#ffffff" emissive="#e0f2fe" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>

      {/* =========================================================================
          2. SIDE PEGBOARD GLASSWARE DRYING RACK (GIÁ ÚP PHƠI KHÔ DỤNG CỤ)
         ========================================================================= */}
      <group position={[-0.83, 1.35, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Pegboard Backing Panel */}
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.75, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        {/* Angled Drying Pegs (Que cắm nghiêng) */}
        {[-0.18, 0, 0.18].map((px) =>
          [-0.25, -0.08, 0.08, 0.24].map((py, pidx) => (
            <group key={`peg_${px}_${py}`} position={[px, py, 0.01]} rotation={[-0.45, 0, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.007, 0.007, 0.12, 10]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} />
              </mesh>
              {/* Inverted drying beakers on some pegs */}
              {pidx % 3 === 0 && (
                <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
                  <cylinderGeometry args={[0.035, 0.035, 0.09, 14, 1, true]} />
                  <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4} roughness={0.08} />
                </mesh>
              )}
            </group>
          ))
        )}
      </group>

      {/* =========================================================================
          3. DỤNG CỤ: CỐC THÍ NGHIỆM TO (LARGE GRIFFIN BEAKERS - 250mL, 500mL, 1000mL)
         ========================================================================= */}
      {/* 3 Large Glass Beakers lined up on the counter mat */}
      {[
        { x: -0.5, h: 0.19, r: 0.075, label: '1000mL', fluidColor: '#06b6d4', fluidHeight: 0.11 },
        { x: -0.28, h: 0.16, r: 0.062, label: '500mL', fluidColor: '#f59e0b', fluidHeight: 0.08 },
        { x: -0.08, h: 0.13, r: 0.052, label: '250mL', fluidColor: '#10b981', fluidHeight: 0.06 },
      ].map((b, idx) => (
        <group key={`beaker_large_${idx}`} position={[b.x, 0.875 + b.h / 2, 0.12]}>
          {/* Main Glass Cylindrical Body */}
          <mesh castShadow>
            <cylinderGeometry args={[b.r, b.r, b.h, 24, 1, true]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.32}
              roughness={0.04}
              metalness={0.15}
            />
          </mesh>
          {/* Glass Base Floor */}
          <mesh position={[0, -b.h / 2, 0]}>
            <cylinderGeometry args={[b.r, b.r, 0.006, 24]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.55} roughness={0.05} />
          </mesh>
          {/* Glass Rim with Pouring Spout Lip */}
          <mesh position={[0, b.h / 2, 0]}>
            <torusGeometry args={[b.r + 0.002, 0.004, 8, 24]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.65} roughness={0.05} />
          </mesh>
          <mesh position={[0, b.h / 2 + 0.004, b.r + 0.006]} rotation={[0.4, 0, 0]}>
            <coneGeometry args={[0.014, 0.015, 8, 1, true]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} roughness={0.05} />
          </mesh>

          {/* White Graduation Volume Scale Lines on Front Glass */}
          {[-0.3, -0.1, 0.1, 0.3].map((gRatio, gi) => (
            <mesh key={`grad_${gi}`} position={[0, b.h * gRatio * 0.4, b.r + 0.001]} rotation={[0, 0, 0]}>
              <planeGeometry args={[b.r * 0.45, 0.002]} />
              <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
            </mesh>
          ))}

          {/* Liquid Reagent with Meniscus */}
          <mesh position={[0, -b.h / 2 + b.fluidHeight / 2, 0]}>
            <cylinderGeometry args={[b.r - 0.003, b.r - 0.003, b.fluidHeight, 20]} />
            <meshStandardMaterial
              color={b.fluidColor}
              transparent
              opacity={0.68}
              roughness={0.15}
            />
          </mesh>
        </group>
      ))}

      {/* Extra: Erlenmeyer Flasks (Bình tam giác) on Tier 1 */}
      {[-0.45, -0.22, 0.0].map((fx, fi) => (
        <group key={`erlenmeyer_${fi}`} position={[fx, 1.26 + 0.08, -0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.018, 0.06, 0.14, 18]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.06} />
          </mesh>
          <mesh position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
            <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4} roughness={0.06} />
          </mesh>
        </group>
      ))}

      {/* =========================================================================
          4. DỤNG CỤ: GIÁ CẮM TUÝP THÍ NGHIỆM NHỎ (TEST TUBES IN RACK)
         ========================================================================= */}
      <group position={[0.34, 0.875, 0.12]}>
        {/* Wooden / Stainless Test Tube Stand */}
        {/* Bottom Plate */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.36, 0.015, 0.15]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Middle Guide Shelf */}
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.36, 0.012, 0.15]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Top Retainer Shelf */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.36, 0.012, 0.15]} />
          <meshStandardMaterial color="#78350f" roughness={0.4} />
        </mesh>
        {/* Side Uprights */}
        {[-0.17, 0.17].map((ux) => (
          <mesh key={`rack_upright_${ux}`} position={[ux, 0.085, 0]}>
            <boxGeometry args={[0.015, 0.16, 0.15]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>
        ))}

        {/* 12 Slender Glass Test Tubes (2 rows of 6 tubes) */}
        {[-0.13, -0.08, -0.03, 0.02, 0.07, 0.12].map((tx, ti) =>
          [-0.038, 0.038].map((tz, zi) => {
            const tubeIdx = ti + zi * 6;
            const fluidColors = [
              '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6',
              '#e11d48', '#14b8a6', '#6366f1', '#eab308', '#22c55e', '#a855f7'
            ];
            return (
              <group key={`tube_${tubeIdx}`} position={[tx, 0.11, tz]}>
                {/* Glass Tube Body with Rounded Bottom */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.012, 0.012, 0.18, 16, 1, true]} />
                  <meshStandardMaterial
                    color="#e0f2fe"
                    transparent
                    opacity={0.42}
                    roughness={0.04}
                    metalness={0.1}
                  />
                </mesh>
                <mesh position={[0, -0.09, 0]}>
                  <sphereGeometry args={[0.012, 16, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                  <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.04} />
                </mesh>

                {/* Chemical Sample Liquid in Tube */}
                <mesh position={[0, -0.03, 0]}>
                  <cylinderGeometry args={[0.011, 0.011, 0.09, 16]} />
                  <meshStandardMaterial
                    color={fluidColors[tubeIdx % fluidColors.length]}
                    transparent
                    opacity={0.78}
                    roughness={0.2}
                  />
                </mesh>

                {/* White Paper Label Tape on Tube */}
                <mesh position={[0, 0.025, 0.0125]}>
                  <planeGeometry args={[0.016, 0.025]} />
                  <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
                </mesh>

                {/* Top Rim Collar */}
                <mesh position={[0, 0.09, 0]}>
                  <torusGeometry args={[0.0125, 0.002, 6, 16]} />
                  <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
                </mesh>
              </group>
            );
          })
        )}
      </group>

      {/* =========================================================================
          5. DỤNG CỤ: ỐNG HÚT DUNG DỊCH (MICROPIPETTES, PASTEUR PIPETTES & TIPS)
         ========================================================================= */}
      {/* Precision Micropipette Carousel Stand on Tier 2 */}
      <group position={[0.3, 1.69, -0.22]}>
        {/* Weighted Heavy Stand Base */}
        <mesh position={[0, 0.012, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 0.024, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Central Chrome Shaft */}
        <mesh position={[0, 0.16, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.3, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} />
        </mesh>
        {/* Rotary Pipette Hanger Disc */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.018, 24]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.7} />
        </mesh>

        {/* 4 Ergonomic Micropipettes Hanging Vertically */}
        {[
          { angle: 0, color: '#0284c7', range: '100-1000 µL' },
          { angle: Math.PI / 2, color: '#eab308', range: '20-200 µL' },
          { angle: Math.PI, color: '#10b981', range: '10-100 µL' },
          { angle: (3 * Math.PI) / 2, color: '#e11d48', range: '0.5-10 µL' },
        ].map((pip, pi) => {
          const px = Math.cos(pip.angle) * 0.1;
          const pz = Math.sin(pip.angle) * 0.1;
          return (
            <group key={`carousel_pip_${pi}`} position={[px, 0.16, pz]}>
              {/* Ergonomic handle */}
              <mesh castShadow>
                <cylinderGeometry args={[0.013, 0.01, 0.22, 12]} />
                <meshStandardMaterial color={pip.color} roughness={0.3} metalness={0.2} />
              </mesh>
              {/* Digital Volume Readout Display Window */}
              <mesh position={[0, 0.04, 0.012]}>
                <boxGeometry args={[0.016, 0.028, 0.004]} />
                <meshStandardMaterial color="#0f172a" roughness={0.1} />
              </mesh>
              {/* Top Finger Rest & Plunger Push Button */}
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.024, 12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.2} />
              </mesh>
              {/* Disposable Sterile Filter Tip Nozzle */}
              <mesh position={[0, -0.135, 0]}>
                <cylinderGeometry args={[0.005, 0.001, 0.07, 12]} />
                <meshStandardMaterial color="#e0f2fe" transparent opacity={0.75} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Sterile Pipette Tips Matrix Box on Tier 2 */}
      <group position={[-0.32, 1.69, -0.22]}>
        {/* Blue Box Base */}
        <mesh position={[0, 0.035, 0]} castShadow>
          <boxGeometry args={[0.18, 0.07, 0.14]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
        {/* Transparent Hinged Lid */}
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.182, 0.04, 0.142]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* Grid of Pipette Tips Inside */}
        {[-0.06, -0.02, 0.02, 0.06].map((tx) =>
          [-0.04, 0, 0.04].map((tz) => (
            <mesh key={`tip_${tx}_${tz}`} position={[tx, 0.075, tz]}>
              <cylinderGeometry args={[0.004, 0.001, 0.025, 8]} />
              <meshStandardMaterial color="#fde047" transparent opacity={0.8} />
            </mesh>
          ))
        )}
      </group>

      {/* Stainless Steel Instrument Tray with Pasteur Pipettes on Countertop */}
      <group position={[0.55, 0.875, -0.15]}>
        {/* Tray */}
        <mesh position={[0, 0.008, 0]} castShadow>
          <boxGeometry args={[0.26, 0.016, 0.18]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.94} roughness={0.2} />
        </mesh>
        {/* 3 Glass Pasteur Pipettes lying with Red Rubber Bulbs */}
        {[-0.04, 0, 0.04].map((py, pi) => (
          <group key={`pasteur_${pi}`} position={[0, 0.02, py]} rotation={[0, 0, Math.PI / 2]}>
            {/* Long thin glass stem */}
            <mesh>
              <cylinderGeometry args={[0.003, 0.0015, 0.18, 10]} />
              <meshStandardMaterial color="#e0f2fe" transparent opacity={0.6} />
            </mesh>
            {/* Red Rubber Suction Bulb */}
            <mesh position={[0, -0.1, 0]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshStandardMaterial color="#dc2626" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Laboratory Squeeze Wash Bottle (DI Water) */}
      <group position={[0.62, 0.875, 0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.038, 0.038, 0.15, 16]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.7} roughness={0.4} />
        </mesh>
        {/* Screw Cap */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.018, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Curved Gooseneck Dispensing Straw */}
        <mesh position={[0, 0.11, 0.015]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.07, 10]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* =========================================================================
          6. FLOATING OVERHEAD INTERACTIVE PROMPT
         ========================================================================= */}
      <Html position={[0, 2.15, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openEquipmentModal();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isEquipmentModalOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-4 py-2.5 rounded-2xl border border-lab-cyan/60 shadow-2xl backdrop-blur-md flex items-center space-x-3 whitespace-nowrap bg-slate-950/90 hover:border-lab-cyan hover:shadow-lab-cyan/40">
            <div className="w-7 h-7 rounded-xl bg-lab-cyan/20 border border-lab-cyan/60 flex items-center justify-center text-lab-cyan">
              <FlaskConical className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Giá Dụng Cụ Thí Nghiệm Cao Cấp
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-400/40">
                  Đã Nâng Cấp
                </span>
              </div>
              <span className="text-[10px] text-lab-cyan font-mono flex items-center space-x-1.5 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Nhấn [E] để lấy: Cốc to (500mL), Tuýp nhỏ, Ống hút</span>
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
