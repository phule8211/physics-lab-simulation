import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { MEZZANINE_CONFIG, STAIRCASE_GEOMETRY } from '../../data/staircaseConfig';

/**
 * Procedural Wrought Iron Scrollwork Bracket
 * Replicating the ornamental S-scroll / C-scroll metal brackets under each step (Image 1, 4, 5)
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
 * Baluster with Ornamental Spindle Sleeve and Ball (Image 1, 5)
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

      {/* Center decorative elongated oval spindle sleeve (ống tiện phình bầu dục) */}
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
         ======================================================================= */}
      <group>
        {Array.from({ length: f1.steps }).map((_, i) => {
          const stepY = i * STAIRCASE_GEOMETRY.stepRise;
          const stepZ = f1.startZ + i * (f1.directionZ * STAIRCASE_GEOMETRY.treadDepth);
          const stepX = f1.startX;

          return (
            <group key={`f1_step_${i}`} position={[stepX, stepY, stepZ]}>
              {/* Solid Wood Tread (Bậc gỗ sồi/óc chó) */}
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
              <mesh position={[0, -0.06, 0.12]} castShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth - 0.1, 0.12, 0.03]} />
                <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
              </mesh>

              {/* Ornate Wrought-Iron Scroll Brackets underneath (Left & Right) */}
              <OrnateStepBracket position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.08, 0, 0]} />
              <OrnateStepBracket position={[STAIRCASE_GEOMETRY.treadWidth / 2 - 0.08, 0, 0]} />

              {/* Outer Railing Balusters (along outer left edge of flight 1) */}
              <OrnateBaluster
                position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04, 0.045, -0.05]}
                height={0.92}
              />
              <OrnateBaluster
                position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04, 0.045, 0.08]}
                height={0.92}
              />
            </group>
          );
        })}

        {/* Flight 1 Sloped Wooden Handrail */}
        <mesh
          position={[
            f1.startX - STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04,
            f1.startY + 0.98 + (f1.endY - f1.startY) / 2,
            f1.startZ + (f1.directionZ * (f1.steps * STAIRCASE_GEOMETRY.treadDepth)) / 2,
          ]}
          rotation={[-0.54, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.05, 3.0]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          2. MID-LANDING PLATFORM (Chiếu nghỉ Y = 1.53m)
         ======================================================================= */}
      <group position={[(l.minX + l.maxX) / 2, l.y, (l.minZ + l.maxZ) / 2]}>
        {/* Landing Solid Wood Platform */}
        <mesh position={[0, -0.03, 0]} castShadow receiveShadow>
          <boxGeometry args={[l.maxX - l.minX, 0.06, l.maxZ - l.minZ]} />
          <meshStandardMaterial map={woodTexture} color="#6d4c41" roughness={0.35} />
        </mesh>

        {/* Outer Heavy Steel Fascia Beam Trim */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[l.maxX - l.minX + 0.04, 0.12, l.maxZ - l.minZ + 0.04]} />
          <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* 4 Heavy Cast-Iron Support Pillars down to ground */}
        {[-0.9, 0.9].map((px) =>
          [-0.6, 0.6].map((pz) => (
            <group key={`land_col_${px}_${pz}`} position={[px, -l.y / 2, pz]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.055, 0.065, l.y, 16]} />
                <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
              </mesh>
              {/* Pillar Decorative Capital and Base */}
              <mesh position={[0, l.y / 2 - 0.05, 0]}>
                <boxGeometry args={[0.16, 0.08, 0.16]} />
                <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.3} />
              </mesh>
              <mesh position={[0, -l.y / 2 + 0.05, 0]}>
                <boxGeometry args={[0.18, 0.1, 0.18]} />
                <meshStandardMaterial color="#27272a" metalness={0.85} roughness={0.3} />
              </mesh>
            </group>
          ))
        )}

        {/* Landing Guardrails along North side (Z-) and East side (X+) */}
        {[-1.0, -0.5, 0, 0.5, 1.0].map((bx) => (
          <OrnateBaluster key={`land_bal_n_${bx}`} position={[bx, 0, -(l.maxZ - l.minZ) / 2 + 0.04]} height={0.92} />
        ))}
        {/* North Handrail */}
        <mesh position={[0, 0.94, -(l.maxZ - l.minZ) / 2 + 0.04]}>
          <boxGeometry args={[l.maxX - l.minX, 0.06, 0.05]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>

        {/* East Handrail */}
        <mesh position={[(l.maxX - l.minX) / 2 - 0.04, 0.94, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[l.maxZ - l.minZ, 0.06, 0.05]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          3. FLIGHT 2: UPPER FLIGHT (From Landing Y=1.53 to Mezzanine Y=3.06)
         ======================================================================= */}
      <group>
        {Array.from({ length: f2.steps }).map((_, i) => {
          const stepY = f2.startY + i * STAIRCASE_GEOMETRY.stepRise;
          const stepZ = f2.startZ + i * (f2.directionZ * STAIRCASE_GEOMETRY.treadDepth);
          const stepX = f2.startX;

          return (
            <group key={`f2_step_${i}`} position={[stepX, stepY, stepZ]}>
              {/* Solid Wood Tread */}
              <mesh position={[0, 0.022, 0]} castShadow receiveShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth, 0.045, STAIRCASE_GEOMETRY.treadDepth + 0.03]} />
                <meshStandardMaterial map={woodTexture} color="#6d4c41" roughness={0.35} metalness={0.06} />
              </mesh>

              {/* Riser & Under-structure Steel Channel */}
              <mesh position={[0, -0.06, -0.12]} castShadow>
                <boxGeometry args={[STAIRCASE_GEOMETRY.treadWidth - 0.1, 0.12, 0.03]} />
                <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
              </mesh>

              {/* Ornate Wrought-Iron Scroll Brackets underneath */}
              <OrnateStepBracket position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.08, 0, 0]} />
              <OrnateStepBracket position={[STAIRCASE_GEOMETRY.treadWidth / 2 - 0.08, 0, 0]} />

              {/* Railing Balusters (along outer left edge of flight 2) */}
              <OrnateBaluster
                position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04, 0.045, -0.08]}
                height={0.92}
              />
              <OrnateBaluster
                position={[-STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04, 0.045, 0.08]}
                height={0.92}
              />
            </group>
          );
        })}

        {/* Flight 2 Sloped Wooden Handrail */}
        <mesh
          position={[
            f2.startX - STAIRCASE_GEOMETRY.treadWidth / 2 + 0.04,
            f2.startY + 0.98 + (f2.endY - f2.startY) / 2,
            f2.startZ + (f2.directionZ * (f2.steps * STAIRCASE_GEOMETRY.treadDepth)) / 2,
          ]}
          rotation={[0.54, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.06, 0.05, 3.0]} />
          <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          4. 2ND FLOOR MEZZANINE (TẦNG 2 - SÀN LỬNG NGHIÊN CỨU & LAN CAN AN TOÀN)
         ======================================================================= */}
      <group position={[0, mez.floorY, (mez.bounds.minZ + mez.bounds.maxZ) / 2]}>
        {/* Main Mezzanine Structural Floor Slab */}
        <mesh position={[0, -mez.floorThickness / 2, 0]} receiveShadow>
          <boxGeometry
            args={[
              mez.bounds.maxX - mez.bounds.minX,
              mez.floorThickness,
              mez.bounds.maxZ - mez.bounds.minZ,
            ]}
          />
          <meshStandardMaterial
            map={woodTexture}
            color="#5d4037"
            roughness={0.28}
            metalness={0.12}
            envMapIntensity={0.8}
          />
        </mesh>

        {/* Front Steel I-Beam Fascia (Dầm viền chịu lực thép hình I) */}
        <mesh position={[0, -mez.floorThickness - 0.08, -(mez.bounds.maxZ - mez.bounds.minZ) / 2]}>
          <boxGeometry args={[mez.bounds.maxX - mez.bounds.minX, 0.28, 0.12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.25} />
        </mesh>

        {/* Heavy Structural Support Columns from Ground to Mezzanine (4 pillars) */}
        {[-7.5, -2.5, 2.5, 7.5].map((cx) => (
          <group key={`mez_col_${cx}`} position={[cx, -mez.floorY / 2, -(mez.bounds.maxZ - mez.bounds.minZ) / 2 + 0.1]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.09, 0.11, mez.floorY, 24]} />
              <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Column Capital */}
            <mesh position={[0, mez.floorY / 2 - 0.1, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.26]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
            {/* Column Baseplate */}
            <mesh position={[0, -mez.floorY / 2 + 0.08, 0]}>
              <boxGeometry args={[0.28, 0.12, 0.28]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* 2nd Floor Safety Guardrail overlooking Ground Floor (Lan can bảo vệ tầng 2) */}
        {/* Front overlook railing (skipping stair entrance opening at x in [5.8, 7.5]) */}
        <group position={[0, 0, -(mez.bounds.maxZ - mez.bounds.minZ) / 2 + 0.04]}>
          {/* Railing Left Section (from X = -9.6 to X = 5.7) */}
          <group position={[-1.95, 0, 0]}>
            {/* Wooden top handrail */}
            <mesh position={[0, 0.95, 0]} castShadow>
              <boxGeometry args={[15.3, 0.06, 0.06]} />
              <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
            </mesh>

            {/* Bottom iron rail bar */}
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[15.3, 0.02, 0.03]} />
              <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
            </mesh>

            {/* Vertical Balusters every 0.35m */}
            {Array.from({ length: 42 }).map((_, bi) => {
              const bx = -7.4 + bi * 0.36;
              return <OrnateBaluster key={`rail_bal_${bi}`} position={[bx, 0, 0]} height={0.92} />;
            })}
          </group>

          {/* Railing along Upper Stairway Opening (North-South direction) */}
          <group position={[5.7, 0, 1.2]} rotation={[0, Math.PI / 2, 0]}>
            <mesh position={[0, 0.95, 0]} castShadow>
              <boxGeometry args={[2.4, 0.06, 0.06]} />
              <meshStandardMaterial map={woodTexture} color="#5d4037" roughness={0.3} />
            </mesh>
            {Array.from({ length: 7 }).map((_, bi) => (
              <OrnateBaluster key={`rail_side_bal_${bi}`} position={[-1.0 + bi * 0.33, 0, 0]} height={0.92} />
            ))}
          </group>
        </group>

        {/* Recessed Warm Ceiling / Mezzanine Lighting */}
        {[-6, -2, 2, 6].map((lx) => (
          <pointLight
            key={`mez_light_${lx}`}
            position={[lx, 2.8, 0]}
            intensity={2.2}
            distance={8}
            decay={2}
            color="#fef3c7"
          />
        ))}
      </group>
    </group>
  );
}

