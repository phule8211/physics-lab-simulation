import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { MEZZANINE_CONFIG, STAIRCASE_GEOMETRY } from '../../data/staircaseConfig';

/**
 * Procedural Wrought Iron Scrollwork Bracket
 * Replicating the ornamental S-scroll / C-scroll metal brackets under each step
 */
function OrnateStepBracket({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {/* Horizontal mounting plate under tread */}
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.24]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
      </mesh>

      {/* Main diagonal structural bracket arm */}
      <mesh position={[0, -0.08, -0.03]} rotation={[0.65, 0, 0]}>
        <boxGeometry args={[0.03, 0.16, 0.03]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
      </mesh>

      {/* Ornate Wrought-Iron Spiral C-Scroll (Front loop) */}
      <mesh position={[0, -0.05, 0.06]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.045, 0.008, 12, 24, Math.PI * 1.5]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
      </mesh>

      {/* Ornate Wrought-Iron Spiral S-Scroll (Back loop) */}
      <mesh position={[0, -0.11, -0.06]} rotation={[0, Math.PI / 2, Math.PI]}>
        <torusGeometry args={[0.038, 0.008, 12, 24, Math.PI * 1.4]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
      </mesh>

      {/* Central decorative cast iron rosette / stud */}
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshStandardMaterial color="#27272a" metalness={0.92} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Baluster with Ornamental Spindle Sleeve and Ball
 */
function OrnateBaluster({
  position,
  height = 0.9,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      {/* Main vertical rod */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.009, 0.009, height, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Bottom mounting shoe / rosette */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.03, 12]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Center decorative elongated oval spindle sleeve */}
      <mesh position={[0, height * 0.52, 0]} scale={[1, 2.2, 1]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.92} roughness={0.25} />
      </mesh>

      {/* Accent rings above and below sleeve */}
      <mesh position={[0, height * 0.52 + 0.055, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, height * 0.52 - 0.055, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 0.01, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * Ornate Newel Post (Trụ cái cầu thang đúc đồng & sắt nghệ thuật ở chân & đỉnh thang)
 */
function NewelPost({
  position,
  height = 1.15,
}: {
  position: [number, number, number];
  height?: number;
}) {
  return (
    <group position={position}>
      {/* Square base plinth */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.16, 0.24, 0.16]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Main post shaft */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.11, height - 0.24, 0.11]} />
        <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Post capital cap */}
      <mesh position={[0, height, 0]} castShadow>
        <boxGeometry args={[0.18, 0.06, 0.18]} />
        <meshStandardMaterial color="#27272a" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Brass finial sphere on top */}
      <mesh position={[0, height + 0.07, 0]} castShadow>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.18} />
      </mesh>
    </group>
  );
}

/**
 * Complete Wide Single Straight Grand Staircase & 2nd Floor Mezzanine Deck Component
 * Wide 2.2m straight flight centered at X = 2.4, ascending directly to Floor 2
 */
export function StaircaseAndMezzanine() {
  // Load textures
  const woodTexture = useTexture('/textures/wood.jpg');
  useMemo(() => {
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 4);
  }, [woodTexture]);

  const sg = STAIRCASE_GEOMETRY;
  const mez = MEZZANINE_CONFIG;

  // Staircase slope math: rise = 3.06m, run = 4.60m
  const stairAngle = Math.atan2(sg.endY - sg.startY, sg.endZ - sg.startZ); // ~0.587 rad
  const stairLength = Math.hypot(sg.endY - sg.startY, sg.endZ - sg.startZ); // ~5.52m
  const midY = (sg.startY + sg.endY) / 2;
  const midZ = (sg.startZ + sg.endZ) / 2;

  return (
    <group>
      {/* =======================================================================
          1. WIDE SINGLE STRAIGHT GRAND STAIRCASE (CẦU THANG THẲNG 1 HÀNG TO ĐẸP)
          Width: 2.2m, Centered at X = 2.4 (from X = 1.3 to X = 3.5)
          Ascends directly along +Z from Z = 0.0 to Z = 4.6, Y = 0 to 3.06m
         ======================================================================= */}
      <group position={[sg.startX, 0, 0]}>
        {/* 18 Solid Wood Treads with Under-Structure Brackets */}
        {Array.from({ length: sg.steps }).map((_, i) => {
          const stepY = i * sg.stepRise;
          const stepZ = sg.startZ + (i + 0.5) * sg.treadDepth;

          return (
            <group key={`stair_step_${i}`} position={[0, stepY, stepZ]}>
              {/* Solid Wood Tread (Width 2.2m, Depth 0.28m, Thickness 4.8cm) */}
              <mesh position={[0, 0.024, 0]} castShadow receiveShadow>
                <boxGeometry args={[sg.treadWidth, 0.048, sg.treadDepth + 0.03]} />
                <meshStandardMaterial
                  map={woodTexture}
                  color="#6d4c41"
                  roughness={0.35}
                  metalness={0.06}
                />
              </mesh>

              {/* Tread Anti-Slip Brass Inlay Front Groove */}
              <mesh position={[0, 0.049, -sg.treadDepth / 2 + 0.03]}>
                <boxGeometry args={[sg.treadWidth - 0.2, 0.002, 0.01]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
              </mesh>

              {/* Heavy Understructure Steel Channel Riser */}
              <mesh position={[0, -0.06, 0.12]} castShadow>
                <boxGeometry args={[sg.treadWidth - 0.08, 0.12, 0.03]} />
                <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
              </mesh>

              {/* 3 Ornate Wrought-Iron Scroll Brackets underneath (Left, Center, Right) */}
              <OrnateStepBracket position={[-sg.treadWidth / 2 + 0.15, 0, 0]} />
              <OrnateStepBracket position={[0, 0, 0]} />
              <OrnateStepBracket position={[sg.treadWidth / 2 - 0.15, 0, 0]} />

              {/* Left and Right Balusters on Tread Ends */}
              <OrnateBaluster
                position={[-sg.treadWidth / 2 + 0.05, 0.048, 0]}
                height={0.92}
              />
              <OrnateBaluster
                position={[sg.treadWidth / 2 - 0.05, 0.048, 0]}
                height={0.92}
              />
            </group>
          );
        })}

        {/* 2 Heavy Sloped Steel Stringer Beams under the stairs (Dầm thép chịu lực 2 bên) */}
        {[-sg.treadWidth / 2 + 0.08, sg.treadWidth / 2 - 0.08].map((bx, idx) => (
          <mesh
            key={`stringer_beam_${idx}`}
            position={[bx, midY - 0.1, midZ]}
            rotation={[-stairAngle, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.22, stairLength]} />
            <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.25} />
          </mesh>
        ))}

        {/* Center Reinforcement Stringer Beam */}
        <mesh
          position={[0, midY - 0.1, midZ]}
          rotation={[-stairAngle, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.2, stairLength]} />
          <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Left Sloped Wooden Handrail (Lan can dốc bên trái) */}
        <mesh
          position={[-sg.treadWidth / 2 + 0.05, midY + 0.96, midZ]}
          rotation={[-stairAngle, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.07, 0.06, stairLength + 0.2]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>

        {/* Right Sloped Wooden Handrail (Lan can dốc bên phải) */}
        <mesh
          position={[sg.treadWidth / 2 - 0.05, midY + 0.96, midZ]}
          rotation={[-stairAngle, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.07, 0.06, stairLength + 0.2]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>

        {/* Bottom Newel Posts at Base (Trụ cái ở chân cầu thang) */}
        <NewelPost position={[-sg.treadWidth / 2 + 0.05, 0, sg.startZ + 0.08]} height={1.12} />
        <NewelPost position={[sg.treadWidth / 2 - 0.05, 0, sg.startZ + 0.08]} height={1.12} />

        {/* Top Newel Posts at 2nd Floor Mezzanine landing (Trụ cái ở đỉnh cầu thang) */}
        <NewelPost position={[-sg.treadWidth / 2 + 0.05, sg.endY, sg.endZ - 0.08]} height={1.12} />
        <NewelPost position={[sg.treadWidth / 2 - 0.05, sg.endY, sg.endZ - 0.08]} height={1.12} />
      </group>

      {/* =======================================================================
          2. 2ND FLOOR MEZZANINE (TẦNG 2 - SÀN LỬNG NGHIÊN CỨU & LAN CAN AN TOÀN)
          Deck height: Y = 3.06m.
          Stairwell opening: X in [1.3, 3.5], Z from 3.2 to 4.6 (where stair arrives).
         ======================================================================= */}
      <group position={[0, mez.floorY, 0]}>
        {/* Slab A: West Floor Deck (X: -9.5 to 1.30, Z: 3.2 to 11.6, width = 10.8m) */}
        <mesh position={[-4.1, -mez.floorThickness / 2, 7.4]} receiveShadow>
          <boxGeometry args={[10.8, mez.floorThickness, 8.4]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Slab B: East Floor Deck (X: 3.50 to 9.5, Z: 3.2 to 11.6, width = 6.0m) */}
        <mesh position={[6.5, -mez.floorThickness / 2, 7.4]} receiveShadow>
          <boxGeometry args={[6.0, mez.floorThickness, 8.4]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Slab C: South Walkway Behind Stairwell (X: 1.30 to 3.50, Z: 4.6 to 11.6, width = 2.2m) */}
        <mesh position={[2.4, -mez.floorThickness / 2, 8.1]} receiveShadow>
          <boxGeometry args={[2.2, mez.floorThickness, 7.0]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Front Steel I-Beam Fascia (West) */}
        <mesh position={[-4.1, -mez.floorThickness - 0.08, 3.2]}>
          <boxGeometry args={[10.8, 0.28, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Front Steel I-Beam Fascia (East) */}
        <mesh position={[6.5, -mez.floorThickness - 0.08, 3.2]}>
          <boxGeometry args={[6.0, 0.28, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Heavy Structural Support Columns from Ground to Mezzanine */}
        {[-7.5, -2.5, 5.5, 8.5].map((cx) => (
          <group key={`mez_col_front_${cx}`} position={[cx, -mez.floorY / 2, 3.28]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.11, mez.floorY, 24]} />
              <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, mez.floorY / 2 - 0.1, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.26]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, -mez.floorY / 2 + 0.08, 0]}>
              <boxGeometry args={[0.28, 0.12, 0.28]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Mid-Row Structural Support Columns (at Z = 7.4) */}
        {[-7.5, -2.5, 5.5, 8.5].map((cx) => (
          <group key={`mez_col_mid_${cx}`} position={[cx, -mez.floorY / 2, 7.4]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.11, mez.floorY, 24]} />
              <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, mez.floorY / 2 - 0.1, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.26]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* =======================================================================
            2ND FLOOR SAFETY GUARDRAILS (LAN CAN AN TOÀN TẦNG 2)
           ======================================================================= */}
        {/* 1. Left Front Overlook Railing (X: -9.5 to 1.30 at Z = 3.2) */}
        <group position={[-4.1, 0, 3.24]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[10.8, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[10.8, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {Array.from({ length: 28 }).map((_, bi) => {
            const bx = -5.1 + bi * 0.38;
            return <OrnateBaluster key={`rail_l_${bi}`} position={[bx, 0, 0]} height={0.92} />;
          })}
        </group>

        {/* 2. Right Front Overlook Railing (X: 3.50 to 9.5 at Z = 3.2) */}
        <group position={[6.5, 0, 3.24]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[6.0, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[6.0, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {Array.from({ length: 15 }).map((_, bi) => {
            const bx = -2.7 + bi * 0.38;
            return <OrnateBaluster key={`rail_r_${bi}`} position={[bx, 0, 0]} height={0.92} />;
          })}
        </group>

        {/* 3. Stairwell Left Side Guardrail (along X = 1.30, Z from 3.20 to 4.60) */}
        <group position={[1.3, 0, 3.9]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.4, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {[-0.5, -0.16, 0.16, 0.5].map((bz) => (
            <OrnateBaluster key={`rail_stair_l_${bz}`} position={[bz, 0, 0]} height={0.92} />
          ))}
        </group>

        {/* 4. Stairwell Right Side Guardrail (along X = 3.50, Z from 3.20 to 4.60) */}
        <group position={[3.5, 0, 3.9]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.4, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {[-0.5, -0.16, 0.16, 0.5].map((bz) => (
            <OrnateBaluster key={`rail_stair_r_${bz}`} position={[bz, 0, 0]} height={0.92} />
          ))}
        </group>

        {/* Warm Ambient Lights on Mezzanine */}
        {[-6, -2, 2, 6].map((lx) => (
          <pointLight
            key={`mez_light_${lx}`}
            position={[lx, 2.6, 5.3]}
            intensity={2.0}
            distance={8}
            decay={2}
            color="#fef3c7"
          />
        ))}
      </group>
    </group>
  );
}
