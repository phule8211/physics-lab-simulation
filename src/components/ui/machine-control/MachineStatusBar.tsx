import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AlertTriangle, BookOpen, LayoutGrid, ListOrdered, Power } from 'lucide-react';
import { useLabStore, MachineId } from '../../../store/useLabStore';
import { STATIONS } from '../../../data/labConfig';

interface MachineStatusBarProps {
  stationId: MachineId;
  title: string;
  badgeText: string;
  badgeClassName?: string;
  accentColor?: string;
  offlineWarningText: string;
  compactPowerLabel?: boolean;
  extraStatusContent?: React.ReactNode;
  dockViewMode?: 'GUIDED' | 'PRO';
  onChangeDockViewMode?: (mode: 'GUIDED' | 'PRO') => void;
  onExit: () => void;
}

/**
 * Shared dock header & power-interlock warning bar across Laser, Coating, and Sensor stations.
 * Subscribes atomically to machine power and knowledge-panel collapse state.
 */
export const MachineStatusBar: React.FC<MachineStatusBarProps> = ({
  stationId,
  title,
  badgeText,
  badgeClassName = 'bg-slate-800 text-slate-400 border-slate-700',
  accentColor = '#06b6d4',
  offlineWarningText,
  compactPowerLabel = false,
  extraStatusContent,
  dockViewMode,
  onChangeDockViewMode,
  onExit,
}) => {
  const {
    isPowered,
    activeStationId,
    isKnowledgePanelCollapsed,
    toggleMachinePower,
    toggleKnowledgePanelCollapsed,
  } = useLabStore(
    useShallow((s) => ({
      isPowered: stationId in STATIONS ? Boolean(s.machinePower[stationId]) : true,
      activeStationId: s.activeStationId,
      isKnowledgePanelCollapsed: s.isKnowledgePanelCollapsed,
      toggleMachinePower: s.toggleMachinePower,
      toggleKnowledgePanelCollapsed: s.toggleKnowledgePanelCollapsed,
    }))
  );

  const powerButtonTitle =
    stationId === 'SENSOR_STATION'
      ? 'Bật/Tắt công tắc nguồn Trạm Cảm Biến'
      : stationId === 'COATING_STATION'
      ? 'Bật/Tắt công tắc nguồn Buồng Phủ Sơn'
      : 'Bật/Tắt công tắc nguồn máy';

  return (
    <>
      {!isPowered && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 text-rose-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{offlineWarningText}</span>
          </div>
          <button
            onClick={() => toggleMachinePower(stationId)}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all active:scale-95 flex items-center space-x-1"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Bật nguồn ngay</span>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <h3 className="text-xs md:text-sm font-bold tracking-wide text-white uppercase font-mono">
            {title}
          </h3>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${badgeClassName}`}>
            {badgeText}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {extraStatusContent}

          {dockViewMode && onChangeDockViewMode && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs">
              <button
                onClick={() => onChangeDockViewMode('GUIDED')}
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
                onClick={() => onChangeDockViewMode('PRO')}
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
          )}

          <button
            onClick={() => toggleMachinePower(stationId)}
            className={`flex items-center ${
              compactPowerLabel ? 'space-x-1 px-2.5' : 'space-x-1.5 px-3'
            } py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
              isPowered
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-500/50'
                : 'bg-rose-500/25 border-rose-500/70 text-rose-300 hover:bg-emerald-500/20 hover:border-emerald-500/50'
            }`}
            title={powerButtonTitle}
          >
            <Power className={`w-3.5 h-3.5 ${isPowered ? 'text-emerald-400' : 'text-rose-400'}`} />
            {compactPowerLabel ? (
              <span className="hidden sm:inline">{isPowered ? 'BẬT' : 'TẮT'}</span>
            ) : (
              <span>{isPowered ? 'Nguồn: BẬT' : 'Nguồn: TẮT'}</span>
            )}
          </button>

          {activeStationId && (
            <button
              onClick={toggleKnowledgePanelCollapsed}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-semibold transition-all active:scale-95 ${
                !isKnowledgePanelCollapsed
                  ? 'bg-lab-cyan/20 border-lab-cyan/60 text-lab-cyan shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title={
                dockViewMode
                  ? 'Bật/Tắt bảng lý thuyết & cấu tạo máy [Phím Tab]'
                  : 'Bật/Tắt bảng lý thuyết trạm [Phím Tab]'
              }
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lý thuyết</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                Tab
              </kbd>
            </button>
          )}

          <button
            onClick={onExit}
            className={`flex items-center ${
              compactPowerLabel ? 'space-x-1 px-2.5' : 'space-x-1.5 px-3'
            } py-1 rounded-full bg-slate-800/90 hover:bg-rose-500/25 border border-slate-700/80 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95`}
            title="Dừng thao tác máy & Ẩn con trỏ chuột (ESC hoặc phím di chuyển WASD)"
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Thoát</span>
            <kbd
              className={`text-[10px] ${
                compactPowerLabel ? 'px-1' : 'px-1.5'
              } py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400 font-mono`}
            >
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </>
  );
};
