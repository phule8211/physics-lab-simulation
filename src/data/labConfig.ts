import { StationConfig, AABBBox } from '../types/lab';

export const ROOM_BOUNDS = {
  width: 20,
  length: 28,
  height: 4.5,
  minX: -9.5,
  maxX: 9.5,
  minZ: -15.5, // Expanded to accommodate the new spray coating room
  maxZ: 12.0, // Expanded South for the 2nd-floor research & chemistry wing
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
  COATING_STATION: {
    id: 'COATING_STATION',
    name: 'Buồng Phủ Sơn Tĩnh Điện & Sấy UV Bề Mặt',
    shortName: 'Phòng Phủ Sơn',
    category: 'Xử lý bề mặt & Đóng rắn quang học (Finishing)',
    wavelength: 'Sơn phủ & Sấy UV (395 nm)',
    accentColor: '#38bdf8',
    position: [0, 0, -12.5],
    rotation: [0, 0, 0],
    inspectCameraPosition: [0, 1.6, -10.4],
    inspectLookAt: [0, 1.0, -12.5],
    collider: {
      id: 'collider_coating',
      name: 'Buồng sơn và bàn xoay',
      min: [-2.4, 0, -14.5],
      max: [2.4, 2.6, -11.0],
    },
  },
};

export const WALL_COLLIDERS: AABBBox[] = [
  // Tường Bắc phòng chính (Chia đôi làm cửa thông phòng rộng 3.6m ở giữa x: [-1.8, 1.8])
  { id: 'wall_north_left', name: 'Tường Bắc Trái', min: [-10.5, 0, -8.5], max: [-1.8, 8, -7.5] },
  { id: 'wall_north_right', name: 'Tường Bắc Phải', min: [1.8, 0, -8.5], max: [10.5, 8, -7.5] },

  // Tường Nam phòng chính (nới rộng đến z = 12.0)
  { id: 'wall_south', name: 'Tường Nam', min: [-10.5, 0, 11.8], max: [10.5, 8, 12.8] },

  // Tường Tây phòng chính
  { id: 'wall_west', name: 'Tường Tây', min: [-10.5, 0, -8.5], max: [-9.5, 8, 12.8] },

  // Tường Đông phòng chính
  { id: 'wall_east', name: 'Tường Đông', min: [9.5, 0, -8.5], max: [10.5, 8, 12.8] },

  // CÁC BỨC TƯỜNG CỦA PHÒNG PHỦ SƠN (COATING CLEANROOM) (x: [-5.5, 5.5], z: [-16, -8])
  { id: 'wall_coating_west', name: 'Vách Tây Phòng Sơn', min: [-5.6, 0, -16.5], max: [-4.8, 8, -7.8] },
  { id: 'wall_coating_east', name: 'Vách Đông Phòng Sơn', min: [4.8, 0, -16.5], max: [5.6, 8, -7.8] },
  { id: 'wall_coating_north', name: 'Vách Sau Buồng Sơn', min: [-5.6, 0, -16.5], max: [5.6, 8, -15.2] },
];
