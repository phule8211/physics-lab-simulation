export type MachineId = 'CO2_LASER' | 'UV_LASER' | 'FIBER_LASER' | 'SENSOR_STATION';

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

