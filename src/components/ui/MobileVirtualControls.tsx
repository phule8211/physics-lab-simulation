import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { MachineId } from '../../types/lab';
import {
  setMobileMove,
  addMobileLookDelta,
  triggerMobileJump,
  toggleMobileSprintState,
} from '../../utils/mobileInput';
import {
  ArrowUp,
  Zap,
  Hand,
  Layers,
  Sparkles,
  Compass,
  MessageSquare,
  Droplets,
  FlaskConical,
  Eye,
  PenTool,
} from 'lucide-react';

const JOYSTICK_RADIUS = 46; // max travel distance of knob from center in px

export function MobileVirtualControls() {
  const {
    mode,
    activeStationId,
    hoveredStationId,
    currentFloor,
    teleportTo,
    isDesignModalOpen,
    isSpecimenModalOpen,
    isHelpModalOpen,
    isNpcDialogOpen,
    isChemicalModalOpen,
    isEquipmentModalOpen,
    isSinkModalOpen,
    openNpcDialog,
    openChemicalModal,
    openEquipmentModal,
    openSinkModal,
    openDesignModal,
    enterInspection,
    setSavedPlayerPosition,
    isMobileSprint,
    toggleMobileSprint,
  } = useLabStore();

  const isAnyModalOpen =
    isDesignModalOpen ||
    isSpecimenModalOpen ||
    isHelpModalOpen ||
    isNpcDialogOpen ||
    isChemicalModalOpen ||
    isEquipmentModalOpen ||
    isSinkModalOpen;

  // Joystick touch tracking
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera look touch tracking
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Onboarding hint
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  // ---------------------------------------------------------------------------
  // LEFT JOYSTICK TOUCH HANDLERS
  // ---------------------------------------------------------------------------
  const handleJoystickStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setShowHint(false);

    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    if (!touch || !joystickBaseRef.current) return;

    joystickTouchIdRef.current = touch.identifier;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    joystickCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setIsJoystickActive(true);
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;

    // Find the specific touch for the joystick
    let currentTouch: React.Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        currentTouch = e.changedTouches[i];
        break;
      }
    }
    if (!currentTouch) return;

    const dx = currentTouch.clientX - joystickCenterRef.current.x;
    const dy = currentTouch.clientY - joystickCenterRef.current.y;
    const distance = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (distance > JOYSTICK_RADIUS) {
      clampedX = (dx / distance) * JOYSTICK_RADIUS;
      clampedY = (dy / distance) * JOYSTICK_RADIUS;
    }

    setKnobPos({ x: clampedX, y: clampedY });

    // Normalized vector (-1 to 1)
    // x: left (-1) to right (+1)
    // y: forward (+1) to backward (-1)
    const normX = clampedX / JOYSTICK_RADIUS;
    const normY = -(clampedY / JOYSTICK_RADIUS);
    setMobileMove(normX, normY);
  }, []);

  const handleJoystickEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;

    let ended = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        ended = true;
        break;
      }
    }

    if (ended) {
      joystickTouchIdRef.current = null;
      setKnobPos({ x: 0, y: 0 });
      setIsJoystickActive(false);
      setMobileMove(0, 0);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // RIGHT CAMERA LOOK TOUCH HANDLERS
  // ---------------------------------------------------------------------------
  const handleLookStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // If already tracking a look touch, ignore
    if (lookTouchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    lookTouchIdRef.current = touch.identifier;
    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
    setShowHint(false);
  }, []);

  const handleLookMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current === null) return;

    let touch: React.Touch | null = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        touch = e.changedTouches[i];
        break;
      }
    }
    if (!touch) return;

    const deltaX = touch.clientX - lastLookPosRef.current.x;
    const deltaY = touch.clientY - lastLookPosRef.current.y;

    lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };

    // Accumulate touch look delta into high-frequency loop
    addMobileLookDelta(deltaX, deltaY);
  }, []);

  const handleLookEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        break;
      }
    }
  }, []);

  // ---------------------------------------------------------------------------
  // INTERACTION ACTION TRIGGER [E]
  // ---------------------------------------------------------------------------
  const handleStationInteraction = useCallback(() => {
    if (!hoveredStationId) return;

    if (hoveredStationId === 'npc_dung') {
      openNpcDialog();
    } else if (hoveredStationId === 'chemical_rack') {
      openChemicalModal();
    } else if (hoveredStationId === 'equipment_rack') {
      openEquipmentModal();
    } else if (hoveredStationId === 'lab_sink') {
      openSinkModal();
    } else if (hoveredStationId === 'computer_desk') {
      openDesignModal();
    } else if (hoveredStationId in STATIONS) {
      enterInspection(hoveredStationId as MachineId);
    }
  }, [
    hoveredStationId,
    openNpcDialog,
    openChemicalModal,
    openEquipmentModal,
    openSinkModal,
    openDesignModal,
    enterInspection,
  ]);

  // Floor quick teleport
  const handleFloorSwitch = useCallback(() => {
    if (currentFloor === 1) {
      // Teleport to floor 2 mezzanine
      teleportTo([0, 4.76, 5.5]);
    } else {
      // Teleport to floor 1 ground workshop
      teleportTo([0, 1.7, 0]);
    }
  }, [currentFloor, teleportTo]);

  // Don't render virtual controls if modal is open or inspecting a machine
  if (isAnyModalOpen) {
    return null;
  }

  return (
    <>
      {/* =======================================================================
          1. RIGHT HALF TOUCH LOOK ZONE (Rotates camera 360° on touch drag)
         ======================================================================= */}
      <div
        role="region"
        aria-label="Vùng vuốt xoay góc nhìn camera trên mobile"
        className="fixed inset-y-0 right-0 w-1/2 z-20 touch-none pointer-events-auto select-none"
        onTouchStart={handleLookStart}
        onTouchMove={handleLookMove}
        onTouchEnd={handleLookEnd}
        onTouchCancel={handleLookEnd}
      />

      {/* =======================================================================
          2. BOTTOM-LEFT VIRTUAL ANALOG JOYSTICK (Movement thumbstick)
         ======================================================================= */}
      {mode === 'WALKING' && (
        <div
          role="region"
          aria-label="Cần điều khiển ảo di chuyển"
          className="fixed bottom-6 left-6 z-30 touch-none pointer-events-auto select-none"
        >
          {/* Outer Base Ring */}
          <div
            ref={joystickBaseRef}
            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-colors duration-200 flex items-center justify-center backdrop-blur-xl shadow-2xl ${
              isJoystickActive
                ? 'bg-slate-950/85 border-cyan-400 shadow-cyan-500/30'
                : 'bg-slate-950/60 border-slate-700/80 shadow-black/60'
            }`}
          >
            {/* Concentric Guide Ring */}
            <div className="absolute w-16 h-16 rounded-full border border-cyan-500/20 pointer-events-none" />

            {/* Directional tick marks */}
            <div className="absolute top-1.5 w-1 h-2 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute bottom-1.5 w-1 h-2 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute left-1.5 w-2 h-1 rounded-full bg-cyan-400/50 pointer-events-none" />
            <div className="absolute right-1.5 w-2 h-1 rounded-full bg-cyan-400/50 pointer-events-none" />

            {/* Draggable Inner Thumb Knob */}
            <div
              className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-white/70 shadow-lg shadow-cyan-500/50 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
                transition: isJoystickActive ? 'none' : 'transform 0.18s ease-out',
              }}
            >
              {/* Grip texture center */}
              <div className="w-4 h-4 rounded-full bg-white/40 shadow-inner" />
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          3. BOTTOM-RIGHT FLOATING ACTION BUTTONS ([E] Interact, Jump, Sprint, Floor)
         ======================================================================= */}
      {mode === 'WALKING' && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end gap-2.5 pointer-events-auto select-none">
          {/* Prominent Station Interaction Button [E] when near workstation */}
          {hoveredStationId && (
            <button
              onClick={handleStationInteraction}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-cyan-500/50 border-2 border-white/60 active:scale-95 animate-pulse transition-transform"
              aria-label="Tương tác với máy hoặc vật dụng [Phím E]"
            >
              <Hand className="w-5 h-5 text-white flex-shrink-0 animate-bounce" />
              <div className="flex flex-col text-left">
                <span className="font-mono text-[10px] text-cyan-200 uppercase tracking-wider leading-none">
                  Chạm để mở [E]
                </span>
                <span className="font-bold leading-tight truncate max-w-[150px]">
                  {hoveredStationId in STATIONS
                    ? STATIONS[hoveredStationId as MachineId].shortName
                    : hoveredStationId === 'npc_dung'
                    ? 'Gặp KS. Dũng'
                    : hoveredStationId === 'chemical_rack'
                    ? 'Giá Hóa Chất'
                    : hoveredStationId === 'equipment_rack'
                    ? 'Giá Dụng Cụ'
                    : hoveredStationId === 'lab_sink'
                    ? 'Vòi Nước DI'
                    : 'Bàn Máy Tính'}
                </span>
              </div>
            </button>
          )}

          {/* Action Row: Jump, Sprint Toggle, Floor Toggle */}
          <div className="flex items-center space-x-2">
            {/* Quick Floor Switch Teleport (Tầng 1 ⇄ Tầng 2) */}
            <button
              onClick={handleFloorSwitch}
              className="px-2.5 py-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-slate-700/80 text-white active:scale-95 active:bg-cyan-600 transition-all shadow-xl flex items-center space-x-1.5"
              aria-label="Chuyển đổi tầng 1 hoặc tầng 2"
              title="Chuyển đổi giữa Tầng 1 và Tầng 2"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono font-bold">
                T{currentFloor === 1 ? '1 → T2' : '2 → T1'}
              </span>
            </button>

            {/* Sprint / Chạy nhanh Toggle */}
            <button
              onClick={toggleMobileSprint}
              className={`p-3 rounded-2xl border transition-all active:scale-90 shadow-xl flex items-center justify-center ${
                isMobileSprint
                  ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-amber-500/40'
                  : 'bg-slate-900/85 backdrop-blur-xl border-slate-700/80 text-slate-400 hover:text-white'
              }`}
              aria-label={isMobileSprint ? 'Đang chạy nhanh: chạm để đi bộ' : 'Đang đi bộ: chạm để chạy nhanh'}
              title="Bật/Tắt chạy nhanh"
            >
              <Zap className={`w-5 h-5 ${isMobileSprint ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
            </button>

            {/* Jump Button [Nhảy] */}
            <button
              onClick={triggerMobileJump}
              className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-600/80 text-white active:bg-cyan-600 active:scale-90 transition-transform shadow-2xl shadow-black/80 flex flex-col items-center justify-center"
              aria-label="Nhảy lên (Phím Space)"
            >
              <ArrowUp className="w-5 h-5 text-cyan-300" />
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-0.5 leading-none">
                Nhảy
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =======================================================================
          4. INTUITIVE ONBOARDING HINT (Fades out after 8s or on interaction)
         ======================================================================= */}
      {showHint && mode === 'WALKING' && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-20 pointer-events-none flex justify-center animate-fadeIn">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-slate-200 text-xs shadow-2xl flex items-center space-x-2 text-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
            <span className="leading-snug">
              🕹️ <b>Cần gạt trái:</b> Di chuyển • <b>Vuốt màn hình phải:</b> Xoay camera 360°
            </span>
          </div>
        </div>
      )}
    </>
  );
}
