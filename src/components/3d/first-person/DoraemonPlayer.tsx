import React, { useRef, useState, useEffect, useMemo } from 'react';
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
    <group position={[0, 0.035, -0.04]} rotation={[0.4, 0.2, -0.1]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.012, 24]} />
        <meshStandardMaterial
          color={baseColor}
          metalness={isMetal ? 0.9 : 0.05}
          roughness={isWood ? 0.8 : isAcrylic ? 0.15 : 0.25}
          transparent={isAcrylic}
          opacity={isAcrylic ? 0.8 : 1.0}
        />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI * 2) / 12;
        return (
          <mesh
            key={`gear-tooth-${i}`}
            position={[Math.cos(angle) * 0.043, 0, Math.sin(angle) * 0.043]}
            rotation={[0, -angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshStandardMaterial
              color={isWood ? '#92400e' : baseColor}
              metalness={isMetal ? 0.9 : 0.05}
              roughness={isWood ? 0.9 : 0.2}
            />
          </mesh>
        );
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.013, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Borosilicate Glass Beaker 250ml (Cốc đong chia vạch thủy tinh) */
function HeldBeaker() {
  return (
    <group position={[0, 0.035, -0.03]} rotation={[0.2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.026, 0.023, 0.06, 20]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transparent
          opacity={0.45}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.023, 0.021, 0.038, 18]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.2}
          transparent
          opacity={0.8}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

/** Glass Test Tube with Solution (Ống nghiệm thủy tinh đáy cầu) */
function HeldTestTube() {
  return (
    <group position={[0, 0.04, -0.03]} rotation={[0.3, 0.1, -0.15]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.075, 16]} />
        <meshPhysicalMaterial
          color="#f0f9ff"
          transparent
          opacity={0.4}
          roughness={0.05}
          clearcoat={1.0}
        />
      </mesh>
      <mesh position={[0, -0.015, 0]}>
        <cylinderGeometry args={[0.0075, 0.0075, 0.04, 16]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#9333ea"
          emissiveIntensity={1.3}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

/** Lab Micropipette 100-1000uL (Bút bơm hóa chất chuẩn) */
function HeldPipette() {
  return (
    <group position={[0, 0.05, -0.03]} rotation={[0.4, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.01, 0.008, 0.085, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.014, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.055, 0]}>
        <coneGeometry args={[0.005, 0.04, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Digital Vernier Caliper (Thước kẹp điện tử) */
function HeldCaliper() {
  return (
    <group position={[0, 0.025, -0.03]} rotation={[0.3, 0.3, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[0.009, 0.13, 0.003]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.004, 0.012, 0.003]}>
        <boxGeometry args={[0.02, 0.028, 0.007]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
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
  const walkBob = isMoving ? Math.sin(walkCycle * 2) * 0.006 : 0;
  const walkSway = isMoving ? Math.cos(walkCycle) * 0.008 * sign : 0;
  const tapOffset = tapProgress * 0.06;

  // Position hands naturally at lower corners of screen
  const posX = sign * 0.22 + walkSway;
  const posY = -0.25 + walkBob + tapProgress * 0.025;
  const posZ = -0.36 - tapOffset;

  return (
    <group position={[posX, posY, posZ]} rotation={[0.22, -sign * 0.1, -sign * 0.06]}>
      {/* Blue Sleeve (Ống tay áo xanh tròn) */}
      <mesh position={[-sign * 0.025, -0.045, 0.05]} rotation={[0.32, 0, sign * 0.12]} castShadow>
        <cylinderGeometry args={[0.044, 0.038, 0.11, 20]} />
        <meshStandardMaterial color="#009fe8" roughness={0.35} />
      </mesh>

      {/* Red Wrist Trim Ring (Viền cổ tay màu đỏ đặc trưng) */}
      <mesh position={[-sign * 0.01, -0.01, 0.025]} rotation={[0.32, 0, sign * 0.12]}>
        <torusGeometry args={[0.042, 0.0055, 12, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.35} />
      </mesh>

      {/* Iconic Spherical White Paw (Bàn tay tròn xoe màu trắng của Doraemon) */}
      <mesh position={[0, 0.012, 0]} castShadow>
        <sphereGeometry args={[0.05, 28, 28]} />
        <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.02} />
      </mesh>

      {/* Subtle Specular Glisten on Paw */}
      <mesh position={[sign * 0.018, 0.04, 0.025]}>
        <sphereGeometry args={[0.007, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Held Lab Item on Right Hand */}
      {isRight && (
        <group position={[0, 0.025, -0.015]} scale={[1.1, 1.1, 1.1]}>
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
// 3. ANIME-FAITHFUL DORAEMON FACE TEXTURE GENERATOR (CANVAS 1024x1024)
// =========================================================================

function createDoraemonFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background matching Doraemon Blue
  ctx.fillStyle = '#009fe8';
  ctx.fillRect(0, 0, 1024, 1024);

  // 1. Large White Face Mask (Mặt nạ tròn trắng siêu to bao phủ trọn mặt)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(512, 530, 440, 420, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#0284c7';
  ctx.stroke();
  ctx.restore();

  // 2. Big Anime Eyes (Hai mắt to chạm nhau giữa trục X = 512)
  const eyeRadiusX = 120;
  const eyeRadiusY = 175;
  const eyeCenterY = 265;
  const leftEyeCenterX = 512 - eyeRadiusX; // 392
  const rightEyeCenterX = 512 + eyeRadiusX; // 632

  function drawEye(cx: number, cy: number, isLeft: boolean) {
    if (!ctx) return;
    ctx.save();
    // Sclera
    ctx.beginPath();
    ctx.ellipse(cx, cy, eyeRadiusX, eyeRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#09090b';
    ctx.stroke();

    // Pupil
    const pupilX = isLeft ? cx + 38 : cx - 38;
    const pupilY = cy + 24;
    ctx.beginPath();
    ctx.ellipse(pupilX, pupilY, 36, 52, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#09090b';
    ctx.fill();

    // Sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pupilX - 10, pupilY - 14, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pupilX + 11, pupilY + 18, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEye(leftEyeCenterX, eyeCenterY, true);
  drawEye(rightEyeCenterX, eyeCenterY, false);

  // 3. Shiny Red Ball Nose
  const noseY = 415;
  ctx.save();
  ctx.beginPath();
  ctx.arc(512, noseY, 56, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(495, 395, 8, 512, noseY, 56);
  grad.addColorStop(0, '#ff6b6b');
  grad.addColorStop(0.35, '#ef4444');
  grad.addColorStop(1, '#b91c1c');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#991b1b';
  ctx.stroke();

  // Nose highlight
  ctx.beginPath();
  ctx.arc(495, 395, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // 4. Black Philtrum Line
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(512, noseY + 54);
  ctx.lineTo(512, 570);
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#09090b';
  ctx.stroke();
  ctx.restore();

  // 5. Huge Joyous Open Mouth (Nụ cười siêu tươi chuẩn Doraemon)
  ctx.save();
  ctx.beginPath();
  const leftX = 210, rightX = 814, topY = 570, botY = 870;
  ctx.moveTo(leftX, topY);
  ctx.quadraticCurveTo(512, 595, rightX, topY);
  ctx.bezierCurveTo(800, botY, 224, botY, leftX, topY);
  ctx.closePath();
  ctx.fillStyle = '#9f1239'; // Deep ruby mouth cavity
  ctx.fill();
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#b91c1c';
  ctx.stroke();

  // Clip inside mouth to draw tongue
  ctx.clip();
  // Two-lobed cute pink tongue
  ctx.beginPath();
  ctx.arc(455, 820, 105, 0, Math.PI * 2);
  ctx.arc(569, 820, 105, 0, Math.PI * 2);
  ctx.fillStyle = '#fb7185';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#f43f5e';
  ctx.stroke();
  ctx.restore();

  // 6. Bold Whiskers (6 sợi râu mèo đen đậm, sắc nét)
  ctx.save();
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#09090b';

  // Left whiskers
  [
    [270, 420, 40, 365],
    [250, 480, 20, 480],
    [270, 540, 40, 595],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  // Right whiskers
  [
    [754, 420, 984, 365],
    [774, 480, 1004, 480],
    [754, 540, 984, 595],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// =========================================================================
// 4. FULL 3D DORAEMON CHARACTER MODEL (CHUẨN ANIME & SIÊU ĐÁNG YÊU)
// =========================================================================

interface FullBodyDoraemonProps {
  walkCycle: number;
  isMoving: boolean;
  heldItem: HeldItemType;
  materialType: string;
  tapProgress?: number;
}

function FullBodyDoraemon({
  walkCycle,
  isMoving,
  heldItem,
  materialType,
  tapProgress = 0,
}: FullBodyDoraemonProps) {
  const rootRef = useRef<THREE.Group>(null);
  const currentYawRef = useRef<number>(0);

  // Generate crisp 1024x1024 anime face texture
  const faceTexture = useMemo(() => {
    return createDoraemonFaceTexture();
  }, []);

  // Custom planar UV geometry for seamless orthographic face projection without polar distortion
  const faceGeometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.354, 48, 48, 0, Math.PI, 0.15, 2.84);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const R = 0.35;
    const yOffset = -0.01;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i) - yOffset;
      // Planar projection: u in [0, 1] across face width, v in [0, 1] across face height
      uv.setXY(i, (x / (2 * R)) + 0.5, (y / (2 * R)) + 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      faceTexture.dispose();
      faceGeometry.dispose();
    };
  }, [faceTexture, faceGeometry]);

  // Dynamic waddling walk animations
  const waddleAngle = isMoving ? Math.sin(walkCycle) * 0.08 : 0;
  const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.45 : 0;
  const rightLegAngle = isMoving ? -Math.sin(walkCycle) * 0.45 : 0;
  const leftFootLift = isMoving ? Math.max(0, Math.sin(walkCycle) * 0.035) : 0;
  const rightFootLift = isMoving ? Math.max(0, -Math.sin(walkCycle) * 0.035) : 0;
  const leftArmAngle = (isMoving ? -Math.sin(walkCycle) * 0.45 : 0) + tapProgress * 0.35;
  const rightArmAngle = (isMoving ? Math.sin(walkCycle) * 0.45 : 0) + tapProgress * 0.75;
  const tailWiggle = isMoving ? Math.sin(walkCycle * 2) * 0.35 : Math.sin(Date.now() * 0.002) * 0.08;
  const idleBob = Math.sin(Date.now() * 0.0025) * 0.005;

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const dt = Math.min(delta, 0.1);

    // Position Doraemon cleanly on the floor
    const eyeHeight = 1.7;
    const groundY = playerWorldState.y - eyeHeight;
    rootRef.current.position.set(playerWorldState.x, groundY, playerWorldState.z);

    // Smooth rotation: when moving, rotate towards move direction; when stopped, KEEP orientation!
    const targetAngle = playerWorldState.moveAngle;
    let diff = targetAngle - currentYawRef.current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    currentYawRef.current += diff * Math.min(1, dt * 12);
    rootRef.current.rotation.set(0, currentYawRef.current, 0);
  });

  return (
    <group ref={rootRef} name="FullBodyDoraemon">
      {/* Bobbing & Waddling Stance Container */}
      <group position={[0, idleBob, 0]} rotation={[0, 0, waddleAngle]}>
        {/* =====================================================================
            1. HEAD & ICONIC FACE (Đầu tròn xoe & Khuôn mặt Doraemon chuẩn anime)
           ===================================================================== */}
        <group position={[0, 0.95, 0]}>
          {/* Main Blue Spherical Head */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.35, 48, 48]} />
            <meshStandardMaterial
              color="#009fe8"
              roughness={0.35}
              metalness={0.03}
            />
          </mesh>

          {/* Front Face Dome with Planar UV Projected Anime Texture */}
          <mesh geometry={faceGeometry} position={[0, 0, 0.002]}>
            <meshStandardMaterial
              map={faceTexture}
              roughness={0.3}
              metalness={0.02}
            />
          </mesh>
        </group>

        {/* =====================================================================
            2. RED COLLAR & GOLDEN MAGIC BELL (Vòng cổ đỏ & Chuông vàng to sáng)
           ===================================================================== */}
        <group position={[0, 0.64, 0]}>
          {/* Vibrant Red Collar Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.028, 16, 36]} />
            <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.08} />
          </mesh>

          {/* Golden Magic Bell (Chuông vàng kim loại to đẹp) */}
          <group position={[0, -0.035, 0.23]}>
            <mesh castShadow>
              <sphereGeometry args={[0.056, 28, 28]} />
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.92}
                roughness={0.15}
                envMapIntensity={2.0}
              />
            </mesh>
            {/* Equatorial Double Slits */}
            <mesh position={[0, 0.006, 0]}>
              <torusGeometry args={[0.057, 0.0025, 8, 24]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, -0.006, 0]}>
              <torusGeometry args={[0.057, 0.0025, 8, 24]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Bell Sound Hole in Center */}
            <mesh position={[0, -0.015, 0.053]}>
              <sphereGeometry args={[0.011, 12, 12]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {/* Golden Attachment Ring */}
            <mesh position={[0, 0.056, 0]}>
              <torusGeometry args={[0.015, 0.004, 8, 16]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* =====================================================================
            3. CHUBBY BODY & 4D MAGIC POUCH (Thân tròn mũm mĩm & Túi thần kỳ)
           ===================================================================== */}
        <group position={[0, 0.36, 0]}>
          {/* Chubby Blue Body */}
          <mesh castShadow receiveShadow scale={[1.05, 0.95, 0.95]}>
            <sphereGeometry args={[0.28, 36, 36]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} metalness={0.03} />
          </mesh>

          {/* Large White Belly Sphere (Bụng trắng tròn xoe bao phủ phía trước) */}
          <mesh position={[0, 0, 0.07]} scale={[0.92, 0.88, 0.88]}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.02} />
          </mesh>

          {/* 4D Magic Pocket (Túi thần kỳ bán nguyệt) */}
          <group position={[0, -0.045, 0.27]}>
            {/* White Pocket Face */}
            <mesh>
              <circleGeometry args={[0.135, 24, 0, Math.PI]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.3} />
            </mesh>
            {/* Dark Pocket Hem Rim Outline */}
            <mesh position={[0, 0, 0.002]}>
              <ringGeometry args={[0.13, 0.138, 24, 1, 0, Math.PI]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <boxGeometry args={[0.27, 0.007, 0.002]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          </group>

          {/* Red Round Tail on Back (Chiếc đuôi đỏ tròn xoe) */}
          <group position={[0, -0.14, -0.27]} rotation={[0, tailWiggle, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.045, 20, 20]} />
              <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.03, 12]} />
              <meshStandardMaterial color="#009fe8" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* =====================================================================
            4. ARMS & WHITE ROUND HANDS (Tay áo xanh & Bàn tay tròn xoe trắng)
           ===================================================================== */}
        {/* Left Arm (Tay trái) */}
        <group position={[-0.23, 0.42, 0]} rotation={[leftArmAngle, 0, 0.28]}>
          <mesh position={[-0.03, -0.08, 0]} rotation={[0, 0, 0.25]} castShadow>
            <cylinderGeometry args={[0.055, 0.048, 0.15, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} />
          </mesh>
          {/* Spherical White Hand */}
          <mesh position={[-0.07, -0.16, 0]} castShadow>
            <sphereGeometry args={[0.065, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.22} />
          </mesh>
        </group>

        {/* Right Arm (Tay phải - cầm dụng cụ nếu có) */}
        <group position={[0.23, 0.42, 0]} rotation={[rightArmAngle, 0, -0.28]}>
          <mesh position={[0.03, -0.08, 0]} rotation={[0, 0, -0.25]} castShadow>
            <cylinderGeometry args={[0.055, 0.048, 0.15, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.35} />
          </mesh>
          {/* Spherical White Hand */}
          <mesh position={[0.07, -0.16, 0]} castShadow>
            <sphereGeometry args={[0.065, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.22} />
          </mesh>

          {/* Held Lab Item */}
          {heldItem !== 'NONE' && (
            <group position={[0.08, -0.14, 0.03]} scale={[1.2, 1.2, 1.2]}>
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
        <group position={[-0.11, 0.11 + leftFootLift, 0]} rotation={[leftLegAngle, 0, 0]}>
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.12, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.4} />
          </mesh>
          {/* Large flat oval white shoe */}
          <mesh
            position={[0, -0.065, 0.03]}
            rotation={[0, 0.1, 0]}
            scale={[0.10, 0.055, 0.18]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.28} />
          </mesh>
        </group>

        {/* Right Leg & Foot (Chân phải) */}
        <group position={[0.11, 0.11 + rightFootLift, 0]} rotation={[rightLegAngle, 0, 0]}>
          <mesh position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.12, 16]} />
            <meshStandardMaterial color="#009fe8" roughness={0.4} />
          </mesh>
          {/* Large flat oval white shoe */}
          <mesh
            position={[0, -0.065, 0.03]}
            rotation={[0, -0.1, 0]}
            scale={[0.10, 0.055, 0.18]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.28} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =========================================================================
// 5. MAIN DORAEMON PLAYER ORCHESTRATOR
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
  const prevTapTrigger = useRef(playerWorldState.handTapTrigger);

  // Mouse click & KeyE tap animation on first-person paws / hands
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        tapAnim.current = 1.0;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE') {
        tapAnim.current = 1.0;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
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

    const moveSpeed = 7.2;

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

        swayX.current = THREE.MathUtils.damp(swayX.current, -deltaYaw * 0.1, 10, dt);
        swayY.current = THREE.MathUtils.damp(swayY.current, deltaPitch * 0.1, 10, dt);

        if (playerWorldState.handTapTrigger !== prevTapTrigger.current) {
          prevTapTrigger.current = playerWorldState.handTapTrigger;
          tapAnim.current = 1.0;
        }

        if (tapAnim.current > 0) {
          tapAnim.current = THREE.MathUtils.damp(tapAnim.current, 0, 8, dt);
        }

        const breatheY = Math.sin(idleTime.current * 1.8) * 0.004;
        const breatheX = Math.cos(idleTime.current * 0.9) * 0.002;

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
      {/* 1. Full 3D Doraemon Character on Ground (Always active when walking, visible in Third-Person mode) */}
      {isVisible && (
        <FullBodyDoraemon
          walkCycle={walkCycle.current}
          isMoving={isMoving}
          heldItem={heldItem}
          materialType={selectedMaterial}
          tapProgress={tapAnim.current}
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
