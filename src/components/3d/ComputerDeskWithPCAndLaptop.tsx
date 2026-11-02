import React from 'react';
import { useTexture } from '@react-three/drei';
import { SECOND_FLOOR_STATIONS } from '../../data/staircaseConfig';

export function ComputerDeskWithPCAndLaptop() {
  const deskConfig = SECOND_FLOOR_STATIONS.COMPUTER_DESK;
  const woodTexture = useTexture('/textures/wood.jpg');

  return (
    <group position={deskConfig.position} rotation={deskConfig.rotation}>
      {/* 1. DESK TABLETOP & METAL FRAME */}
      {/* Solid Oak Wood Tabletop */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.04, 0.85]} />
        <meshStandardMaterial map={woodTexture} color="#451a03" roughness={0.3} metalness={0.08} />
      </mesh>

      {/* Matte Black Steel Leg Frame */}
      {[-0.78, 0.78].map((lx) => (
        <group key={`leg_${lx}`} position={[lx, 0.36, 0]}>
          {/* Vertical Leg Posts */}
          {[-0.36, 0.36].map((lz) => (
            <mesh key={`post_${lz}`} position={[0, 0, lz]} castShadow>
              <boxGeometry args={[0.04, 0.72, 0.04]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
          {/* Bottom Foot Sled */}
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.05, 0.03, 0.8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
          </mesh>
          {/* Top Crossbar */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.05, 0.03, 0.76]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Long Rear Cross Stiffener */}
      <mesh position={[0, 0.45, -0.36]}>
        <boxGeometry args={[1.56, 0.03, 0.03]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Wide Deskmat / Mousepad */}
      <mesh position={[-0.1, 0.762, 0.08]}>
        <boxGeometry args={[0.9, 0.004, 0.42]} />
        <meshStandardMaterial color="#020617" roughness={0.8} />
      </mesh>

      {/* =========================================================================
          2. WORKSTATION PC SETUP (Left side of desk)
         ========================================================================= */}
      {/* PC Tower Case on Floor / Under Desk or Desk Right */}
      <group position={[-0.65, 0.76 + 0.22, -0.15]}>
        {/* Chassis Body (Matte Obsidian) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.22, 0.44, 0.44]} />
          <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Tinted Tempered Glass Side Panel */}
        <mesh position={[0.112, 0, 0]}>
          <boxGeometry args={[0.005, 0.42, 0.42]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.35} metalness={0.9} roughness={0.05} />
        </mesh>
        {/* Internal Glowing RGB Fans */}
        {[-0.1, 0.1].map((fy) => (
          <mesh key={`fan_${fy}`} position={[0.108, fy, 0.05]}>
            <ringGeometry args={[0.035, 0.048, 16]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        ))}
        {/* Front Mesh Air Intake */}
        <mesh position={[0, 0, 0.221]}>
          <planeGeometry args={[0.2, 0.42]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* Power LED Indicator */}
        <mesh position={[0.08, 0.21, 0.222]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Dual Curved 27-inch Workstation Monitors */}
      {/* Monitor 1 (Main CAD & Simulation Console) */}
      <group position={[-0.15, 0.76 + 0.26, -0.15]} rotation={[0, 0.05, 0]}>
        {/* Bezelless Screen Face */}
        <mesh castShadow>
          <boxGeometry args={[0.56, 0.33, 0.02]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Display Panel Glowing Image */}
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.54, 0.31]} />
          <meshBasicMaterial color="#0369a1" />
        </mesh>
        {/* Metal Articulating Monitor Arm */}
        <mesh position={[0, -0.14, -0.08]}>
          <cylinderGeometry args={[0.015, 0.018, 0.28, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.27, -0.08]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Mechanical Keyboard with Backlit Keycaps */}
      <group position={[-0.18, 0.766, 0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.015, 0.13]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.009, 0]}>
          <planeGeometry args={[0.32, 0.11]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>

      {/* Ergonomic Gaming Mouse on Pad */}
      <mesh position={[0.16, 0.772, 0.12]} castShadow>
        <boxGeometry args={[0.065, 0.022, 0.1]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* =========================================================================
          3. ERGONOMIC LAPTOP ON ANGLED METAL RISER STAND (Right side of desk)
         ========================================================================= */}
      <group position={[0.48, 0.76, -0.05]} rotation={[0, -0.18, 0]}>
        {/* Aluminum Ergonomic Laptop Riser Stand (Vát nghiêng 20 độ) */}
        {/* Base Plate */}
        <mesh position={[0, 0.01, 0]} castShadow>
          <boxGeometry args={[0.26, 0.006, 0.22]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Twin Vertical Cantilever Stems */}
        {[-0.09, 0.09].map((sx) => (
          <mesh key={`stem_${sx}`} position={[sx, 0.06, -0.04]} rotation={[0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.03, 0.12, 0.006]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}
        {/* Angled Resting Tray on Stand */}
        <group position={[0, 0.11, -0.01]} rotation={[-0.32, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.006, 0.22]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
          </mesh>
          {/* Front Retaining Lip Hook */}
          <mesh position={[0, 0.01, 0.11]}>
            <boxGeometry args={[0.26, 0.018, 0.008]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Laptop Base Chassis */}
          <group position={[0, 0.008, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.31, 0.012, 0.21]} />
              <meshStandardMaterial color="#475569" metalness={0.88} roughness={0.25} />
            </mesh>
            {/* Laptop Keyboard Area */}
            <mesh position={[0, 0.007, -0.02]}>
              <planeGeometry args={[0.26, 0.1]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Trackpad */}
            <mesh position={[0, 0.007, 0.065]}>
              <planeGeometry args={[0.09, 0.05]} />
              <meshStandardMaterial color="#334155" roughness={0.5} />
            </mesh>

            {/* Laptop Screen Lid Opened at 110 degrees */}
            <group position={[0, 0.006, -0.1]} rotation={[-1.75, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.31, 0.21, 0.006]} />
                <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Illuminated Display Screen */}
              <mesh position={[0, 0, 0.004]}>
                <planeGeometry args={[0.29, 0.19]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Ergonomic Mesh Office Chair */}
      <group position={[-0.15, 0, 0.55]} rotation={[0, Math.PI, 0]}>
        {/* 5-Star Caster Base */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.03, 5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* Hydraulic Piston Column */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.34, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} />
        </mesh>
        {/* Chair Seat Cushion */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <boxGeometry args={[0.46, 0.07, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        {/* Breathable Mesh Backrest */}
        <mesh position={[0, 0.74, 0.2]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.04]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
