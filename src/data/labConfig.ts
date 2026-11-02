import { StationConfig, AABBBox } from '../types/lab';

export const ROOM_BOUNDS = {
  width: 20,
  length: 16,
  height: 4.5,
  minX: -9.5,
  maxX: 9.5,
  minZ: -7.5,
  maxZ: 7.5,
};

export const STATIONS: Record<string, StationConfig> = {
  CO2_LASER: {
    id: 'CO2_LASER',
    name: 'Máy Cắt Laser Khí CO2 Công Nghiệp',
    shortName: 'Laser CO2',
    category: 'Gia công nhiệt quang học (Thermal Cutting)',
    wavelength: '10.6 µm (Hồng ngoại xa)',
    accentColor: '#06b6d4',
    position: [-6, 0, -4],
    rotation: [0, 0, 0],
    inspectCameraPosition: [-6, 1.6, -2.4],
    inspectLookAt: [-6, 0.9, -4],
    collider: {
      id: 'collider_co2',
      name: 'Bàn máy CO2',
      min: [-7.6, 0, -5.2],
      max: [-4.4, 1.6, -2.8],
    },
  },
  UV_LASER: {
    id: 'UV_LASER',
    name: 'Máy Khắc Laser Tử Ngoại UV (Cold Ablation)',
    shortName: 'Laser UV',
    category: 'Gia công lạnh quang hóa (Photochemical)',
    wavelength: '355 nm (Tử ngoại DPSS)',
    accentColor: '#8b5cf6',
    position: [6, 0, -4],
    rotation: [0, 0, 0],
    inspectCameraPosition: [6, 1.6, -2.4],
    inspectLookAt: [6, 0.9, -4],
    collider: {
      id: 'collider_uv',
      name: 'Bàn máy UV',
      min: [4.4, 0, -5.2],
      max: [7.6, 1.7, -2.8],
    },
  },
  FIBER_LASER: {
    id: 'FIBER_LASER',
    name: 'Máy Khắc Laser Fiber Sợi Quang & Đầu Galvo',
    shortName: 'Laser Fiber',
    category: 'Khắc tốc độ cao kim loại (Near-IR)',
    wavelength: '1064 nm (Cận hồng ngoại)',
    accentColor: '#f59e0b',
    position: [-6, 0, 4],
    rotation: [0, Math.PI, 0],
    inspectCameraPosition: [-6, 1.6, 2.4],
    inspectLookAt: [-6, 0.9, 4],
    collider: {
      id: 'collider_fiber',
      name: 'Bàn máy Fiber',
      min: [-7.4, 0, 2.8],
      max: [-4.6, 1.8, 5.2],
    },
  },
  SENSOR_STATION: {
    id: 'SENSOR_STATION',
    name: 'Cụm Cảm Biến An Toàn & Giám Sát Xưởng',
    shortName: 'Cảm Biến An Toàn',
    category: 'Quang học, Lưu lượng nhiệt & Khí khói',
    wavelength: 'Cảm biến đa kênh (Multi-sensor)',
    accentColor: '#10b981',
    position: [6, 0, 4],
    rotation: [0, Math.PI, 0],
    inspectCameraPosition: [6, 1.6, 2.4],
    inspectLookAt: [6, 0.9, 4],
    collider: {
      id: 'collider_sensor',
      name: 'Bàn cảm biến',
      min: [4.5, 0, 2.8],
      max: [7.5, 1.5, 5.2],
    },
  },
};

export const WALL_COLLIDERS: AABBBox[] = [
  // Bức tường Bắc (North Wall)
  { id: 'wall_north', name: 'Tường Bắc', min: [-10.5, 0, -8.5], max: [10.5, 5, -7.5] },
  // Bức tường Nam (South Wall)
  { id: 'wall_south', name: 'Tường Nam', min: [-10.5, 0, 7.5], max: [10.5, 5, 8.5] },
  // Bức tường Tây (West Wall)
  { id: 'wall_west', name: 'Tường Tây', min: [-10.5, 0, -8.5], max: [-9.5, 5, 8.5] },
  // Bức tường Đông (East Wall)
  { id: 'wall_east', name: 'Tường Đông', min: [9.5, 0, -8.5], max: [10.5, 5, 8.5] },
];

