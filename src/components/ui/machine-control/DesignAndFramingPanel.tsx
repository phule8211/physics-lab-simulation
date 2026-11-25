import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AlertTriangle, ArrowLeft, ArrowRight, PenTool, Scan } from 'lucide-react';
import { useLabStore } from '../../../store/useLabStore';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { useDesignBoundingBox } from './hooks/useMachineTelemetry';

interface DesignAndFramingPanelProps {
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Step 2 panel for selecting CAD vector files, inspecting bed bounds, and running red-diode framing.
 */
export const DesignAndFramingPanel: React.FC<DesignAndFramingPanelProps> = ({
  onPrev,
  onNext,
}) => {
  const {
    selectedMaterial,
    currentDesignName,
    isFraming,
    openDesignModal,
    startFraming,
    stopFraming,
    autoFitCurrentDesign,
  } = useLabStore(
    useShallow((s) => ({
      selectedMaterial: s.selectedMaterial,
      currentDesignName: s.currentDesignName,
      isFraming: s.isFraming,
      openDesignModal: s.openDesignModal,
      startFraming: s.startFraming,
      stopFraming: s.stopFraming,
      autoFitCurrentDesign: s.autoFitCurrentDesign,
    }))
  );

  const bbox = useDesignBoundingBox();
  const isOutOfBounds = bbox.isOutOfBounds;

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
      <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
        <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
        <span>
          Bước 2/4: Bàn làm việc 300 x 200 mm. Dùng nút <b>Quét Thử Khung Viền [F]</b> để đầu laser
          chạy thử quanh 4 mép phôi tránh lệch.
        </span>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Schematic Box */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Bàn phôi: 300 x 200 mm</span>
            <span className={isOutOfBounds ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
              {isOutOfBounds ? '⚠️ Tràn phôi' : '✓ Vừa vặn'}
            </span>
          </div>
          <div className="relative w-full h-24 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />
            <div className="w-[85%] h-[80%] rounded border border-cyan-500/40 bg-cyan-950/20 flex flex-col items-center justify-center relative">
              <span className="text-[9px] text-cyan-400/70 font-mono">
                VẬT LIỆU: {MATERIALS_CATALOG[selectedMaterial]?.name}
              </span>
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

        {/* Design Metrics & Framing Tools */}
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
              onClick={() => (isFraming ? stopFraming() : startFraming())}
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
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại: Vật Liệu</span>
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
        >
          <span>Tiếp tục: Cài Đặt Tham Số P-v-f</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
