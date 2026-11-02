import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { MEZZANINE_CONFIG, STAIRCASE_GEOMETRY } from '../../data/staircaseConfig';

/**
 * Procedural Wrought Iron Scrollwork Bracket
 * Replicating the ornamental S-scroll / C-scroll metal brackets under each step (User Reference Images)
 */
function OrnateStepBracket({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
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
 * Baluster with Ornamental Spindle Sleeve and Ball (User Reference Images)
 */
function OrnateBaluster({ position, height = 0.9 }: { position: [number, number, number]; height?: number }) {
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
 * Complete Switchback Staircase & 2nd Floor Mezzanine Deck Component
 * Positioned in South section, ascending Southwards to the Mezzanine
 */
export function StaircaseAndMezzanine() {
  // Load textures
  const woodTexture = useTexture('/textures/wood.jpg');
  useMemo(() => {
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(4, 4);
  }, [woodTexture]);

  const f1 = STAIRCASE_GEOMETRY.flight1;
  const f2 = STAIRCASE_GEOMETRY.flight2;
  const l = STAIRCASE_GEOMETRY.landing;
  const mez = MEZZANINE_CONFIG;

  return (
    <group>
      {/* =======================================================================
          1. FLIGHT 1: LOWER FLIGHT (From Ground Y=0 to Landing Y=1.53)
          Ascends South (+Z) from Z = 0.0 to Z = 1.98 at X = 2.85
         ======================================================================= */}
      <group>
        {Array.from({ length: f1.steps }).map((_, i) => {
          const stepY = i * STAIRCASE_GEOMETRY.stepRise;
          const stepZ = f1.startZ + (i + 0.5) * STAIRCASE_GEOMETRY.treadDepth;
          const stepX = f1.startX;

          return (
            <group key={`f1_step_${i}`} position={[stepX, stepY, stepZ]}>
              {/* Solid Wood Tread */}
              <mesh position={[0, 0.022, 0]} castShadow receiveShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth, 0.045, STAIRCASE_GEOMETRY.treadDepth + 0.03]} />
                <meshStandardMaterial
                  map={woodTexture}
                  color="#6d4c41"
                  roughness={0.35}
                  metalness={0.06}
                />
              </mesh>

              {/* Riser & Under-structure Steel Channel */}
              <mesh position={[0, -0.06, 0.11]} castShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth - 0.1, 0.12, 0.03]} />
                <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
              </mesh>

              {/* Ornate Wrought-Iron Scroll Brackets underneath (Left & Right) */}
              <OrnateStepBracket position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.08, 0, 0]} />
              <OrnateStepBracket position={[STAIRCASE_GEOMETRY.treadWidth / 2 - 0.08, 0, 0]} />

              {/* Outer Railing Balusters (along outer East edge of flight 1) */}
              <OrnateBaluster
                position={[STAIRCASE_GEOMETRY.treadWidth / 2 - 0.04, 0.045, 0]}
                height={0.92}
              />
            </group>
          );
        })}

        {/* Flight 1 Sloped Wooden Handrail */}
        <mesh
          position={[
            f1.startX + STAIRCASE_GEOMETRY.treadWidth / 2 - 0.04,
            f1.startY + (f1.endY - f1.startY) / 2 + 0.95,
            f1.startZ + (f1.steps * STAIRCASE_GEOMETRY.treadDepth) / 2,
          ]}
          rotation={[-0.658, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.05, 2.5]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          2. MID-LANDING PLATFORM (Chiếu nghỉ Y = 1.53m)
          X from 1.25 to 3.45, Z from 1.98 to 2.70
         ======================================================================= */}
      <group position={[(l.minX + l.maxX) / 2, l.y, (l.minZ + l.maxZ) / 2]}>
        {/* Landing Solid Wood Platform */}
        <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[l.maxX - l.minX, 0.06, l.maxZ - l.minZ]} />
          <meshStandardMaterial map={woodTexture} color="#6d4c41" roughness={0.35} />
        </mesh>

        {/* Outer Heavy Steel Fascia Beam Trim */}
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[l.maxX - l.minX + 0.04, 0.12, l.maxZ - l.minZ + 0.04]} />
          <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* 4 Heavy Cast-Iron Support Pillars down to ground */}
        {[-0.85, 0.85].map((px) =>
          [-0.25, 0.25].map((pz) => (
            <group key={`land_col_${px}_${pz}`} position={[px, -l.y / 2, pz]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.06, l.y, 16]} />
                <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
              </mesh>
              {/* Decorative Capital */}
              <mesh position={[0, l.y / 2 - 0.05, 0]}>
                <boxGeometry args={[0.15, 0.08, 0.15]} />
                <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.3} />
              </mesh>
              {/* Decorative Base */}
              <mesh position={[0, -l.y / 2 + 0.05, 0]}>
                <boxGeometry args={[0.16, 0.1, 0.16]} />
                <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.3} />
              </mesh>
            </group>
          ))
        )}

        {/* Landing East Outer Handrail & Balusters */}
        {[-0.22, 0, 0.22].map((bz) => (
          <OrnateBaluster key={`land_bal_e_${bz}`} position={[(l.maxX - l.minX) / 2 - 0.04, 0, bz]} height={0.92} />
        ))}
        <mesh position={[(l.maxX - l.minX) / 2 - 0.04, 0.94, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[l.maxZ - l.minZ, 0.06, 0.05]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          3. FLIGHT 2: UPPER FLIGHT (From Landing Y=1.53 to Mezzanine Y=3.06)
          Ascends South (+Z) from Z = 2.70 to Z = 4.68 at X = 1.85
         ======================================================================= */}
      <group>
        {Array.from({ length: f2.steps }).map((_, i) => {
          const stepY = f2.startY + i * STAIRCASE_GEOMETRY.stepRise;
          const stepZ = f2.startZ + (i + 0.5) * STAIRCASE_GEOMETRY.treadDepth;
          const stepX = f2.startX;

          return (
            <group key={`f2_step_${i}`} position={[stepX, stepY, stepZ]}>
              {/* Solid Wood Tread */}
              <mesh position={[0, 0.022, 0]} castShadow receiveShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth, 0.045, STAIRCASE_GEOMETRY.treadDepth + 0.03]} />
                <meshStandardMaterial map={woodTexture} color="#6d4c41" roughness={0.35} metalness={0.06} />
              </mesh>

              {/* Riser & Under-structure Steel Channel */}
              <mesh position={[0, -0.06, 0.11]} castShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth - 0.1, 0.12, 0.03]} />
                <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
              </mesh>

              {/* Ornate Wrought-Iron Scroll Brackets underneath */}
              <OrnateStepBracket position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.08, 0, 0]} />
              <OrnateStepBracket position={[STAIRCASE_GEOMETRY.treadWidth / 2 - 0.08, 0, 0]} />

              {/* Railing Balusters (along outer West edge of flight 2) */}
              <OrnateBaluster
                position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04, 0.045, 0]}
                height={0.92}
              />
            </group>
          );
        })}

        {/* Flight 2 Sloped Wooden Handrail */}
        <mesh
          position={[
            f2.startX - STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04,
            f2.startY + (f2.endY - f2.startY) / 2 + 0.95,
            f2.startZ + (f2.steps * STAIRCASE_GEOMETRY.treadDepth) / 2,
          ]}
          rotation={[-0.658, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.05, 2.5]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          4. 2ND FLOOR MEZZANINE (TẦNG 2 - SÀN LỬNG NGHIÊN CỨU & LAN CAN AN TOÀN)
          Deck height: Y = 3.06m.
          Expanded Southwards to Z = 11.6 for Chemistry, Equipment, Sink & Computer Desk
         ======================================================================= */}
      <group position={[0, mez.floorY, 0]}>
        {/* Slab A: West Floor Deck (X: -9.5 to 1.25, Z: 3.2 to 11.6) */}
        <mesh position={[-4.125, -mez.floorThickness / 2, 7.4]} receiveShadow>
          <boxGeometry args={[10.75, mez.floorThickness, 8.4]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Slab B: East Floor Deck (X: 2.45 to 9.5, Z: 3.2 to 11.6) */}
        <mesh position={[5.975, -mez.floorThickness / 2, 7.4]} receiveShadow>
          <boxGeometry args={[7.05, mez.floorThickness, 8.4]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Slab C: South Walkway Behind Stairwell (X: 1.25 to 2.45, Z: 4.68 to 11.6) */}
        <mesh position={[1.85, -mez.floorThickness / 2, 8.14]} receiveShadow>
          <boxGeometry args={[1.2, mez.floorThickness, 6.92]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.28} metalness={0.12} />
        </mesh>

        {/* Front Steel I-Beam Fascia (West) */}
        <mesh position={[-4.125, -mez.floorThickness - 0.08, 3.2]}>
          <boxGeometry args={[10.75, 0.28, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Front Steel I-Beam Fascia (East) */}
        <mesh position={[5.975, -mez.floorThickness - 0.08, 3.2]}>
          <boxGeometry args={[7.05, 0.28, 0.12]} />
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
        {/* 1. Left Front Overlook Railing (X: -9.5 to 1.25 at Z = 3.2) */}
        <group position={[-4.125, 0, 3.24]}>
          {/* Top Wooden Handrail */}
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[10.75, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          {/* Bottom Iron Rail */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[10.75, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {/* Balusters */}
          {Array.from({ length: 28 }).map((_, bi) => {
            const bx = -5.1 + bi * 0.38;
            return <OrnateBaluster key={`rail_l_${bi}`} position={[bx, 0, 0]} height={0.92} />;
          })}
        </group>

        {/* 2. Right Front Overlook Railing (X: 2.45 to 9.5 at Z = 3.2) */}
        <group position={[5.975, 0, 3.24]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[7.05, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[7.05, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {Array.from({ length: 18 }).map((_, bi) => {
            const bx = -3.2 + bi * 0.38;
            return <OrnateBaluster key={`rail_r_${bi}`} position={[bx, 0, 0]} height={0.92} />;
          })}
        </group>

        {/* 3. Stairwell Left Side Guardrail (along X = 1.25, Z from 3.20 to 4.68) */}
        <group position={[1.25, 0, 3.94]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[1.48, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.48, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {[-0.55, -0.18, 0.18, 0.55].map((bz) => (
            <OrnateBaluster key={`rail_stair_l_${bz}`} position={[bz, 0, 0]} height={0.92} />
          ))}
        </group>

        {/* 4. Stairwell Right Side Guardrail (along X = 2.45, Z from 3.20 to 4.68) */}
        <group position={[2.45, 0, 3.94]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[1.48, 0.06, 0.06]} />
            <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.48, 0.02, 0.03]} />
            <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
          </mesh>
          {[-0.55, -0.18, 0.18, 0.55].map((bz) => (
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
