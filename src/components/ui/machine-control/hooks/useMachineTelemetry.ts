import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useLabStore, MachineId } from '../../../../store/useLabStore';
import { MATERIALS_CATALOG, MaterialInteraction } from '../../../../data/materialsConfig';
import { STATIONS } from '../../../../data/labConfig';
import { BoundingBox, computeBoundingBox } from '../../../../data/vectorDesigns';
import {
  getRecommendedParameters,
  LaserPhysicsResult,
  MATERIAL_PHYSICAL_SPECS,
  MaterialPhysicalSpec,
  RecommendedSettings,
  simulateLaserPhysics,
} from '../../../../utils/laserPhysicsEngine';

const DEFAULT_INTERACTION: MaterialInteraction = {
  status: 'COMPATIBLE',
  statusText: 'KHẢ DỤNG',
  badgeColor: '#10b981',
  effectDescription: 'Tương thích gia công tiêu chuẩn.',
  sparkColor: '#fbbf24',
  canCutOrEngrave: true,
};

/**
 * Navigation and dock visibility selectors without subscribing to high-frequency slider or progress ticks.
 */
export function useStationOverlayContext() {
  const {
    mode,
    activeStationId,
    hoveredStationId,
    isMachineDockDismissed,
    isKnowledgePanelCollapsed,
    exitInspection,
    dismissMachineDock,
  } = useLabStore(
    useShallow((s) => ({
      mode: s.mode,
      activeStationId: s.activeStationId,
      hoveredStationId: s.hoveredStationId,
      isMachineDockDismissed: s.isMachineDockDismissed,
      isKnowledgePanelCollapsed: s.isKnowledgePanelCollapsed,
      exitInspection: s.exitInspection,
      dismissMachineDock: s.dismissMachineDock,
    }))
  );

  const currentStationId =
    activeStationId || (mode === 'WALKING' && hoveredStationId ? hoveredStationId : null);
  const currentStation =
    currentStationId && currentStationId in STATIONS ? STATIONS[currentStationId] : null;
  const targetMachineId = (
    currentStationId && currentStationId in STATIONS ? currentStationId : 'CO2_LASER'
  ) as MachineId;

  const isOverlayHidden =
    !currentStationId ||
    !currentStation ||
    !(currentStationId in STATIONS) ||
    (mode === 'WALKING' && isMachineDockDismissed);

  const isKnowledgePanelOpen = Boolean(activeStationId) && !isKnowledgePanelCollapsed;

  const stopUsingMachine = () => {
    if (mode === 'INSPECTING') {
      exitInspection();
    }
    dismissMachineDock();
    try {
      document.querySelector('canvas')?.requestPointerLock();
    } catch {
      // Ignore pointer lock errors when headless or interrupted
    }
  };

  return {
    currentStationId,
    currentStation,
    targetMachineId,
    isOverlayHidden,
    isKnowledgePanelOpen,
    stopUsingMachine,
  };
}

/**
 * Memoized CAD vector toolpath bounding box selector.
 */
export function useDesignBoundingBox(): BoundingBox {
  const currentToolpaths = useLabStore((s) => s.currentToolpaths);
  return useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);
}

/**
 * Material optical interaction metadata for the active laser machine.
 */
export function useMaterialInteraction(stationId: string | null) {
  const selectedMaterial = useLabStore((s) => s.selectedMaterial);
  const processMode = useLabStore((s) => s.processMode);

  const currentMatConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;
  const interaction =
    (stationId ? currentMatConfig?.interactions?.[stationId] : undefined) || DEFAULT_INTERACTION;

  return {
    selectedMaterial,
    processMode,
    currentMatConfig,
    interaction,
    isReflective: interaction.status === 'BLOCKED_REFLECTIVE',
    isIneffective: interaction.status === 'INEFFECTIVE',
  };
}

/**
 * Memoized AI-recommended optimal laser parameters for active machine, material, and process mode.
 */
export function useRecommendedLaserPreset(targetMachineId: MachineId): {
  recSettings: RecommendedSettings;
  matPhys: MaterialPhysicalSpec;
} {
  const { selectedMaterial, processMode } = useLabStore(
    useShallow((s) => ({
      selectedMaterial: s.selectedMaterial,
      processMode: s.processMode,
    }))
  );

  const matPhys = MATERIAL_PHYSICAL_SPECS[selectedMaterial] || MATERIAL_PHYSICAL_SPECS.WOOD;
  const recSettings = useMemo(
    () => getRecommendedParameters(targetMachineId, selectedMaterial, processMode),
    [targetMachineId, selectedMaterial, processMode]
  );

  return { recSettings, matPhys };
}

/**
 * Real-time laser physics simulation memoized outside React JSX rendering.
 * Only components displaying live physics outputs subscribe to (P, v, f) updates.
 */
export function useMachineTelemetry(targetMachineId: MachineId): {
  laserPowerWatts: number;
  scanSpeedMmS: number;
  pulseFrequencyKhz: number;
  processMode: string;
  linearEnergyDensity: number;
  matPhys: MaterialPhysicalSpec;
  recSettings: RecommendedSettings;
  liveSim: LaserPhysicsResult;
} {
  const {
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    selectedMaterial,
    processMode,
  } = useLabStore(
    useShallow((s) => ({
      laserPowerWatts: s.laserPowerWatts,
      scanSpeedMmS: s.scanSpeedMmS,
      pulseFrequencyKhz: s.pulseFrequencyKhz,
      selectedMaterial: s.selectedMaterial,
      processMode: s.processMode,
    }))
  );

  const matPhys = MATERIAL_PHYSICAL_SPECS[selectedMaterial] || MATERIAL_PHYSICAL_SPECS.WOOD;

  const recSettings = useMemo(
    () => getRecommendedParameters(targetMachineId, selectedMaterial, processMode),
    [targetMachineId, selectedMaterial, processMode]
  );

  const liveSim = useMemo(
    () =>
      simulateLaserPhysics(
        laserPowerWatts,
        scanSpeedMmS,
        pulseFrequencyKhz,
        targetMachineId,
        selectedMaterial,
        processMode
      ),
    [
      laserPowerWatts,
      scanSpeedMmS,
      pulseFrequencyKhz,
      targetMachineId,
      selectedMaterial,
      processMode,
    ]
  );

  const linearEnergyDensity = laserPowerWatts / Math.max(1, scanSpeedMmS);

  return {
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    processMode,
    linearEnergyDensity,
    matPhys,
    recSettings,
    liveSim,
  };
}
