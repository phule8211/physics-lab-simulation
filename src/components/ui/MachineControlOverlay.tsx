import React, { useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { ScientificRationaleModal } from './ScientificRationaleModal';
import { useStationOverlayContext } from './machine-control/hooks/useMachineTelemetry';
import { FloatingToastOnly, OverlayFeedbackBanners } from './machine-control/OverlayFeedbackBanner';
import { SensorStationPanel } from './machine-control/SensorStationPanel';
import { CoatingStationPanel } from './machine-control/CoatingStationPanel';
import { MachineStatusBar } from './machine-control/MachineStatusBar';
import { LaserGuidedStepper } from './machine-control/LaserGuidedStepper';
import { MaterialAndLensSelector } from './machine-control/MaterialAndLensSelector';
import { DesignAndFramingPanel } from './machine-control/DesignAndFramingPanel';
import { LaserParameterPanel } from './machine-control/LaserParameterPanel';
import {
  ProcessExecutionControls,
  ProExecutionButton,
  ProLidToggleButton,
} from './machine-control/ProcessExecutionControls';

/**
 * Top-level dock coordinator for machine controls (Laser Stations, Coating Station, Sensor Station).
 * Delegates state subscriptions to domain panels with atomic/shallow selectors to prevent slider re-render churn.
 */
export function MachineControlOverlay() {
  const [laserStep, setLaserStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [dockViewMode, setDockViewMode] = React.useState<'GUIDED' | 'PRO'>('GUIDED');

  const {
    currentStationId,
    currentStation,
    targetMachineId,
    isOverlayHidden,
    isKnowledgePanelOpen,
    stopUsingMachine,
  } = useStationOverlayContext();

  const isCuttingJob = useLabStore((s) => s.isCuttingJob);
  const isCutComplete = useLabStore((s) => s.cutProgress >= 100);

  // Auto-switch to Step 4 when cutting begins or completes
  useEffect(() => {
    if (isCuttingJob || isCutComplete) {
      setLaserStep(4);
    }
  }, [isCuttingJob, isCutComplete]);

  if (isOverlayHidden || !currentStationId || !currentStation) {
    return <FloatingToastOnly />;
  }

  const containerAlignment = isKnowledgePanelOpen
    ? 'left-0 right-0 md:right-[540px] lg:right-[620px]'
    : 'inset-x-0';

  return (
    <div
      className={`fixed bottom-3 md:bottom-5 z-40 flex flex-col items-center pointer-events-none px-3 transition-all duration-300 ${containerAlignment}`}
    >
      <OverlayFeedbackBanners />

      {currentStationId === 'SENSOR_STATION' ? (
        <SensorStationPanel onExit={stopUsingMachine} />
      ) : currentStationId === 'COATING_STATION' ? (
        <CoatingStationPanel onExit={stopUsingMachine} />
      ) : (
        <>
          <section
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Bảng điều khiển gia công vật liệu và nắp máy"
            className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
          >
            <MachineStatusBar
              stationId={targetMachineId}
              title={currentStation.shortName || 'THIẾT BỊ LASER'}
              badgeText={currentStation.wavelength}
              accentColor={currentStation.accentColor || '#06b6d4'}
              offlineWarningText="MÁY ĐANG TẮT NGUỒN CHÍNH. Bật công tắc để bắt đầu chạy máy hoặc điều chỉnh thông số."
              compactPowerLabel
              dockViewMode={dockViewMode}
              onChangeDockViewMode={setDockViewMode}
              onExit={stopUsingMachine}
            />

            {dockViewMode === 'GUIDED' ? (
              <div className="flex flex-col gap-3">
                <LaserGuidedStepper laserStep={laserStep} onSelectStep={setLaserStep} />

                {laserStep === 1 && (
                  <MaterialAndLensSelector
                    stationId={currentStationId}
                    variant="guided"
                    onNext={() => setLaserStep(2)}
                  />
                )}

                {laserStep === 2 && (
                  <DesignAndFramingPanel
                    onPrev={() => setLaserStep(1)}
                    onNext={() => setLaserStep(3)}
                  />
                )}

                {laserStep === 3 && (
                  <LaserParameterPanel
                    targetMachineId={targetMachineId}
                    variant="guided"
                    onPrev={() => setLaserStep(2)}
                    onNext={() => setLaserStep(4)}
                  />
                )}

                {laserStep === 4 && (
                  <ProcessExecutionControls
                    currentStationId={currentStationId}
                    targetMachineId={targetMachineId}
                    onPrev={() => setLaserStep(3)}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  <ProLidToggleButton />
                  <MaterialAndLensSelector stationId={currentStationId} variant="pro" />
                  <ProExecutionButton
                    currentStationId={currentStationId}
                    targetMachineId={targetMachineId}
                  />
                </div>

                <LaserParameterPanel targetMachineId={targetMachineId} variant="pro" />
              </div>
            )}
          </section>

          <ScientificRationaleModal />
        </>
      )}
    </div>
  );
}
