import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { MachineId } from '../../types/lab';
import {
  Flame,
  Zap,
  Activity,
  ShieldCheck,
  Paintbrush,
  LogOut,
  Navigation,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

const STATION_ITEMS: {
  id: MachineId;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}[] = [
  {
    id: 'CO2_LASER',
    label: 'CO2 Laser',
    sub: '10.6 µm',
    icon: Flame,
    color: '#06b6d4',
  },
  {
    id: 'UV_LASER',
    label: 'UV Laser',
    sub: '355 nm',
    icon: Zap,
    color: '#8b5cf6',
  },
  {
    id: 'FIBER_LASER',
    label: 'Fiber Laser',
    sub: '1064 nm',
    icon: Activity,
    color: '#f59e0b',
  },
  {
    id: 'SENSOR_STATION',
    label: 'Cảm Biến',
    sub: 'An Toàn',
    icon: ShieldCheck,
    color: '#10b981',
  },
  {
    id: 'COATING_STATION',
    label: 'Buồng Sơn',
    sub: 'Sấy UV',
    icon: Paintbrush,
    color: '#38bdf8',
  },
];

export function MobileNavBar() {
  const {
    activeStationId,
    hoveredStationId,
    mode,
    enterInspection,
    exitInspection,
    toggleHelpModal,
    toggleStats,
  } = useLabStore();

  // On desktop, CrosshairHUD provides full station controls, and MachineControlOverlay
  // provides machine operation controls. Hide completely when machine dock is active.
  if (activeStationId || hoveredStationId) {
    return null;
  }

  const handleStationClick = (id: MachineId) => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    if (activeStationId === id) {
      // Toggle off to walk mode
      exitInspection();
    } else {
      enterInspection(id);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Thanh điều hướng trạm máy trên thiết bị di động"
      className="md:hidden pointer-events-auto fixed bottom-3 inset-x-2 z-40 flex items-center justify-between gap-1.5 p-1.5 bg-slate-950/90 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl max-w-xl mx-auto select-none"
    >
      {/* Station Buttons */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
        {STATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeStationId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleStationClick(item.id)}
              className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] sm:min-w-[64px] border ${
                isActive
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              style={{
                borderColor: isActive ? item.color : undefined,
                boxShadow: isActive ? `0 0 12px ${item.color}30` : undefined,
              }}
              aria-label={`Chuyển góc nhìn đến ${item.label}`}
              aria-selected={isActive}
            >
              <Icon
                className="w-4 h-4 mb-0.5 transition-transform group-hover:scale-110"
                style={{ color: isActive ? item.color : undefined }}
              />
              <span className="text-[10px] font-bold font-mono tracking-tight leading-none">
                {item.label}
              </span>
              <span className="text-[8px] text-slate-400 font-mono scale-90 mt-0.5 leading-none">
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Auxiliary Buttons Divider */}
      <div className="h-7 w-px bg-slate-800 mx-1 flex-shrink-0" />

      {/* Exit or Diagnostics Quick Buttons */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {activeStationId ? (
          <button
            onClick={() => {
              exitInspection();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 hover:bg-rose-500/25 transition-all"
            aria-label="Thoát chế độ kiểm tra máy và quay lại xưởng (Phím ESC)"
            title="Quay lại xưởng (ESC)"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[8px] font-mono mt-0.5 font-bold">Thoát</span>
          </button>
        ) : (
          <button
            onClick={toggleHelpModal}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            aria-label="Xem hướng dẫn thao tác (Phím H)"
            title="Trợ giúp (H)"
          >
            <HelpCircle className="w-4 h-4 text-lab-cyan" />
            <span className="text-[8px] font-mono mt-0.5">Phím tắt</span>
          </button>
        )}

        <button
          onClick={toggleStats}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all hidden sm:flex"
          aria-label="Bật tắt đo hiệu năng FPS (Phím P)"
          title="Chỉ số FPS / Draw calls (P)"
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="text-[8px] font-mono mt-0.5">FPS</span>
        </button>
      </div>
    </nav>
  );
}
