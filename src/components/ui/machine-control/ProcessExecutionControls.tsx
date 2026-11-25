import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ArrowLeft,
  DoorClosed,
  DoorOpen,
  PackageCheck,
  Power,
  RotateCcw,
  Scan,
  ShieldCheck,
  Sparkles,
  Square,
  Zap,
} from 'lucide-react';
import { useLabStore, MachineId } from '../../../store/useLabStore';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { useMaterialInteraction } from './hooks/useMachineTelemetry';

interface ProcessExecutionControlsProps {
  currentStationId: string;
  targetMachineId: MachineId;
  onPrev: () => void;
}

const openSpecimenAndUnlock = (openSpecimenModal: () => void) => {
  if (typeof document !== 'undefined' && document.pointerLockElement) {
    document.exitPointerLock();
  }
  openSpecimenModal();
};

/**
 * Step 4 pre-flight safety checklist and Start/Stop/Frame/Inspect execution deck.
 */
export const ProcessExecutionControls: React.FC<ProcessExecutionControlsProps> = ({
  currentStationId,
  targetMachineId,
  onPrev,
}) => {
  const {
    isPowered,
    isLidOpen,
    isCuttingJob,
    cutProgress,
    isFraming,
    toggleMachinePower,
    toggleLid,
    startCuttingJob,
    stopCuttingJob,
    openSpecimenModal,
    resetWorkpiece,
    startFraming,
    stopFraming,
  } = useLabStore(
    useShallow((s) => ({
      isPowered: Boolean(s.machinePower[targetMachineId]),
      isLidOpen: s.isLidOpen,
      isCuttingJob: s.isCuttingJob,
      cutProgress: s.cutProgress,
      isFraming: s.isFraming,
      toggleMachinePower: s.toggleMachinePower,
      toggleLid: s.toggleLid,
      startCuttingJob: s.startCuttingJob,
      stopCuttingJob: s.stopCuttingJob,
      openSpecimenModal: s.openSpecimenModal,
      resetWorkpiece: s.resetWorkpiece,
      startFraming: s.startFraming,
      stopFraming: s.stopFraming,
    }))
  );

  const { selectedMaterial, processMode, interaction, isReflective, isIneffective } =
    useMaterialInteraction(currentStationId);

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
      <div className="p-2 px-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 flex items-center space-x-2">
        <span className="font-bold text-emerald-400">💡 Hướng dẫn:</span>
        <span>
          Bước 4/4: Kiểm tra 3 điều kiện an toàn (Nguồn, Nắp máy, Quạt hút) rồi bấm{' '}
          <b>Bắt Đầu Cắt [Phím C]</b> để kích hoạt tia laser.
        </span>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Bước 4: Danh Mục Kiểm Tra An Toàn & Kích Hoạt Gia Công
        </span>
      </div>

      {/* Pre-flight Checklist 3 Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Power className={`w-4 h-4 ${isPowered ? 'text-emerald-400' : 'text-rose-400'}`} />
            <div>
              <span className="text-xs font-bold block text-slate-200">1. Nguồn chính</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isPowered ? 'Đã bật' : 'Chưa bật nguồn'}
              </span>
            </div>
          </div>
          {!isPowered && (
            <button
              onClick={() => toggleMachinePower(targetMachineId)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold transition-all"
            >
              Bật nguồn
            </button>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isLidOpen ? (
              <DoorOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            <div>
              <span className="text-xs font-bold block text-slate-200">2. Nắp máy [O]</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isLidOpen ? 'Nắp đang mở (Ngắt tia)' : 'Đã đóng (Sẵn sàng)'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleLid}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              isLidOpen
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {isLidOpen ? 'Đóng nắp [O]' : 'Mở nắp [O]'}
          </button>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles
              className="w-4 h-4"
              style={{ color: interaction?.badgeColor || '#10b981' }}
            />
            <div>
              <span className="text-xs font-bold block text-slate-200">3. Vật liệu</span>
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px] block">
                {MATERIALS_CATALOG[selectedMaterial]?.name}
              </span>
            </div>
          </div>
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
            style={{
              color: interaction?.badgeColor || '#10b981',
              borderColor: (interaction?.badgeColor || '#10b981') + '40',
            }}
          >
            {interaction?.statusText || 'KHẢ DỤNG'}
          </span>
        </div>
      </div>

      {/* Primary Action Button (Execution / Progress) */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col gap-2">
        {isCuttingJob ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={stopCuttingJob}
              className="w-full py-3 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-rose-500 shadow-lg shadow-rose-900/50 active:scale-95 animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>DỪNG CẮT NGAY ({cutProgress.toFixed(0)}%)</span>
            </button>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-lab-cyan h-full transition-all duration-100 ease-linear"
                style={{ width: `${cutProgress}%` }}
              />
            </div>
          </div>
        ) : cutProgress >= 100 ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => openSpecimenAndUnlock(openSpecimenModal)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all border border-emerald-300 shadow-xl shadow-emerald-950/60 active:scale-95 animate-pulse"
            >
              <PackageCheck className="w-5 h-5 text-emerald-200" />
              <span>LẤY MẪU RA QUAN SÁT 360° [PHÍM G]</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={startCuttingJob}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center justify-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Cắt Lại Hình Này</span>
              </button>
              <button
                onClick={resetWorkpiece}
                className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nạp Phôi Mới Chưa Cắt</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={startCuttingJob}
              disabled={isReflective || isIneffective || !isPowered}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all border shadow-lg active:scale-95 ${
                isReflective
                  ? 'bg-rose-950/40 border-rose-800 text-rose-400 cursor-not-allowed opacity-75'
                  : isIneffective
                  ? 'bg-amber-950/40 border-amber-800 text-amber-400 cursor-not-allowed opacity-75'
                  : !isPowered
                  ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-emerald-400 text-white shadow-emerald-950/50'
              }`}
            >
              <Zap className="w-4 h-4 fill-current text-white" />
              <span>BẮT ĐẦU {processMode === 'CUT' ? 'CẮT' : 'KHẮC'} LASER [PHÍM C]</span>
            </button>

            <button
              onClick={() => (isFraming ? stopFraming() : startFraming())}
              className={`py-3 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all border active:scale-95 ${
                isFraming
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-cyan-300'
              }`}
              title="Quét thử khung viền phôi [F]"
            >
              <Scan className="w-4 h-4 text-cyan-400" />
              <span>Frame [F]</span>
            </button>
          </div>
        )}
      </div>

      {/* Step 4 Footer Navigation */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <button
          onClick={onPrev}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại: Hiệu Chỉnh Tham Số P-v-f</span>
        </button>

        <span className="text-[11px] font-mono text-slate-400">
          Phím tắt: [O] Nắp • [C] Cắt • [G] Lấy Mẫu • [F] Frame
        </span>
      </div>
    </div>
  );
};

/**
 * Isolated lid toggle button used in Pro Quick Action Bar.
 */
export const ProLidToggleButton: React.FC = () => {
  const { isLidOpen, toggleLid } = useLabStore(
    useShallow((s) => ({
      isLidOpen: s.isLidOpen,
      toggleLid: s.toggleLid,
    }))
  );

  return (
    <div className="md:col-span-3">
      <button
        onClick={toggleLid}
        className={`w-full py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-95 shadow-md ${
          isLidOpen
            ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-200'
            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
        }`}
      >
        {isLidOpen ? (
          <>
            <DoorOpen className="w-4 h-4 text-amber-400" />
            <span>Đóng nắp [O]</span>
          </>
        ) : (
          <>
            <DoorClosed className="w-4 h-4 text-slate-400" />
            <span>Mở nắp [O]</span>
          </>
        )}
      </button>
    </div>
  );
};

/**
 * Isolated cutting/inspect CTA button used in Pro Quick Action Bar.
 */
export const ProExecutionButton: React.FC<{
  currentStationId: string;
  targetMachineId: MachineId;
}> = ({ currentStationId, targetMachineId }) => {
  const {
    isPowered,
    isCuttingJob,
    cutProgress,
    startCuttingJob,
    stopCuttingJob,
    openSpecimenModal,
  } = useLabStore(
    useShallow((s) => ({
      isPowered: Boolean(s.machinePower[targetMachineId]),
      isCuttingJob: s.isCuttingJob,
      cutProgress: s.cutProgress,
      startCuttingJob: s.startCuttingJob,
      stopCuttingJob: s.stopCuttingJob,
      openSpecimenModal: s.openSpecimenModal,
    }))
  );

  const { processMode, isReflective, isIneffective } = useMaterialInteraction(currentStationId);

  return (
    <div className="md:col-span-3">
      {isCuttingJob ? (
        <button
          onClick={stopCuttingJob}
          className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 animate-pulse"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Dừng Cắt ({cutProgress.toFixed(0)}%)</span>
        </button>
      ) : cutProgress >= 100 ? (
        <button
          onClick={() => openSpecimenAndUnlock(openSpecimenModal)}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 animate-pulse"
        >
          <PackageCheck className="w-4 h-4 text-emerald-200" />
          <span>Lấy Mẫu Xem [G]</span>
        </button>
      ) : (
        <button
          onClick={startCuttingJob}
          disabled={isReflective || isIneffective || !isPowered}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{processMode === 'CUT' ? 'Cắt [C]' : 'Khắc [C]'}</span>
        </button>
      )}
    </div>
  );
};
