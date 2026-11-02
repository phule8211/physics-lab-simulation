import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { resolveMovementWithCollisions } from './CollisionManager';
import { MachineId } from '../../types/lab';
import { getGroundHeightAt } from '../../data/staircaseConfig';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 4.2;
const SPRINT_SPEED = 7.5;
const INTERACTION_DISTANCE = 3.2;

export function PlayerController() {
  const { camera, gl } = useThree();
  const keys = useKeyboardControls();
  const controlsRef = useRef<any>(null);
  const previousStationRef = useRef<MachineId | null>(null);

  const {
    mode,
    activeStationId,
    setHoveredStation,
    setPointerLocked,
    enterInspection,
    exitInspection,
    setSavedPlayerPosition,
    savedPlayerPosition,
    setMode,
    setCameraHeading,
    setPlayerElevation,
  } = useLabStore();

  const velocity = useRef(new THREE.Vector3());
  const position = useRef(new THREE.Vector3(0, EYE_HEIGHT, 0));
  const isJumping = useRef(false);
  const verticalVelocity = useRef(0);

  // Transition animation references
  const transitionProgress = useRef(0);
  const startCameraPos = useRef(new THREE.Vector3());
  const targetCameraPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  // Inspection interactive orbit state
  const isDragging = useRef(false);
  const prevMouseX = useRef(0);
  const prevMouseY = useRef(0);
  const orbitYaw = useRef(0);
  const orbitPitch = useRef(0.25);
  const orbitRadius = useRef(2.5);

  // Keyboard shortcut listener (E, ESC, 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentMode = useLabStore.getState().mode;

      if (e.code === 'KeyE') {
        const hovered = useLabStore.getState().hoveredStationId;
        if (hovered && currentMode === 'WALKING') {
          setSavedPlayerPosition([position.current.x, position.current.y, position.current.z]);
          if (document.pointerLockElement) {
            document.exitPointerLock();
          }
          enterInspection(hovered);
        }
      } else if (e.code === 'Escape') {
        if (currentMode === 'INSPECTING') {
          exitInspection();
        }
      } else if (e.code === 'Digit1') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('CO2_LASER');
      } else if (e.code === 'Digit2') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('UV_LASER');
      } else if (e.code === 'Digit3') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('FIBER_LASER');
      } else if (e.code === 'Digit4') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('SENSOR_STATION');
      } else if (e.code === 'Digit5' || e.code === 'KeyP') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('COATING_STATION');
      } else if (e.code === 'KeyO') {
        useLabStore.getState().toggleLid();
      } else if (e.code === 'KeyC') {
        const store = useLabStore.getState();
        if (store.isCuttingJob) {
          store.stopCuttingJob();
        } else {
          store.startCuttingJob();
        }
      } else if (e.code === 'KeyM') {
        const mats = ['WOOD', 'ACRYLIC', 'STEEL', 'ALUMINUM', 'SILICON', 'GLASS'] as const;
        const currentMat = useLabStore.getState().selectedMaterial;
        const nextIdx = (mats.indexOf(currentMat as any) + 1) % mats.length;
        useLabStore.getState().setSelectedMaterial(mats[nextIdx]);
      } else if (e.code === 'KeyT') {
        if (document.pointerLockElement) document.exitPointerLock();
        useLabStore.getState().openDesignModal();
      } else if (e.code === 'KeyG') {
        if (document.pointerLockElement) document.exitPointerLock();
        useLabStore.getState().openSpecimenModal();
      } else if (e.code === 'KeyF') {
        const store = useLabStore.getState();
        if (store.isFraming) {
          store.stopFraming();
        } else {
          store.startFraming();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enterInspection, exitInspection, setSavedPlayerPosition]);

  // Inspection Mouse Drag Orbit Events
  useEffect(() => {
    const dom = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (useLabStore.getState().mode === 'INSPECTING' && e.button === 0) {
        isDragging.current = true;
        prevMouseX.current = e.clientX;
        prevMouseY.current = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current && useLabStore.getState().mode === 'INSPECTING') {
        const deltaX = e.clientX - prevMouseX.current;
        const deltaY = e.clientY - prevMouseY.current;
        prevMouseX.current = e.clientX;
        prevMouseY.current = e.clientY;

        orbitYaw.current -= deltaX * 0.006;
        orbitPitch.current = Math.max(
          0.05,
          Math.min(Math.PI / 2.3, orbitPitch.current + deltaY * 0.006)
        );
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [gl]);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(position.current.x, position.current.y, position.current.z);
  }, [camera]);

  // Handle pointer lock state changes via both Drei controls and native browser event
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      setPointerLocked(isLocked);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    handlePointerLockChange();

    const onLock = () => setPointerLocked(true);
    const onUnlock = () => setPointerLocked(false);

    const controls = controlsRef.current;
    if (controls) {
      controls.addEventListener('lock', onLock);
      controls.addEventListener('unlock', onUnlock);
      }

      return () => {
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
        if (controls) {
          controls.removeEventListener('lock', onLock);
          controls.removeEventListener('unlock', onUnlock);
    }
  };
}, [setPointerLocked]);

