import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useLabStore } from '../../store/useLabStore';
import { MEZZANINE_CONFIG } from '../../data/staircaseConfig';
import { MessageSquareText, Sparkles, FlaskConical, Activity, CheckCircle2 } from 'lucide-react';

interface Waypoint {
  name: string;
  taskTitle: string;
  position: [number, number, number];
  targetYaw: number;
  duration: number; // seconds spent experimenting at station
  experimentType: 'LAPTOP_CAD' | 'DI_WATER_RINSE' | 'ACID_TITRATION' | 'PIPETTE_CHECK' | 'WORKSHOP_PATROL';
}

const NPC_PATROL_WAYPOINTS: Waypoint[] = [
  {
    name: 'Bàn Máy Tính CAD',
    taskTitle: 'Đang theo dõi dữ liệu CAD & phổ cắt laser trên laptop',
    position: [-4.6, MEZZANINE_CONFIG.floorY, 9.6],
    targetYaw: 0,
    duration: 8,
    experimentType: 'LAPTOP_CAD',
  },
  {
    name: 'Bồn Nước & Vòi DI Water',
    taskTitle: 'Đang tráng rửa dụng cụ bằng nước khử ion siêu sạch DI Water',
    position: [0.0, MEZZANINE_CONFIG.floorY, 9.6],
    targetYaw: 0,
    duration: 7,
    experimentType: 'DI_WATER_RINSE',
  },
  {
    name: 'Giá Hóa Chất Wafer',
    taskTitle: 'Đang chuẩn độ dung dịch ăn mòn wafer bán dẫn (HCl + HNO3)',
    position: [3.6, MEZZANINE_CONFIG.floorY, 9.6],
    targetYaw: 0,
    duration: 9,
    experimentType: 'ACID_TITRATION',
  },
  {
    name: 'Giá Dụng Cụ Thí Nghiệm',
    taskTitle: 'Đang kiểm tra độ chính xác của Micropipette và ống nghiệm',
    position: [6.6, MEZZANINE_CONFIG.floorY, 9.2],
    targetYaw: -Math.PI / 4,
    duration: 7,
    experimentType: 'PIPETTE_CHECK',
  },
  {
    name: 'Lan Can Ban Công Tầng 2',
    taskTitle: 'Đang tuần tra an toàn và giám sát các buồng cắt laser tầng 1',
    position: [-1.2, MEZZANINE_CONFIG.floorY, 5.8],
    targetYaw: Math.PI,
    duration: 8,
    experimentType: 'WORKSHOP_PATROL',
  },
];

function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (2 * Math.PI);
  if (diff < -Math.PI) diff += 2 * Math.PI;
  if (diff > Math.PI) diff -= 2 * Math.PI;
  return a + diff * Math.min(1, t);
}

