import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
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
    isTouchDevice,
  } = useLabStore();

  const isGroundStation = hoveredStationId && hoveredStationId in STATIONS;
  const isSecondFloor = hoveredStationId && hoveredStationId in SECOND_FLOOR_HUD_INFO;
  const hoveredInfo = isGroundStation
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
    : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2.5 sm:p-4 md:p-6 overflow-hidden">
      {/* =========================================================================
          TOP HEADER: Lab Title & Controls
         ========================================================================= */}
      <header role="banner" className="flex items-start justify-between w-full">
        {/* Lab Title Badge */}
        <div className="glass-panel rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center space-x-2 sm:space-x-3 pointer-events-auto border border-slate-700/60 shadow-lg max-w-[200px] sm:max-w-none">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan flex-shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center space-x-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-wide text-lab-text truncate">
                VIRTUAL LASER LAB 3D
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                Phase 4 Complete
              </span>
            </div>
            <p className="hidden md:block text-xs text-lab-muted">
              Xưởng mô phỏng nguyên lý máy laser & cảm biến quang học
            </p>
          </div>
        </div>

        {/* Top Right Controls & 3D Compass HUD */}
        <div className="flex flex-col items-end space-y-1.5 sm:space-y-2 pointer-events-auto">
          {/* Quick Toolbar (Mute sound, Diagnostics, Help, Simulation Toggle) */}
          <div className="flex items-center space-x-1 sm:space-x-2">
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
          CENTER: Reticle & Interactive Prompt (Only in WALKING mode)
         ========================================================================= */}
      {mode === 'WALKING' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {hoveredInfo ? (
              // Active Crosshair when pointing at an interactive workstation
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 rounded-full border-2 border-lab-cyan animate-pulse flex items-center justify-center bg-lab-cyan/15 shadow-lg shadow-lab-cyan/30">
                  <div className="w-2 h-2 rounded-full bg-lab-cyan" />
                </div>

                {/* Floating Interactive Tooltip with Distance */}
                <div className="absolute top-12 flex flex-col items-center bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-lab-cyan/60 shadow-2xl shadow-lab-cyan/30 whitespace-nowrap animate-bounce">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-lab-cyan text-slate-950 font-bold text-xs font-mono">
                      [E]
                    </span>
                    <span className="text-xs font-bold text-white">
                      {hoveredInfo.action}
                    </span>
                    {hoveredDistance && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {hoveredDistance}m
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-lab-cyan font-mono mt-1">
                    {hoveredInfo.sub}
                  </span>
                  {!isPointerLocked && !isTouchDevice && (
                    <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-amber-300 font-medium mt-1.5 pt-1.5 border-t border-slate-800/80">
                      <MousePointerClick className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
                      <span>Ấn chuột trái thì sẽ mất cursor để điều khiển bằng W, A, S, D</span>
                    </div>
                  )}
                  {isTouchDevice && (
                    <div className="flex sm:hidden items-center space-x-1.5 text-[10px] text-cyan-300 font-medium mt-1.5 pt-1.5 border-t border-slate-800/80">
                      <span>Chạm nút [E] để tương tác</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Default subtle crosshair dot
              <div className="w-2 h-2 rounded-full bg-white/70 border border-slate-900 shadow-sm" />
            )}
          </div>
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
          BOTTOM FOOTER: Navigation Guide & Hotkeys [1, 2, 3, 4] (WALKING mode)
         ========================================================================= */}
      {mode === 'WALKING' && !hoveredStationId && (
        <footer role="contentinfo" className="hidden md:flex items-end justify-between w-full">
          {/* Controls Instructions Card */}
          <div className="glass-pill rounded-xl px-4 py-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-300 pointer-events-auto shadow-lg">
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-lab-cyan">
                WASD
              </span>
              <span className="text-lab-muted">Di chuyển</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-lab-cyan">
                E
              </span>
              <span className="text-lab-muted">Khám phá máy</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-amber-400">
                O
              </span>
              <span className="text-lab-muted">Mở/Đóng nắp</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-400">
                C
              </span>
              <span className="text-lab-muted">Cắt/Khắc</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-violet-400">
                T
              </span>
              <span className="text-lab-muted">Thiết kế hình</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-cyan-400">
                P / 5
              </span>
              <span className="text-lab-muted">Phòng Phủ Sơn</span>
            </div>

            {cutProgress >= 100 && (
              <div className="flex items-center space-x-1.5 animate-pulse">
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 border border-emerald-400 font-mono font-bold text-white shadow-sm">
                  G
                </span>
                <span className="text-emerald-400 font-bold">Lấy mẫu ra xem</span>
              </div>
            )}

                <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg transition-all ${!isPointerLocked && hoveredInfo
                    ? 'bg-amber-950/60 border border-amber-500/50'
                    : ''
                  }`}>
                  <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-xs ${!isPointerLocked && hoveredInfo
                      ? 'bg-amber-400 text-slate-950 animate-pulse'
                      : 'bg-slate-800 border border-slate-700 text-lab-cyan'
                    }`}>
                    CHUỘT TRÁI
                  </span>
                    <span className={!isPointerLocked && hoveredInfo ? 'text-amber-200 font-semibold' : 'text-lab-muted'}>
                      {isPointerLocked
                        ? 'Đã ẩn cursor (WASD)'
                        : 'Ấn chuột trái để ẩn cursor điều khiển WASD'}
                    </span>
                </div>
            </div>

            {/* 4 Workstations Quick Selection Buttons with Key Numbers [1-4] */}
            <div className="flex items-center space-x-2 pointer-events-auto overflow-x-auto max-w-[55vw]">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 flex items-center space-x-2 active:scale-95 ${activeStationId === st.id
                      ? 'bg-lab-cyan text-slate-950 font-bold border-lab-cyan shadow-lg shadow-lab-cyan/30 scale-105'
                      : hoveredStationId === st.id
                        ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-lg shadow-lab-cyan/20'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  aria-label={`Xem chi tiết ${st.shortName} (Phím tắt: ${idx + 1})`}
                  title={`Phím tắt: [${idx + 1}]`}
                >
                  <span
                    className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${activeStationId === st.id
                        ? 'bg-slate-950 text-lab-cyan'
                        : 'bg-slate-800 text-slate-300'
                      }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="whitespace-nowrap">{st.shortName}</span>
                </button>
              ))}
            </div>
        </footer>
      )}
    </div>
  );
}