useFrame((_, delta) => {
  const dt = Math.min(delta, 0.1);

  // MODE 1: INSPECTION TRANSITION (LERP TO / FROM STATION)
  if (mode === 'TRANSITIONING') {
    transitionProgress.current += dt * 1.6; // ~0.65s transition
    const t = Math.min(transitionProgress.current, 1);
    // Smooth ease-in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    if (activeStationId) {
      // Moving TO the station
      const station = STATIONS[activeStationId];
      if (transitionProgress.current <= dt * 1.6) {
        startCameraPos.current.copy(camera.position);
        targetCameraPos.current.set(...station.inspectCameraPosition);
        targetLookAt.current.set(...station.inspectLookAt);

        // Reset orbit angles to station default
        const dx = station.inspectCameraPosition[0] - station.inspectLookAt[0];
        const dz = station.inspectCameraPosition[2] - station.inspectLookAt[2];
        orbitYaw.current = Math.atan2(dx, dz);
        orbitRadius.current = Math.sqrt(dx * dx + dz * dz);
        orbitPitch.current = Math.asin(
          (station.inspectCameraPosition[1] - station.inspectLookAt[1]) /
          Math.max(0.1, orbitRadius.current)
        );
      }

      camera.position.lerpVectors(startCameraPos.current, targetCameraPos.current, ease);
      camera.lookAt(targetLookAt.current);

      if (t >= 1) {
        transitionProgress.current = 0;
        setMode('INSPECTING');
      }
    } else {
      // Returning BACK to player's walking position
      if (transitionProgress.current <= dt * 1.6) {
        startCameraPos.current.copy(camera.position);
        targetCameraPos.current.set(savedPlayerPosition[0], EYE_HEIGHT, savedPlayerPosition[2]);
      }

      camera.position.lerpVectors(startCameraPos.current, targetCameraPos.current, ease);

      if (t >= 1) {
        transitionProgress.current = 0;
        position.current.set(savedPlayerPosition[0], EYE_HEIGHT, savedPlayerPosition[2]);
        camera.position.copy(position.current);
        setMode('WALKING');
      }
    }
    return;
  }

  // MODE 2: INSPECTING MODE (Supports interactive mouse drag orbit around machine)
  if (mode === 'INSPECTING') {
    if (activeStationId) {
      const station = STATIONS[activeStationId];
      const lookAt = station.inspectLookAt;
      const r = orbitRadius.current;

      // Spherical to Cartesian relative to machine center
      const x = lookAt[0] + r * Math.cos(orbitPitch.current) * Math.sin(orbitYaw.current);
      const y = Math.max(0.2, lookAt[1] + r * Math.sin(orbitPitch.current));
      const z = lookAt[2] + r * Math.cos(orbitPitch.current) * Math.cos(orbitYaw.current);

      // Frame offset: Shift focal target rightwards so the machine is centered in the visible left 60% of screen (avoiding KnowledgePanel occlusion)
      const forward = new THREE.Vector3(lookAt[0] - x, 0, lookAt[2] - z).normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      const adjustedLookAt = new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]).addScaledVector(right, 0.32 * r);

      camera.position.lerp(new THREE.Vector3(x, y, z), 0.15);
      camera.lookAt(adjustedLookAt.x, adjustedLookAt.y, adjustedLookAt.z);
    }
    return;
  }

  // MODE 3: NORMAL FIRST-PERSON WALKING
  if (mode === 'WALKING') {
    const moveDirection = new THREE.Vector3();
    const currentSpeed = keys.current.sprint ? SPRINT_SPEED : WALK_SPEED;

    // Extract forward and right vectors from camera (ignoring vertical pitch)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();
    right.negate();

    if (keys.current.forward) moveDirection.add(forward);
    if (keys.current.backward) moveDirection.sub(forward);
    if (keys.current.right) moveDirection.add(right);
    if (keys.current.left) moveDirection.sub(right);

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize();
      velocity.current.x = moveDirection.x * currentSpeed;
      velocity.current.z = moveDirection.z * currentSpeed;
    } else {
      velocity.current.x *= Math.max(0, 1 - dt * 12);
      velocity.current.z *= Math.max(0, 1 - dt * 12);
    }

    // Resolve AABB collisions with wall sliding (radius 0.32m for smooth passage)
    const intendedPos: [number, number, number] = [
      position.current.x + velocity.current.x * dt,
      position.current.y,
      position.current.z + velocity.current.z * dt,
    ];

    const resolvedPos = resolveMovementWithCollisions(
      [position.current.x, position.current.y, position.current.z],
      intendedPos,
      0.32
    );

    position.current.set(resolvedPos[0], resolvedPos[1], resolvedPos[2]);

    // Calculate ground height & stair elevation under player
    const targetGround = getGroundHeightAt(position.current.x, position.current.z);
    setPlayerElevation(targetGround);
    const targetEyeY = targetGround + EYE_HEIGHT;

    // Calculate 3D Compass Heading (0 - 360°)
    const viewDir = new THREE.Vector3();
    camera.getWorldDirection(viewDir);
    // In Three.js: -Z is North (0°), +X is East (90°), +Z is South (180°), -X is West (270°)
    const heading = Math.round(((Math.atan2(viewDir.x, -viewDir.z) * 180 / Math.PI) + 360) % 360);
    setCameraHeading(heading);

    // Jump & gravity physics
    if (keys.current.jump && !isJumping.current) {
      isJumping.current = true;
      verticalVelocity.current = 4.2;
    }

    if (isJumping.current) {
      verticalVelocity.current -= 14 * dt;
      position.current.y += verticalVelocity.current * dt;
      if (position.current.y <= targetEyeY) {
        position.current.y = targetEyeY;
        isJumping.current = false;
        verticalVelocity.current = 0;
      }
    } else {
      // Step up or down stairs smoothly and responsive to player motion
      if (targetEyeY > position.current.y) {
        position.current.y = Math.min(targetEyeY, position.current.y + dt * 18.0);
      } else {
        position.current.y = THREE.MathUtils.lerp(
          position.current.y,
          targetEyeY,
          Math.min(1, dt * 18)
        );
      }
    }

    camera.position.copy(position.current);

    // Proximity Raycasting to detect closest interactive workstation
    let closestStation: MachineId | null = null;
    let minDistance = INTERACTION_DISTANCE;

    for (const st of Object.values(STATIONS)) {
      const dx = position.current.x - st.position[0];
      const dz = position.current.z - st.position[2];
      const dy = Math.abs(position.current.y - (st.position[1] + EYE_HEIGHT));
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Only interact with ground floor stations when player is on ground floor (dy < 1.5)
      if (dist < minDistance && dy < 1.5) {
        const dirToStation = new THREE.Vector3(
          st.position[0] - position.current.x,
          0,
          st.position[2] - position.current.z
        ).normalize();

        const viewDir = new THREE.Vector3();
        camera.getWorldDirection(viewDir);
        viewDir.y = 0;
        viewDir.normalize();

        const dot = viewDir.dot(dirToStation);
          // If close (< 2.4m), allow wider view angle (dot > 0.1); if approaching (2.4m - 3.2m), require facing it (dot > 0.35)
          const isFacing = dist < 2.4 ? dot > 0.1 : dot > 0.35;
          if (isFacing) {
            minDistance = dist;
            closestStation = st.id;
          }
        }
      }

      // Auto-unlock cursor when entering a machine station so user doesn't need to press ESC
      if (closestStation && closestStation !== previousStationRef.current) {
        previousStationRef.current = closestStation;
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      } else if (!closestStation) {
        previousStationRef.current = null;
      }

      setHoveredStation(
        closestStation,
        closestStation ? Number(minDistance.toFixed(1)) : null
      );
    }
  });

return (
  <>
    {mode === 'WALKING' && (
        <PointerLockControls ref={controlsRef} />
    )}
  </>
);
}
