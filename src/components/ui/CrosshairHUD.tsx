import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { Volume2, VolumeX, Play, Pause, Compass, MousePointerClick, Move3d, PackageCheck } from 'lucide-react';

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
  } = useLabStore();

  const hoveredStation = hoveredStationId ? STATIONS[hoveredStationId] : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 md:p-6 overflow-hidden">
      {/* =========================================================================
          TOP HEADER: Lab Title & Controls
         ========================================================================= */}
      <header role="banner" className="flex items-start justify-between w-full">
        {/* Lab Title Badge */}
        <div className="glass-panel rounded-xl px-4 py-3 flex items-center space-x-3 pointer-events-auto border border-slate-700/60 shadow-lg">
          <div className="w-9 h-9 rounded-lg bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wide text-lab-text">
                VIRTUAL LASER LAB 3D
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-lab-cyan/15 text-lab-cyan border border-lab-cyan/30">
                Phase 2 Live
              </span>
            </div>
            <p className="text-xs text-lab-muted">
              Xưởng mô phỏng nguyên lý máy laser & cảm biến
            </p>
          </div>
        </div>

        {/* Quick Toolbar (Mute sound, Toggle simulation animation) */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={toggleMachineRunning}
            className={`glass-pill px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-200 ${
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
            className={`glass-pill p-2 rounded-lg border transition-all duration-200 ${
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
      </header>

      {/* =========================================================================
          CENTER: Reticle & Interactive Prompt (Only in WALKING mode)
         ========================================================================= */}
      {mode === 'WALKING' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {hoveredStation ? (
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
                      Khám phá {hoveredStation.shortName}
                    </span>
                    {hoveredDistance && (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {hoveredDistance}m
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-lab-cyan font-mono mt-1">
                    {hoveredStation.wavelength}
                  </span>
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
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              openSpecimenModal();
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center space-x-2.5 shadow-2xl shadow-emerald-500/50 border border-emerald-300 active:scale-95 animate-bounce"
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
      {mode === 'WALKING' && (
        <footer role="contentinfo" className="flex items-end justify-between w-full">
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

            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-lab-cyan">
                CLICK
              </span>
              <span className="text-lab-muted">
                {isPointerLocked ? 'Đã khóa chuột' : 'Khóa chuột'}
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
                  } else {
                    if (document.pointerLockElement) {
                      document.exitPointerLock();
                    }
                    enterInspection(st.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 flex items-center space-x-2 active:scale-95 ${
                  activeStationId === st.id
                    ? 'bg-lab-cyan text-slate-950 font-bold border-lab-cyan shadow-lg shadow-lab-cyan/30 scale-105'
                    : hoveredStationId === st.id
                    ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-lg shadow-lab-cyan/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                aria-label={`Xem chi tiết ${st.shortName} (Phím tắt: ${idx + 1})`}
                title={`Phím tắt: [${idx + 1}]`}
              >
                <span
                  className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                    activeStationId === st.id
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
