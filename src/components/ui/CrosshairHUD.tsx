import React from 'react';
import { useLabStore, StationId, MachineId, playerWorldState } from '../../store/useLabStore';
import { sound } from '../../utils/audioSystem';
import { STATIONS } from '../../data/labConfig';
import { LAB_TABLES } from '../../data/staircaseConfig';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Compass,
  MousePointerClick,
  Move3d,
  PackageCheck,
  HelpCircle,
  Activity,
  Sliders,
  Layers,
  Eye,
  Sparkles,
} from 'lucide-react';
import { CompassWidget } from './CompassWidget';
import { CatHandsDropdown } from './CatHandsDropdown';

const SECOND_FLOOR_HUD_INFO: Record<string, { shortName: string; wavelength: string; hint: string }> = {
  npc_dung: {
    shortName: 'KS. Nguyễn Văn Dũng',
    wavelength: 'Cố vấn Kỹ thuật & Nghiên cứu Bán dẫn',
    hint: 'Trò chuyện với KS. Dũng',
  },
  chemical_rack: {
    shortName: 'Giá Hóa Chất Wafer',
    wavelength: 'HCl 37%, HNO3 68%, H2O2 30%, DI Water',
    hint: 'Lấy hóa chất vào cốc to',
  },
  equipment_rack: {
    shortName: 'Giá Dụng Cụ Thí Nghiệm',
    wavelength: 'Cốc to 500mL, Tuýp nhỏ, Micropipette',
    hint: 'Lấy dụng cụ thí nghiệm',
  },
  lab_sink: {
    shortName: 'Bồn Nước & Vòi Cổ Ngỗng',
    wavelength: 'Nước siêu sạch khử ion DI Water',
    hint: 'Lấy nước & chỉnh lưu lượng',
  },
  computer_desk: {
    shortName: 'Bàn Máy Tính & Laptop CAD',
    wavelength: 'Hệ thống thiết kế G-Code & Giám sát',
    hint: 'Mở Studio thiết kế CAD',
  },
};

