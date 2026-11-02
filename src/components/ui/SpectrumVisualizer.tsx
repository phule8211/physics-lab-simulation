import React from 'react';
import { MachineId } from '../../types/lab';

interface SpectrumProps {
  activeId: MachineId;
}

export function SpectrumVisualizer({ activeId }: SpectrumProps) {
  return (
    <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-lab-cyan animate-pulse" />
          <span>Vị Trí Bước Sóng Trên Thang Quang Phổ Điện Từ</span>
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Đơn vị: Nanomet (nm) & Micromet (µm)
        </span>
      </div>

      {/* SVG Spectrum Bar */}
      <div className="relative pt-6 pb-4">
        {/* Continuous Gradient Bar */}
        <div className="h-4 rounded-full w-full bg-gradient-to-r from-violet-600 via-sky-400 via-amber-400 via-rose-500 to-rose-900 border border-slate-700/60 shadow-inner" />

        {/* 3 Wavelength Markers */}
        {/* 1. UV Laser Marker (355 nm) */}
        <div
          className={`absolute top-0 left-[12%] -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${
            activeId === 'UV_LASER' ? 'scale-110 z-10' : 'opacity-70'
          }`}
        >
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
              activeId === 'UV_LASER'
                ? 'bg-violet-500 text-white border-violet-300 shadow-lg shadow-violet-500/50'
                : 'bg-slate-900 text-violet-400 border-slate-700'
            }`}
          >
            355 nm
          </span>
          <div className="w-0.5 h-3 bg-violet-400 my-0.5" />
          <div className="w-2 h-2 rounded-full bg-violet-400 ring-2 ring-slate-900" />
          <span className="text-[9px] font-semibold text-violet-300 mt-1">Laser UV</span>
        </div>

        {/* Visible Light Reference Indicator (400 - 700 nm) */}
        <div className="absolute top-1 left-[32%] -translate-x-1/2 flex flex-col items-center opacity-60">
          <span className="text-[9px] font-mono text-slate-400">Khả kiến (400-700nm)</span>
        </div>

        {/* 2. Fiber Laser Marker (1064 nm) */}
        <div
          className={`absolute top-0 left-[55%] -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${
            activeId === 'FIBER_LASER' ? 'scale-110 z-10' : 'opacity-70'
          }`}
        >
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
              activeId === 'FIBER_LASER'
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/50'
                : 'bg-slate-900 text-amber-400 border-slate-700'
            }`}
          >
            1064 nm
          </span>
          <div className="w-0.5 h-3 bg-amber-400 my-0.5" />
          <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
          <span className="text-[9px] font-semibold text-amber-300 mt-1">Fiber / Galvo</span>
        </div>

        {/* 3. CO2 Laser Marker (10.6 µm = 10,600 nm) */}
        <div
          className={`absolute top-0 left-[90%] -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${
            activeId === 'CO2_LASER' ? 'scale-110 z-10' : 'opacity-70'
          }`}
        >
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
              activeId === 'CO2_LASER'
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/50'
                : 'bg-slate-900 text-cyan-400 border-slate-700'
            }`}
          >
            10.6 µm
          </span>
          <div className="w-0.5 h-3 bg-cyan-400 my-0.5" />
          <div className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900" />
          <span className="text-[9px] font-semibold text-cyan-300 mt-1">Laser CO2</span>
        </div>
      </div>

      {/* Comparison Legend Grid */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-[11px]">
        <div
          className={`p-2 rounded-lg border transition-all ${
            activeId === 'UV_LASER'
              ? 'bg-violet-950/40 border-violet-500/60 text-violet-200'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="font-bold">UV (355 nm)</div>
          <div className="text-[10px] text-slate-400">Gia công lạnh, phá vỡ liên kết phân tử</div>
        </div>

        <div
          className={`p-2 rounded-lg border transition-all ${
            activeId === 'FIBER_LASER'
              ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="font-bold">Fiber (1064 nm)</div>
          <div className="text-[10px] text-slate-400">Hấp thụ cực mạnh trên kim loại</div>
        </div>

        <div
          className={`p-2 rounded-lg border transition-all ${
            activeId === 'CO2_LASER'
              ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
              : 'bg-slate-900/40 border-slate-800 text-slate-400'
          }`}
        >
          <div className="font-bold">CO2 (10.6 µm)</div>
          <div className="text-[10px] text-slate-400">Bốc hơi nhiệt trên phi kim (gỗ, mica)</div>
        </div>
      </div>
    </div>
  );
}

