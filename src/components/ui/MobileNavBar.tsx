import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
  X,
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
    deviceMode,
    activeStationId,
    hoveredStationId,
    mode,
    enterInspection,
    exitInspection,
    toggleHelpModal,
    toggleStats,
    currentFloor,
    teleportTo,
    isDesignModalOpen,
    isSpecimenModalOpen,
    isHelpModalOpen,
    isNpcDialogOpen,
    isChemicalModalOpen,
    isEquipmentModalOpen,
    isSinkModalOpen,
  } = useLabStore();

  if (deviceMode !== 'mobile') return null;

  const [isOpen, setIsOpen] = useState(false);

  const isAnyModalOpen =
    isDesignModalOpen ||
    isSpecimenModalOpen ||
    isHelpModalOpen ||
    isNpcDialogOpen ||
    isChemicalModalOpen ||
    isEquipmentModalOpen ||
    isSinkModalOpen;

  if (isAnyModalOpen) return null;

  const handleStationClick = (id: MachineId) => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setIsOpen(false);
    if (activeStationId === id) {
      exitInspection();
    } else {
      enterInspection(id);
    }
  };

  const handleFloorClick = (floor: 1 | 2) => {
    setIsOpen(false);
    if (floor === 1) {
      teleportTo([0, 1.7, 0]);
    } else {
      teleportTo([0, 4.76, 5.5]);
    }
  };

  return (
    <div className="md:hidden fixed top-16 left-3 z-30 pointer-events-auto select-none max-w-[calc(100vw-24px)]">
      {/* 1. When in INSPECTING mode: Floating Return to Lab button */}
      {mode === 'INSPECTING' && (
        <button
          onClick={() => {
            exitInspection();
          }}
          className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-rose-600/90 text-white font-bold text-xs shadow-2xl border border-rose-400 active:scale-95 animate-fadeIn"
          aria-label="Thoát chế độ kiểm tra máy và quay lại xưởng (Phím ESC)"
        >
          <LogOut className="w-4 h-4" />
          <span>Quay lại xưởng (ESC)</span>
        </button>
      )}

      {/* 2. When in WALKING mode: Compact Collapsible Station Selector Pill */}
      {mode === 'WALKING' && (
        <div className="flex flex-col items-start gap-1.5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border backdrop-blur-xl shadow-lg transition-all text-xs font-medium ${
              isOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-cyan-500/30'
                : 'bg-slate-950/80 text-slate-300 border-slate-700/80 hover:bg-slate-900'
            }`}
            aria-label="Mở danh sách di chuyển nhanh đến trạm máy"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trạm máy nhanh</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expanded Horizontal Station Chips Bar */}
          {isOpen && (
            <div className="flex items-center space-x-1.5 p-1.5 bg-slate-950/95 backdrop-blur-2xl border border-slate-700 rounded-2xl shadow-2xl overflow-x-auto max-w-[94vw] no-scrollbar animate-fadeIn">
              {/* Floor Switch Chips */}
              <button
                onClick={() => handleFloorClick(1)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex-shrink-0 transition-all ${
                  currentFloor === 1
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Tầng 1 (Xưởng)</span>
              </button>

              <button
                onClick={() => handleFloorClick(2)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex-shrink-0 transition-all ${
                  currentFloor === 2
                    ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Tầng 2 (Phòng sạch)</span>
              </button>

              <div className="w-px h-6 bg-slate-800 flex-shrink-0 mx-0.5" />

              {/* Station Buttons */}
              {STATION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleStationClick(item.id)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex-shrink-0 transition-all"
                    style={{ borderColor: `${item.color}40` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    <span className="font-mono text-[11px] font-bold">{item.label}</span>
                  </button>
                );
              })}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white flex-shrink-0"
                aria-label="Đóng menu trạm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
