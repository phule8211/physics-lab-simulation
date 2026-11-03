import React, { useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { X, Droplets, Waves, Sliders, Play, Square, Check, Gauge } from 'lucide-react';

export function WaterSinkModal() {
  const {
    isSinkModalOpen,
    closeSinkModal,
    sinkWaterFlowRate,
    setSinkWaterFlowRate,
    isSinkTapRunning,
    toggleSinkTap,
    dispenseWaterIntoBeaker,
    chemicalBeaker,
  } = useLabStore();

  // Automatically release mouse pointer when modal opens
  useEffect(() => {
    if (isSinkModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isSinkModalOpen]);

  if (!isSinkModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Droplets className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                BỒN NƯỚC & VÒI CỔ NGỖNG THÍ NGHIỆM
              </h2>
              <p className="text-xs text-slate-400">
                Điều chỉnh lưu lượng van nước và đong nước khử ion DI Water vào cốc to
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              closeSinkModal();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* 1. Tap Status & Live Stream Indicator */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                  isSinkTapRunning
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <Waves className={`w-6 h-6 ${isSinkTapRunning ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">Trạng thái vòi:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold border ${
                      isSinkTapRunning
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isSinkTapRunning ? 'ĐANG CHẢY NƯỚC' : 'ĐANG ĐÓNG VAN'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Nguồn nước: Khử ion siêu tinh khiết (DI Water - Điện trở suất &gt; 18.2 MΩ·cm)
                </p>
              </div>
            </div>

            {/* Toggle Tap Button */}
            <button
              onClick={toggleSinkTap}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
                isSinkTapRunning
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
              }`}
            >
              {isSinkTapRunning ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Khóa Vòi Nước</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Mở Vòi Nước</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Adjustable Water Flow Rate Slider (Điều chỉnh lưu lượng nước) */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>ĐIỀU CHỈNH LƯU LƯỢNG VAN NƯỚC (FLOW RATE)</span>
              </div>
              <span className="text-sm font-mono font-bold text-cyan-300">
                {sinkWaterFlowRate}% ({((sinkWaterFlowRate * 1.8) / 100).toFixed(2)} L/phút)
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={sinkWaterFlowRate}
              onChange={(e) => setSinkWaterFlowRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Chảy nhỏ giọt (10%)</span>
              <span>Lưu lượng vừa (50%)</span>
              <span>Chảy tối đa (100%)</span>
            </div>
          </div>

          {/* 3. Quick Dispense Presets into Large Beaker (Rót trực tiếp vào cốc to) */}
          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <span>RÓT NƯỚC TRỰC TIẾP VÀO CỐC THÍ NGHIỆM TO (500mL)</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                Cốc hiện có: {chemicalBeaker.water}mL nước
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Nhấn để mở vòi và tự động lấy chính xác lượng nước cất DI vào cốc to:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[50, 100, 200, 300].map((amt) => (
                <button
                  key={`dispense_${amt}`}
                  onClick={() => dispenseWaterIntoBeaker(amt)}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center space-y-0.5 group hover:scale-[1.03]"
                >
                  <span className="text-white text-sm font-bold">+{amt} mL</span>
                  <span className="text-[10px] text-cyan-400 font-normal">Nước DI</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => {
              closeSinkModal();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="px-6 py-2.5 rounded-2xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-lab-cyan/30 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Xong & Đóng Bồn Nước</span>
          </button>
        </div>
      </div>
    </div>
  );
}
