import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useLabStore, MachineId } from '../../../store/useLabStore';
import { useRecommendedLaserPreset } from './hooks/useMachineTelemetry';
import { LiveTelemetryPanel } from './LiveTelemetryPanel';

interface LaserParameterPanelProps {
  targetMachineId: MachineId;
  variant: 'guided' | 'pro';
  onPrev?: () => void;
  onNext?: () => void;
}

/**
 * Laser process parameter sliders (Power P, Scan Speed v, Pulse Frequency f),
 * AI parameter recommendation preset bar, and composed LiveTelemetryPanel.
 */
export const LaserParameterPanel: React.FC<LaserParameterPanelProps> = ({
  targetMachineId,
  variant,
  onPrev,
  onNext,
}) => {
  if (variant === 'pro') {
    return (
      <>
        <SmartPresetBanner targetMachineId={targetMachineId} variant="pro" />
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-2.5">
          <ParameterSlidersRow variant="pro" />
          <LiveTelemetryPanel targetMachineId={targetMachineId} variant="pro" />
        </div>
      </>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
      <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
        <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
        <span>
          Bước 3/4: Bấm <b>Áp Dụng Chuẩn AI</b> để máy tự thiết lập thông số P-v-f tối ưu cho vật
          liệu, hoặc kéo thanh trượt tùy ý.
        </span>
      </div>

      <SmartPresetBanner targetMachineId={targetMachineId} variant="guided" />
      <ParameterSlidersRow variant="guided" />
      <LiveTelemetryPanel targetMachineId={targetMachineId} variant="guided" />

      {(onPrev || onNext) && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
          {onPrev ? (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Bản Vẽ</span>
            </button>
          ) : (
            <span />
          )}

          {onNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <span>Tiếp tục: Kiểm Tra An Toàn & Chạy Máy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SmartPresetBanner: React.FC<{
  targetMachineId: MachineId;
  variant: 'guided' | 'pro';
}> = React.memo(({ targetMachineId, variant }) => {
  const { applyRecommendedParameters, setRationaleModalOpen } = useLabStore(
    useShallow((s) => ({
      applyRecommendedParameters: s.applyRecommendedParameters,
      setRationaleModalOpen: s.setRationaleModalOpen,
    }))
  );
  const { recSettings } = useRecommendedLaserPreset(targetMachineId);

  if (variant === 'pro') {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-white">
            Gợi ý: <b className="text-amber-300">{recSettings.powerWatts.toFixed(1)}W</b> •{' '}
            <b className="text-cyan-300">{recSettings.speedMmS.toFixed(1)}mm/s</b> •{' '}
            <b className="text-emerald-300">{recSettings.frequencyKhz.toFixed(1)}kHz</b> •{' '}
            <b className="text-amber-400">
              E = {(recSettings.powerWatts / recSettings.speedMmS).toFixed(3)} J/mm
            </b>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRationaleModalOpen(true)}
            className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-mono border border-slate-700"
          >
            Tại sao chọn?
          </button>
          <button
            onClick={applyRecommendedParameters}
            className="px-2.5 py-0.5 rounded bg-cyan-500 text-slate-950 font-bold text-[11px] font-mono"
          >
            Nạp Chuẩn
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
      <div className="flex items-center space-x-2">
        <Sliders className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Bước 3: Hiệu Chỉnh Tham Số Công Nghệ (P - v - f)
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => setRationaleModalOpen(true)}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-mono border border-slate-700 flex items-center space-x-1 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tại sao chọn?</span>
        </button>
        <button
          onClick={applyRecommendedParameters}
          className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/50 active:scale-95"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            Áp Dụng Chuẩn AI ({recSettings.powerWatts.toFixed(1)}W •{' '}
            {recSettings.speedMmS.toFixed(1)}mm/s • {recSettings.frequencyKhz.toFixed(1)}kHz)
          </span>
        </button>
      </div>
    </div>
  );
});

interface SliderDef {
  id: string;
  guidedLabel: string;
  proLabel: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  valueClass: string;
  accentClass: string;
}

const SLIDER_DEFS: readonly SliderDef[] = [
  {
    id: 'power',
    guidedLabel: 'Công suất (P):',
    proLabel: 'P:',
    min: 5,
    max: 100,
    step: 1,
    unit: 'W',
    valueClass: 'text-amber-300 font-bold',
    accentClass: 'accent-amber-400',
  },
  {
    id: 'speed',
    guidedLabel: 'Tốc độ quét (v):',
    proLabel: 'v:',
    min: 5,
    max: 800,
    step: 5,
    unit: 'mm/s',
    valueClass: 'text-cyan-300 font-bold',
    accentClass: 'accent-cyan-400',
  },
  {
    id: 'frequency',
    guidedLabel: 'Tần số xung (f):',
    proLabel: 'f:',
    min: 5,
    max: 100,
    step: 1,
    unit: 'kHz',
    valueClass: 'text-emerald-300 font-bold',
    accentClass: 'accent-emerald-400',
  },
] as const;

const ParameterSlidersRow: React.FC<{ variant: 'guided' | 'pro' }> = ({ variant }) => {
  const {
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    setLaserPowerWatts,
    setScanSpeedMmS,
    setPulseFrequencyKhz,
  } = useLabStore(
    useShallow((s) => ({
      laserPowerWatts: s.laserPowerWatts,
      scanSpeedMmS: s.scanSpeedMmS,
      pulseFrequencyKhz: s.pulseFrequencyKhz,
      setLaserPowerWatts: s.setLaserPowerWatts,
      setScanSpeedMmS: s.setScanSpeedMmS,
      setPulseFrequencyKhz: s.setPulseFrequencyKhz,
    }))
  );

  const values = [laserPowerWatts, scanSpeedMmS, pulseFrequencyKhz];
  const setters = [setLaserPowerWatts, setScanSpeedMmS, setPulseFrequencyKhz];
  const isPro = variant === 'pro';

  return (
    <div
      className={
        isPro
          ? 'grid grid-cols-3 gap-3'
          : 'grid grid-cols-1 md:grid-cols-3 gap-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800'
      }
    >
      {SLIDER_DEFS.map((def, idx) => {
        const val = values[idx];
        const onChange = setters[idx];
        return (
          <div key={def.id} className="flex flex-col gap-1">
            <div className={`flex justify-between ${isPro ? 'text-[10px]' : 'text-xs'} font-mono`}>
              <span className="text-slate-400">{isPro ? def.proLabel : def.guidedLabel}</span>
              <span className={def.valueClass}>
                {val.toFixed(1)} {def.unit}
              </span>
            </div>
            <input
              type="range"
              min={def.min}
              max={def.max}
              step={def.step}
              value={val}
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
              className={`${def.accentClass} cursor-pointer h-1.5 bg-slate-800 rounded-lg`}
            />
          </div>
        );
      })}
    </div>
  );
};