export function CrosshairHUD() {
  const {
    mode,
    hoveredStationId,
    hoveredDistance,
    activeStationId,
    isPointerLocked,
    isMachineRunning,
    soundEnabled,
    toggleMachineRunning,
    toggleSound,
    enterInspection,
    exitInspection,
    cutProgress,
    openSpecimenModal,
    openHelpModal,
    toggleStats,
    isStatsVisible,
    isThirdPersonView,
    toggleThirdPersonView,
    nearbyStations,
    activeTargetIndex,
    cycleInteractiveTarget,
    isAptomatOn,
    toggleAptomat,
    isCeilingLampsAptomatOn,
    toggleCeilingLampsAptomat,
    openWorkbenchModal,
    openNpcDialog,
    openChemicalModal,
    openEquipmentModal,
    openSinkModal,
    openDesignModal,
    openLandingPage,
  } = useLabStore();

  const getTargetDisplayName = (id: StationId): string => {
    if (id === 'aptomat_tube_lights') return 'Aptomat 4 Đèn Dài (CB-01)';
    if (id === 'aptomat_ceiling_lamps') return 'Aptomat 8 Đèn Trần (CB-02)';
    if (id in STATIONS) return STATIONS[id].shortName;
    if (id in SECOND_FLOOR_HUD_INFO) return SECOND_FLOOR_HUD_INFO[id].shortName;
    if (typeof id === 'string' && id.startsWith('table_')) {
      const tb = LAB_TABLES.find((t) => t.id === id);
      if (tb) return tb.name;
    }
    return id;
  };

  const isAptomatTube = hoveredStationId === 'aptomat_tube_lights';
  const isAptomatCeiling = hoveredStationId === 'aptomat_ceiling_lamps';
  const isGroundStation = hoveredStationId && hoveredStationId in STATIONS;
  const isSecondFloor = hoveredStationId && hoveredStationId in SECOND_FLOOR_HUD_INFO;
  const isTableStation = Boolean(hoveredStationId && typeof hoveredStationId === 'string' && hoveredStationId.startsWith('table_'));
  const matchedTable = isTableStation ? LAB_TABLES.find((t) => t.id === hoveredStationId) : null;

  const currentBrightnessPct = Math.round(((isAptomatOn ? 0.43 : 0) + (isCeilingLampsAptomatOn ? 0.57 : 0)) * 100);

  const hoveredInfo = isAptomatTube
    ? {
        name: 'Aptomat 4 Đèn Dài (CB-01)',
        sub: isAptomatOn 
          ? `Nguồn điện: ĐANG BẬT [ON] • Độ rọi lab: ${currentBrightnessPct}%` 
          : currentBrightnessPct === 0
          ? 'Nguồn điện: ĐÃ NGẮT [OFF] • Lab tối hoàn toàn (0% ánh sáng)'
          : `Nguồn điện: ĐÃ NGẮT [OFF] • Tắt 4 đèn dài (Độ rọi lab còn: ${currentBrightnessPct}%)`,
        action: `Dùng tay gạt ${isAptomatOn ? 'TẮT' : 'BẬT'} 4 đèn tuýp dài (CB-01)`,
      }
    : isAptomatCeiling
    ? {
        name: 'Aptomat 8 Đèn Âm Trần (CB-02)',
        sub: isCeilingLampsAptomatOn 
          ? `Nguồn điện: ĐANG BẬT [ON] • Độ rọi lab: ${currentBrightnessPct}%` 
          : currentBrightnessPct === 0
          ? 'Nguồn điện: ĐÃ NGẮT [OFF] • Lab tối hoàn toàn (0% ánh sáng)'
          : `Nguồn điện: ĐÃ NGẮT [OFF] • Tắt 8 đèn trần (Độ rọi lab còn: ${currentBrightnessPct}%)`,
        action: `Dùng tay gạt ${isCeilingLampsAptomatOn ? 'TẮT' : 'BẬT'} 8 đèn âm trần (CB-02)`,
      }
    : isGroundStation
    ? {
        name: STATIONS[hoveredStationId].shortName,
        sub: STATIONS[hoveredStationId].wavelength,
        action: `Khám phá ${STATIONS[hoveredStationId].shortName}`,
      }
    : isSecondFloor
    ? {
        name: SECOND_FLOOR_HUD_INFO[hoveredStationId].shortName,
        sub: SECOND_FLOOR_HUD_INFO[hoveredStationId].wavelength,
        action: SECOND_FLOOR_HUD_INFO[hoveredStationId].hint,
      }
    : matchedTable
    ? {
        name: matchedTable.name,
        sub: `Bàn Gỗ Thí Nghiệm #${matchedTable.tableNumber} - Tầng 2`,
        action: `Làm thí nghiệm tại ${matchedTable.name}`,
      }
    : null;

  const handleHUDInteract = () => {
    if (!hoveredStationId) return;
    playerWorldState.handTapTrigger++;
    if (hoveredStationId === 'aptomat_tube_lights') {
      toggleAptomat();
      sound.playRelayClick();
    } else if (hoveredStationId === 'aptomat_ceiling_lamps') {
      toggleCeilingLampsAptomat();
      sound.playRelayClick();
    } else if (hoveredStationId === 'npc_dung') {
      openNpcDialog();
    } else if (hoveredStationId === 'chemical_rack') {
      openChemicalModal();
    } else if (hoveredStationId === 'equipment_rack') {
      openEquipmentModal();
    } else if (hoveredStationId === 'lab_sink') {
      openSinkModal();
    } else if (hoveredStationId === 'computer_desk') {
      openDesignModal();
    } else if (typeof hoveredStationId === 'string' && hoveredStationId.startsWith('table_')) {
      openWorkbenchModal(hoveredStationId);
    } else if (hoveredStationId in STATIONS) {
      enterInspection(hoveredStationId as MachineId);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2.5 sm:p-4 md:p-6 overflow-hidden">
      {/* =========================================================================
          TOP HEADER: Lab Title & Controls
         ========================================================================= */}
      <header role="banner" className="flex items-start justify-between w-full">
        {/* Lab Title Badge */}
        <div
          onClick={openLandingPage}
          className="glass-panel rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center space-x-2 sm:space-x-3 pointer-events-auto border border-slate-700/60 shadow-lg max-w-[220px] sm:max-w-none cursor-pointer hover:border-cyan-500/50 transition-all group"
          title="Nhấp để xem trang giới thiệu Phanulab - Phanu Corp."
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan flex-shrink-0 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-wide text-lab-text truncate group-hover:text-cyan-300 transition-colors">
                PHANULAB 3D
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold">
                Phanu Corp.
              </span>
            </div>
            <p className="hidden md:block text-xs text-lab-muted">
              Nền tảng mô phỏng quang học & bán dẫn tương tác
            </p>
          </div>
        </div>

        {/* Top Right Controls & 3D Compass HUD */}
        <div className="flex flex-col items-end space-y-1.5 sm:space-y-2 pointer-events-auto">
          {/* Quick Toolbar (Mute sound, Diagnostics, Help, Simulation Toggle) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Phanulab Info Landing Page Reopen Button */}
            <button
              onClick={openLandingPage}
              className="glass-pill px-2.5 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-200"
              aria-label="Xem trang thông tin Phanulab & Phanu Corp."
              title="Thông tin Phanulab • Phanu Corp. (Co-founder: Lê Ngọc Phú - Đinh Thiên Ân)"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-[11px] hidden md:inline">Phanulab</span>
            </button>
            {/* Performance Stats HUD Toggle */}
            <button
              onClick={toggleStats}
              className={`hidden sm:flex glass-pill px-2.5 py-2 rounded-lg text-xs font-medium items-center space-x-1.5 border transition-all duration-200 ${
                isStatsVisible
                  ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
                  : 'text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800/60'
              }`}
              aria-label="Bật tắt bảng theo dõi hiệu năng WebGL 60 FPS (Phím P)"
              title="Chỉ số hiệu năng WebGL / FPS (P)"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-[11px]">FPS</span>
            </button>

            {/* Cat Hands Held Item Quick Selector Dropdown */}
            <div className="hidden sm:block">
              <CatHandsDropdown />
            </div>

            {/* Help Shortcuts Modal */}
            <button
              onClick={openHelpModal}
              className="glass-pill p-1.5 sm:p-2 rounded-lg border text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800/60 transition-all duration-200"
              aria-label="Mở bảng hướng dẫn thao tác & phím tắt (Phím H)"
              title="Hướng dẫn & Phím tắt (H)"
            >
              <HelpCircle className="w-4 h-4 text-lab-cyan" />
            </button>

            <button
              onClick={toggleMachineRunning}
              className={`glass-pill p-1.5 sm:px-3 sm:py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-200 ${
                isMachineRunning
                  ? 'text-lab-cyan border-lab-cyan/50 hover:bg-lab-cyan/10'
                  : 'text-lab-muted border-slate-700 hover:text-white'
              }`}
              aria-label={isMachineRunning ? 'Tạm dừng mô phỏng máy' : 'Tiếp tục mô phỏng máy'}
            >
              {isMachineRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden sm:inline">
                {isMachineRunning ? 'Đang chạy' : 'Đã tạm dừng'}
              </span>
            </button>

            <button
              onClick={toggleSound}
              className={`glass-pill p-1.5 sm:p-2 rounded-lg border transition-all duration-200 ${
                soundEnabled
                  ? 'text-lab-cyan border-lab-cyan/40 hover:bg-lab-cyan/10'
                  : 'text-slate-500 border-slate-800 hover:text-white'
              }`}
              aria-label={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
              title={soundEnabled ? 'Âm thanh: Đang bật' : 'Âm thanh: Đang tắt'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Real-time 3D Compass Orientation Widget */}
          <CompassWidget />
        </div>
      </header>

      {/* =========================================================================
          CENTER RETICLE / CROSSHAIR: Strictly locked to viewport center (50%, 50%)
         ========================================================================= */}
      {mode === 'WALKING' && (
        <div
          className="fixed pointer-events-none z-20 flex flex-col items-center justify-center"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          {/* Interaction Reticle Dot & Animated Targeting Ring */}
          <div className="relative flex items-center justify-center pointer-events-none select-none">
            {/* Outer Target Ring (Expands & glows smoothly on hover) */}
            <div
              className={`absolute rounded-full border transition-all duration-150 ease-out pointer-events-none ${
                hoveredInfo
                  ? 'w-8 h-8 border-cyan-400/80 bg-cyan-400/15 scale-100 opacity-100 shadow-lg shadow-cyan-400/40 ring-1 ring-cyan-300/30'
                  : 'w-4 h-4 border-transparent scale-50 opacity-0'
              }`}
            />

            {/* Core Reticle Dot: subtle 5-6px dot, smoothly scaling up and brightening on hover */}
            <div
              className={`rounded-full shadow-sm pointer-events-none transition-all duration-150 ease-out ${
                hoveredInfo
                  ? 'w-2 h-2 bg-cyan-300 scale-125 opacity-100 ring-2 ring-cyan-400/60 shadow-cyan-400/60'
                  : 'w-1.5 h-1.5 bg-white/70 border border-slate-950/60 scale-100 opacity-60'
              }`}
            />
          </div>

          {/* Floating Interactive Tooltip with Distance (Positioned below center reticle) */}
          {hoveredInfo && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleHUDInteract();
              }}
              className="mt-8 flex flex-col items-center bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-lab-cyan/60 shadow-2xl shadow-lab-cyan/30 whitespace-nowrap animate-bounce pointer-events-auto cursor-pointer hover:border-cyan-300 hover:scale-105 transition-all"
              title="Nhấn chuột hoặc phím [E] để tương tác"
            >
              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.5 rounded bg-lab-cyan text-slate-950 font-bold text-xs font-mono">
                  [E]
                </span>
                <span className="text-xs font-bold text-white">
                  {hoveredInfo.action}
                </span>
                {hoveredDistance !== null && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {hoveredDistance}m
                  </span>
                )}
              </div>
              <span className="text-[10px] text-lab-cyan font-mono mt-1">
                {hoveredInfo.sub}
              </span>
              {nearbyStations.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleInteractiveTarget();
                  }}
                  className="flex items-center space-x-1.5 text-[11px] text-amber-300 font-medium mt-1.5 pt-1.5 border-t border-slate-800/80 hover:text-white transition-all cursor-pointer pointer-events-auto"
                  title="Bấm phím [Tab] hoặc [Q] để đổi đối tượng tương tác"
                >
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold font-mono text-[10px]">
                    [Tab / Q]
                  </span>
                  <span>
                    Đổi mục tiêu ({activeTargetIndex + 1}/{nearbyStations.length}):
                    <b className="text-white ml-1 font-sans">
                      {getTargetDisplayName(nearbyStations[(activeTargetIndex + 1) % nearbyStations.length])}
                    </b>
                  </span>
                </button>
              )}
              {!isPointerLocked && (
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 font-medium mt-1.5 pt-1.5 border-t border-slate-800/80">
                  <MousePointerClick className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
                  <span>Ấn chuột trái thì sẽ mất cursor để điều khiển bằng W, A, S, D</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          INSPECTION OVERLAY: 3D Orbit Tip on Canvas
         ========================================================================= */}
      {mode === 'INSPECTING' && (
        <div className="hidden md:flex absolute bottom-6 left-6 glass-panel rounded-xl px-3.5 py-2.5 items-center space-x-2 text-xs text-slate-300 border border-slate-700/80 shadow-lg pointer-events-auto">
          <Move3d className="w-4 h-4 text-lab-cyan animate-pulse" />
          <span>Kéo chuột trên màn hình để xoay 360° quan sát máy</span>
        </div>
      )}

      {/* Floating CTA Banner when Cutting Job is Finished (100%) */}
      {cutProgress >= 100 && (
        <div className="fixed bottom-36 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[92vw]">
          <button
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              openSpecimenModal();
            }}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center space-x-2 shadow-2xl shadow-emerald-500/50 border border-emerald-300 active:scale-95 animate-bounce"
            title="Lấy mẫu sản phẩm ra khỏi máy để quan sát 360° (Phím G)"
          >
            <PackageCheck className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            <span>ĐÃ CẮT XONG! NHẤN ĐỂ LẤY MẪU RA XEM [G]</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          TWO VERTICAL SIDE DOCKS (WALKING mode):
          1. Left Column: Workshop Controls Hotkeys [WASD, Chuột, E, 9, O, C, T, P/5, G]
          2. Right Column: Workstations Quick Selection [1-5]
         ========================================================================= */}
      {mode === 'WALKING' && !hoveredStationId && (
        <>
          {/* CỘT DỌC BÊN TRÁI: ĐIỀU KHIỂN & PHÍM TẮT */}
          <aside
            aria-label="Bảng phím tắt điều khiển xưởng"
            className="hidden md:flex fixed left-4 bottom-6 z-20 flex-col items-start gap-1 pointer-events-auto"
          >
            <div className="glass-panel backdrop-blur-md bg-slate-950/85 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5 min-w-[210px]">
              <div className="flex items-center space-x-1.5 px-1 pb-1 border-b border-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase text-lab-cyan">
                <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
                <span>ĐIỀU KHIỂN XƯỞNG</span>
              </div>

              {/* WASD */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-lab-cyan text-[11px]">
                  WASD
                </span>
                <span className="text-lab-muted text-[11px]">Di chuyển</span>
              </div>

              {/* CHUỘT TRÁI */}
              <div className={`flex items-center space-x-2 text-xs px-1 py-0.5 rounded-lg transition-all ${
                !isPointerLocked && hoveredInfo ? 'bg-amber-950/60 border border-amber-500/50' : ''
              }`}>
                <span className={`w-12 text-center px-1 py-0.5 rounded font-mono font-bold text-[10px] ${
                  !isPointerLocked && hoveredInfo
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-slate-800 border border-slate-700 text-lab-cyan'
                }`}>
                  CHUỘT
                </span>
                <span className={`text-[11px] truncate max-w-[130px] ${
                  !isPointerLocked && hoveredInfo ? 'text-amber-200 font-semibold' : 'text-lab-muted'
                }`}>
                  {isPointerLocked ? 'Đã khoá nhìn' : 'Ấn để lái WASD'}
                </span>
              </div>

              {/* E */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-lab-cyan text-[11px]">
                  E
                </span>
                <span className="text-lab-muted text-[11px]">Tương tác trạm</span>
              </div>

              {/* Tab / Q: Đổi mục tiêu khi có nhiều trạm gần nhau */}
              {nearbyStations.length > 1 && (
                <button
                  onClick={cycleInteractiveTarget}
                  className="flex items-center space-x-2 text-xs px-1 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:text-white transition-all text-left pointer-events-auto active:scale-95"
                  title="Nhấn Tab hoặc Q để đổi đối tượng tương tác"
                >
                  <span className="w-12 text-center px-1 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[10px]">
                    TAB / Q
                  </span>
                  <span className="text-[11px] font-semibold">Đổi mục tiêu</span>
                </button>
              )}

              {/* 9: Doraemon 3D Full Body View */}
              <button
                onClick={toggleThirdPersonView}
                className={`flex items-center space-x-2 text-xs px-1 py-1 rounded-lg transition-all border text-left active:scale-95 ${
                  isThirdPersonView
                    ? 'bg-sky-500/20 border-sky-400/60 text-sky-300 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-white'
                }`}
                title="Bấm phím [9] để chuyển giữa góc nhìn thứ nhất và góc nhìn toàn thân Doraemon"
              >
                <span className={`w-12 text-center px-1.5 py-0.5 rounded font-mono font-bold text-[11px] ${
                  isThirdPersonView ? 'bg-sky-500 text-slate-950 font-black' : 'bg-slate-800 border border-slate-700 text-sky-400'
                }`}>
                  9
                </span>
                <span className="text-[11px] font-medium flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isThirdPersonView ? 'Góc nhìn Doraemon' : 'Xem Doraemon 3D'}</span>
                </span>
              </button>

              {/* O */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-amber-400 text-[11px]">
                  O
                </span>
                <span className="text-lab-muted text-[11px]">Mở/Đóng nắp</span>
              </div>

              {/* C */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-400 text-[11px]">
                  C
                </span>
                <span className="text-lab-muted text-[11px]">Cắt/Khắc</span>
              </div>

              {/* T */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-violet-400 text-[11px]">
                  T
                </span>
                <span className="text-lab-muted text-[11px]">Thiết kế CAD</span>
              </div>

              {/* P / 5 */}
              <div className="flex items-center space-x-2 text-xs text-slate-300 px-1">
                <span className="w-12 text-center px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-400 text-[11px]">
                  P / 5
                </span>
                <span className="text-lab-muted text-[11px]">Buồng Phủ Sơn</span>
              </div>

              {/* G (if cut finished) */}
              {cutProgress >= 100 && (
                <button
                  onClick={() => {
                    if (document.pointerLockElement) document.exitPointerLock();
                    openSpecimenModal();
                  }}
                  className="flex items-center space-x-2 text-xs px-1 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 animate-pulse text-left"
                >
                  <span className="w-12 text-center px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-bold text-[11px]">
                    G
                  </span>
                  <span className="text-[11px] font-bold">Lấy mẫu ra xem</span>
                </button>
              )}
            </div>
          </aside>

          {/* CỘT DỌC BÊN PHẢI: TRẠM THÍ NGHIỆM [1-5] */}
          <aside
            aria-label="Bảng chọn nhanh trạm thí nghiệm"
            className="hidden md:flex fixed right-4 bottom-6 z-20 flex-col items-end gap-1 pointer-events-auto"
          >
            <div className="glass-panel backdrop-blur-md bg-slate-950/85 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5 min-w-[170px]">
              <div className="flex items-center justify-between space-x-1.5 px-1 pb-1 border-b border-slate-800 text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                <span>TRẠM MÁY [1-5]</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
              </div>

              {Object.values(STATIONS).map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => {
                    if (activeStationId === st.id) {
                      exitInspection();
                      document.querySelector('canvas')?.requestPointerLock();
                    } else {
                      if (document.pointerLockElement) {
                        document.exitPointerLock();
                      }
                      enterInspection(st.id);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-mono border transition-all duration-200 flex items-center justify-between space-x-2 active:scale-95 ${
                    activeStationId === st.id
                      ? 'bg-lab-cyan text-slate-950 font-bold border-lab-cyan shadow-lg shadow-lab-cyan/30 scale-102'
                      : hoveredStationId === st.id
                      ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-lg shadow-lab-cyan/20'
                      : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  aria-label={`Xem chi tiết ${st.shortName} (Phím tắt: ${idx + 1})`}
                  title={`Phím tắt: [${idx + 1}]`}
                >
                  <span className="whitespace-nowrap font-sans font-medium text-[11px]">{st.shortName}</span>
                  <span
                    className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center font-mono ${
                      activeStationId === st.id
                        ? 'bg-slate-950 text-lab-cyan'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
