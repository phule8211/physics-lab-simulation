import React from 'react';
import { Check } from 'lucide-react';
import { useLabStore } from '../../../store/useLabStore';
import { MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { useDesignBoundingBox } from './hooks/useMachineTelemetry';

interface LaserGuidedStepperProps {
  laserStep: 1 | 2 | 3 | 4;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
}

const Step1Desc: React.FC = React.memo(() => {
  const selectedMaterial = useLabStore((s) => s.selectedMaterial);
  const processMode = useLabStore((s) => s.processMode);
  return (
    <>
      {MATERIALS_CATALOG[selectedMaterial]?.name.split(' ')[0]} •{' '}
      {processMode === 'CUT' ? 'Cắt' : 'Khắc'}
    </>
  );
});

const Step2Desc: React.FC = React.memo(() => {
  const currentDesignName = useLabStore((s) => s.currentDesignName);
  const bbox = useDesignBoundingBox();
  return (
    <>
      {currentDesignName.split(' ')[0]} {bbox.isOutOfBounds ? '⚠️ Lệch' : '✓ Chuẩn'}
    </>
  );
});

const Step3Desc: React.FC = React.memo(() => {
  const laserPowerWatts = useLabStore((s) => s.laserPowerWatts);
  const scanSpeedMmS = useLabStore((s) => s.scanSpeedMmS);
  return (
    <>
      {laserPowerWatts}W • {scanSpeedMmS}mm/s
    </>
  );
});

const Step4Desc: React.FC = React.memo(() => {
  const isCuttingJob = useLabStore((s) => s.isCuttingJob);
  const cutProgress = useLabStore((s) => s.cutProgress);
  const isLidOpen = useLabStore((s) => s.isLidOpen);

  if (isCuttingJob) return <>Đang chạy {cutProgress.toFixed(0)}%</>;
  if (isLidOpen) return <>Nắp Mở</>;
  return <>Sẵn sàng</>;
});

const LASER_STEPS: ReadonlyArray<{
  step: 1 | 2 | 3 | 4;
  title: string;
  Desc: React.FC;
}> = [
  { step: 1, title: '1. Vật Liệu & Chế Độ', Desc: Step1Desc },
  { step: 2, title: '2. Bản Vẽ & Canh Phôi', Desc: Step2Desc },
  { step: 3, title: '3. Tham Số P-v-f', Desc: Step3Desc },
  { step: 4, title: '4. An Toàn & Chạy Máy', Desc: Step4Desc },
];

/**
 * 4-step workflow navigation bar with isolated per-step summary subscriptions.
 */
export const LaserGuidedStepper: React.FC<LaserGuidedStepperProps> = ({
  laserStep,
  onSelectStep,
}) => {
  const isCutComplete = useLabStore((s) => s.cutProgress >= 100);

  return (
    <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
      {LASER_STEPS.map(({ step, title, Desc }) => {
        const isActive = laserStep === step;
        const isPast = laserStep > step || (step === 4 && isCutComplete);
        return (
          <button
            key={step}
            onClick={() => onSelectStep(step)}
            className={`flex flex-col text-left p-1.5 md:p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-lab-cyan/15 border border-cyan-400/60 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                : isPast
                ? 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700'
                : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              {isPast ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {step}
                </span>
              )}
              <span className="truncate">{title}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline pl-5">
              <Desc />
            </span>
          </button>
        );
      })}
    </div>
  );
};