export function NpcInstructorDung() {
  const { openNpcDialog, isNpcDialogOpen, hoveredStationId } = useLabStore();

  // Root Character Transform
  const rootRef = useRef<THREE.Group>(null);
  const positionRef = useRef<THREE.Vector3>(
    new THREE.Vector3(NPC_PATROL_WAYPOINTS[0].position[0], NPC_PATROL_WAYPOINTS[0].position[1], NPC_PATROL_WAYPOINTS[0].position[2])
  );
  const yawRef = useRef<number>(0);

  // Skeletal Joint References
  const pelvisRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const leftThighRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightThighRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);

  // Held Experiment Items
  const heldItemRef = useRef<THREE.Group>(null);

  // State Management for Patrol & Experiments
  const currentWaypointIndex = useRef<number>(0);
  const stateRef = useRef<'WALKING' | 'EXPERIMENTING'>('EXPERIMENTING');
  const timerRef = useRef<number>(0);
  const walkPhaseRef = useRef<number>(0);
  const lastStoreSyncRef = useRef<number>(0);
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string>(NPC_PATROL_WAYPOINTS[0].taskTitle);

  // Main Dynamic Kinematics & Physics Animation Loop
  useFrame(({ camera, clock }, rawDt) => {
    const dt = Math.min(0.08, rawDt);
    const time = clock.getElapsedTime();

    if (!rootRef.current) return;

    // Check distance to player
    const distToPlayer = camera.position.distanceTo(positionRef.current);
    const isPlayerTalking = isNpcDialogOpen || distToPlayer < 2.3;

    const currentWp = NPC_PATROL_WAYPOINTS[currentWaypointIndex.current];

    if (isPlayerTalking) {
      // 1. PLAYER INTERACTION OVERRIDE: Stop and face the player politely
      const dirToPlayer = new THREE.Vector3()
        .subVectors(camera.position, positionRef.current);
      const targetAngle = Math.atan2(dirToPlayer.x, dirToPlayer.z);
      yawRef.current = lerpAngle(yawRef.current, targetAngle, dt * 5.0);

      // Reset leg rotation to neutral standing
      if (leftThighRef.current) leftThighRef.current.rotation.x = THREE.MathUtils.lerp(leftThighRef.current.rotation.x, 0, dt * 8);
      if (rightThighRef.current) rightThighRef.current.rotation.x = THREE.MathUtils.lerp(rightThighRef.current.rotation.x, 0, dt * 8);
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, 0, dt * 8);
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, 0, dt * 8);

      // Welcoming gesture: Lego right arm raised forward politely with forward-bent elbow
      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.55, dt * 6);
        rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.z, 0.32, dt * 6);
      }
      if (rightElbowRef.current) {
        rightElbowRef.current.rotation.x = THREE.MathUtils.lerp(rightElbowRef.current.rotation.x, 0.52, dt * 6);
      }

      // Left arm holding clipboard with Lego claw hand, elbow bent forward
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.25, dt * 6);
        leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.z, -0.32, dt * 6);
      }
      if (leftElbowRef.current) {
        leftElbowRef.current.rotation.x = THREE.MathUtils.lerp(leftElbowRef.current.rotation.x, 0.52, dt * 6);
      }

      // Head nods gently towards player
      if (headRef.current) {
        headRef.current.rotation.x = 0.05 + Math.sin(time * 2.0) * 0.02;
        headRef.current.rotation.y = 0;
      }
    } else {
      // 2. AUTONOMOUS PATROL & EXPERIMENT STATE MACHINE
      if (stateRef.current === 'WALKING') {
        const targetPos = new THREE.Vector3(...currentWp.position);
        const toTarget = new THREE.Vector3().subVectors(targetPos, positionRef.current);
        const distToTarget = toTarget.length();

        if (distToTarget < 0.25) {
          // Reached waypoint: Start experiment!
          stateRef.current = 'EXPERIMENTING';
          timerRef.current = 0;
          setCurrentTaskTitle(currentWp.taskTitle);
        } else {
          // Move towards target waypoint
          const moveDir = toTarget.normalize();
          const walkSpeed = 1.15; // m/s
          positionRef.current.addScaledVector(moveDir, walkSpeed * dt);

          // Rotate facing travel direction with angular smoothing
          const travelAngle = Math.atan2(moveDir.x, moveDir.z);
          yawRef.current = lerpAngle(yawRef.current, travelAngle, dt * 6.0);

          // Advance walk cycle phase
          walkPhaseRef.current += dt * 5.2;
          const p = walkPhaseRef.current;

          // Leg kinematics with natural knee flexion (Chân bước tự nhiên, đầu gối gập ra sau)
          const stride = 0.65;
          if (leftThighRef.current) leftThighRef.current.rotation.x = Math.sin(p) * stride;
          if (rightThighRef.current) rightThighRef.current.rotation.x = -Math.sin(p) * stride;

          // Knees flex backwards only during backward swing
          if (leftKneeRef.current) leftKneeRef.current.rotation.x = Math.max(0, -Math.sin(p - 0.25) * 0.75);
          if (rightKneeRef.current) rightKneeRef.current.rotation.x = Math.max(0, Math.sin(p - 0.25) * 0.75);

          // Pelvis vertical oscillation (Nhấp nhô bước đi)
          if (pelvisRef.current) {
            pelvisRef.current.position.y = 0.82 + Math.abs(Math.sin(p * 2)) * 0.04;
          }

          // Lego Arms: Minifigure arm swing pivoting from shoulder with rigid forward elbow bend (~28 deg)
          const armSwing = 0.42;
          if (leftShoulderRef.current) {
            leftShoulderRef.current.rotation.x = -Math.sin(p) * armSwing;
            leftShoulderRef.current.rotation.z = -0.32; // Lego outward flare
          }
          if (rightShoulderRef.current) {
            rightShoulderRef.current.rotation.x = Math.sin(p) * armSwing;
            rightShoulderRef.current.rotation.z = 0.32; // Lego outward flare
          }
          if (leftElbowRef.current) {
            // Constant forward bend (Lego posture) with subtle swing
            leftElbowRef.current.rotation.x = 0.48 + Math.sin(p) * 0.05;
          }
          if (rightElbowRef.current) {
            rightElbowRef.current.rotation.x = 0.48 - Math.sin(p) * 0.05;
          }

          // Head looks ahead with subtle sway
          if (headRef.current) {
            headRef.current.rotation.x = 0;
            headRef.current.rotation.y = Math.sin(p) * 0.04;
          }
        }
      } else {
        // EXPERIMENTING MODE at Current Station
        timerRef.current += dt;
        yawRef.current = lerpAngle(yawRef.current, currentWp.targetYaw, dt * 4.0);

        // Stand stable
        if (leftThighRef.current) leftThighRef.current.rotation.x = THREE.MathUtils.lerp(leftThighRef.current.rotation.x, 0, dt * 6);
        if (rightThighRef.current) rightThighRef.current.rotation.x = THREE.MathUtils.lerp(rightThighRef.current.rotation.x, 0, dt * 6);
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(leftKneeRef.current.rotation.x, 0, dt * 6);
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = THREE.MathUtils.lerp(rightKneeRef.current.rotation.x, 0, dt * 6);
        if (pelvisRef.current) pelvisRef.current.position.y = 0.82;

        // Specialized experiment animations
        const expType = currentWp.experimentType;
        if (expType === 'ACID_TITRATION' || expType === 'DI_WATER_RINSE') {
          // Holding test tube / beaker in left hand, gently swirling with right hand
          if (leftShoulderRef.current) {
            leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(leftShoulderRef.current.rotation.x, -0.75, dt * 4);
            leftShoulderRef.current.rotation.z = -0.2;
          }
          if (leftElbowRef.current) {
            leftElbowRef.current.rotation.x = THREE.MathUtils.lerp(leftElbowRef.current.rotation.x, 0.85, dt * 4);
          }
          if (rightShoulderRef.current) {
            rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(rightShoulderRef.current.rotation.x, -0.65, dt * 4);
            rightShoulderRef.current.rotation.z = 0.25;
          }
          if (rightElbowRef.current) {
            rightElbowRef.current.rotation.x = 0.75 + Math.sin(time * 3.5) * 0.15; // swirling motion
          }
          if (headRef.current) {
            headRef.current.rotation.x = 0.22 + Math.sin(time * 1.5) * 0.04; // inspecting liquid level
          }
        } else if (expType === 'LAPTOP_CAD') {
          // Both arms forward typing on keyboard
          if (leftShoulderRef.current) {
            leftShoulderRef.current.rotation.x = -0.55 + Math.sin(time * 8) * 0.04;
            leftShoulderRef.current.rotation.z = -0.15;
          }
          if (rightShoulderRef.current) {
            rightShoulderRef.current.rotation.x = -0.55 + Math.cos(time * 8) * 0.04;
            rightShoulderRef.current.rotation.z = 0.15;
          }
          if (leftElbowRef.current) leftElbowRef.current.rotation.x = 0.8;
          if (rightElbowRef.current) rightElbowRef.current.rotation.x = 0.8;
          if (headRef.current) headRef.current.rotation.x = 0.18; // looking at laptop screen
        } else {
          // Inspecting equipment / patrol overview
          if (leftShoulderRef.current) {
            leftShoulderRef.current.rotation.x = -0.3;
            leftShoulderRef.current.rotation.z = -0.12;
          }
          if (rightShoulderRef.current) {
            rightShoulderRef.current.rotation.x = -0.2 + Math.sin(time * 1.2) * 0.1;
            rightShoulderRef.current.rotation.z = 0.2;
          }
          if (headRef.current) {
            headRef.current.rotation.y = Math.sin(time * 0.8) * 0.25; // looking around lab
            headRef.current.rotation.x = 0.08;
          }
        }

        // When station experiment timer completes, proceed to next waypoint!
        if (timerRef.current >= currentWp.duration) {
          currentWaypointIndex.current = (currentWaypointIndex.current + 1) % NPC_PATROL_WAYPOINTS.length;
          stateRef.current = 'WALKING';
          timerRef.current = 0;
        }
      }
    }

    // Apply Root Transform
    rootRef.current.position.copy(positionRef.current);
    rootRef.current.rotation.y = yawRef.current;

    // Sync real-time position to store for proximity detection
    if (time - lastStoreSyncRef.current > 0.4) {
      lastStoreSyncRef.current = time;
      useLabStore.getState().setNpcDungPosition([positionRef.current.x, positionRef.current.y, positionRef.current.z]);
    }

    // Subtle natural breathing
    if (chestRef.current) {
      chestRef.current.position.y = 0.23 + Math.sin(time * 1.8) * 0.006;
      chestRef.current.rotation.x = Math.sin(time * 1.8) * 0.012;
    }
  });

  return (
    <group
      ref={rootRef}
      onClick={(e) => {
        e.stopPropagation();
        openNpcDialog();
      }}
    >
      {/* =========================================================================
          1. 3D ARTICULATED CHARACTER SKELETON: KS. NGUYỄN VĂN DŨNG
         ========================================================================= */}
      {/* PELVIS / HIPS ROOT GROUP (at Y = 0.82) */}
      <group ref={pelvisRef} position={[0, 0.82, 0]}>
        {/* Navy Slacks Waistband */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.12, 0.22]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>

        {/* LEFT LEG HIERARCHY (Khớp Hông & Đầu Gối Trái) */}
        <group ref={leftThighRef} position={[-0.1, -0.06, 0]}>
          {/* Thigh (Đùi) */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.36, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>

          {/* Left Knee Joint (Khớp Đầu Gối Trái) */}
          <group ref={leftKneeRef} position={[0, -0.36, 0]}>
            {/* Calf / Shin (Bắp Chân) */}
            <mesh position={[0, -0.18, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.055, 0.36, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Oxford Leather Shoe (Giày Da Nâu) */}
            <mesh position={[0, -0.36, 0.04]} castShadow>
              <boxGeometry args={[0.088, 0.08, 0.22]} />
              <meshStandardMaterial color="#2d1810" roughness={0.35} metalness={0.1} />
            </mesh>
          </group>
        </group>

        {/* RIGHT LEG HIERARCHY (Khớp Hông & Đầu Gối Phải) */}
        <group ref={rightThighRef} position={[0.1, -0.06, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.065, 0.36, 14]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>

          {/* Right Knee Joint (Khớp Đầu Gối Phải) */}
          <group ref={rightKneeRef} position={[0, -0.36, 0]}>
            {/* Calf */}
            <mesh position={[0, -0.18, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.055, 0.36, 14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.6} />
            </mesh>
            {/* Oxford Leather Shoe */}
            <mesh position={[0, -0.36, 0.04]} castShadow>
              <boxGeometry args={[0.088, 0.08, 0.22]} />
              <meshStandardMaterial color="#2d1810" roughness={0.35} metalness={0.1} />
            </mesh>
          </group>
        </group>

        {/* TORSO & UPPER BODY (Thân Trên & Áo Blouse) */}
        <group ref={chestRef} position={[0, 0.23, 0]}>
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
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.02, 0.015, 0.008]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            <mesh castShadow>
              <boxGeometry args={[0.065, 0.085, 0.004]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.025, 0.003]}>
              <planeGeometry args={[0.055, 0.025]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
          </group>

          {/* LEFT ARM HIERARCHY: CLASSIC LEGO MINIFIGURE ARM (Khuỷu tay gập về trước, bàn tay Lego C-Clamp) */}
          <group ref={leftShoulderRef} position={[-0.23, 0.28, 0]} rotation={[0, 0, -0.32]}>
            {/* Lego Upper Arm Sleeve */}
            <mesh position={[0, -0.13, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.048, 0.26, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>

            {/* Lego Left Elbow Joint (Cố định gập về trước ~28 độ) */}
            <group ref={leftElbowRef} position={[0, -0.26, 0]} rotation={[0.48, 0.1, 0]}>
              {/* Lego Forearm Sleeve */}
              <mesh position={[0, -0.11, 0]} castShadow>
                <cylinderGeometry args={[0.048, 0.042, 0.22, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.35} />
              </mesh>

              {/* Yellow Lego Wrist Plug */}
              <group position={[0, -0.23, 0.02]} rotation={[0, 0, 0]}>
                <mesh position={[0, 0.012, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.024, 16]} />
                  <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                </mesh>

                {/* Iconic Yellow Lego C-Clamp Hand */}
                <group rotation={[Math.PI / 2, 0, Math.PI / 4]}>
                  <mesh castShadow>
                    <torusGeometry args={[0.028, 0.009, 12, 24, Math.PI * 1.55]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                  {/* Lego Finger rounded tip caps */}
                  <mesh position={[0.028, 0, 0]}>
                    <sphereGeometry args={[0.009, 10, 10]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                  <mesh position={[-0.004, -0.028, 0]}>
                    <sphereGeometry args={[0.009, 10, 10]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                </group>

                {/* Metal Clipboard held firmly in Lego C-Clamp hand */}
                <mesh position={[0.02, 0, 0.06]} rotation={[-0.3, 0.2, 0]} castShadow>
                  <boxGeometry args={[0.18, 0.26, 0.01]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
            </group>
          </group>

          {/* RIGHT ARM HIERARCHY: CLASSIC LEGO MINIFIGURE ARM (Khuỷu tay gập về trước, bàn tay Lego C-Clamp) */}
          <group ref={rightShoulderRef} position={[0.23, 0.28, 0]} rotation={[0, 0, 0.32]}>
            {/* Lego Upper Arm Sleeve */}
            <mesh position={[0, -0.13, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.048, 0.26, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>

            {/* Lego Right Elbow Joint (Cố định gập về trước ~28 độ) */}
            <group ref={rightElbowRef} position={[0, -0.26, 0]} rotation={[0.48, -0.1, 0]}>
              {/* Lego Forearm Sleeve */}
              <mesh position={[0, -0.11, 0]} castShadow>
                <cylinderGeometry args={[0.048, 0.042, 0.22, 16]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.35} />
              </mesh>

              {/* Yellow Lego Wrist Plug */}
              <group position={[0, -0.23, 0.02]} rotation={[0, 0, 0]}>
                <mesh position={[0, 0.012, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.024, 16]} />
                  <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                </mesh>

                {/* Iconic Yellow Lego C-Clamp Hand */}
                <group rotation={[Math.PI / 2, 0, -Math.PI / 4]}>
                  <mesh castShadow>
                    <torusGeometry args={[0.028, 0.009, 12, 24, Math.PI * 1.55]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                  {/* Lego Finger rounded tip caps */}
                  <mesh position={[0.028, 0, 0]}>
                    <sphereGeometry args={[0.009, 10, 10]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                  <mesh position={[-0.004, -0.028, 0]}>
                    <sphereGeometry args={[0.009, 10, 10]} />
                    <meshStandardMaterial color="#facc15" roughness={0.25} metalness={0.05} />
                  </mesh>
                </group>

                {/* Handheld Experiment Item: Lab Flask firmly gripped inside Lego C-Clamp hand */}
                <group ref={heldItemRef} position={[0, 0.02, 0.05]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.014, 0.04, 0.1, 14]} />
                    <meshStandardMaterial color="#e0f2fe" transparent opacity={0.65} roughness={0.1} />
                  </mesh>
                  {/* Colorful Liquid in Flask */}
                  <mesh position={[0, -0.025, 0]}>
                    <cylinderGeometry args={[0.032, 0.036, 0.04, 12]} />
                    <meshStandardMaterial color="#06b6d4" transparent opacity={0.85} roughness={0.2} />
                  </mesh>
                </group>
              </group>
            </group>
          </group>

          {/* HEAD & FACE (Đầu, Kính Bảo Hộ & Tóc) */}
          <group ref={headRef} position={[0, 0.52, 0]}>
            {/* Face */}
            <mesh castShadow>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#fcd34d" roughness={0.4} />
            </mesh>

            {/* Neat Professional Black Hair */}
            <mesh position={[0, 0.045, -0.015]} castShadow>
              <sphereGeometry args={[0.116, 24, 24]} />
              <meshStandardMaterial color="#171717" roughness={0.7} />
            </mesh>

            {/* Clear Laser Safety Goggles */}
            <group position={[0, 0.01, 0.095]}>
              <mesh position={[-0.042, 0, 0]}>
                <boxGeometry args={[0.042, 0.032, 0.02]} />
                <meshStandardMaterial color="#06b6d4" transparent opacity={0.55} roughness={0.1} metalness={0.2} />
              </mesh>
              <mesh position={[0.042, 0, 0]}>
                <boxGeometry args={[0.042, 0.032, 0.02]} />
                <meshStandardMaterial color="#06b6d4" transparent opacity={0.55} roughness={0.1} metalness={0.2} />
              </mesh>
              <mesh position={[0, 0, -0.02]}>
                <boxGeometry args={[0.17, 0.015, 0.08]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* =========================================================================
          2. FLOATING OVERHEAD INTERACTIVE PROMPT WITH DYNAMIC STATUS
         ========================================================================= */}
      <Html position={[0, 2.15, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            openNpcDialog();
          }}
          className={`cursor-pointer pointer-events-auto transition-all duration-200 transform hover:scale-105 select-none ${
            isNpcDialogOpen ? 'hidden' : 'block'
          }`}
        >
          <div className="glass-panel px-4 py-2.5 rounded-2xl border border-lab-cyan/60 shadow-2xl backdrop-blur-md flex items-center space-x-3 whitespace-nowrap bg-slate-950/90 hover:border-lab-cyan hover:shadow-lab-cyan/40">
            <div className="w-7 h-7 rounded-xl bg-lab-cyan/20 border border-lab-cyan/60 flex items-center justify-center text-lab-cyan flex-shrink-0">
              <MessageSquareText className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  KS. Nguyễn Văn Dũng
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-400/40 flex items-center space-x-1">
                  <Activity className="w-2.5 h-2.5 animate-spin" />
                  <span>Đang hoạt động</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono flex items-center space-x-1 mt-0.5 max-w-[260px] truncate">
                <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>{currentTaskTitle}</span>
              </span>
              <span className="text-[9px] text-lab-cyan font-mono mt-0.5">
                Nhấn [E] hoặc Click để trò chuyện & hỏi đáp
              </span>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}
