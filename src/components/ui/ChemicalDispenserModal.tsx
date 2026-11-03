import React, { useMemo, useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  X,
  FlaskConical,
  RotateCcw,
  AlertTriangle,
  Plus,
  Droplet,
  Sparkles,
  ShieldAlert,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export function ChemicalDispenserModal() {
  const {
    isChemicalModalOpen,
    closeChemicalModal,
    chemicalBeaker,
    addChemicalToTestBeaker,
    resetChemicalBeaker,
  } = useLabStore();

  // Automatically release mouse pointer when modal opens
  useEffect(() => {
    if (isChemicalModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isChemicalModalOpen]);

  if (!isChemicalModalOpen) return null;

  const total = chemicalBeaker.hcl + chemicalBeaker.hno3 + chemicalBeaker.h2o2 + chemicalBeaker.water;
  const capacity = chemicalBeaker.capacity;
  const fillPercentage = Math.min(100, (total / capacity) * 100);

  // Chemical mixture classification & recipe detection
  const mixtureAnalysis = useMemo(() => {
    if (total === 0) {
      return {
        name: 'Cốc Thí Nghiệm Trống',
        color: 'text-slate-400',
        badge: 'Chưa có dung dịch',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
        description: 'Hãy chọn các nút bên phải để đong từng lượng axit hoặc oxy già vào cốc to.',
      };
    }

    const { hcl, hno3, h2o2, water } = chemicalBeaker;

    // Check for Aqua Regia (Nước Cường Toan: HCl:HNO3 approx 3:1)
    if (hcl > 0 && hno3 > 0 && Math.abs(hcl / hno3 - 3) < 1.2 && h2o2 === 0) {
      return {
        name: 'NƯỚC CƯỜNG TOAN (Aqua Regia - 3 HCl : 1 HNO3)',
        color: 'text-amber-300 font-bold',
        badge: 'Khắc Ăn Mòn Cực Mạnh',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
        description: 'Dung dịch bốc khói màu cam có khả năng hòa tan vàng, bạch kim và ăn mòn sâu các lớp màng kim loại bán dẫn!',
      };
    }

    // Check for Piranha-type strong oxidizer
    if (h2o2 > 0 && (hcl > 0 || hno3 > 0)) {
      return {
        name: 'HỖN HỢP OXY HÓA MẠNH (Acid + Peroxide Clean)',
        color: 'text-rose-400 font-bold',
        badge: 'Oxy Hóa Mạnh',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
        description: 'Tạo phản ứng giải phóng oxy nguyên tử sủi bọt, chuyên dùng để tẩy sạch mọi tạp chất hữu cơ bám trên wafer Silicon.',
      };
    }

    // Pure chemical or simple dilute
    if (hcl > 0 && hno3 === 0 && h2o2 === 0) {
      return {
        name: `Dung dịch Axit Clohidric (HCl ${water > 0 ? 'Pha Loãng' : '37%'})`,
        color: 'text-cyan-400',
        badge: 'Axit Ăn Mòn',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        description: 'Axit vô cơ mạnh dùng để tẩy màng oxit kim loại và làm sạch bề mặt chi tiết phôi.',
      };
    }

    if (hno3 > 0 && hcl === 0 && h2o2 === 0) {
      return {
        name: `Dung dịch Axit Nitric (HNO3 ${water > 0 ? 'Pha Loãng' : '68%'})`,
        color: 'text-yellow-400',
        badge: 'Axit Bốc Khói',
        badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        description: 'Axit có tính oxy hóa cao, dùng để thụ động hóa bề mặt inox và ăn mòn đồng kim loại.',
      };
    }

    if (h2o2 > 0 && hcl === 0 && hno3 === 0) {
      return {
        name: 'Dung dịch Oxy Già (H2O2 30%)',
        color: 'text-blue-400',
        badge: 'Chất Khử Trùng / Oxy Hóa',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        description: 'Chất oxy hóa thân thiện với môi trường, phân hủy thành nước và oxy phân tử.',
      };
    }

    return {
      name: 'Hỗn hợp Dung dịch Đa thành phần',
      color: 'text-emerald-400',
      badge: 'Dung dịch Thí Nghiệm',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Hỗn hợp đang được hòa trộn trong cốc thí nghiệm chịu nhiệt.',
    };
  }, [chemicalBeaker, total]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                GIÁ ĐỠ HÓA CHẤT & ĐONG DUNG DỊCH ĂN MÒN
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Cho phép lấy HCl, HNO3, H2O2 và nước khử ion vào cốc thí nghiệm to (500mL)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              closeChemicalModal();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Left is Beaker Visualizer, Right is Dispensing Controls */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-3.5 sm:p-6 overflow-y-auto">
          {/* LEFT: 2D/3D Beaker Graphic & Liquid Composition */}
          <div className="flex flex-col items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-950/80 border border-slate-800">
            {/* Mixture Status Card */}
            <div className="w-full text-center space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <span className={`text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full border ${mixtureAnalysis.badgeColor}`}>
                  {mixtureAnalysis.badge}
                </span>
              </div>
              <h3 className={`text-xs sm:text-sm md:text-base ${mixtureAnalysis.color}`}>
                {mixtureAnalysis.name}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto">
                {mixtureAnalysis.description}
              </p>
            </div>

            {/* Beaker Visual Flask with Fluid Level */}
            <div className="relative w-36 h-48 sm:w-44 sm:h-56 my-3 sm:my-5 rounded-b-3xl border-4 border-t-0 border-cyan-400/40 bg-slate-900/60 overflow-hidden flex flex-col justify-end p-1 shadow-2xl shadow-cyan-900/20 flex-shrink-0">
              {/* Beaker Graduation Ticks */}
              <div className="absolute inset-y-3 sm:inset-y-4 right-1.5 sm:right-2 flex flex-col justify-between text-[9px] sm:text-[10px] font-mono text-slate-500 pointer-events-none select-none">
                <span>- 500mL</span>
                <span>- 400mL</span>
                <span>- 300mL</span>
                <span>- 200mL</span>
                <span>- 100mL</span>
              </div>

              {/* Fluid Layers */}
              {total > 0 && (
                <div
                  className="w-full transition-all duration-500 ease-out rounded-b-2xl relative overflow-hidden"
                  style={{
                    height: `${fillPercentage}%`,
                    background:
                      chemicalBeaker.hno3 > 0
                        ? 'linear-gradient(to top, rgba(234, 179, 8, 0.8), rgba(251, 191, 36, 0.6))'
                        : chemicalBeaker.hcl > 0
                        ? 'linear-gradient(to top, rgba(6, 182, 212, 0.8), rgba(56, 189, 248, 0.6))'
                        : 'linear-gradient(to top, rgba(59, 130, 246, 0.8), rgba(96, 165, 250, 0.6))',
                  }}
                >
                  {/* Subtle surface bubbles if H2O2 is present */}
                  {chemicalBeaker.h2o2 > 0 && (
                    <div className="absolute inset-0 flex justify-around items-end pb-1 opacity-70 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                      <div className="w-2 h-2 rounded-full bg-white/70" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    </div>
                  )}
                  {/* Liquid meniscus surface line */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-white/50" />
                </div>
              )}

              {/* Empty indicator */}
              {total === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-600">
                  CỐC TRỐNG
                </div>
              )}
            </div>

            {/* Volume Breakdown Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Tổng thể tích:</span>
                <span className="font-bold text-white">
                  {total} / {capacity} mL ({Math.round(fillPercentage)}%)
                </span>
              </div>

              <div className="h-2.5 sm:h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                {chemicalBeaker.hcl > 0 && (
                  <div
                    style={{ width: `${(chemicalBeaker.hcl / capacity) * 100}%` }}
                    className="bg-cyan-500 h-full"
                    title={`HCl: ${chemicalBeaker.hcl}mL`}
                  />
                )}
                {chemicalBeaker.hno3 > 0 && (
                  <div
                    style={{ width: `${(chemicalBeaker.hno3 / capacity) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`HNO3: ${chemicalBeaker.hno3}mL`}
                  />
                )}
                {chemicalBeaker.h2o2 > 0 && (
                  <div
                    style={{ width: `${(chemicalBeaker.h2o2 / capacity) * 100}%` }}
                    className="bg-blue-400 h-full"
                    title={`H2O2: ${chemicalBeaker.h2o2}mL`}
                  />
                )}
                {chemicalBeaker.water > 0 && (
                  <div
                    style={{ width: `${(chemicalBeaker.water / capacity) * 100}%` }}
                    className="bg-sky-300 h-full"
                    title={`Nước DI: ${chemicalBeaker.water}mL`}
                  />
                )}
              </div>

              {/* Legend Badges: 2 cols on mobile, 4 cols on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] sm:text-[11px] font-mono text-center">
                <div className="p-1 rounded bg-slate-900 border border-cyan-500/30 text-cyan-300">
                  HCl: {chemicalBeaker.hcl}ml
                </div>
                <div className="p-1 rounded bg-slate-900 border border-amber-500/30 text-amber-300">
                  HNO3: {chemicalBeaker.hno3}ml
                </div>
                <div className="p-1 rounded bg-slate-900 border border-blue-500/30 text-blue-300">
                  H2O2: {chemicalBeaker.h2o2}ml
                </div>
                <div className="p-1 rounded bg-slate-900 border border-sky-500/30 text-sky-300">
                  DI H2O: {chemicalBeaker.water}ml
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Chemical Dispensing Actions */}
          <div className="flex flex-col justify-between space-y-3.5 sm:space-y-4">
            <div className="space-y-3 sm:space-y-3.5">
              <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                CHỌN DUNG DỊCH ĐỂ RÓT VÀO CỐC TO
              </h4>

              {/* 1. Axit Clohidric (HCl 37%) */}
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Axit Clohidric (HCl 37%)
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">Ăn mòn oxit</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={`hcl_${amt}`}
                      onClick={() => addChemicalToTestBeaker('HCl', amt)}
                      disabled={total >= capacity}
                      className="py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 text-[11px] sm:text-xs font-mono font-bold transition-all disabled:opacity-40"
                    >
                      +{amt}mL
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Axit Nitric (HNO3 68%) */}
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-white">
                      Axit Nitric (HNO3 68%)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">Oxy hóa cực mạnh</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={`hno3_${amt}`}
                      onClick={() => addChemicalToTestBeaker('HNO3', amt)}
                      disabled={total >= capacity}
                      className="py-1.5 rounded-xl bg-slate-900 hover:bg-amber-900/60 text-amber-200 border border-amber-500/40 text-[11px] sm:text-xs font-mono font-bold transition-all disabled:opacity-40"
                    >
                      +{amt}mL
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Oxy Già (H2O2 30%) */}
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold text-white">
                      Oxy Già (Hydrogen Peroxide H2O2 30%)
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Tẩy rửa Wafer</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[10, 25, 50, 100].map((amt) => (
                    <button
                      key={`h2o2_${amt}`}
                      onClick={() => addChemicalToTestBeaker('H2O2', amt)}
                      disabled={total >= capacity}
                      className="py-1.5 rounded-xl bg-slate-900 hover:bg-blue-900/60 text-blue-200 border border-blue-500/40 text-[11px] sm:text-xs font-mono font-bold transition-all disabled:opacity-40"
                    >
                      +{amt}mL
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Nước Cất Khử Ion (DI Water) */}
              <div className="p-2.5 sm:p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-sky-300" />
                    <span className="text-xs font-bold text-white">
                      Nước Khử Ion Siêu Tinh Khiết (DI Water)
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-300 font-mono">Pha loãng & Tráng</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[50, 100, 200].map((amt) => (
                    <button
                      key={`water_${amt}`}
                      onClick={() => addChemicalToTestBeaker('WATER', amt)}
                      disabled={total >= capacity}
                      className="py-1.5 rounded-xl bg-slate-900 hover:bg-sky-900/60 text-sky-200 border border-sky-500/40 text-[11px] sm:text-xs font-mono font-bold transition-all disabled:opacity-40"
                    >
                      +{amt}mL
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={resetChemicalBeaker}
                className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-bold flex items-center justify-center space-x-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đổ Bỏ & Làm Sạch Cốc</span>
              </button>

              <button
                onClick={() => {
                  closeChemicalModal();
                  document.querySelector('canvas')?.requestPointerLock();
                }}
                className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-lab-cyan/30"
              >
                Hoàn Tất & Giữ Cốc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
