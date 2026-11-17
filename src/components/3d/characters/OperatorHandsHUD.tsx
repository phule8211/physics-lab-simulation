import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabStore } from '../../../store/useLabStore';

interface HandJoints {
  palm: THREE.Group;
  thumb: THREE.Group;
  index: THREE.Group;
  middle: THREE.Group;
  ring: THREE.Group;
  pinky: THREE.Group;
}

export function OperatorHandsHUD() {
  const rootRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Store bindings
  const mode = useLabStore((s) => s.mode);
  const isLidOpen = useLabStore((s) => s.isLidOpen);
  const isSpecimenModalOpen = useLabStore((s) => s.isSpecimenModalOpen);
  const isPartDetached = useLabStore((s) => s.isPartDetached);
  const operatorPPE = useLabStore((s: any) => s.operatorPPE) ?? {
    glovesESD: true,
    gogglesWavelength: '1064nm',
    hardhat: true,
  };

  const isESDGloves = operatorPPE?.glovesESD !== false;

  // Animation states
  const animState = useRef({
    lidActionProgress: 0, // 0 -> 1 during Key O lid toggle
    inspectActionProgress: 0, // 0 -> 1 during Key G inspection
    detachActionProgress: 0, // 0 -> 1 during Key Space detachment
    walkBobPhase: 0,
    isMoving: false,
    prevCameraPos: new THREE.Vector3(),
  });

  // Track key actions directly for snappy tactile response
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing into input/textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyO') {
        animState.current.lidActionProgress = 1.0;
      } else if (e.code === 'KeyG') {
        animState.current.inspectActionProgress = 1.0;
      } else if (e.code === 'Space') {
        animState.current.detachActionProgress = 1.0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Procedural ESD Carbon Weave Texture
  const esdTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0284c7'; // Anti-static dissipative blue
      ctx.fillRect(0, 0, 128, 128);

      // Carbon dissipative conductive grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      for (let i = 0; i < 128; i += 16) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(128, i);
        ctx.stroke();
      }

      // Subtle ESD micro-stipple
      ctx.fillStyle = '#0369a1';
      for (let x = 4; x < 128; x += 8) {
        for (let y = 4; y < 128; y += 8) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }, []);

  // Coiled ESD grounding cord curve for left wrist
  const coiledCordGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const coils = 8;
    const radius = 0.012;
    const length = 0.18;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const angle = t * coils * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = -t * length;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 64, 0.0035, 8, false);
  }, []);

  // Materials
  const esdMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: esdTexture,
        color: '#38bdf8',
        roughness: 0.35,
        metalness: 0.12,
      }),
    [esdTexture]
  );

  const kevlarMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#eab308', // Nomex/Kevlar thermal yellow
        roughness: 0.85,
        metalness: 0.04,
      }),
    []
  );

  const thermalPadMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1f2937', // Heat-resistant charcoal grip padding
        roughness: 0.9,
        metalness: 0.05,
      }),
    []
  );

  const cuffMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isESDGloves ? '#0369a1' : '#ca8a04',
        roughness: 0.6,
      }),
    [isESDGloves]
  );

  const metallicAccentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.2,
      }),
    []
  );

  // Per-frame camera tracking & procedural animations
  useFrame((state, delta) => {
    if (!rootRef.current || !leftArmRef.current || !rightArmRef.current) return;

    // Only render hands in WALKING mode or during inspection transitions
    const isVisible = mode === 'WALKING' || isSpecimenModalOpen;
    rootRef.current.visible = isVisible;
    if (!isVisible) return;

    const camera = state.camera;
    const time = state.clock.getElapsedTime();

    // Smooth camera tracking: hands stay locked relative to camera orientation & position
    // Base resting position: forward 0.45m, down 0.28m from camera
    const baseOffset = new THREE.Vector3(0, -0.28, -0.45);

    // Detect camera movement for walking bob
    const distMoved = camera.position.distanceTo(animState.current.prevCameraPos);
    animState.current.prevCameraPos.copy(camera.position);
    const speed = Math.min(distMoved / Math.max(delta, 0.001), 6.0);
    const isMoving = speed > 0.05;

    if (isMoving) {
      animState.current.walkBobPhase += delta * 9.0;
    } else {
      animState.current.walkBobPhase += delta * 1.8;
    }

    // Natural bobbing displacement
    const walkBobY = Math.sin(animState.current.walkBobPhase) * (isMoving ? 0.014 : 0.0035);
    const walkBobX = Math.cos(animState.current.walkBobPhase * 0.5) * (isMoving ? 0.008 : 0.0015);
    baseOffset.x += walkBobX;
    baseOffset.y += walkBobY;

    // Transform baseOffset into world space based on camera orientation
    const targetWorldPos = baseOffset.applyQuaternion(camera.quaternion).add(camera.position);

    // Apply smooth position & rotation
    rootRef.current.position.copy(targetWorldPos);
    rootRef.current.quaternion.copy(camera.quaternion);

    // Animation progress decay
    animState.current.lidActionProgress = THREE.MathUtils.damp(
      animState.current.lidActionProgress,
      isLidOpen ? 0.8 : 0,
      6.0,
      delta
    );

    const targetInspect = isSpecimenModalOpen ? 1.0 : 0.0;
    animState.current.inspectActionProgress = THREE.MathUtils.damp(
      animState.current.inspectActionProgress,
      targetInspect,
      7.0,
      delta
    );

    const targetDetach = isPartDetached ? 1.0 : 0.0;
    animState.current.detachActionProgress = THREE.MathUtils.damp(
      animState.current.detachActionProgress,
      targetDetach,
      8.0,
      delta
    );

    const lidProg = animState.current.lidActionProgress;
    const inspectProg = animState.current.inspectActionProgress;
    const detachProg = animState.current.detachActionProgress;

    // =========================================================================
    // LEFT HAND TRANSFORMS
    // =========================================================================
    // Baseline resting position: offset left [-0.22, -0.05, 0]
    const leftBasePos = new THREE.Vector3(-0.22, -0.05, 0.0);
    const leftBaseRot = new THREE.Euler(0.2, 0.15, -0.1);

    // In inspection mode (Key G): Left hand lifts to hold left side of specimen plate
    if (inspectProg > 0.01) {
      leftBasePos.x = THREE.MathUtils.lerp(leftBasePos.x, -0.12, inspectProg);
      leftBasePos.y = THREE.MathUtils.lerp(leftBasePos.y, 0.1, inspectProg);
      leftBasePos.z = THREE.MathUtils.lerp(leftBasePos.z, 0.12, inspectProg);
      leftBaseRot.x = THREE.MathUtils.lerp(leftBaseRot.x, 0.55, inspectProg);
      leftBaseRot.y = THREE.MathUtils.lerp(leftBaseRot.y, 0.45, inspectProg);
      leftBaseRot.z = THREE.MathUtils.lerp(leftBaseRot.z, -0.35, inspectProg);
    }

    leftArmRef.current.position.copy(leftBasePos);
    leftArmRef.current.rotation.copy(leftBaseRot);

    // =========================================================================
    // RIGHT HAND TRANSFORMS
    // =========================================================================
    // Baseline resting position: offset right [0.22, -0.05, 0]
    const rightBasePos = new THREE.Vector3(0.22, -0.05, 0.0);
    const rightBaseRot = new THREE.Euler(0.2, -0.15, 0.1);

    // Key O (Lid open/close): Reach forward, arc upward to grasp machine handle
    if (lidProg > 0.01) {
      rightBasePos.x = THREE.MathUtils.lerp(rightBasePos.x, 0.08, lidProg);
      rightBasePos.y = THREE.MathUtils.lerp(rightBasePos.y, 0.22, lidProg);
      rightBasePos.z = THREE.MathUtils.lerp(rightBasePos.z, 0.28, lidProg);
      rightBaseRot.x = THREE.MathUtils.lerp(rightBaseRot.x, -0.4, lidProg);
      rightBaseRot.y = THREE.MathUtils.lerp(rightBaseRot.y, -0.2, lidProg);
      rightBaseRot.z = THREE.MathUtils.lerp(rightBaseRot.z, 0.25, lidProg);
    }
    // Key G (Inspection mode): Right hand holds right side of specimen
    else if (inspectProg > 0.01) {
      rightBasePos.x = THREE.MathUtils.lerp(rightBasePos.x, 0.12, inspectProg);
      rightBasePos.y = THREE.MathUtils.lerp(rightBasePos.y, 0.1, inspectProg);
      rightBasePos.z = THREE.MathUtils.lerp(rightBasePos.z, 0.12, inspectProg);
      rightBaseRot.x = THREE.MathUtils.lerp(rightBaseRot.x, 0.55, inspectProg);
      rightBaseRot.y = THREE.MathUtils.lerp(rightBaseRot.y, -0.45, inspectProg);
      rightBaseRot.z = THREE.MathUtils.lerp(rightBaseRot.z, 0.35, inspectProg);
    }
    // Key Space (Part detachment): Precision pinch & lift
    else if (detachProg > 0.01) {
      rightBasePos.x = THREE.MathUtils.lerp(rightBasePos.x, 0.05, detachProg);
      rightBasePos.y = THREE.MathUtils.lerp(rightBasePos.y, 0.14, detachProg);
      rightBasePos.z = THREE.MathUtils.lerp(rightBasePos.z, 0.2, detachProg);
      rightBaseRot.x = THREE.MathUtils.lerp(rightBaseRot.x, 0.35, detachProg);
      rightBaseRot.y = THREE.MathUtils.lerp(rightBaseRot.y, -0.15, detachProg);
      rightBaseRot.z = THREE.MathUtils.lerp(rightBaseRot.z, 0.1, detachProg);
    }

    rightArmRef.current.position.copy(rightBasePos);
    rightArmRef.current.rotation.copy(rightBaseRot);
  });

  const activeGloveMaterial = isESDGloves ? esdMaterial : kevlarMaterial;

  /**
   * Builds an articulated 3D hand with forearm, wrist cuff, palm, and 5 fingers
   */
  const renderHand = (isLeft: boolean) => {
    const side = isLeft ? -1 : 1;
    return (
      <group>
        {/* Forearm sleeve */}
        <mesh
          position={[0, -0.12, -0.14]}
          rotation={[0.35, 0, side * 0.08]}
          material={activeGloveMaterial}
        >
          <cylinderGeometry args={[0.042, 0.052, 0.24, 16]} />
        </mesh>

        {/* Wrist cuff */}
        <mesh
          position={[0, -0.01, -0.03]}
          rotation={[0.2, 0, 0]}
          material={cuffMaterial}
        >
          <cylinderGeometry args={[0.043, 0.044, 0.035, 16]} />
        </mesh>

        {/* Coiled ESD Grounding Wrist Strap (Left hand only) */}
        {isLeft && isESDGloves && (
          <group position={[0.042, -0.01, -0.03]}>
            {/* Grounding stud snap */}
            <mesh material={metallicAccentMaterial}>
              <cylinderGeometry args={[0.007, 0.007, 0.006, 12]} />
            </mesh>
            {/* Coiled flexible cord */}
            <mesh
              geometry={coiledCordGeometry}
              material={
                new THREE.MeshStandardMaterial({
                  color: '#0284c7',
                  roughness: 0.4,
                })
              }
              position={[0, -0.005, 0]}
              rotation={[0, 0, -0.2]}
            />
          </group>
        )}

        {/* Palm block with contoured bevel */}
        <group position={[0, 0.015, 0.02]} rotation={[0.1, side * 0.05, 0]}>
          <mesh material={activeGloveMaterial}>
            <boxGeometry args={[0.076, 0.028, 0.085]} />
          </mesh>

          {/* Thermal heat pad / grip reinforcement */}
          {!isESDGloves && (
            <mesh position={[0, -0.015, 0.005]} material={thermalPadMaterial}>
              <boxGeometry args={[0.068, 0.004, 0.072]} />
            </mesh>
          )}

          {/* Thumb (2 segments) */}
          <group
            position={[side * 0.042, -0.005, -0.01]}
            rotation={[0.2, side * 0.65, side * 0.3]}
          >
            {/* Proximal phalanx */}
            <mesh position={[side * 0.014, 0, 0.018]} material={activeGloveMaterial}>
              <boxGeometry args={[0.018, 0.018, 0.036]} />
            </mesh>
            {/* Distal phalanx */}
            <group
              position={[side * 0.026, -0.002, 0.034]}
              rotation={[0.15, side * 0.25, 0]}
            >
              <mesh material={activeGloveMaterial}>
                <boxGeometry args={[0.016, 0.016, 0.032]} />
              </mesh>
              {/* Grip patch */}
              {!isESDGloves && (
                <mesh position={[0, -0.009, 0]} material={thermalPadMaterial}>
                  <boxGeometry args={[0.014, 0.002, 0.028]} />
                </mesh>
              )}
            </group>
          </group>

          {/* Index Finger (3 segments) */}
          <group position={[side * 0.028, 0.002, 0.046]} rotation={[0.22, side * 0.06, 0]}>
            <mesh position={[0, 0, 0.016]} material={activeGloveMaterial}>
              <boxGeometry args={[0.016, 0.016, 0.032]} />
            </mesh>
            <group position={[0, -0.004, 0.032]} rotation={[0.3, 0, 0]}>
              <mesh position={[0, 0, 0.013]} material={activeGloveMaterial}>
                <boxGeometry args={[0.015, 0.015, 0.026]} />
              </mesh>
              <group position={[0, -0.004, 0.026]} rotation={[0.35, 0, 0]}>
                <mesh position={[0, 0, 0.011]} material={activeGloveMaterial}>
                  <boxGeometry args={[0.014, 0.014, 0.022]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Middle Finger (3 segments) */}
          <group position={[side * 0.009, 0.003, 0.048]} rotation={[0.18, 0, 0]}>
            <mesh position={[0, 0, 0.018]} material={activeGloveMaterial}>
              <boxGeometry args={[0.016, 0.016, 0.036]} />
            </mesh>
            <group position={[0, -0.004, 0.036]} rotation={[0.32, 0, 0]}>
              <mesh position={[0, 0, 0.014]} material={activeGloveMaterial}>
                <boxGeometry args={[0.015, 0.015, 0.028]} />
              </mesh>
              <group position={[0, -0.004, 0.028]} rotation={[0.38, 0, 0]}>
                <mesh position={[0, 0, 0.011]} material={activeGloveMaterial}>
                  <boxGeometry args={[0.014, 0.014, 0.022]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Ring Finger (3 segments) */}
          <group position={[-side * 0.01, 0.002, 0.046]} rotation={[0.22, -side * 0.05, 0]}>
            <mesh position={[0, 0, 0.016]} material={activeGloveMaterial}>
              <boxGeometry args={[0.015, 0.015, 0.032]} />
            </mesh>
            <group position={[0, -0.004, 0.032]} rotation={[0.34, 0, 0]}>
              <mesh position={[0, 0, 0.013]} material={activeGloveMaterial}>
                <boxGeometry args={[0.014, 0.014, 0.026]} />
              </mesh>
              <group position={[0, -0.004, 0.026]} rotation={[0.4, 0, 0]}>
                <mesh position={[0, 0, 0.01]} material={activeGloveMaterial}>
                  <boxGeometry args={[0.013, 0.013, 0.02]} />
                </mesh>
              </group>
            </group>
          </group>

          {/* Little / Pinky Finger (3 segments) */}
          <group position={[-side * 0.028, 0, 0.042]} rotation={[0.26, -side * 0.1, 0]}>
            <mesh position={[0, 0, 0.014]} material={activeGloveMaterial}>
              <boxGeometry args={[0.014, 0.014, 0.028]} />
            </mesh>
            <group position={[0, -0.004, 0.028]} rotation={[0.38, 0, 0]}>
              <mesh position={[0, 0, 0.011]} material={activeGloveMaterial}>
                <boxGeometry args={[0.013, 0.013, 0.022]} />
              </mesh>
              <group position={[0, -0.004, 0.022]} rotation={[0.42, 0, 0]}>
                <mesh position={[0, 0, 0.009]} material={activeGloveMaterial}>
                  <boxGeometry args={[0.012, 0.012, 0.018]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group ref={rootRef} name="OperatorHandsHUD">
      {/* Left Hand Arm Group */}
      <group ref={leftArmRef}>{renderHand(true)}</group>

      {/* Right Hand Arm Group */}
      <group ref={rightArmRef}>{renderHand(false)}</group>
    </group>
  );
}

export default OperatorHandsHUD;
