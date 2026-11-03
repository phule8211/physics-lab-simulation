import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabStore, HeldItemType, playerWorldState } from '../../../store/useLabStore';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls';

// =========================================================================
// 1. HELD LAB ITEMS 3D MODELS (VẬT DỤNG THÍ NGHIỆM TRÊN TAY DORAEMON)
// =========================================================================

/** Laser-Cut Specimen Workpiece (Bánh răng laser) */
function HeldWorkpiece({ materialType }: { materialType: string }) {
  const isWood = materialType === 'WOOD';
  const isAcrylic = materialType === 'ACRYLIC';
  const isMetal = materialType === 'STEEL' || materialType === 'ALUMINUM';

  const baseColor = isWood
    ? '#b45309'
    : isAcrylic
    ? '#38bdf8'
    : isMetal
    ? '#cbd5e1'
    : '#f8fafc';

  return (
    <group position={[0, 0.04, -0.06]} rotation={[0.4, 0.2, -0.1]}>
      {/* Central Gear Disk */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.012, 24]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={isMetal ? 0.9 : 0.05}
          roughness={isWood ? 0.8 : isAcrylic ? 0.15 : 0.25}
          transparent={isAcrylic}
          opacity={isAcrylic ? 0.8 : 1.0}
        />
      </mesh>
      {/* 12 Outer Gear Teeth */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <mesh
            key={`gear-tooth-${i}`}
            position={[Math.cos(angle) * 0.048, 0, Math.sin(angle) * 0.048]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.012, 0.012, 0.012]} />
            <meshStandardMaterial
              color={isWood ? '#92400e' : baseColor}
              metalness={isMetal ? 0.9 : 0.05}
              roughness={isWood ? 0.9 : 0.2}
            />
          </mesh>
        );
      })}
      {/* Center Bore Axle Hole */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.013, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Borosilicate Glass Beaker 250ml (Cốc đong chia vạch thủy tinh) */
function HeldBeaker() {
  return (
    <group position={[0, 0.05, -0.05]} rotation={[0.2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.032, 0.028, 0.075, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.42}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.038, -0.03]} rotation={[-0.4, 0, 0]}>
        <coneGeometry args={[0.008, 0.012, 8]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.029, 0.026, 0.045, 18]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.2}
          transparent
          opacity={0.78}
          roughness={0.1}
        />
      </mesh>
      {[-0.015, -0.005, 0.005, 0.015, 0.025].map((y, i) => (
        <mesh key={`beaker-tick-${i}`} position={[0, y, 0.03]}>
          <boxGeometry args={[0.014, 0.0015, 0.001]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

/** Glass Test Tube with Solution (Ống nghiệm thủy tinh đáy cầu) */
function HeldTestTube() {
  return (
    <group position={[0, 0.06, -0.04]} rotation={[0.3, 0.1, -0.15]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.09, 16]} />
        <meshPhysicalMaterial
          color="#f0f9ff"
          transparent
          opacity={0.35}
          roughness={0.05}
          clearcoat={1.0}
        />
      </mesh>
      <mesh position={[0, -0.045, 0]}>
        <sphereGeometry args={[0.01, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#f0f9ff" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -0.015, 0]}>
        <cylinderGeometry args={[0.0085, 0.0085, 0.05, 16]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#9333ea"
          emissiveIntensity={1.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 0.048, 0]}>
        <cylinderGeometry args={[0.011, 0.009, 0.012, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Lab Micropipette 100-1000uL (Bút bơm hóa chất chuẩn) */
function HeldPipette() {
  return (
    <group position={[0, 0.07, -0.04]} rotation={[0.4, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.013, 0.011, 0.1, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.056, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.018, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.015, 0.01]}>
        <boxGeometry args={[0.014, 0.022, 0.006]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <coneGeometry args={[0.007, 0.05, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.11, 0]}>
        <coneGeometry args={[0.004, 0.035, 16]} />
        <meshPhysicalMaterial color="#38bdf8" transparent opacity={0.7} roughness={0.1} />
      </mesh>
    </group>
  );
}

/** Digital Vernier Caliper (Thước kẹp điện tử) */
function HeldCaliper() {
  return (
    <group position={[0, 0.04, -0.05]} rotation={[0.3, 0.3, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[0.012, 0.16, 0.004]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.014, 0.07, 0]}>
        <boxGeometry args={[0.022, 0.012, 0.004]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.006, 0.02, 0.004]}>
        <boxGeometry args={[0.026, 0.036, 0.01]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0.006, 0.02, 0.01]}>
        <planeGeometry args={[0.018, 0.018]} />
        <meshBasicMaterial color="#0284c7" />
      </mesh>
    </group>
  );
}

// =========================================================================
// 2. FIRST-PERSON DORAEMON HANDS (BÀN TAY TRÒN XOE TRẮNG CỦA DORAEMON)
// =========================================================================

interface DoraemonHandProps {
  side: 'left' | 'right';
  tapProgress: number;
  walkCycle: number;
  isMoving: boolean;
  heldItem: HeldItemType;
  materialType: string;
}

function DoraemonHand({
  side,
  tapProgress,
  walkCycle,
  isMoving,
  heldItem,
  materialType,
}: DoraemonHandProps) {
  const isRight = side === 'right';
  const sign = isRight ? 1 : -1;

  // Natural walking swing and tap reach offset
  const walkBob = isMoving ? Math.sin(walkCycle * 2) * 0.01 : 0;
  const walkSway = isMoving ? Math.cos(walkCycle) * 0.015 * sign : 0;
  const tapOffset = tapProgress * 0.12;

  const posX = sign * 0.28 + walkSway;
  const posY = -0.22 + walkBob + tapProgress * 0.04;
  const posZ = -0.42 - tapOffset;

  return (
    <group position={[posX, posY, posZ]} rotation={[0.2, -sign * 0.15, -sign * 0.1]}>
      {/* Blue Sleeve (Ống tay áo xanh Doraemon) */}
      <mesh position={[-sign * 0.04, -0.06, 0.08]} rotation={[0.4, 0, sign * 0.2]} castShadow>
        <cylinderGeometry args={[0.062, 0.055, 0.16, 20]} />
        <meshStandardMaterial color="#009fe8" roughness={0.35} />
      </mesh>

      {/* Red Wrist Cuff Trim (Viền cổ tay màu đỏ phong cách Doraemon) */}
      <mesh position={[-sign * 0.018, -0.015, 0.04]} rotation={[0.4, 0, sign * 0.2]}>
        <torusGeometry args={[0.058, 0.008, 12, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>

      {/* Iconic Spherical White Paw / Hand (Bàn tay tròn xoe màu trắng của Doraemon) */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* Cute White Specular Glisten on hand */}
      <mesh position={[sign * 0.025, 0.055, 0.035]}>
        <sphereGeometry args={[0.01, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Held Lab Item on Right Hand (Workpiece, Beaker, Pipette, etc.) */}
      {isRight && (
        <group position={[0, 0.04, -0.02]}>
          {heldItem === 'WORKPIECE' && <HeldWorkpiece materialType={materialType} />}
          {heldItem === 'BEAKER' && <HeldBeaker />}
          {heldItem === 'TEST_TUBE' && <HeldTestTube />}
          {heldItem === 'PIPETTE' && <HeldPipette />}
          {heldItem === 'CALIPER' && <HeldCaliper />}
        </group>
      )}
    </group>
  );
}

// =========================================================================
// 3. FULL 3D DORAEMON CHARACTER MODEL (MÔ HÌNH DORAEMON HOÀN CHỈNH 3D)
// =========================================================================

interface FullBodyDoraemonProps {
  walkCycle: number;
  isMoving: boolean;
  heldItem: HeldItemType;
  materialType: string;
}

function FullBodyDoraemon({
  walkCycle,
  isMoving,
  heldItem,
  materialType,
}: FullBodyDoraemonProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentYawRef = useRef<number>(0);

  // Waddling walk swing dynamics
  const waddleAngle = isMoving ? Math.sin(walkCycle) * 0.09 : 0;
  const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.55 : 0;
  const rightLegAngle = isMoving ? -Math.sin(walkCycle) * 0.55 : 0;
  const leftArmAngle = isMoving ? -Math.sin(walkCycle) * 0.6 : 0;
  const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.6 : 0;
  const tailWiggle = isMoving ? Math.sin(walkCycle * 2) * 0.35 : Math.sin(Date.now() * 0.003) * 0.1;

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.1);

    // Smooth position matching player world coordinates
    const eyeHeight = 1.7;
    const groundY = playerWorldState.y - eyeHeight;

    rootRef.current.position.set(playerWorldState.x, groundY, playerWorldState.z);

    // Smooth character rotation toward travel angle when walking, or camera view when stopped
    const targetAngle = playerWorldState.isMoving
      ? playerWorldState.moveAngle
      : playerWorldState.yaw;

    // Shortest angular difference interpolation
    let diff = targetAngle - currentYawRef.current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    currentYawRef.current += diff * Math.min(1, dt * 14);
    rootRef.current.rotation.set(0, currentYawRef.current, 0);
  });

  return (
    <group ref={rootRef} name="FullBodyDoraemon">
      {/* Base container rocking slightly during waddling walk */}
      <group rotation={[0, 0, waddleAngle]}>
        {/* =====================================================================
            1. HEAD & ICONIC FACE (Đầu & Khuôn mặt Doraemon)
           ===================================================================== */}
        <group position={[0, 0.98, 0]}>
          {/* Main Blue Spherical Head */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.38, 36, 36]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} metalness={0.05} />
          </mesh>

          {/* White Face Mask Oval (Mặt nạ tròn trắng phía trước mặt) */}
          <mesh position={[0, -0.04, 0.11]} scale={[1.04, 0.95, 0.92]}>
            <sphereGeometry args={[0.33, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.28} metalness={0.02} />
          </mesh>

          {/* Left Eye (Mắt trái hình bầu dục trắng) */}
          <group position={[-0.068, 0.13, 0.32]}>
            <mesh scale={[0.07, 0.09, 0.035]}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Eye border outline */}
            <mesh scale={[0.072, 0.092, 0.03]}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial color="#0f172a" wireframe />
            </mesh>
            {/* Pupil (Tròng đen) */}
            <mesh position={[0.015, 0, 0.032]} scale={[0.022, 0.034, 0.008]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#09090b" />
            </mesh>
            {/* Catchlight (Điểm sáng trắng trong mắt) */}
            <mesh position={[0.022, 0.016, 0.038]}>
              <sphereGeometry args={[0.008, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* Right Eye (Mắt phải hình bầu dục trắng) */}
          <group position={[0.068, 0.13, 0.32]}>
            <mesh scale={[0.07, 0.09, 0.035]}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Eye border outline */}
            <mesh scale={[0.072, 0.092, 0.03]}>
              <sphereGeometry args={[1, 20, 20]} />
              <meshBasicMaterial color="#0f172a" wireframe />
            </mesh>
            {/* Pupil (Tròng đen) */}
            <mesh position={[-0.015, 0, 0.032]} scale={[0.022, 0.034, 0.008]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshBasicMaterial color="#09090b" />
            </mesh>
            {/* Catchlight (Điểm sáng trắng trong mắt) */}
            <mesh position={[-0.008, 0.016, 0.038]}>
              <sphereGeometry args={[0.008, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>

          {/* Bright Red Nose (Mũi đỏ tròn xoe) */}
          <mesh position={[0, 0.055, 0.38]} castShadow>
            <sphereGeometry args={[0.052, 24, 24]} />
            <meshStandardMaterial color="#ef4444" roughness={0.18} metalness={0.15} />
          </mesh>
          {/* Nose Specular Shine Highlight */}
          <mesh position={[-0.015, 0.075, 0.42]}>
            <sphereGeometry args={[0.012, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Black Philtrum Line (Đường thẳng đen nối mũi xuống miệng) */}
          <mesh position={[0, -0.02, 0.38]}>
            <boxGeometry args={[0.005, 0.09, 0.006]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>

          {/* Curved Happy Smile (Nụ cười tươi đỏ đặc trưng) */}
          <group position={[0, -0.075, 0.36]}>
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.13, 0.007, 12, 28, Math.PI]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            {/* Pink Tongue (Chiếc lưỡi hồng đáng yêu) */}
            <mesh position={[0, -0.02, -0.005]} scale={[1.2, 0.8, 1]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshStandardMaterial color="#fb7185" roughness={0.4} />
            </mesh>
          </group>

          {/* 6 Whiskers (6 chiếc râu mèo đặc trưng: 3 trái, 3 phải) */}
          {/* Left Cheek Whiskers */}
          {[-0.15, 0, 0.15].map((angle, idx) => (
            <mesh
              key={`whisker-l-${idx}`}
              position={[-0.20, -0.01 + idx * 0.035, 0.34]}
              rotation={[0, -0.3, angle]}
            >
              <cylinderGeometry args={[0.003, 0.003, 0.12, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          ))}

          {/* Right Cheek Whiskers */}
          {[-0.15, 0, 0.15].map((angle, idx) => (
            <mesh
              key={`whisker-r-${idx}`}
              position={[0.20, -0.01 + idx * 0.035, 0.34]}
              rotation={[0, 0.3, -angle]}
            >
              <cylinderGeometry args={[0.003, 0.003, 0.12, 8]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          ))}
        </group>

        {/* =====================================================================
            2. RED COLLAR & GOLDEN MAGIC BELL (Vòng cổ đỏ & Chuông vàng thần kỳ)
           ===================================================================== */}
        <group position={[0, 0.67, 0]}>
          {/* Thick Red Collar Strap */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26, 0.034, 16, 36]} />
            <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.1} />
          </mesh>

          {/* Golden Bell (Chuông vàng kim loại sáng bóng) */}
          <group position={[0, -0.035, 0.28]}>
            <mesh castShadow>
              <sphereGeometry args={[0.065, 24, 24]} />
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.9}
                roughness={0.18}
                envMapIntensity={1.5}
              />
            </mesh>
            {/* Equatorial slit groove */}
            <mesh>
              <torusGeometry args={[0.066, 0.0035, 8, 24]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Bell center sound hole */}
            <mesh position={[0, -0.01, 0.062]}>
              <sphereGeometry args={[0.012, 12, 12]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Golden loop attaching to collar */}
            <mesh position={[0, 0.06, 0]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.018, 0.005, 8, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* =====================================================================
            3. TORSO & 4D MAGIC POUCH (Thân tròn mũm mĩm & Túi thần kỳ)
           ===================================================================== */}
        <group position={[0, 0.38, 0]}>
          {/* Chubby Blue Body Sphere */}
          <mesh castShadow receiveShadow scale={[1.05, 0.95, 0.95]}>
            <sphereGeometry args={[0.34, 32, 32]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} metalness={0.05} />
          </mesh>

          {/* Large White Belly (Bụng trắng tròn xoe) */}
          <mesh position={[0, 0, 0.11]} scale={[1.04, 0.95, 0.9]}>
            <sphereGeometry args={[0.27, 28, 28]} />
            <meshStandardMaterial color="#ffffff" roughness={0.28} metalness={0.02} />
          </mesh>

          {/* 4D Magic Pocket (Túi thần kỳ bán nguyệt) */}
          <group position={[0, -0.06, 0.33]}>
            {/* White pocket front semicircle */}
            <mesh rotation={[0, 0, 0]}>
              <circleGeometry args={[0.15, 24, 0, Math.PI]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Pocket rim outline */}
            <mesh position={[0, 0, 0.002]}>
              <ringGeometry args={[0.145, 0.152, 24, 1, 0, Math.PI]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <boxGeometry args={[0.30, 0.007, 0.002]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          </group>

          {/* Red Round Tail on Lower Back (Chiếc đuôi đỏ tròn xoe) */}
          <group position={[0, -0.16, -0.32]} rotation={[0, tailWiggle, 0]}>
            {/* Red sphere tail */}
            <mesh castShadow>
              <sphereGeometry args={[0.048, 20, 20]} />
              <meshStandardMaterial color="#ef4444" roughness={0.25} />
            </mesh>
            {/* Connecting stem */}
            <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 12]} />
              <meshStandardMaterial color="#009fe8" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* =====================================================================
            4. ARMS & WHITE ROUND HANDS (Cánh tay xanh & Bàn tay tròn xoe trắng)
           ===================================================================== */}
        {/* Left Arm (Tay trái) */}
        <group position={[-0.32, 0.44, 0]} rotation={[leftArmAngle, 0, 0.25]}>
          {/* Blue sleeve arm */}
          <mesh position={[-0.04, -0.10, 0]} rotation={[0, 0, 0.3]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.20, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} />
          </mesh>
          {/* Round spherical white hand */}
          <mesh position={[-0.09, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.082, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.22} />
          </mesh>
        </group>

        {/* Right Arm (Tay phải - cầm dụng cụ khi được chọn) */}
        <group position={[0.32, 0.44, 0]} rotation={[rightArmAngle, 0, -0.25]}>
          {/* Blue sleeve arm */}
          <mesh position={[0.04, -0.10, 0]} rotation={[0, 0, -0.3]} castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.20, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} />
          </mesh>
          {/* Round spherical white hand */}
          <mesh position={[0.09, -0.22, 0]} castShadow>
            <sphereGeometry args={[0.082, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.22} />
          </mesh>

          {/* Held Lab Item attached to right hand */}
          {heldItem !== 'NONE' && (
            <group position={[0.10, -0.20, 0.04]} scale={[1.3, 1.3, 1.3]}>
              {heldItem === 'WORKPIECE' && <HeldWorkpiece materialType={materialType} />}
              {heldItem === 'BEAKER' && <HeldBeaker />}
              {heldItem === 'TEST_TUBE' && <HeldTestTube />}
              {heldItem === 'PIPETTE' && <HeldPipette />}
              {heldItem === 'CALIPER' && <HeldCaliper />}
            </group>
          )}
        </group>

        {/* =====================================================================
            5. LEGS & OVAL WHITE FEET (Chân xanh & Bàn chân trắng dẹt hình bầu dục)
           ===================================================================== */}
        {/* Left Leg & Foot (Chân trái) */}
        <group position={[-0.14, 0.12, 0]} rotation={[leftLegAngle, 0, 0]}>
          {/* Short stubby blue leg */}
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.14, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.4} />
          </mesh>
          {/* Large flat oval white shoe */}
          <mesh position={[0, -0.08, 0.04]} scale={[0.115, 0.065, 0.22]} castShadow receiveShadow>
            <sphereGeometry args={[1, 20, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.32} />
          </mesh>
        </group>

        {/* Right Leg & Foot (Chân phải) */}
        <group position={[0.14, 0.12, 0]} rotation={[rightLegAngle, 0, 0]}>
          {/* Short stubby blue leg */}
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.14, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.4} />
          </mesh>
          {/* Large flat oval white shoe */}
          <mesh position={[0, -0.08, 0.04]} scale={[0.115, 0.065, 0.22]} castShadow receiveShadow>
            <sphereGeometry args={[1, 20, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.32} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 4. MAIN DORAEMON PLAYER ORCHESTRATOR
// =========================================================================

export function DoraemonPlayer() {
  const { camera } = useThree();
  const keys = useKeyboardControls();
  const firstPersonGroupRef = useRef<THREE.Group>(null);

  const {
    mode,
    heldItem,
    selectedMaterial,
    isThirdPersonView,
  } = useLabStore();

  const walkCycle = useRef(0);
  const idleTime = useRef(0);
  const swayX = useRef(0);
  const swayY = useRef(0);
  const prevCamRot = useRef(new THREE.Euler().copy(camera.rotation));
  const tapAnim = useRef(0);

  // Mouse click tap animation on first-person paws
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement) {
        tapAnim.current = 1.0;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const isVisible = mode === 'WALKING';

    // Update walking cycle
    const isMoving =
      keys.current.forward ||
      keys.current.backward ||
      keys.current.left ||
      keys.current.right ||
      playerWorldState.isMoving;

    const isSprinting = keys.current.sprint;
    const moveSpeed = isSprinting ? 12 : 7.5;

    if (isMoving) {
      walkCycle.current += dt * moveSpeed;
    } else {
      walkCycle.current = THREE.MathUtils.damp(
        walkCycle.current,
        Math.round(walkCycle.current / Math.PI) * Math.PI,
        6,
        dt
      );
    }

    idleTime.current += dt;

    // First-person viewmodel positioning (Only visible in first-person mode)
    if (firstPersonGroupRef.current) {
      const showFirstPersonHands = isVisible && !isThirdPersonView;
      firstPersonGroupRef.current.visible = showFirstPersonHands;

      if (showFirstPersonHands) {
        firstPersonGroupRef.current.position.copy(camera.position);
        firstPersonGroupRef.current.quaternion.copy(camera.quaternion);

        // Inertial Mouse Sway Lag
        const deltaYaw = camera.rotation.y - prevCamRot.current.y;
        const deltaPitch = camera.rotation.x - prevCamRot.current.x;
        prevCamRot.current.copy(camera.rotation);

        swayX.current = THREE.MathUtils.damp(swayX.current, -deltaYaw * 0.12, 10, dt);
        swayY.current = THREE.MathUtils.damp(swayY.current, deltaPitch * 0.12, 10, dt);

        if (tapAnim.current > 0) {
          tapAnim.current = THREE.MathUtils.damp(tapAnim.current, 0, 8, dt);
        }

        const breatheY = Math.sin(idleTime.current * 1.8) * 0.005;
        const breatheX = Math.cos(idleTime.current * 0.9) * 0.003;

        firstPersonGroupRef.current.translateX(swayX.current + breatheX);
        firstPersonGroupRef.current.translateY(swayY.current + breatheY);
      }
    }
  });

  const isVisible = mode === 'WALKING';
  const isMoving =
    keys.current.forward ||
    keys.current.backward ||
    keys.current.left ||
    keys.current.right ||
    playerWorldState.isMoving;

  return (
    <>
      {/* 1. Full 3D Doraemon Character on Ground (Always active when walking, highlighted in Third-Person mode) */}
      {isVisible && (
        <FullBodyDoraemon
          walkCycle={walkCycle.current}
          isMoving={isMoving}
          heldItem={heldItem}
          materialType={selectedMaterial}
        />
      )}

      {/* 2. First-Person Doraemon Round White Paws (Shown when not in 3rd-person view) */}
      <group ref={firstPersonGroupRef} name="FirstPersonDoraemonHands">
        <DoraemonHand
          side="left"
          tapProgress={tapAnim.current * 0.6}
          walkCycle={walkCycle.current}
          isMoving={isMoving}
          heldItem={heldItem}
          materialType={selectedMaterial}
        />
        <DoraemonHand
          side="right"
          tapProgress={tapAnim.current}
          walkCycle={walkCycle.current}
          isMoving={isMoving}
          heldItem={heldItem}
          materialType={selectedMaterial}
        />
      </group>
    </>
  );
}
