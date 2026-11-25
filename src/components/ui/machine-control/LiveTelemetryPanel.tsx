import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLabStore, MachineId } from '../../../store/useLabStore';
import { useMachineTelemetry } from './hooks/useMachineTelemetry';

interface LiveTelemetryPanelProps {
  targetMachineId: MachineId;
  variant: 'guided' | 'pro';
}

/**
 * Real-time physical simulation readout panel (linear energy density, pulse overlap,
 * ablation depth, kerf width, roughness, and quality rating).
 */
export const LiveTelemetryPanel: React.FC<LiveTelemetryPanelProps> = ({
  targetMachineId,
  variant,
}) => {
  const applyRecommendedParameters = useLabStore((s) => s.applyRecommendedParameters);
  const {
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    processMode,
    linearEnergyDensity,
    matPhys,
    liveSim,
  } = useMachineTelemetry(targetMachineId);

  if (variant === 'pro') {
    return (
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">Độ sâu:</span>
          <span className="font-bold text-cyan-300">
            {liveSim.actualDepthMm.toFixed(2)} mm ({liveSim.cutThroughPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">Chồng lấp:</span>
          <span className="font-bold text-slate-200">
            η {liveSim.pulseOverlapPercent.toFixed(1)}%
          </span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">Kerf / E:</span>
          <span className="font-bold text-amber-300">
            {liveSim.kerfWidthMm.toFixed(3)} mm • {linearEnergyDensity.toFixed(3)} J/mm
          </span>
        </div>
        <div className="p-1.5 rounded bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block">Chất lượng:</span>
          <span
            className={`font-bold ${
              liveSim.isCutThrough ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {liveSim.qualityRating === 'PERFECT' ? '✓ Hoàn hảo' : liveSim.qualityRating}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Formula Ribbon with Fractions & Decimals */}
      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-inner">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Năng lượng dài:</span>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
            <span>E_line = </span>
            <span className="inline-flex flex-col text-center align-middle mx-1">
              <span className="border-b border-amber-400/50 pb-0.5 text-[10px] text-amber-200 font-bold">
                P ({laserPowerWatts.toFixed(1)} W)
              </span>
              <span className="pt-0.5 text-[10px] text-cyan-200 font-bold">
                v ({scanSpeedMmS.toFixed(1)} mm/s)
              </span>
            </span>
            <span className="font-bold text-amber-400 text-xs">
              {' '}
              = {linearEnergyDensity.toFixed(3)} J/mm
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Chồng lấp xung:</span>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300">
            <span>η = [ 1 − </span>
            <span className="inline-flex flex-col text-center align-middle mx-1">
              <span className="border-b border-emerald-400/50 pb-0.5 text-[10px] text-emerald-200 font-bold">
                v ({scanSpeedMmS.toFixed(1)})
              </span>
              <span className="pt-0.5 text-[10px] text-emerald-200 font-bold">
                2w₀·f ({(0.085 * pulseFrequencyKhz).toFixed(2)})
              </span>
            </span>
            <span>
              {' '}
              ] = <b className="text-emerald-400 font-bold">{liveSim.pulseOverlapPercent.toFixed(1)}%</b>
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Physical Feedback */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Độ sâu dự kiến:</span>
          <span
            className={`font-bold mt-1 ${
              liveSim.isCutThrough
                ? 'text-emerald-400'
                : processMode === 'CUT'
                ? 'text-rose-400 animate-pulse'
                : 'text-cyan-300'
            }`}
          >
            {liveSim.actualDepthMm.toFixed(2)} mm / {matPhys.plateThicknessMm.toFixed(2)} mm (
            {liveSim.cutThroughPercentage.toFixed(1)}%)
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Chồng lấp & Ra:</span>
          <span className="font-bold text-slate-200 mt-1">
            η {liveSim.pulseOverlapPercent.toFixed(1)}% • Ra {liveSim.surfaceRoughnessRaUm.toFixed(2)} µm
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Rãnh Kerf & Năng lượng:</span>
          <span className="font-bold text-amber-300 mt-1">
            {liveSim.kerfWidthMm.toFixed(3)} mm • {linearEnergyDensity.toFixed(3)} J/mm
          </span>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400">Chất lượng mép:</span>
          <span
            className={`font-bold mt-1 ${
              liveSim.qualityRating === 'PERFECT'
                ? 'text-emerald-400'
                : liveSim.qualityRating === 'POOR_OVERBURNT'
                ? 'text-amber-400'
                : liveSim.qualityRating === 'FAILED_UNCUT'
                ? 'text-rose-400'
                : 'text-cyan-300'
            }`}
          >
            {liveSim.qualityRating === 'PERFECT'
              ? '✓ Hoàn hảo (100.0%)'
              : liveSim.qualityRating === 'POOR_OVERBURNT'
              ? '⚠️ Quá nhiệt (HAZ > 0.40mm)'
              : liveSim.qualityRating === 'FAILED_UNCUT'
              ? `❌ Chưa đứt (d < ${matPhys.plateThicknessMm.toFixed(2)}mm)`
              : '✓ Tối ưu'}
          </span>
        </div>
      </div>

      {/* Cut Warning if applicable */}
      {processMode === 'CUT' && !liveSim.isCutThrough && (
        <div className="p-2 px-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span>
              CẢNH BÁO: Tia chỉ cắt sâu {liveSim.actualDepthMm.toFixed(2)} mm (chưa đứt phôi{' '}
              {matPhys.plateThicknessMm.toFixed(2)} mm).
            </span>
          </div>
          <button
            onClick={applyRecommendedParameters}
            className="underline font-bold text-cyan-300 hover:text-white flex-shrink-0 pl-2 cursor-pointer"
          >
            Khắc phục chuẩn
          </button>
        </div>
      )}
    </>
  );
};
