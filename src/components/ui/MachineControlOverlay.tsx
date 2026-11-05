import React, { useEffect, useMemo } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { MachineId } from '../../types/lab';
import { MATERIALS_CATALOG, MaterialType } from '../../data/materialsConfig';
import { STATIONS } from '../../data/labConfig';
import { computeBoundingBox } from '../../data/vectorDesigns';
import { COATING_FINISHES } from '../../data/coatingFinishes';
import {
  getRecommendedParameters,
  simulateLaserPhysics,
  MATERIAL_PHYSICAL_SPECS,
} from '../../utils/laserPhysicsEngine';
import { ScientificRationaleModal } from './ScientificRationaleModal';
import {
  DoorOpen,
  DoorClosed,
  Play,
  Square,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Layers,
  Sparkles,
  Zap,
  PenTool,
  PackageCheck,
  RotateCcw,
  Scan,
  Scissors,
  Palette,
  MousePointerClick,
  Sliders,
  Thermometer,
  Wind,
  Droplets,
  AlertOctagon,
  Power,
  BookOpen,
} from 'lucide-react';

export function MachineControlOverlay() {
  const {
    mode,
    activeStationId,
    hoveredStationId,
    isPointerLocked,
    isLidOpen,
    toggleLid,
    selectedMaterial,
    setSelectedMaterial,
    isCuttingJob,
    cutProgress,
    startCuttingJob,
    stopCuttingJob,
    interlockTriggered,
    actionMessage,
    clearActionMessage,
    currentDesignName,
    currentToolpaths,
    openDesignModal,
    openSpecimenModal,
    resetWorkpiece,
    isFraming,
    startFraming,
    stopFraming,
    autoFitCurrentDesign,
    processMode,
    setProcessMode,
    selectedCoatingFinish,
    setSelectedCoatingFinish,
    coatingCoverage,
    curingProgress,
    isSpraying,
    isCuring,
    isTurntableRotating,
    startSpraying,
    stopSpraying,
    startCuring,
    stopCuring,
    resetCoating,
    toggleTurntable,
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    setLaserPowerWatts,
    setScanSpeedMmS,
    setPulseFrequencyKhz,
    applyRecommendedParameters,
    setRationaleModalOpen,
    sampleTemperature,
    chillerFlowRate,
    smokeDensity,
    isAlarmBuzzerActive,
    setSampleTemperature,
    setChillerFlowRate,
    setSmokeDensity,
    triggerEmergencyStop,
    resetSensors,
    isMachineDockDismissed,
    dismissMachineDock,
    exitInspection,
    machinePower,
    toggleMachinePower,
    isKnowledgePanelCollapsed,
    toggleKnowledgePanelCollapsed,
  } = useLabStore();

  const isKnowledgePanelOpen = Boolean(activeStationId) && !isKnowledgePanelCollapsed;

  const handleStopUsingMachine = () => {
    if (mode === 'INSPECTING') {
      exitInspection();
    }
    dismissMachineDock();
    try {
      document.querySelector('canvas')?.requestPointerLock();
    } catch {}
  };

  const bbox = useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);
  const isOutOfBounds = bbox.isOutOfBounds;

  const currentStationId = activeStationId || (mode === 'WALKING' && hoveredStationId ? hoveredStationId : null);
  const currentStation = currentStationId ? STATIONS[currentStationId] : null;
  const targetMachineId = (currentStationId && currentStationId in STATIONS ? currentStationId : 'CO2_LASER') as MachineId;

  const matPhys = MATERIAL_PHYSICAL_SPECS[selectedMaterial] || MATERIAL_PHYSICAL_SPECS.WOOD;

  const recSettings = useMemo(() => {
    return getRecommendedParameters(targetMachineId, selectedMaterial, processMode);
  }, [targetMachineId, selectedMaterial, processMode]);

  const liveSim = useMemo(() => {
    return simulateLaserPhysics(
      laserPowerWatts,
      scanSpeedMmS,
      pulseFrequencyKhz,
      targetMachineId,
      selectedMaterial,
      processMode
    );
  }, [laserPowerWatts, scanSpeedMmS, pulseFrequencyKhz, targetMachineId, selectedMaterial, processMode]);

  // Auto clear action message after 4.5 seconds
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        clearActionMessage();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [actionMessage, clearActionMessage]);

  if (!currentStationId || !currentStation || !(currentStationId in STATIONS) || (mode === 'WALKING' && isMachineDockDismissed)) {
    // Only show toast if there is a message
    if (!actionMessage) return null;
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[92vw] sm:max-w-md w-full px-2">
        <ToastNotification message={actionMessage} onClose={clearActionMessage} />
      </div>
    );
  }

  // =========================================================================
  // SENSOR STATION FAULT INJECTION & SAFETY DOCK
  // =========================================================================
  if (currentStationId === 'SENSOR_STATION') {
    const isFlowTripped = chillerFlowRate < 2.0;
    const isTempTripped = sampleTemperature > 95;
    const isSmokeTripped = smokeDensity > 60;
    const hasAnyFault = isFlowTripped || isTempTripped || isSmokeTripped || isAlarmBuzzerActive;

    return (
      <div className={`fixed bottom-3 md:bottom-5 z-40 flex flex-col items-center pointer-events-none px-3 transition-all duration-300 ${
        isKnowledgePanelOpen ? 'left-0 right-0 md:right-[540px] lg:right-[620px]' : 'inset-x-0'
      }`}>
        {actionMessage && (
          <div className="mb-3 pointer-events-auto max-w-xl w-full">
            <ToastNotification message={actionMessage} onClose={clearActionMessage} />
          </div>
        )}

        <CursorGuideBanner isPointerLocked={isPointerLocked} isCuttingJob={isCuttingJob} />

        <section
          aria-label="Bảng giả lập sự cố cảm biến và ngắt khẩn cấp"
          className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
        >
          {/* Offline Power Warning Banner */}
          {!machinePower['SENSOR_STATION'] && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>TRẠM CẢM BIẾN ĐANG TẮT NGUỒN. Hãy bật công tắc nguồn để kích hoạt telemetry và interlock.</span>
              </div>
              <button
                onClick={() => toggleMachinePower('SENSOR_STATION')}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Bật nguồn ngay</span>
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs md:text-sm font-bold tracking-wide text-white uppercase font-mono">
                BẢNG GIẢ LẬP SỰ CỐ AN TOÀN (FAULT INJECTION)
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                ACTIVE HARDWARE INTERLOCK
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleMachinePower('SENSOR_STATION')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                  machinePower['SENSOR_STATION']
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/50'
                    : 'bg-rose-500/25 border-rose-500/70 text-rose-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                }`}
                title="Bật/Tắt công tắc nguồn Trạm Cảm Biến"
              >
                <Power className={`w-3.5 h-3.5 ${machinePower['SENSOR_STATION'] ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{machinePower['SENSOR_STATION'] ? 'Nguồn: BẬT' : 'Nguồn: TẮT'}</span>
              </button>
              {hasAnyFault ? (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 text-xs font-mono font-bold animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>SỰ CỐ KÍCH HOẠT: INTERLOCK NGẮT TIA LASER</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CẢM BIẾN ĐỊNH MỨC AN TOÀN</span>
                </div>
              )}

              <button
                onClick={handleStopUsingMachine}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-rose-500/25 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95"
                title="Dừng thao tác máy & Ẩn con trỏ chuột (ESC hoặc phím di chuyển WASD)"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Dừng dùng máy</span>
                <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">ESC</kbd>
              </button>
            </div>
          </div>

          {/* Interactive Fault Injection Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Chiller Flow Slider */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              isFlowTripped ? 'bg-rose-950/40 border-rose-600/80' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nước làm mát Chiller:</span>
                </span>
                <span className={`font-mono font-bold ${isFlowTripped ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {chillerFlowRate.toFixed(1)} L/min
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={chillerFlowRate}
                onChange={(e) => setChillerFlowRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] mt-1.5 font-mono text-slate-400">
                {isFlowTripped ? '⚠️ Dưới 2.0 L/min: Nguy cơ nổ bóng!' : '✓ Ngưỡng an toàn ≥ 2.0 L/min'}
              </span>
            </div>

            {/* 2. Workpiece Temperature Slider */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              isTempTripped ? 'bg-rose-950/40 border-rose-600/80' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhiệt độ phôi cắt:</span>
                </span>
                <span className={`font-mono font-bold ${isTempTripped ? 'text-rose-400' : 'text-amber-300'}`}>
                  {sampleTemperature.toFixed(0)} °C
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="140"
                step="1"
                value={sampleTemperature}
                onChange={(e) => setSampleTemperature(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] mt-1.5 font-mono text-slate-400">
                {isTempTripped ? '⚠️ Trên 95°C: Nguy cơ bốc cháy!' : '✓ Ngưỡng an toàn ≤ 95°C'}
              </span>
            </div>

            {/* 3. Optical Smoke Concentration Slider */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
              isSmokeTripped ? 'bg-rose-950/40 border-rose-600/80' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                  <Wind className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mật độ khói (Tyndall):</span>
                </span>
                <span className={`font-mono font-bold ${isSmokeTripped ? 'text-rose-400' : 'text-purple-300'}`}>
                  {smokeDensity.toFixed(0)} ppm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={smokeDensity}
                onChange={(e) => setSmokeDensity(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] mt-1.5 font-mono text-slate-400">
                {isSmokeTripped ? '⚠️ Trên 60 ppm: Buồng quá nhiều khói!' : '✓ Quạt hút hoạt động tốt'}
              </span>
            </div>
          </div>

          {/* Action Row: Emergency Stop Button + Reset Button */}
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={triggerEmergencyStop}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-rose-400 shadow-xl shadow-rose-950/60 active:scale-95 transition-all"
              title="Kích hoạt ngắt khẩn cấp E-STOP toàn bộ hệ thống xưởng"
            >
              <AlertOctagon className="w-4 h-4 text-white fill-rose-900" />
              <span>NÚT DỪNG KHẨN CẤP (EMERGENCY STOP)</span>
            </button>

            <button
              onClick={resetSensors}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-all active:scale-95"
              title="Khôi phục trạng thái cảm biến về mức bình thường"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset Về Định Mức</span>
            </button>
          </div>
        </section>
      </div>
    );
  }

  // =========================================================================
  // SPECIALIZED COATING & UV FINISHING DOCK
  // =========================================================================
  if (currentStationId === 'COATING_STATION') {
    const finishConfig = COATING_FINISHES[selectedCoatingFinish] || COATING_FINISHES.CLEAR_GLOSS;
    const finishList = Object.values(COATING_FINISHES);

    return (
      <div className={`fixed bottom-3 md:bottom-5 z-40 flex flex-col items-center pointer-events-none px-3 transition-all duration-300 ${
        isKnowledgePanelOpen ? 'left-0 right-0 md:right-[540px] lg:right-[620px]' : 'inset-x-0'
      }`}>
        {actionMessage && (
          <div className="mb-3 pointer-events-auto max-w-xl w-full">
            <ToastNotification message={actionMessage} onClose={clearActionMessage} />
          </div>
        )}

        <CursorGuideBanner isPointerLocked={isPointerLocked} isCuttingJob={isCuttingJob} />

        <section
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Bảng điều khiển phủ sơn tĩnh điện và sấy UV"
          className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
        >
          {/* Offline Power Warning Banner */}
          {!machinePower['COATING_STATION'] && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>BUỒNG PHỦ SƠN ĐANG TẮT NGUỒN. Hãy bật công tắc nguồn để vận hành quạt hút, vòi phun & sấy UV.</span>
              </div>
              <button
                onClick={() => toggleMachinePower('COATING_STATION')}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Bật nguồn ngay</span>
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-xs md:text-sm font-bold tracking-wide text-white uppercase font-mono">
                BUỒNG PHỦ SƠN TĨNH ĐIỆN & SẤY UV BỀ MẶT
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                Sơn phủ & Sấy UV (395nm)
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <span className="text-slate-400">Độ phủ:</span>
                <b className={coatingCoverage >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                  {coatingCoverage.toFixed(0)}%
                </b>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
                <span className="text-slate-400">Độ khô UV:</span>
                <b className={curingProgress >= 100 ? 'text-purple-400' : 'text-slate-300'}>
                  {curingProgress.toFixed(0)}%
                </b>
              </div>

              <button
                onClick={() => toggleMachinePower('COATING_STATION')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 font-sans ${
                  machinePower['COATING_STATION']
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/50'
                    : 'bg-rose-500/25 border-rose-500/70 text-rose-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                }`}
                title="Bật/Tắt công tắc nguồn Buồng Phủ Sơn"
              >
                <Power className={`w-3.5 h-3.5 ${machinePower['COATING_STATION'] ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{machinePower['COATING_STATION'] ? 'Nguồn: BẬT' : 'Nguồn: TẮT'}</span>
              </button>
              <button
                onClick={handleStopUsingMachine}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-rose-500/25 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95 font-sans"
                title="Dừng thao tác máy & Ẩn con trỏ chuột (ESC hoặc phím di chuyển WASD)"
              >
                <Power className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Dừng dùng máy</span>
                <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">ESC</kbd>
              </button>
            </div>
          </div>

          {/* Paint Swatches Row */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Palette className="w-3 h-3 text-lab-cyan" />
                <span>Chọn loại sơn & màng phủ công nghiệp:</span>
              </span>
              <span className="text-cyan-300 font-semibold">{finishConfig.name}</span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {finishList.map((finish) => {
                const isSelected = selectedCoatingFinish === finish.id;
                return (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedCoatingFinish(finish.id)}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-150 border ${
                      isSelected
                        ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-lg shadow-lab-cyan/20 ring-1 ring-lab-cyan/40'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/40 flex-shrink-0"
                      style={{ backgroundColor: finish.color }}
                    />
                    <span className="whitespace-nowrap">{finish.name.split(' (')[0]}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({finish.glossUnit.split(' ')[0]})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Hold to Spray, Turn on Curing, Rotate Turntable, Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center pt-1">
            {/* Spray Trigger Button (Col 5) */}
            <div className="sm:col-span-5 flex flex-col gap-1">
              <button
                onMouseDown={startSpraying}
                onMouseUp={stopSpraying}
                onMouseLeave={stopSpraying}
                onTouchStart={startSpraying}
                onTouchEnd={stopSpraying}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-150 border shadow-lg select-none active:scale-95 ${
                  isSpraying
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 border-cyan-300 shadow-cyan-900/50 animate-pulse'
                    : coatingCoverage >= 100
                    ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                    : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border-cyan-400 shadow-cyan-950/50'
                }`}
                title="Nhấp giữ chuột để phun lớp sơn lên bề mặt chi tiết"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isSpraying
                    ? `Đang Phun Sơn... (${coatingCoverage.toFixed(0)}%)`
                    : coatingCoverage >= 100
                    ? '✓ Đã Phủ Kín 100% (Giữ để sơn thêm)'
                    : 'Giữ Chuột Để Phun Sơn [🔫]'}
                </span>
              </button>

              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-lab-cyan h-full transition-all duration-100 ease-linear"
                  style={{ width: `${coatingCoverage}%` }}
                />
              </div>
            </div>

            {/* UV Curing Button (Col 3) */}
            <div className="sm:col-span-3">
              <button
                onClick={() => {
                  if (isCuring) stopCuring();
                  else startCuring();
                }}
                disabled={coatingCoverage < 10}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isCuring
                    ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-950/60 animate-pulse'
                    : curingProgress >= 100
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-300 hover:border-purple-500/50'
                }`}
                title="Bật dàn đèn sấy tia cực tím UV 395nm để đóng rắn màng sơn"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {isCuring
                    ? `Đang Sấy UV (${curingProgress.toFixed(0)}%)...`
                    : curingProgress >= 100
                    ? '✓ Đã Đóng Rắn 100%'
                    : 'Sấy UV Quang Hóa'}
                </span>
              </button>
            </div>

            {/* Turntable 360 & Reset Buttons (Col 4) */}
            <div className="sm:col-span-4 flex items-center space-x-1.5">
              <button
                onClick={toggleTurntable}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition-all active:scale-95 ${
                  isTurntableRotating
                    ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Bật / tắt quay bàn xoay 360 độ"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isTurntableRotating ? 'animate-spin' : ''}`} />
                <span>{isTurntableRotating ? 'Đang Xoay' : 'Xoay Bàn'}</span>
              </button>

              <button
                onClick={resetCoating}
                className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-1 transition-all active:scale-95"
                title="Tẩy sạch lớp sơn, đưa phôi trở về ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tẩy Sơn</span>
              </button>
            </div>
          </div>

          {/* Technical Specs Footer */}
          <div className="text-[11px] text-slate-300 bg-slate-900/60 rounded-xl p-2 px-3 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-lab-cyan flex-shrink-0" />
              <span className="line-clamp-1">{finishConfig.description}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-3 text-slate-400 font-mono text-[10px] pl-2 flex-shrink-0">
              <span>Độ dày: <b className="text-white">{finishConfig.dryFilmThickness}</b></span>
              <span>•</span>
              <span>Độ bóng: <b className="text-white">{finishConfig.glossUnit}</b></span>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const currentMatConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;

  const interaction = currentMatConfig?.interactions?.[currentStationId] || {
    status: 'COMPATIBLE' as const,
    statusText: 'KHẢ DỤNG',
    badgeColor: '#10b981',
    effectDescription: 'Tương thích gia công tiêu chuẩn.',
    sparkColor: '#fbbf24',
    canCutOrEngrave: true,
  };
  const isReflective = interaction.status === 'BLOCKED_REFLECTIVE';
  const isIneffective = interaction.status === 'INEFFECTIVE';

  const materialsList: MaterialType[] = ['WOOD', 'ACRYLIC', 'STEEL', 'ALUMINUM', 'SILICON', 'GLASS'];

  return (
    <div className={`fixed bottom-3 md:bottom-5 z-40 flex flex-col items-center pointer-events-none px-3 transition-all duration-300 ${
      isKnowledgePanelOpen ? 'left-0 right-0 md:right-[540px] lg:right-[620px]' : 'inset-x-0'
    }`}>
      {/* 1. FLOATING ACTION TOAST NOTIFICATION */}
      {actionMessage && (
        <div className="mb-3 pointer-events-auto max-w-xl w-full">
          <ToastNotification message={actionMessage} onClose={clearActionMessage} />
        </div>
      )}

      <CursorGuideBanner isPointerLocked={isPointerLocked} isCuttingJob={isCuttingJob} />

      {/* 2. MAIN DOCK CONTROLLER */}
      <section
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        aria-label="Bảng điều khiển gia công vật liệu và nắp máy"
        className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
      >
        {/* Offline Power Warning Banner */}
        {currentStationId && currentStationId in STATIONS && !machinePower[currentStationId as MachineId] && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>MÁY ĐANG TẮT NGUỒN CHÍNH. Bật công tắc để bắt đầu chạy máy hoặc điều chỉnh thông số.</span>
            </div>
            <button
              onClick={() => toggleMachinePower(currentStationId as MachineId)}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Bật nguồn ngay</span>
            </button>
          </div>
        )}

        {/* Header Bar: Station Name, Safety Interlock Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentStation?.accentColor || '#06b6d4' }}
            />
            <h3 className="text-xs md:text-sm font-bold tracking-wide text-white uppercase font-mono">
              {currentStation?.shortName || 'THIẾT BỊ LASER'}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
              {currentStation?.wavelength}
            </span>
          </div>

          {/* Design CAD Studio Button & Safety Interlock Pill */}
          <div className="flex items-center space-x-2">
            {currentStationId && currentStationId in STATIONS && (
              <button
                onClick={() => toggleMachinePower(currentStationId as MachineId)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                  machinePower[currentStationId as MachineId]
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/50'
                    : 'bg-rose-500/25 border-rose-500/70 text-rose-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                }`}
                title="Bật/Tắt công tắc nguồn máy"
              >
                <Power className={`w-3.5 h-3.5 ${machinePower[currentStationId as MachineId] ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>{machinePower[currentStationId as MachineId] ? 'Nguồn: BẬT' : 'Nguồn: TẮT'}</span>
              </button>
            )}

            {activeStationId && (
              <button
                onClick={toggleKnowledgePanelCollapsed}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                  !isKnowledgePanelCollapsed
                    ? 'bg-lab-cyan/20 border-lab-cyan/60 text-lab-cyan shadow-sm shadow-cyan-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Bật/Tắt bảng thông tin lý thuyết & cấu tạo máy [Phím Tab]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lý thuyết</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">Tab</kbd>
              </button>
            )}

            <button
              onClick={handleStopUsingMachine}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/90 hover:bg-rose-500/25 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95 mr-1"
              title="Dừng thao tác máy & Ẩn con trỏ chuột (ESC hoặc phím di chuyển WASD)"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Dừng máy</span>
              <kbd className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">ESC</kbd>
            </button>

            <button
              onClick={openDesignModal}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-lab-cyan/15 hover:bg-lab-cyan/25 border border-lab-cyan/50 text-lab-cyan text-xs font-semibold transition-all active:scale-95 shadow-md shadow-cyan-950/40"
              title="Mở Studio thiết kế hình cắt & G-code (Phím T)"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="truncate max-w-[150px]">Hình: <b>{currentDesignName.split(' ')[0]}</b></span>
              <span className="text-[10px] text-cyan-200 font-mono">[T]</span>
            </button>

            <button
              onClick={() => setProcessMode(processMode === 'CUT' ? 'ENGRAVE' : 'CUT')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                processMode === 'CUT'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/60 text-amber-300'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/60 text-cyan-300'
              }`}
              title="Chuyển đổi chế độ: Cắt Xuyên Phôi (3mm) hoặc Khắc Bề Mặt (0.1mm)"
            >
              {processMode === 'CUT' ? (
                <>
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cắt Xuyên</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Khắc Mặt</span>
                </>
              )}
            </button>

            {isLidOpen ? (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-semibold animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>INTERLOCK NGẮT TIA (Nắp mở)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>INTERLOCK SẴN SÀNG (Nắp đóng)</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Row: Lid Toggle + Material Selection + Cut Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* A. LID TOGGLE BUTTON (Col 3) */}
          <div className="md:col-span-3">
            <button
              onClick={toggleLid}
              className={`w-full py-2.5 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center space-x-2 transition-all duration-200 active:scale-95 shadow-md ${
                isLidOpen
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-200 shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Phím tắt: O"
            >
              {isLidOpen ? (
                <>
                  <DoorOpen className="w-4 h-4 text-amber-400" />
                  <span>Đóng nắp máy [O]</span>
                </>
              ) : (
                <>
                  <DoorClosed className="w-4 h-4 text-slate-400" />
                  <span>Mở nắp máy [O]</span>
                </>
              )}
            </button>
          </div>

          {/* B. MATERIAL SELECTOR PILLS (Col 6) */}
          <div className="md:col-span-6 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Layers className="w-3 h-3 text-lab-cyan" />
                <span>Chọn phôi vật liệu vào bàn cắt [M]:</span>
              </span>
              <span
                className="font-semibold"
                style={{ color: interaction?.badgeColor || '#10b981' }}
              >
                {interaction?.statusText || 'KHẢ DỤNG'}
              </span>
            </div>

            {/* Scrollable pill container */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {materialsList.map((mType) => {
                const mat = MATERIALS_CATALOG[mType];
                const matInter = mat?.interactions?.[currentStationId];
                const isSelected = selectedMaterial === mType;

                return (
                  <button
                    key={mType}
                    onClick={() => setSelectedMaterial(mType)}
                    className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-150 border ${
                      isSelected
                        ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-lg shadow-lab-cyan/20 ring-1 ring-lab-cyan/40'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/40 flex-shrink-0"
                      style={{ backgroundColor: mat?.color || '#cbd5e1' }}
                    />
                    <span className="whitespace-nowrap">{mat?.name ? mat.name.split(' ')[0] : mType}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: matInter?.badgeColor || '#10b981' }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. CUT / ENGRAVE CTA BUTTON (Col 3) */}
          <div className="md:col-span-3">
            {isCuttingJob ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={stopCuttingJob}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-200 border border-rose-500 shadow-lg shadow-rose-900/40 active:scale-95 animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Dừng Cắt ({cutProgress.toFixed(0)}%)</span>
                </button>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-lab-cyan h-full transition-all duration-100 ease-linear"
                    style={{ width: `${cutProgress}%` }}
                  />
                </div>
              </div>
            ) : cutProgress >= 100 ? (
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    if (document.pointerLockElement) document.exitPointerLock();
                    openSpecimenModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-200 border border-emerald-300 shadow-xl shadow-emerald-950/50 active:scale-95 animate-pulse"
                  title="Lấy mẫu sản phẩm ra khỏi máy để quan sát 360° (Phím G)"
                >
                  <PackageCheck className="w-4 h-4 text-emerald-200" />
                  <span>Lấy Mẫu Ra Xem [G]</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={startCuttingJob}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center justify-center space-x-1"
                    title="Cắt lại hình này"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Cắt lại</span>
                  </button>
                  <button
                    onClick={resetWorkpiece}
                    className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono border border-slate-700 flex items-center justify-center space-x-1"
                    title="Đặt phôi mới chưa cắt vào bàn làm việc"
                  >
                    <RotateCcw className="w-3 h-3 text-cyan-400" />
                    <span>Phôi mới</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={startCuttingJob}
                    disabled={isReflective || isIneffective || (Boolean(currentStationId && currentStationId in STATIONS && !machinePower[currentStationId as MachineId]))}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border shadow-lg active:scale-95 ${
                      isReflective
                        ? 'bg-rose-950/40 border-rose-800 text-rose-400 cursor-not-allowed opacity-75'
                        : isIneffective
                        ? 'bg-amber-950/40 border-amber-800 text-amber-400 cursor-not-allowed opacity-75'
                        : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/80 text-white shadow-emerald-950/50 hover:shadow-emerald-500/30'
                    }`}
                    title="Bắt đầu chu trình cắt / khắc laser (Phím C)"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-white" />
                    <span>{processMode === 'CUT' ? 'Cắt [C]' : 'Khắc [C]'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isFraming) stopFraming();
                      else startFraming();
                    }}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border active:scale-95 ${
                      isFraming
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300 hover:border-cyan-500/50'
                    }`}
                    title="Quét thử khung bao viền của mẫu trên bàn cắt bằng tia laser dẫn hướng đỏ (Phím F)"
                  >
                    <Scan className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isFraming ? 'Dừng' : 'Frame [F]'}</span>
                  </button>
                </div>

                {isOutOfBounds && (
                  <button
                    onClick={autoFitCurrentDesign}
                    className="w-full py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-[10px] font-bold flex items-center justify-center space-x-1.5 animate-pulse transition-all shadow-md active:scale-95"
                    title="Thiết kế đang tràn phôi. Bấm để tự động co vừa vào trong lòng phôi"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>Tràn phôi! Bấm để thu vừa</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 1. Smart Recommendation Banner (Khuyến nghị thông số phù hợp theo vật liệu & máy) */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-slate-900/95 via-cyan-950/40 to-slate-900/95 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  {recSettings.standardScenarioCode}
                </span>
                <span className="text-[11px] font-bold text-white font-mono">
                  Gợi ý chuẩn: <span className="text-amber-300">{recSettings.powerWatts}W</span> •{' '}
                  <span className="text-cyan-300">{recSettings.speedMmS}mm/s</span> •{' '}
                  <span className="text-emerald-300">{recSettings.frequencyKhz}kHz</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                {recSettings.surfaceFinishDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setRationaleModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-cyan-300 hover:text-white text-[11px] font-mono font-semibold transition-all border border-slate-700 hover:border-cyan-500/50 flex items-center space-x-1 active:scale-95 shadow-sm"
              title="Xem mô hình toán lý quang - nhiệt và lý do chọn thông số này"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tại sao chọn?</span>
            </button>

            <button
              onClick={applyRecommendedParameters}
              className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-mono font-bold transition-all shadow-md shadow-cyan-950/50 flex items-center space-x-1 active:scale-95"
              title="Tự động nạp các thông số khuyến nghị chuẩn vào thanh trượt"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Áp Dụng Chuẩn</span>
            </button>
          </div>
        </div>

        {/* 2. Laser Parameter Tuning Controls (P, v, f, E_line) */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col gap-2.5 text-xs shadow-inner">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] flex-shrink-0">
              <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
              <span>Thông số công nghệ:</span>
            </div>

            <div className="grid grid-cols-3 gap-3 flex-1 w-full">
              {/* P slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Công suất (P):</span>
                  <span className="text-amber-300 font-bold">{laserPowerWatts} W</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={laserPowerWatts}
                  onChange={(e) => setLaserPowerWatts(parseInt(e.target.value))}
                  className="accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* v slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Tốc độ (v):</span>
                  <span className="text-cyan-300 font-bold">{scanSpeedMmS} mm/s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="800"
                  step="5"
                  value={scanSpeedMmS}
                  onChange={(e) => setScanSpeedMmS(parseInt(e.target.value))}
                  className="accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* f slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Tần số xung (f):</span>
                  <span className="text-emerald-300 font-bold">{pulseFrequencyKhz} kHz</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={pulseFrequencyKhz}
                  onChange={(e) => setPulseFrequencyKhz(parseInt(e.target.value))}
                  className="accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono flex-shrink-0">
              <span className="text-slate-400">E_line:</span>
              <span className="text-amber-400 font-bold">{(laserPowerWatts / Math.max(1, scanSpeedMmS)).toFixed(3)} J/mm</span>
            </div>
          </div>

          {/* Real-time Dynamic Physical Feedback Under Sliders */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
            {/* Projected Depth */}
            <div className="p-1.5 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Độ sâu dự kiến:</span>
              <span className={`font-bold ${
                liveSim.isCutThrough
                  ? 'text-emerald-400'
                  : processMode === 'CUT'
                  ? 'text-rose-400 animate-pulse'
                  : 'text-cyan-300'
              }`}>
                {liveSim.actualDepthMm}mm / {matPhys.plateThicknessMm}mm ({liveSim.cutThroughPercentage}%)
              </span>
            </div>

            {/* Pulse Overlap & Roughness */}
            <div className="p-1.5 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Chồng lấp & Ra:</span>
              <span className={`font-bold ${
                liveSim.pulseOverlapPercent > 75
                  ? 'text-emerald-400'
                  : liveSim.pulseOverlapPercent < 30
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }`}>
                η {liveSim.pulseOverlapPercent}% • Ra {liveSim.surfaceRoughnessRaUm}µm
              </span>
            </div>

            {/* Kerf Width */}
            <div className="p-1.5 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Rãnh Kerf:</span>
              <span className="font-bold text-amber-300">{liveSim.kerfWidthMm} mm</span>
            </div>

            {/* Surface Quality */}
            <div className="p-1.5 px-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Chất lượng mép:</span>
              <span className={`font-bold truncate max-w-[120px] ${
                liveSim.qualityRating === 'PERFECT'
                  ? 'text-emerald-400'
                  : liveSim.qualityRating === 'POOR_OVERBURNT'
                  ? 'text-amber-400'
                  : liveSim.qualityRating === 'FAILED_UNCUT'
                  ? 'text-rose-400 font-extrabold'
                  : 'text-cyan-300'
              }`} title={liveSim.hazQuality}>
                {liveSim.qualityRating === 'PERFECT'
                  ? '✓ Hoàn hảo'
                  : liveSim.qualityRating === 'POOR_OVERBURNT'
                  ? '⚠️ Quá nhiệt'
                  : liveSim.qualityRating === 'FAILED_UNCUT'
                  ? '❌ Chưa đứt phôi'
                  : '✓ Tối ưu'}
              </span>
            </div>
          </div>

          {/* Alert Banner if Cut Mode will Fail */}
          {processMode === 'CUT' && !liveSim.isCutThrough && (
            <div className="p-2 px-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span>
                  <strong>CẢNH BÁO:</strong> Với thông số hiện tại, tia laser chỉ cắt sâu {liveSim.actualDepthMm}mm (chưa xuyên đứt tấm phôi {matPhys.plateThicknessMm}mm). Chi tiết sẽ bị dính kẹt!
                </span>
              </div>
              <button
                onClick={applyRecommendedParameters}
                className="underline font-bold text-cyan-300 hover:text-white flex-shrink-0 pl-2 cursor-pointer"
              >
                Khắc phục ngay
              </button>
            </div>
          )}
        </div>

        {/* Live Interaction Physics Hint Description */}
        <div className="text-[11px] text-slate-300 bg-slate-900/60 rounded-xl p-2 px-3 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-lab-cyan flex-shrink-0" />
            <span className="line-clamp-1">{interaction.effectDescription}</span>
          </div>
          <span className="hidden sm:inline text-slate-400 font-mono text-[10px] pl-2 flex-shrink-0">
            {isLidOpen ? '⚠️ Cần đóng nắp để cắt' : '✓ Sẵn sàng kích hoạt'}
          </span>
        </div>
      </section>

      {/* Scientific Rationale & Mathematical Proof Modal */}
      <ScientificRationaleModal />
    </div>
  );
}

// =============================================================================
// CURSOR GUIDANCE BANNER (TỰ ĐỘNG HIỆN CON TRỎ KHI VÀO MÁY + TỰ ĐỘNG ẨN KHI THOÁT)
// =============================================================================
function CursorGuideBanner({
  isPointerLocked,
  isCuttingJob = false,
}: {
  isPointerLocked: boolean;
  isCuttingJob?: boolean;
}) {
  const [isDismissed, setIsDismissed] = React.useState(false);
  if (isPointerLocked || isCuttingJob || isDismissed) return null;

  const handleLockCursor = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  };

  return (
    <div
      onClick={handleLockCursor}
      className="w-full max-w-4xl mb-2 px-3.5 py-2 rounded-xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-xl shadow-xl shadow-cyan-950/40 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-slate-900/95 hover:border-cyan-400 transition-all group"
      title="Nhấp vào đây, ấn W/A/S/D hoặc ESC để tự động ẩn con trỏ chuột và tiếp tục điều khiển"
    >
      <div className="flex items-center space-x-2.5 text-xs text-white">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
          <MousePointerClick className="w-3.5 h-3.5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-cyan-300">Đã tự động hiện con trỏ chuột khi vào máy</span>
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Không cần ấn ESC
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Khi dừng dùng máy: ấn phím <b className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">W, A, S, D</b> hoặc <b className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">ESC</b> hoặc <b className="text-amber-300 underline font-semibold">Click</b> để tự động ẩn con trỏ chuột di chuyển.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/90 group-hover:bg-cyan-500 group-hover:text-slate-950 px-3 py-1.5 rounded-lg border border-cyan-700 transition-all flex-shrink-0">
          <span className="hidden sm:inline">Ẩn con trỏ chuột</span>
          <span className="font-mono text-xs font-bold">[ESC / WASD] ↵</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Tắt thanh nhắc nhở này"
          aria-label="Tắt nhắc nhở"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ToastNotification({
  message,
  onClose,
}: {
  message: { text: string; type: 'info' | 'warning' | 'error' | 'success' };
  onClose: () => void;
}) {
  const styles = {
    info: 'bg-cyan-950/95 border-cyan-500/70 text-cyan-200 shadow-cyan-950/50',
    warning: 'bg-amber-950/95 border-amber-500/70 text-amber-200 shadow-amber-950/50',
    error: 'bg-rose-950/95 border-rose-500/70 text-rose-200 shadow-rose-950/50 animate-shake',
    success: 'bg-emerald-950/95 border-emerald-500/70 text-emerald-200 shadow-emerald-950/50',
  };

  const icons = {
    info: <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    error: <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`p-2.5 sm:p-3.5 rounded-2xl border shadow-2xl flex items-start justify-between gap-2.5 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 ${styles[message.type]}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-2.5">
        {icons[message.type]}
        <p className="text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed">{message.text}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Đóng thông báo"
      >
        ✕
      </button>
    </div>
  );
}

