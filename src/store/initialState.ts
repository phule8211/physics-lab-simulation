import {
  GraphicsQuality,
  MachineId,
  OperatorPPE,
  TargetFps,
} from '../types/lab';

/** Toast feedback item displayed by the HUD overlay. */
export interface ActionToast {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

/** Tool or specimen currently held by the first-person operator hands. */
export type HeldItemType =
  | 'NONE'
  | 'WORKPIECE'
  | 'BEAKER'
  | 'TEST_TUBE'
  | 'PIPETTE'
  | 'CALIPER';

/** Volume tracking (mL) for the bench chemical mixing beaker. */
export interface ChemicalBeakerState {
  hcl: number;
  hno3: number;
  h2o2: number;
  water: number;
  capacity: number;
}

/** Inventory counts of glassware taken from the equipment rack. */
export interface CollectedEquipmentState {
  beakers: number;
  testTubes: number;
  pipettes: number;
}

/**
 * Shared mutable player world transform for 60 FPS 3D avatars without React render churn.
 */
export const playerWorldState = {
  x: 0,
  y: 1.7,
  z: 5,
  yaw: 0,
  moveAngle: 0,
  isMoving: false,
  handTapTrigger: 0,
};

let toastIdCounter = 0;

/**
 * Builds an ActionToast with a monotonically increasing ID across all store slices.
 */
export const createActionToast = (
  text: string,
  type: ActionToast['type'] = 'info'
): ActionToast => ({
  id: ++toastIdCounter,
  text,
  type,
});

export const ENGRAVING_DEPTH_MAP_RESOLUTION = 256;

export const createInitialEngravingDepthMap = (): Float32Array =>
  new Float32Array(ENGRAVING_DEPTH_MAP_RESOLUTION * ENGRAVING_DEPTH_MAP_RESOLUTION);

export const DEFAULT_PLAYER_POSITION: [number, number, number] = [0, 1.7, 0];
export const DEFAULT_NPC_DUNG_POSITION: [number, number, number] = [-4.6, 3.06, 9.6];

export const INITIAL_OPERATOR_PPE: OperatorPPE = {
  gogglesWavelength: '10600nm',
  glovesESD: true,
  hardhat: true,
  coatCleanroom: true,
};

export const INITIAL_CHEMICAL_BEAKER: ChemicalBeakerState = {
  hcl: 0,
  hno3: 0,
  h2o2: 0,
  water: 0,
  capacity: 500,
};

export const INITIAL_COLLECTED_EQUIPMENT: CollectedEquipmentState = {
  beakers: 1,
  testTubes: 0,
  pipettes: 1,
};

export const INITIAL_MACHINE_POWER: Record<MachineId, boolean> = {
  CO2_LASER: true,
  UV_LASER: true,
  FIBER_LASER: true,
  SENSOR_STATION: true,
  COATING_STATION: true,
};

export const INITIAL_LASER_PARAMETERS = {
  laserPowerWatts: 45,
  scanSpeedMmS: 12,
  pulseFrequencyKhz: 10,
} as const;

export const INITIAL_SENSOR_TELEMETRY = {
  sampleTemperature: 26.5, // °C (Normal: 26.5, Trip: > 95)
  chillerFlowRate: 4.8, // L/min (Normal: 4.8, Trip: < 2.0)
  smokeDensity: 5, // ppm (Normal: 5, Trip: > 60)
  isAlarmBuzzerActive: false,
} as const;

export const SENSOR_SAFETY_THRESHOLDS = {
  maxSampleTempC: 95,
  minChillerFlowLMin: 2.0,
  maxSmokeDensityPpm: 60,
} as const;

/**
 * Resolves the initial graphics quality preset from localStorage or a hardware heuristic.
 */
export const getInitialGraphicsQuality = (): GraphicsQuality => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('phanulab_graphics_quality') as GraphicsQuality | null;
      if (saved && (saved === 'LOW' || saved === 'MEDIUM' || saved === 'HIGH')) {
        return saved;
      }
      // Low-spec hardware heuristic: low cores or low device memory
      if (typeof navigator !== 'undefined') {
        const cores = navigator.hardwareConcurrency || 8;
        const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
        if (cores <= 4 || memory <= 4) {
          return 'LOW';
        }
      }
    }
  } catch {
    // Ignore storage access errors in headless/restricted environments
  }
  return 'MEDIUM';
};

/**
 * Resolves the initial target frame rate cap from localStorage (defaults to 60 FPS).
 */
export const getInitialTargetFps = (): TargetFps => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('phanulab_target_fps');
      if (saved === '30' || saved === '60') {
        return Number(saved) as TargetFps;
      }
    }
  } catch {
    // Ignore storage access errors in headless/restricted environments
  }
  return 60;
};
