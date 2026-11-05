export type MachineId = 'CO2_LASER' | 'UV_LASER' | 'FIBER_LASER' | 'SENSOR_STATION' | 'COATING_STATION';
export type SecondFloorStationId =
  | 'computer_desk'
  | 'npc_dung'
  | 'lab_sink'
  | 'chemical_rack'
  | 'equipment_rack'
  | `table_${string}`;
export type WallSwitchId = 'aptomat_tube_lights' | 'aptomat_ceiling_lamps';
export type StationId = MachineId | SecondFloorStationId | WallSwitchId;

export type AppMode = 'WALKING' | 'TRANSITIONING' | 'INSPECTING';

export type InfoTab = 'OVERVIEW' | 'PHYSICS_PRINCIPLE' | 'COMPONENTS' | 'SPECTRUM_MATERIALS' | 'SAFETY';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface AABBBox {
  id: string;
  name: string;
  min: [number, number, number];
  max: [number, number, number];
}

export interface StationConfig {
  id: MachineId;
  name: string;
  shortName: string;
  category: string;
  wavelength: string;
  accentColor: string;
  position: [number, number, number];
  rotation: [number, number, number];
  inspectCameraPosition: [number, number, number];
  inspectLookAt: [number, number, number];
  collider: AABBBox;
}

export type CoatingFinishId =
  | 'CLEAR_GLOSS'
  | 'MATTE_BLACK'
  | 'CANDY_RED'
  | 'SAFETY_ORANGE'
  | 'TITANIUM_GOLD'
  | 'NEON_CYAN_GLOW'
  | 'NANO_HYDROPHOBIC';

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type TargetFps = 30 | 60;

export interface CoatingFinishConfig {
  id: CoatingFinishId;
  name: string;
  category: string;
  color: string;
  roughness: number;
  metalness: number;
  emissive?: string;
  emissiveIntensity?: number;
  glossUnit: string;
  dryFilmThickness: string;
  cureTimeSec: number;
  description: string;
}

export interface ProcessedJobInfo {
  machineId: MachineId;
  machineName: string;
  wavelength: string;
  material: string;
  materialName: string;
  designName: string;
  processMode: 'CUT' | 'ENGRAVE';
  powerWatts: number;
  speedMmS: number;
  frequencyKhz: number;
  energyDensityJPerMm: number;
  kerfWidthMm: number;
  hazQuality: string;
  actualDepthMm: number;
  targetThicknessMm: number;
  isCutThrough: boolean;
  cutThroughPercentage: number;
  pulseOverlapPercent: number;
  surfaceRoughnessRaUm: number;
  contrastRatioCm: number;
  surfaceFinishDescription: string;
  qualityRating: 'PERFECT' | 'OPTIMAL' | 'ACCEPTABLE' | 'POOR_OVERBURNT' | 'FAILED_UNCUT';
  scientificFeedback: string;
  timestamp: number;
}
