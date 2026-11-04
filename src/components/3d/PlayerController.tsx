import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { useLabStore, playerWorldState } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { resolveMovementWithCollisions } from './CollisionManager';
import { MachineId, StationId } from '../../types/lab';
import { getGroundHeightAt, SECOND_FLOOR_STATIONS, LAB_TABLES, WALL_SWITCHES, MEZZANINE_CONFIG } from '../../data/staircaseConfig';
import { sound } from '../../utils/audioSystem';
const EYE_HEIGHT = 1.7;
const WALK_SPEED = 4.2;
const SPRINT_SPEED = 7.5;
const INTERACTION_DISTANCE = 3.2;

// Scratch reusable vectors for 60 FPS zero-allocation physics and interaction loops
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _moveDirection = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _aimDir = new THREE.Vector3();
const _adjustedLookAt = new THREE.Vector3();
const _thirdPersonPos = new THREE.Vector3();
const _tempPos = new THREE.Vector3();
const _targetWorldPos = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'YXZ');

export function PlayerController() {
  const { camera, gl } = useThree();
  const keys = useKeyboardControls();

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
    isLandingPageOpen,
    isSettingsModalOpen,
  } = useLabStore();

  const isAnyModalOpen =
    isLandingPageOpen ||
    isDesignModalOpen ||
    isSpecimenModalOpen ||
    isHelpModalOpen ||
    isNpcDialogOpen ||
    isChemicalModalOpen ||
    isEquipmentModalOpen ||
    isSinkModalOpen ||
    isWorkbenchModalOpen ||
    isSettingsModalOpen ||
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
  const reticleOffset = useRef({ x: 0, y: 0 });

  // Universal hand interaction handler: works whether hands are free or holding an item
  const executeInteraction = (targetId: StationId) => {
    const store = useLabStore.getState();
    playerWorldState.handTapTrigger++;

    if (targetId === 'aptomat_tube_lights') {
      store.toggleAptomat();
      sound.playRelayClick();
    } else if (targetId === 'aptomat_ceiling_lamps') {
      store.toggleCeilingLampsAptomat();
      sound.playRelayClick();
    } else if (targetId === 'npc_dung') {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openNpcDialog();
    } else if (targetId === 'chemical_rack') {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openChemicalModal();
    } else if (targetId === 'equipment_rack') {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openEquipmentModal();
    } else if (targetId === 'lab_sink') {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openSinkModal();
    } else if (targetId === 'computer_desk') {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openDesignModal();
    } else if (typeof targetId === 'string' && targetId.startsWith('table_')) {
      if (document.pointerLockElement) document.exitPointerLock();
      store.openWorkbenchModal(targetId);
    } else if (targetId in STATIONS) {
      setSavedPlayerPosition([position.current.x, position.current.y, position.current.z]);
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      enterInspection(targetId as MachineId);
    }
  };

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
        store.isLandingPageOpen ||
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isSettingsModalOpen;

      const requestLock = () => {
        try {
          gl.domElement.requestPointerLock();
        } catch {
          // ignore
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
          executeInteraction(hovered);
        }
      } else if (e.code === 'KeyX') {
        store.closeActiveLabUI();
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

  // Safe Camera Rotation Helper with strict NaN immunity & automatic recovery
  const rotateCamera = (dx: number, dy: number, factor: number) => {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;

    if (
      Number.isFinite(camera.quaternion.x) &&
      Number.isFinite(camera.quaternion.y) &&
      Number.isFinite(camera.quaternion.z) &&
      Number.isFinite(camera.quaternion.w)
    ) {
      _euler.setFromQuaternion(camera.quaternion);
    } else {
      // Safe recovery if camera quaternion was ever corrupted with NaN
      _euler.set(0, THREE.MathUtils.degToRad(180), 0);
    }

    _euler.y -= dx * factor;
    _euler.x -= dy * factor;
    // Clamp pitch to avoid gimbal flip (-82° to +82°)
    _euler.x = Math.max(-1.43, Math.min(1.43, _euler.x));

    camera.quaternion.setFromEuler(_euler);
  };

  // Unified Pointer, Mouse & Laptop Trackpad Look Controller
  useEffect(() => {
    let lastClientX: number | null = null;
    let lastClientY: number | null = null;

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      const store = useLabStore.getState();
      if (store.mode !== 'WALKING') {
        lastClientX = null;
        lastClientY = null;
        return;
      }

      const isAnyModalCurrentlyOpen =
        store.isLandingPageOpen ||
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isSettingsModalOpen;

      if (isAnyModalCurrentlyOpen) {
        lastClientX = null;
        lastClientY = null;
        return;
      }

      // If hovering over UI interactive controls when pointer is not locked, don't rotate
      if (
        !document.pointerLockElement &&
        e.target instanceof HTMLElement &&
        (e.target.closest('button') ||
          e.target.closest('input') ||
          e.target.closest('select') ||
          e.target.closest('textarea') ||
          e.target.closest('a') ||
          e.target.closest('[role="dialog"]') ||
          e.target.closest('.pointer-events-auto'))
      ) {
        lastClientX = null;
        lastClientY = null;
        return;
      }

      let dx = typeof e.movementX === 'number' && Number.isFinite(e.movementX) ? e.movementX : 0;
      let dy = typeof e.movementY === 'number' && Number.isFinite(e.movementY) ? e.movementY : 0;

      const currentX = e.clientX;
      const currentY = e.clientY;

      // On laptop trackpads or when unlocked, if movementX/Y is 0, compute delta from client coordinates
      if (!document.pointerLockElement || (dx === 0 && dy === 0)) {
        if (
          lastClientX !== null &&
          lastClientY !== null &&
          typeof currentX === 'number' &&
          typeof currentY === 'number'
        ) {
          const clientDx = currentX - lastClientX;
          const clientDy = currentY - lastClientY;
          if (dx === 0 && dy === 0) {
            dx = clientDx;
            dy = clientDy;
          }
        }
      }

      if (typeof currentX === 'number') lastClientX = currentX;
      if (typeof currentY === 'number') lastClientY = currentY;

      // Filter out large single-frame teleports (e.g. pointer lock enter/exit jump)
      if (Math.abs(dx) > 120 || Math.abs(dy) > 120) {
        return;
      }

      if (dx !== 0 || dy !== 0) {
        rotateCamera(dx, dy, 0.0022);
      }
    };

    // Laptop trackpad two-finger swipe / pan gesture listener
    const handleWheel = (e: WheelEvent) => {
      const store = useLabStore.getState();
      if (store.mode !== 'WALKING') return;

      const isAnyModalCurrentlyOpen =
        store.isLandingPageOpen ||
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.isSettingsModalOpen;

      if (isAnyModalCurrentlyOpen) return;

      // Don't capture if user is scrolling inside a scrollable modal/dialog
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest('[role="dialog"]') ||
          e.target.closest('.overflow-y-auto') ||
          e.target.closest('.overflow-auto'))
      ) {
        return;
      }

      let deltaX = typeof e.deltaX === 'number' && Number.isFinite(e.deltaX) ? e.deltaX : 0;
      let deltaY = typeof e.deltaY === 'number' && Number.isFinite(e.deltaY) ? e.deltaY : 0;

      // If shiftKey is held, swap axis
      if (e.shiftKey && deltaX === 0) {
        deltaX = deltaY;
        deltaY = 0;
      }

      // Normalize trackpad wheel sensitivity
      deltaX = THREE.MathUtils.clamp(deltaX, -80, 80);
      deltaY = THREE.MathUtils.clamp(deltaY, -80, 80);

      if (deltaX !== 0 || deltaY !== 0) {
        if (e.cancelable) e.preventDefault();
        rotateCamera(deltaX, deltaY, 0.0016);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [camera]);

  // Canvas click to lock pointer when in walking mode
  useEffect(() => {
    const handleCanvasClick = (e: MouseEvent) => {
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
      const isAnyModalCurrentlyOpen =
        store.isLandingPageOpen ||
        store.isDesignModalOpen ||
        store.isSpecimenModalOpen ||
        store.isHelpModalOpen ||
        store.isNpcDialogOpen ||
        store.isChemicalModalOpen ||
        store.isEquipmentModalOpen ||
        store.isSinkModalOpen ||
        store.isWorkbenchModalOpen ||
        store.mode === 'INSPECTING';

      if (store.mode === 'WALKING' && !isAnyModalCurrentlyOpen) {
        if (!document.pointerLockElement) {
          try {
            const p = gl.domElement.requestPointerLock();
            if (p && typeof p.catch === 'function') p.catch(() => {});
          } catch {}
          return;
        }

        if (store.hoveredStationId) {
          executeInteraction(store.hoveredStationId);
          return;
        }
      }
    };

    const handleBlur = () => {
      keys.current = { forward: false, backward: false, left: false, right: false, sprint: false, jump: false };
    };

    window.addEventListener('click', handleCanvasClick);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gl]);

  // Set initial camera position
  useEffect(() => {
    camera.position.set(position.current.x, position.current.y, position.current.z);
  }, [camera]);

  // Synchronize browser pointer lock state to Zustand store
  useEffect(() => {
    const handlePointerLockChange = () => {
      const isLocked = document.pointerLockElement !== null;
      setPointerLocked(isLocked);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    handlePointerLockChange();

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
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
      _forward.set(lookAt[0] - x, 0, lookAt[2] - z).normalize();
      _right.crossVectors(_forward, _up).normalize();
      _adjustedLookAt.set(lookAt[0], lookAt[1], lookAt[2]).addScaledVector(_right, 0.32 * r);

      _tempPos.set(x, y, z);
      camera.position.lerp(_tempPos, 0.15);
      camera.lookAt(_adjustedLookAt.x, _adjustedLookAt.y, _adjustedLookAt.z);
    }
    return;
  }

  // MODE 3: NORMAL FIRST-PERSON WALKING
  if (mode === 'WALKING') {
    _moveDirection.set(0, 0, 0);
    const isSprinting = keys.current.sprint;
    const currentSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;

    // Extract forward and right vectors from camera (ignoring vertical pitch)
    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();

    _right.crossVectors(camera.up, _forward).normalize().negate();

    if (keys.current.forward) _moveDirection.add(_forward);
    if (keys.current.backward) _moveDirection.sub(_forward);
    if (keys.current.right) _moveDirection.add(_right);
    if (keys.current.left) _moveDirection.sub(_right);

    if (_moveDirection.lengthSq() > 0) {
      _moveDirection.normalize();
      velocity.current.x = _moveDirection.x * currentSpeed;
      velocity.current.z = _moveDirection.z * currentSpeed;
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

    const npcDungPos = useLabStore.getState().npcDungPosition;
    const resolvedPos = resolveMovementWithCollisions(
      [position.current.x, position.current.y, position.current.z],
      intendedPos,
      0.32,
      true,
      npcDungPos ? { x: npcDungPos[0], y: npcDungPos[1], z: npcDungPos[2], radius: 0.35, isEyeHeight: false } : null
    );

    position.current.set(resolvedPos[0], resolvedPos[1], resolvedPos[2]);

    // Calculate ground height & stair elevation under player
    const targetGround = getGroundHeightAt(position.current.x, position.current.z);
    setPlayerElevation(targetGround);
    const targetEyeY = targetGround + EYE_HEIGHT;

    // Calculate 3D Compass Heading (0 - 360°)
    camera.getWorldDirection(_viewDir);
    // In Three.js: -Z is North (0°), +X is East (90°), +Z is South (180°), -X is West (270°)
    const heading = Math.round(((Math.atan2(_viewDir.x, -_viewDir.z) * 180 / Math.PI) + 360) % 360);
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

    const isMoving =
      velocity.current.x * velocity.current.x + velocity.current.z * velocity.current.z > 0.05;
    playerWorldState.x = position.current.x;
    playerWorldState.y = position.current.y;
    playerWorldState.z = position.current.z;
    playerWorldState.isMoving = isMoving;

    const camYaw = Math.atan2(_viewDir.x, _viewDir.z);
    playerWorldState.yaw = camYaw;

    if (isMoving) {
      playerWorldState.moveAngle = Math.atan2(velocity.current.x, velocity.current.z);
    }
    // When stopped, Doraemon retains his orientation so player can orbit camera around him to view his face and body!

    const isThirdPerson = useLabStore.getState().isThirdPersonView;
    if (isThirdPerson) {
      // Third-person camera position: 2.2m behind the player, at eye level with Doraemon
      _thirdPersonPos.set(
        position.current.x - _viewDir.x * 2.2,
        position.current.y - 0.25,
        position.current.z - _viewDir.z * 2.2
      );
      // Soft clamp to room bounding box so camera never slips outside the workshop walls
      _thirdPersonPos.x = THREE.MathUtils.clamp(_thirdPersonPos.x, -9.4, 9.4);
      _thirdPersonPos.z = THREE.MathUtils.clamp(_thirdPersonPos.z, -15.4, 11.4);
      camera.position.copy(_thirdPersonPos);
    } else {
      camera.position.copy(position.current);
    }

    // Multi-Target Proximity Detection: Collect all interactive stations in range
    const nearbyCandidates: { id: StationId; dist: number; dot: number }[] = [];

    camera.getWorldDirection(_aimDir);
    _aimDir.y = 0;
    _aimDir.normalize();

    // Ground floor stations
    for (const st of Object.values(STATIONS)) {
      const dx = st.position[0] - position.current.x;
      const dz = st.position[2] - position.current.z;
      const dy = Math.abs(position.current.y - (st.position[1] + EYE_HEIGHT));
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < INTERACTION_DISTANCE && dy < 1.5) {
        const dot = (dx * _aimDir.x + dz * _aimDir.z) / (dist || 1);
        const isFacing = dist < 2.4 ? dot > 0.1 : dot > 0.35;
        if (isFacing) {
          nearbyCandidates.push({ id: st.id, dist, dot });
        }
      }
    }

    // Ground floor Wall Switches (Aptomat CB-01 & CB-02 on North Wall)
    if (position.current.y < 2.5) {
      for (const sw of Object.values(WALL_SWITCHES)) {
        const dx = sw.position[0] - position.current.x;
        const dz = sw.position[2] - position.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < 4.2) {
          const dot = (dx * _aimDir.x + dz * _aimDir.z) / (dist || 1);
          // Facing check: player must be looking towards the switch
          if (dot > 0.2) {
            nearbyCandidates.push({ id: sw.id, dist, dot });
          }
        }
      }
    }

    // Floor 2 stations
    if (position.current.y > 2.0) {
      const npcPos = useLabStore.getState().npcDungPosition || SECOND_FLOOR_STATIONS.NPC_DUNG.position;
      for (const st of Object.values(SECOND_FLOOR_STATIONS)) {
        const targetPos = st.id === 'npc_dung' ? npcPos : st.position;
        const dx = targetPos[0] - position.current.x;
        const dz = targetPos[2] - position.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const maxDist = st.id === 'chemical_rack' ? 3.8 : 3.0;

        if (dist < maxDist) {
          const dot = (dx * _aimDir.x + dz * _aimDir.z) / (dist || 1);
          const isFacing = dist < 1.8 ? dot > -0.2 : dot > 0.2;
          if (isFacing) {
            nearbyCandidates.push({ id: st.id, dist, dot });
          }
        }
      }

      // Check proximity to all 10 Lab Workbenches
      for (const tb of LAB_TABLES) {
        const dx = tb.position[0] - position.current.x;
        const dz = tb.position[2] - position.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 2.4) {
          const dot = (dx * _aimDir.x + dz * _aimDir.z) / (dist || 1);
          if (dot > 0.2) {
            nearbyCandidates.push({ id: tb.id as StationId, dist, dot });
          }
        }
      }
    }

    // Helper: Obtain 3D interaction anchor point for any station
    const getTargetWorldPos = (id: StationId): THREE.Vector3 | null => {
      if (id in STATIONS) {
        const s = STATIONS[id as MachineId];
        return _targetWorldPos.set(s.position[0], s.position[1] + 0.9, s.position[2]);
      }
      if (id === 'aptomat_tube_lights') {
        return _targetWorldPos.set(WALL_SWITCHES.aptomat_tube_lights.position[0], 1.55, WALL_SWITCHES.aptomat_tube_lights.position[2]);
      }
      if (id === 'aptomat_ceiling_lamps') {
        return _targetWorldPos.set(WALL_SWITCHES.aptomat_ceiling_lamps.position[0], 1.55, WALL_SWITCHES.aptomat_ceiling_lamps.position[2]);
      }
      if (id === 'npc_dung') {
        const pos = useLabStore.getState().npcDungPosition || SECOND_FLOOR_STATIONS.NPC_DUNG.position;
        return _targetWorldPos.set(pos[0], pos[1] + 1.2, pos[2]);
      }
      if (id === 'chemical_rack') {
        const pos = SECOND_FLOOR_STATIONS.CHEMICAL_RACK.position;
        return _targetWorldPos.set(pos[0], MEZZANINE_CONFIG.floorY + 1.1, pos[2]);
      }
      if (id === 'equipment_rack') {
        return _targetWorldPos.set(7.5, MEZZANINE_CONFIG.floorY + 1.1, 9.8);
      }
      if (id === 'lab_sink') {
        return _targetWorldPos.set(0.0, MEZZANINE_CONFIG.floorY + 1.0, 9.8);
      }
      if (id === 'computer_desk') {
        return _targetWorldPos.set(-6.0, MEZZANINE_CONFIG.floorY + 0.9, 9.8);
      }
      if (typeof id === 'string' && id.startsWith('table_')) {
        const tb = LAB_TABLES.find((t) => t.id === id);
        if (tb) return _targetWorldPos.set(tb.position[0], tb.position[1] + 0.85, tb.position[2]);
      }
      return null;
    };

    // Project candidates to screen coordinates to compute secondary auto-aim radius
    const enrichedCandidates: {
      id: StationId;
      dist: number;
      dot: number;
      screenX?: number;
      screenY?: number;
      screenDist?: number;
    }[] = nearbyCandidates.map((cand) => {
      const worldPos = getTargetWorldPos(cand.id);
      if (!worldPos) return cand;
      _tempPos.copy(worldPos).project(camera);
      if (_tempPos.z < 1.0) {
        const screenDist = Math.hypot(_tempPos.x, _tempPos.y);
        return {
          ...cand,
          screenX: _tempPos.x,
          screenY: _tempPos.y,
          screenDist,
        };
      }
      return cand;
    });

    // Prioritize candidates closest to screen center (within auto-aim cone) to prevent rapid flickering
    enrichedCandidates.sort((a, b) => {
      if (a.screenDist !== undefined && b.screenDist !== undefined) {
        if (a.screenDist < 0.28 && b.screenDist < 0.28) {
          return a.screenDist - b.screenDist;
        }
      }
      const scoreA = a.dot * 3.5 - a.dist * 0.8;
      const scoreB = b.dot * 3.5 - b.dist * 0.8;
      return scoreB - scoreA;
    });

    // Magnetism target calculation for center reticle pointer
    const bestScreenCand = enrichedCandidates.find(
      (c) => c.screenDist !== undefined && c.screenDist < 0.26
    );
    let targetPixelX = 0;
    let targetPixelY = 0;

    if (
      bestScreenCand &&
      bestScreenCand.screenX !== undefined &&
      bestScreenCand.screenY !== undefined
    ) {
      const maxPull = 40; // Max auto-aim magnetic pull offset in pixels
      targetPixelX = THREE.MathUtils.clamp(
        bestScreenCand.screenX * (gl.domElement.clientWidth * 0.35),
        -maxPull,
        maxPull
      );
      targetPixelY = THREE.MathUtils.clamp(
        -bestScreenCand.screenY * (gl.domElement.clientHeight * 0.35),
        -maxPull,
        maxPull
      );
    }

    // Smoothly interpolate reticle offset toward target (damp back to 0,0 when looking away)
    reticleOffset.current.x = THREE.MathUtils.damp(
      reticleOffset.current.x,
      targetPixelX,
      16,
      dt
    );
    reticleOffset.current.y = THREE.MathUtils.damp(
      reticleOffset.current.y,
      targetPixelY,
      16,
      dt
    );

    // Apply hardware-accelerated transform directly to DOM element (0 React re-renders)
    const reticleEl = document.getElementById('hud-center-reticle');
    if (reticleEl) {
      const rx = reticleOffset.current.x;
      const ry = reticleOffset.current.y;
      reticleEl.style.transform = `translate(calc(-50% + ${rx.toFixed(1)}px), calc(-50% + ${ry.toFixed(1)}px))`;
    }

    const nearbyIds = enrichedCandidates.map((c) => c.id);

    const storeState = useLabStore.getState();

    // Performance optimization: Only sync nearbyStations when array contents change
    const prevNearby = storeState.nearbyStations;
    const isNearbyEqual =
      prevNearby.length === nearbyIds.length &&
      prevNearby.every((id, idx) => id === nearbyIds[idx]);
    if (!isNearbyEqual) {
      useLabStore.getState().setNearbyStations(nearbyIds);
    }

    const activeIdx = Math.min(storeState.activeTargetIndex, Math.max(0, enrichedCandidates.length - 1));
    const activeCandidate = enrichedCandidates[activeIdx] || null;
    const closestStation: StationId | null = activeCandidate ? activeCandidate.id : null;
    const activeDistance: number | null =
      activeCandidate && activeCandidate.dist !== null ? Number(activeCandidate.dist.toFixed(1)) : null;

    // Performance optimization: Only update hovered station when hovered target or 0.1m rounded distance changes
    if (
      storeState.hoveredStationId !== closestStation ||
      storeState.hoveredDistance !== activeDistance
    ) {
      setHoveredStation(closestStation, activeDistance);
    }
    }
  });

  return null;
}
