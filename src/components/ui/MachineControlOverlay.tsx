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
  ArrowRight,
  ArrowLeft,
  Check,
  ListOrdered,
  LayoutGrid,
  Activity,
  CheckCircle,
} from 'lucide-react';

export function MachineControlOverlay() {
  const [laserStep, setLaserStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [dockViewMode, setDockViewMode] = React.useState<'GUIDED' | 'PRO'>('GUIDED');
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

  // Auto-switch to Step 4 when cutting begins or finishes
  useEffect(() => {
    if (isCuttingJob || cutProgress >= 100) {
      setLaserStep(4);
    }
  }, [isCuttingJob, cutProgress]);

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

        {/* Header Bar: Station Name, Mode Switcher & Global Controls */}
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

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle: GUIDED vs PRO */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs">
              <button
                onClick={() => setDockViewMode('GUIDED')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                  dockViewMode === 'GUIDED'
                    ? 'bg-lab-cyan/20 text-cyan-300 font-bold border border-lab-cyan/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chế độ Hướng Dẫn Từng Bước (Khuyến nghị: Rõ ràng, không quá tải thông tin)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theo Bước</span>
              </button>
              <button
                onClick={() => setDockViewMode('PRO')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
                  dockViewMode === 'PRO'
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chế độ Chuyên Gia: Xem toàn bộ thông số trên 1 màn hình"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Toàn Bộ (Pro)</span>
              </button>
            </div>

            {/* Machine Power Switch */}
            {currentStationId && currentStationId in STATIONS && (
              <button
                onClick={() => toggleMachinePower(currentStationId as MachineId)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                  machinePower[currentStationId as MachineId]
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/50'
                    : 'bg-rose-500/25 border-rose-500/70 text-rose-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                }`}
                title="Bật/Tắt công tắc nguồn máy"
              >
                <Power className={`w-3.5 h-3.5 ${machinePower[currentStationId as MachineId] ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className="hidden sm:inline">{machinePower[currentStationId as MachineId] ? 'BẬT' : 'TẮT'}</span>
              </button>
            )}

            {/* Theory Tab Button */}
            {activeStationId && (
              <button
                onClick={toggleKnowledgePanelCollapsed}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                  !isKnowledgePanelCollapsed
                    ? 'bg-lab-cyan/20 border-lab-cyan/60 text-lab-cyan shadow-sm shadow-cyan-950/40'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Bật/Tắt bảng lý thuyết & cấu tạo máy [Phím Tab]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lý thuyết</span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">Tab</kbd>
              </button>
            )}

            {/* Stop / Exit Machine Button */}
            <button
              onClick={handleStopUsingMachine}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-rose-500/25 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95"
              title="Dừng thao tác máy & Ẩn con trỏ chuột (ESC hoặc phím di chuyển WASD)"
            >
              <Power className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Thoát</span>
              <kbd className="text-[10px] px-1 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono">ESC</kbd>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: GUIDED STEP-BY-STEP WORKFLOW PIPELINE */}
        {/* ========================================================================= */}
        {dockViewMode === 'GUIDED' ? (
          <div className="flex flex-col gap-3">
            {/* Step Navigation Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
              {[
                { step: 1, title: '1. Vật Liệu & Chế Độ', desc: `${MATERIALS_CATALOG[selectedMaterial]?.name.split(' ')[0]} • ${processMode === 'CUT' ? 'Cắt' : 'Khắc'}` },
                { step: 2, title: '2. Bản Vẽ & Canh Phôi', desc: `${currentDesignName.split(' ')[0]} ${isOutOfBounds ? '⚠️ Lệch' : '✓ Chuẩn'}` },
                { step: 3, title: '3. Tham Số P-v-f', desc: `${laserPowerWatts}W • ${scanSpeedMmS}mm/s` },
                { step: 4, title: '4. An Toàn & Chạy Máy', desc: isCuttingJob ? `Đang chạy ${cutProgress.toFixed(0)}%` : isLidOpen ? 'Nắp Mở' : 'Sẵn sàng' },
              ].map((s) => {
                const isActive = laserStep === s.step;
                const isPast = laserStep > s.step || (s.step === 4 && cutProgress >= 100);
                return (
                  <button
                    key={s.step}
                    onClick={() => setLaserStep(s.step as 1 | 2 | 3 | 4)}
                    className={`flex flex-col text-left p-1.5 md:p-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-lab-cyan/15 border border-cyan-400/60 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                        : isPast
                        ? 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700'
                        : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-bold">
                      {isPast ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                          isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {s.step}
                        </span>
                      )}
                      <span className="truncate">{s.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline pl-5">
                      {s.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: MATERIAL & PROCESS MODE */}
            {laserStep === 1 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Bước 1: Chọn Chế Độ Gia Công & Phôi Vật Liệu
                    </span>
                  </div>
                  {/* Cut vs Engrave Mode Toggle */}
                  <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
                    <button
                      onClick={() => setProcessMode('CUT')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        processMode === 'CUT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Scissors className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cắt Xuyên (3mm)</span>
                    </button>
                    <button
                      onClick={() => setProcessMode('ENGRAVE')}
                      className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        processMode === 'ENGRAVE'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Khắc Mặt (0.1mm)</span>
                    </button>
                  </div>
                </div>

                {/* Material Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {materialsList.map((mType) => {
                    const mat = MATERIALS_CATALOG[mType];
                    const matInter = mat?.interactions?.[currentStationId];
                    const isSelected = selectedMaterial === mType;

                    return (
                      <button
                        key={mType}
                        onClick={() => setSelectedMaterial(mType)}
                        className={`p-2 rounded-xl text-left border flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                            style={{ backgroundColor: mat?.color || '#cbd5e1' }}
                          />
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: matInter?.badgeColor || '#10b981' }}
                            title={matInter?.statusText}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 truncate">{mat?.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{matInter?.statusText || 'Khả dụng'}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optical & Physical Interaction Description Banner */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><b>Tương tác quang học:</b> {interaction.effectDescription}</span>
                  </div>
                  <span
                    className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border flex-shrink-0"
                    style={{
                      color: interaction?.badgeColor || '#10b981',
                      borderColor: (interaction?.badgeColor || '#10b981') + '40',
                      backgroundColor: (interaction?.badgeColor || '#10b981') + '15',
                    }}
                  >
                    {interaction?.statusText || 'KHẢ DỤNG'}
                  </span>
                </div>

                {/* Step 1 Footer Navigation */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => setLaserStep(2)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
                  >
                    <span>Tiếp tục: Bản Vẽ & Canh Phôi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DESIGN & FRAMING */}
            {laserStep === 2 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <PenTool className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Bước 2: Chọn Bản Vẽ & Canh Chỉnh Khung Phôi (Framing)
                    </span>
                  </div>
                  <button
                    onClick={openDesignModal}
                    className="px-3 py-1 rounded-lg bg-lab-cyan/20 hover:bg-lab-cyan/30 text-cyan-300 border border-cyan-400/50 text-xs font-bold flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Mở CAD Studio [T]</span>
                  </button>
                </div>

                {/* Design Details & Bed Layout Schematic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  {/* Schematic Box */}
                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Bàn phôi: 300 x 200 mm</span>
                      <span className={isOutOfBounds ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {isOutOfBounds ? '⚠️ Tràn phôi' : '✓ Vừa vặn'}
                      </span>
                    </div>
                    {/* Visual schematic */}
                    <div className="relative w-full h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                      {/* Bed grid pattern */}
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />
                      {/* Workpiece outline */}
                      <div className="w-[85%] h-[80%] rounded border border-cyan-500/40 bg-cyan-950/20 flex flex-col items-center justify-center relative">
                        <span className="text-[9px] text-cyan-400/70 font-mono">VẬT LIỆU: {MATERIALS_CATALOG[selectedMaterial]?.name}</span>
                        {/* Toolpath Bounding Box Preview */}
                        <div
                          className={`mt-1 px-3 py-1 rounded border text-[10px] font-mono font-bold flex items-center space-x-1 ${
                            isOutOfBounds
                              ? 'border-rose-500 bg-rose-950/40 text-rose-300 animate-pulse'
                              : 'border-amber-400/60 bg-amber-950/20 text-amber-300'
                          }`}
                        >
                          <span>{currentDesignName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Design Metrics & Tools */}
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono">
                        <span className="text-slate-400 text-[10px] block">Kích thước hình vẽ:</span>
                        <span className="text-slate-100 font-bold">
                          {bbox.width.toFixed(1)} x {bbox.height.toFixed(1)} mm
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono">
                        <span className="text-slate-400 text-[10px] block">Tọa độ tâm (X, Y):</span>
                        <span className="text-slate-100 font-bold">
                          {bbox.centerX.toFixed(1)}, {bbox.centerY.toFixed(1)} mm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (isFraming) stopFraming();
                          else startFraming();
                        }}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all border active:scale-95 ${
                          isFraming
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300'
                        }`}
                        title="Dùng tia laser đỏ dẫn hướng để rà soát 4 góc mép phôi"
                      >
                        <Scan className="w-4 h-4 text-cyan-400" />
                        <span>{isFraming ? 'Dừng Quét Khung' : 'Quét Thử Khung Viền (Frame [F])'}</span>
                      </button>

                      {isOutOfBounds && (
                        <button
                          onClick={autoFitCurrentDesign}
                          className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center space-x-1.5 animate-pulse transition-all shadow-md active:scale-95"
                          title="Tự động thu nhỏ hình để vừa vặn trong lòng phôi"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Thu Vừa Phôi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2 Footer Navigation */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => setLaserStep(1)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Vật Liệu</span>
                  </button>

                  <button
                    onClick={() => setLaserStep(3)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
                  >
                    <span>Tiếp tục: Cài Đặt Tham Số P-v-f</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PARAMETERS & PHYSICS */}
            {laserStep === 3 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Bước 3: Hiệu Chỉnh Tham Số Công Nghệ (P - v - f)
                    </span>
                  </div>

                  {/* Smart Recommendation Fast-Apply */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRationaleModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono border border-slate-700 flex items-center space-x-1 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tại sao chọn?</span>
                    </button>
                    <button
                      onClick={applyRecommendedParameters}
                      className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/50 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Áp Dụng Chuẩn AI ({recSettings.powerWatts}W • {recSettings.speedMmS}mm/s)</span>
                    </button>
                  </div>
                </div>

                {/* Sliders Grid: P, v, f */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  {/* P slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-mono">
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
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Tốc độ quét (v):</span>
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
                    <div className="flex justify-between text-xs font-mono">
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

                {/* Real-time Dynamic Physical Feedback (4 boxes + Formula E_line) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
                  {/* Projected Depth */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-400">Độ sâu dự kiến:</span>
                    <span className={`font-bold mt-1 ${
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
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-400">Chồng lấp & Ra:</span>
                    <span className="font-bold text-slate-200 mt-1">
                      η {liveSim.pulseOverlapPercent}% • Ra {liveSim.surfaceRoughnessRaUm}µm
                    </span>
                  </div>

                  {/* Kerf Width */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-400">Rãnh Kerf & Năng lượng:</span>
                    <span className="font-bold text-amber-300 mt-1">
                      {liveSim.kerfWidthMm}mm • {(laserPowerWatts / Math.max(1, scanSpeedMmS)).toFixed(3)} J/mm
                    </span>
                  </div>

                  {/* Surface Quality */}
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <span className="text-slate-400">Chất lượng mép:</span>
                    <span className={`font-bold mt-1 ${
                      liveSim.qualityRating === 'PERFECT'
                        ? 'text-emerald-400'
                        : liveSim.qualityRating === 'POOR_OVERBURNT'
                        ? 'text-amber-400'
                        : liveSim.qualityRating === 'FAILED_UNCUT'
                        ? 'text-rose-400'
                        : 'text-cyan-300'
                    }`}>
                      {liveSim.qualityRating === 'PERFECT'
                        ? '✓ Hoàn hảo'
                        : liveSim.qualityRating === 'POOR_OVERBURNT'
                        ? '⚠️ Quá nhiệt'
                        : liveSim.qualityRating === 'FAILED_UNCUT'
                        ? '❌ Chưa đứt'
                        : '✓ Tối ưu'}
                    </span>
                  </div>
                </div>

                {/* Cut Warning if applicable */}
                {processMode === 'CUT' && !liveSim.isCutThrough && (
                  <div className="p-2 px-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>CẢNH BÁO: Tia chỉ cắt sâu {liveSim.actualDepthMm}mm (chưa đứt phôi {matPhys.plateThicknessMm}mm).</span>
                    </div>
                    <button
                      onClick={applyRecommendedParameters}
                      className="underline font-bold text-cyan-300 hover:text-white flex-shrink-0 pl-2 cursor-pointer"
                    >
                      Khắc phục chuẩn
                    </button>
                  </div>
                )}

                {/* Step 3 Footer Navigation */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => setLaserStep(2)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Bản Vẽ</span>
                  </button>

                  <button
                    onClick={() => setLaserStep(4)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
                  >
                    <span>Tiếp tục: Kiểm Tra An Toàn & Chạy Máy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: SAFETY CHECKLIST & EXECUTION */}
            {laserStep === 4 && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Bước 4: Danh Mục Kiểm Tra An Toàn & Kích Hoạt Gia Công
                  </span>
                </div>

                {/* Pre-flight Checklist 3 Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {/* Checklist 1: Power */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Power className={`w-4 h-4 ${machinePower[targetMachineId] ? 'text-emerald-400' : 'text-rose-400'}`} />
                      <div>
                        <span className="text-xs font-bold block text-slate-200">1. Nguồn chính</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {machinePower[targetMachineId] ? 'Đã bật' : 'Chưa bật nguồn'}
                        </span>
                      </div>
                    </div>
                    {!machinePower[targetMachineId] && (
                      <button
                        onClick={() => toggleMachinePower(targetMachineId)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all"
                      >
                        Bật nguồn
                      </button>
                    )}
                  </div>

                  {/* Checklist 2: Safety Interlock Lid [O] */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isLidOpen ? (
                        <DoorOpen className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                      <div>
                        <span className="text-xs font-bold block text-slate-200">2. Nắp máy [O]</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isLidOpen ? 'Nắp đang mở (Ngắt tia)' : 'Đã đóng (Sẵn sàng)'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={toggleLid}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                        isLidOpen
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                      }`}
                    >
                      {isLidOpen ? 'Đóng nắp [O]' : 'Mở nắp [O]'}
                    </button>
                  </div>

                  {/* Checklist 3: Material Compatibility */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles
                        className="w-4 h-4"
                        style={{ color: interaction?.badgeColor || '#10b981' }}
                      />
                      <div>
                        <span className="text-xs font-bold block text-slate-200">3. Vật liệu</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px] block">
                          {MATERIALS_CATALOG[selectedMaterial]?.name}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                      style={{
                        color: interaction?.badgeColor || '#10b981',
                        borderColor: (interaction?.badgeColor || '#10b981') + '40',
                      }}
                    >
                      {interaction?.statusText || 'KHẢ DỤNG'}
                    </span>
                  </div>
                </div>

                {/* Primary Action Button (Execution / Progress) */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2">
                  {isCuttingJob ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={stopCuttingJob}
                        className="w-full py-3 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-rose-500 shadow-lg shadow-rose-900/50 active:scale-95 animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>DỪNG CẮT NGAY ({cutProgress.toFixed(0)}%)</span>
                      </button>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-lab-cyan h-full transition-all duration-100 ease-linear"
                          style={{ width: `${cutProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : cutProgress >= 100 ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          if (document.pointerLockElement) document.exitPointerLock();
                          openSpecimenModal();
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-emerald-300 shadow-xl shadow-emerald-950/60 active:scale-95 animate-pulse"
                      >
                        <PackageCheck className="w-5 h-5 text-emerald-200" />
                        <span>LẤY MẪU RA QUAN SÁT 360° [PHÍM G]</span>
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={startCuttingJob}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center justify-center space-x-1"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cắt Lại Hình Này</span>
                        </button>
                        <button
                          onClick={resetWorkpiece}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center justify-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Nạp Phôi Mới Chưa Cắt</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={startCuttingJob}
                        disabled={isReflective || isIneffective || !machinePower[targetMachineId]}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all border shadow-lg active:scale-95 ${
                          isReflective
                            ? 'bg-rose-950/40 border-rose-800 text-rose-400 cursor-not-allowed opacity-75'
                            : isIneffective
                            ? 'bg-amber-950/40 border-amber-800 text-amber-400 cursor-not-allowed opacity-75'
                            : !machinePower[targetMachineId]
                            ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-emerald-400 text-white shadow-emerald-950/50'
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current text-white" />
                        <span>BẮT ĐẦU {processMode === 'CUT' ? 'CẮT' : 'KHẮC'} LASER [PHÍM C]</span>
                      </button>

                      <button
                        onClick={() => {
                          if (isFraming) stopFraming();
                          else startFraming();
                        }}
                        className={`py-3 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border active:scale-95 ${
                          isFraming
                            ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300'
                        }`}
                        title="Quét thử khung viền phôi [F]"
                      >
                        <Scan className="w-4 h-4 text-cyan-400" />
                        <span>Frame [F]</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Step 4 Footer Navigation */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => setLaserStep(3)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Quay lại: Hiệu Chỉnh Tham Số P-v-f</span>
                  </button>

                  <span className="text-[11px] font-mono text-slate-400">
                    Phím tắt: [O] Nắp • [C] Cắt • [G] Lấy Mẫu • [F] Frame
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: PRO EXPERT ALL-IN-ONE COMPACT GRID */
          /* ========================================================================= */
          <div className="flex flex-col gap-3">
            {/* Quick Action Bar: Lid + Material + Mode + Cut CTA */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
              {/* Lid Button */}
              <div className="md:col-span-3">
                <button
                  onClick={toggleLid}
                  className={`w-full py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md ${
                    isLidOpen
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                  }`}
                >
                  {isLidOpen ? (
                    <>
                      <DoorOpen className="w-4 h-4 text-amber-400" />
                      <span>Đóng nắp [O]</span>
                    </>
                  ) : (
                    <>
                      <DoorClosed className="w-4 h-4 text-slate-400" />
                      <span>Mở nắp [O]</span>
                    </>
                  )}
                </button>
              </div>

              {/* Material Selector Horizontal Pills */}
              <div className="md:col-span-6 flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin">
                {materialsList.map((mType) => {
                  const mat = MATERIALS_CATALOG[mType];
                  const matInter = mat?.interactions?.[currentStationId];
                  const isSelected = selectedMaterial === mType;
                  return (
                    <button
                      key={mType}
                      onClick={() => setSelectedMaterial(mType)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 border transition-all ${
                        isSelected
                          ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: mat?.color || '#cbd5e1' }}
                      />
                      <span>{mat?.name ? mat.name.split(' ')[0] : mType}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Cut / Progress */}
              <div className="md:col-span-3">
                {isCuttingJob ? (
                  <button
                    onClick={stopCuttingJob}
                    className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Dừng Cắt ({cutProgress.toFixed(0)}%)</span>
                  </button>
                ) : cutProgress >= 100 ? (
                  <button
                    onClick={() => {
                      if (document.pointerLockElement) document.exitPointerLock();
                      openSpecimenModal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 animate-pulse"
                  >
                    <PackageCheck className="w-4 h-4 text-emerald-200" />
                    <span>Lấy Mẫu Xem [G]</span>
                  </button>
                ) : (
                  <button
                    onClick={startCuttingJob}
                    disabled={isReflective || isIneffective || !machinePower[targetMachineId]}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{processMode === 'CUT' ? 'Cắt [C]' : 'Khắc [C]'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Smart Preset & Controls */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-white">
                  Gợi ý: <b className="text-amber-300">{recSettings.powerWatts}W</b> • <b className="text-cyan-300">{recSettings.speedMmS}mm/s</b> • <b className="text-emerald-300">{recSettings.frequencyKhz}kHz</b>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRationaleModalOpen(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-mono border border-slate-700"
                >
                  Tại sao chọn?
                </button>
                <button
                  onClick={applyRecommendedParameters}
                  className="px-2.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[11px] font-mono"
                >
                  Nạp Chuẩn
                </button>
              </div>
            </div>

            {/* Sliders & Real-time Telemetry in Pro Mode */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">P:</span>
                    <span className="text-amber-300 font-bold">{laserPowerWatts}W</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={laserPowerWatts}
                    onChange={(e) => setLaserPowerWatts(parseInt(e.target.value))}
                    className="accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">v:</span>
                    <span className="text-cyan-300 font-bold">{scanSpeedMmS}mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="800"
                    step="5"
                    value={scanSpeedMmS}
                    onChange={(e) => setScanSpeedMmS(parseInt(e.target.value))}
                    className="accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">f:</span>
                    <span className="text-emerald-300 font-bold">{pulseFrequencyKhz}kHz</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="1"
                    value={pulseFrequencyKhz}
                    onChange={(e) => setPulseFrequencyKhz(parseInt(e.target.value))}
                    className="accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* 4 Telemetry badges */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Độ sâu:</span>
                  <span className="font-bold text-cyan-300">{liveSim.actualDepthMm}mm ({liveSim.cutThroughPercentage}%)</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Chồng lấp:</span>
                  <span className="font-bold text-slate-200">η {liveSim.pulseOverlapPercent}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Kerf / E:</span>
                  <span className="font-bold text-amber-300">{(laserPowerWatts / Math.max(1, scanSpeedMmS)).toFixed(3)} J/mm</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Chất lượng:</span>
                  <span className={`font-bold ${liveSim.isCutThrough ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {liveSim.qualityRating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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

