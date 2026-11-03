import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useLabStore, playerWorldState } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { resolveMovementWithCollisions } from './CollisionManager';
import { MachineId, StationId } from '../../types/lab';
import { getGroundHeightAt, SECOND_FLOOR_STATIONS, LAB_TABLES } from '../../data/staircaseConfig';
import { mobileInputState } from '../../utils/mobileInput';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 4.2;
const SPRINT_SPEED = 7.5;
const INTERACTION_DISTANCE = 3.2;

export function PlayerController() {
  const { camera, gl } = useThree();
  const keys = useKeyboardControls();
  const controlsRef = useRef<any>(null);
  const previousStationRef = useRef<string | null>(null);

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
    isDesignModalOpen,
    isSpecimenModalOpen,
    isHelpModalOpen,
    isNpcDialogOpen,
    isChemicalModalOpen,
    isEquipmentModalOpen,
    isSinkModalOpen,
    isWorkbenchModalOpen,
    isTouchDevice,
    setIsTouchDevice,
    deviceMode,
    isDeviceSelectModalOpen,
  } = useLabStore();

  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches);
    setIsTouchDevice(isTouch);
  }, [setIsTouchDevice]);

  const isAnyModalOpen =
    isDesignModalOpen ||
    isSpecimenModalOpen ||
    isHelpModalOpen ||
    isNpcDialogOpen ||
    isChemicalModalOpen ||
    isEquipmentModalOpen ||
    isSinkModalOpen ||
    isWorkbenchModalOpen ||
    isDeviceSelectModalOpen ||
    activeStationId !== null ||
    mode === 'INSPECTING';

  // Automatically release mouse pointer whenever any tab/modal is opened
  useEffect(() => {
    if (isAnyModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isAnyModalOpen]);

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
      const store = useLabStore.getState();

      // Check if any modal is currently active
      const anyModalOpen =
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isDeviceSelectModalOpen;

      const requestLock = () => {
        if (controlsRef.current) {
          try {
            controlsRef.current.lock();
          } catch {
            try {
              gl.domElement.requestPointerLock();
            } catch {}
          }
        } else {
          try {
            gl.domElement.requestPointerLock();
          } catch {}
        }
      };

      // Tab / Q: Cycle through nearby interactive targets when multiple objects are close
      if (e.code === 'Tab' || e.code === 'KeyQ') {
        const store = useLabStore.getState();
        if (store.nearbyStations.length > 1) {
          e.preventDefault();
          store.cycleInteractiveTarget();
          return;
        }
      }

      // Movement keys (WASD, arrows, space): Stop inspection/machine dock and lock cursor to canvas
      const movementKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
      if (movementKeys.includes(e.code)) {
        if (currentMode === 'INSPECTING' || (currentMode === 'TRANSITIONING' && !store.activeStationId)) {
          exitInspection();
          store.dismissMachineDock();
          transitionProgress.current = 1.0;
        } else if (currentMode === 'WALKING') {
          store.dismissMachineDock();
        }

        if (!anyModalOpen && !document.pointerLockElement) {
          requestLock();
        }
      }

      if (e.code === 'KeyE') {
        const hovered = store.hoveredStationId;
        if (hovered && currentMode === 'WALKING') {
          if (hovered === 'npc_dung') {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openNpcDialog();
          } else if (hovered === 'chemical_rack') {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openChemicalModal();
          } else if (hovered === 'equipment_rack') {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openEquipmentModal();
          } else if (hovered === 'lab_sink') {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openSinkModal();
          } else if (hovered === 'computer_desk') {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openDesignModal();
          } else if (typeof hovered === 'string' && hovered.startsWith('table_')) {
            if (document.pointerLockElement) document.exitPointerLock();
            store.openWorkbenchModal(hovered);
          } else if (hovered in STATIONS) {
            setSavedPlayerPosition([position.current.x, position.current.y, position.current.z]);
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
            enterInspection(hovered as MachineId);
          }
        }
      } else if (e.code === 'Escape') {
        // Auto-lock pointer upon stopping machine usage or closing panels
        if (store.isNpcDialogOpen) {
          store.closeNpcDialog();
          requestLock();
        } else if (store.isChemicalModalOpen) {
          store.closeChemicalModal();
          requestLock();
        } else if (store.isEquipmentModalOpen) {
          store.closeEquipmentModal();
          requestLock();
        } else if (store.isSinkModalOpen) {
          store.closeSinkModal();
          requestLock();
        } else if (store.isWorkbenchModalOpen) {
          store.closeWorkbenchModal();
          requestLock();
        } else if (store.isDesignModalOpen) {
          store.closeDesignModal();
          requestLock();
        } else if (store.isSpecimenModalOpen) {
          store.closeSpecimenModal();
          requestLock();
        } else if (store.isHelpModalOpen) {
          store.closeHelpModal();
          requestLock();
        } else if (store.isDeviceSelectModalOpen) {
          store.closeDeviceSelectModal();
          requestLock();
        } else if (currentMode === 'INSPECTING') {
          exitInspection();
          store.dismissMachineDock();
          requestLock();
        } else if (currentMode === 'WALKING') {
          // Pressing ESC dismisses machine dock and locks mouse pointer back to canvas
          store.dismissMachineDock();
          if (!document.pointerLockElement) {
            requestLock();
          }
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
      } else if (e.code === 'Digit5') {
        if (document.pointerLockElement) document.exitPointerLock();
        enterInspection('COATING_STATION');
      } else if (e.code === 'Digit9') {
        useLabStore.getState().toggleThirdPersonView();
      } else if (e.code === 'KeyP') {
        useLabStore.getState().toggleStats();
      } else if (e.code === 'KeyH') {
        useLabStore.getState().toggleHelpModal();
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

  // Canvas click to lock pointer when walking
  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
      // If clicking interactive UI elements, don't lock
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest('button') ||
          e.target.closest('input') ||
          e.target.closest('select') ||
          e.target.closest('textarea') ||
          e.target.closest('a') ||
          e.target.closest('[role="dialog"]') ||
          e.target.closest('.pointer-events-auto'))
      ) {
        return;
      }

      const store = useLabStore.getState();
      const anyModalCurrentlyOpen =
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isDeviceSelectModalOpen ||
        store.mode === 'INSPECTING';

      if (store.mode === 'WALKING' && !anyModalCurrentlyOpen && !document.pointerLockElement) {
        if (controlsRef.current) {
          try {
            controlsRef.current.lock();
          } catch {
            try {
              gl.domElement.requestPointerLock();
            } catch {}
          }
        } else {
          try {
            gl.domElement.requestPointerLock();
          } catch {}
        }
      }
    };

    window.addEventListener('click', handleCanvasClick);
    return () => window.removeEventListener('click', handleCanvasClick);
  }, [gl]);

  // Fallback mouse look in WALKING mode when pointer lock is temporarily unengaged
  useEffect(() => {
    let lastX: number | null = null;
    let lastY: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      // If native pointer lock is active, Drei PointerLockControls handles mouse look
      if (document.pointerLockElement) {
        lastX = null;
        lastY = null;
        return;
      }

      const store = useLabStore.getState();
      if (store.mode !== 'WALKING') {
        lastX = null;
        lastY = null;
        return;
      }

      const anyModalCurrentlyOpen =
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isDeviceSelectModalOpen;

      if (anyModalCurrentlyOpen) {
        lastX = null;
        lastY = null;
        return;
      }

      // If hovering over UI interactive controls, don't rotate camera
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest('button') ||
          e.target.closest('input') ||
          e.target.closest('select') ||
          e.target.closest('textarea') ||
          e.target.closest('a') ||
          e.target.closest('[role="dialog"]') ||
          e.target.closest('.pointer-events-auto'))
      ) {
        lastX = null;
        lastY = null;
        return;
      }

      const currentX = e.clientX;
      const currentY = e.clientY;

      let dx = e.movementX;
      let dy = e.movementY;

      if (dx === undefined || (dx === 0 && dy === 0 && lastX !== null)) {
        dx = lastX !== null ? currentX - lastX : 0;
        dy = lastY !== null ? currentY - lastY : 0;
      }

      lastX = currentX;
      lastY = currentY;

      if (Math.abs(dx) > 120 || Math.abs(dy) > 120) {
        return;
      }

      if (dx !== 0 || dy !== 0) {
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= dx * 0.0024;
        euler.x -= dy * 0.0024;
        euler.x = Math.max(-1.42, Math.min(1.42, euler.x));
        camera.quaternion.setFromEuler(euler);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [camera]);

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

  // Check if any teleportation is requested (e.g. from Mobile Floor toggle or Station quick select)
  const currentTeleport = useLabStore.getState().teleportTarget;
  if (currentTeleport) {
    position.current.set(currentTeleport[0], currentTeleport[1], currentTeleport[2]);
    camera.position.set(currentTeleport[0], currentTeleport[1], currentTeleport[2]);
    velocity.current.set(0, 0, 0);
    verticalVelocity.current = 0;
    isJumping.current = false;
    useLabStore.getState().clearTeleportTarget();
  }

  // Handle Touch Screen Look Delta (Yaw & Pitch)
  if (mobileInputState.lookDelta.dx !== 0 || mobileInputState.lookDelta.dy !== 0) {
    if (mode === 'WALKING') {
      const lookSensitivity = 0.0035;
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= mobileInputState.lookDelta.dx * lookSensitivity;
      euler.x -= mobileInputState.lookDelta.dy * lookSensitivity;
      euler.x = Math.max(-1.42, Math.min(1.42, euler.x));
      camera.quaternion.setFromEuler(euler);
    } else if (mode === 'INSPECTING') {
      orbitYaw.current -= mobileInputState.lookDelta.dx * 0.006;
      orbitPitch.current = Math.max(
        0.05,
        Math.min(Math.PI / 2.3, orbitPitch.current + mobileInputState.lookDelta.dy * 0.006)
      );
    }
    mobileInputState.lookDelta.dx = 0;
    mobileInputState.lookDelta.dy = 0;
  }

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
    const isSprinting = keys.current.sprint || mobileInputState.sprint;
    const currentSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;

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

    // Integrate Mobile Virtual Joystick analog input:
    // move.y > 0 is forward, move.y < 0 is backward
    // move.x > 0 is strafe right, move.x < 0 is strafe left
    if (mobileInputState.move.x !== 0 || mobileInputState.move.y !== 0) {
      moveDirection.addScaledVector(forward, mobileInputState.move.y);
      moveDirection.addScaledVector(right, mobileInputState.move.x);
    }

    if (moveDirection.lengthSq() > 0) {
      const joyMag = Math.hypot(mobileInputState.move.x, mobileInputState.move.y);
      const analogScale = joyMag > 0 ? Math.min(1, Math.max(0.35, joyMag)) : 1;
      moveDirection.normalize();
      velocity.current.x = moveDirection.x * currentSpeed * analogScale;
      velocity.current.z = moveDirection.z * currentSpeed * analogScale;
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
    if ((keys.current.jump || mobileInputState.jump) && !isJumping.current) {
      isJumping.current = true;
      verticalVelocity.current = 4.2;
    }
    mobileInputState.jump = false;

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

    const isMoving =
      velocity.current.x * velocity.current.x + velocity.current.z * velocity.current.z > 0.05;
    playerWorldState.x = position.current.x;
    playerWorldState.y = position.current.y;
    playerWorldState.z = position.current.z;
    playerWorldState.isMoving = isMoving;

    const camYaw = Math.atan2(viewDir.x, viewDir.z);
    playerWorldState.yaw = camYaw;

    if (isMoving) {
      playerWorldState.moveAngle = Math.atan2(velocity.current.x, velocity.current.z);
    }
    // When stopped, Doraemon retains his orientation so player can orbit camera around him to view his face and body!

    const isThirdPerson = useLabStore.getState().isThirdPersonView;
    if (isThirdPerson) {
      // Third-person camera position: 2.2m behind the player, at eye level with Doraemon
      const thirdPersonPos = new THREE.Vector3(
        position.current.x - viewDir.x * 2.2,
        position.current.y - 0.25,
        position.current.z - viewDir.z * 2.2
      );
      // Soft clamp to room bounding box so camera never slips outside the workshop walls
      thirdPersonPos.x = THREE.MathUtils.clamp(thirdPersonPos.x, -9.4, 9.4);
      thirdPersonPos.z = THREE.MathUtils.clamp(thirdPersonPos.z, -15.4, 11.4);
      camera.position.copy(thirdPersonPos);
    } else {
      camera.position.copy(position.current);
    }

    // Multi-Target Proximity Detection: Collect all interactive stations in range
    const nearbyCandidates: { id: StationId; dist: number }[] = [];

    // Ground floor stations
    for (const st of Object.values(STATIONS)) {
      const dx = position.current.x - st.position[0];
      const dz = position.current.z - st.position[2];
      const dy = Math.abs(position.current.y - (st.position[1] + EYE_HEIGHT));
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < INTERACTION_DISTANCE && dy < 1.5) {
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
        const isFacing = dist < 2.4 ? dot > 0.1 : dot > 0.35;
        if (isFacing) {
          nearbyCandidates.push({ id: st.id, dist });
        }
      }
    }

    // Floor 2 stations
    if (position.current.y > 2.0) {
      const npcPos = useLabStore.getState().npcDungPosition || SECOND_FLOOR_STATIONS.NPC_DUNG.position;
      for (const st of Object.values(SECOND_FLOOR_STATIONS)) {
        const targetPos = st.id === 'npc_dung' ? npcPos : st.position;
        const dx = position.current.x - targetPos[0];
        const dz = position.current.z - targetPos[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.8) {
          nearbyCandidates.push({ id: st.id, dist });
        }
      }

      // Check proximity to all 10 Lab Workbenches
      for (const tb of LAB_TABLES) {
        const dx = position.current.x - tb.position[0];
        const dz = position.current.z - tb.position[2];
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.2) {
          nearbyCandidates.push({ id: tb.id as StationId, dist });
        }
      }
    }

    // Sort by proximity ascending
    nearbyCandidates.sort((a, b) => a.dist - b.dist);
    const nearbyIds = nearbyCandidates.map((c) => c.id);

    // Sync nearby candidates to Zustand store
    useLabStore.getState().setNearbyStations(nearbyIds);

    const storeState = useLabStore.getState();
    const activeIdx = Math.min(storeState.activeTargetIndex, Math.max(0, nearbyCandidates.length - 1));
    const activeCandidate = nearbyCandidates[activeIdx] || null;
    const closestStation: StationId | null = activeCandidate ? activeCandidate.id : null;
    const activeDistance: number | null = activeCandidate ? activeCandidate.dist : null;

    setHoveredStation(
      closestStation,
      closestStation && activeDistance !== null ? Number(activeDistance.toFixed(1)) : null
    );
    }
  });

  return (
    <>
      {mode === 'WALKING' && !isAnyModalOpen && deviceMode === 'desktop' && (
        <PointerLockControls
          ref={controlsRef}
          onLock={() => setPointerLocked(true)}
          onUnlock={() => setPointerLocked(false)}
        />
      )}
    </>
  );
}
