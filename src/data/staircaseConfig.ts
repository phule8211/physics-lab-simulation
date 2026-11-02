import { AABBBox } from '../types/lab';

/**
 * 2nd Floor Mezzanine Geometry & Layout Constants
 */
export const MEZZANINE_CONFIG = {
  // Height of 2nd floor walking surface above ground
  floorY: 3.06,
  floorThickness: 0.15,

  // Mezzanine Deck bounds on 2nd floor (South area of the lab):
  // X: -9.5 to 9.5 (width 19m)
  // Z: 3.2 to 7.4 (depth 4.2m)
  bounds: {
    minX: -9.5,
    maxX: 9.5,
    minZ: 3.2,
    maxZ: 7.4,
  },
};

/**
 * Switchback Staircase Geometric Parameters
 * Entirely positioned in the SOUTH (Z >= 0.0), ascending towards +Z (South)
 * completely clear of all cutting machines (CO2, UV are at Z = -4) and Sensor Station (X >= 4.5)
 *
 * Flight 1: Starts at X = 2.85, Z = 0.0 (ground Y = 0), climbs along +Z to Z = 1.98, Y = 1.53m
 * Mid-Landing: X from 1.25 to 3.45, Z from 1.98 to 2.70, Y = 1.53m
 * Flight 2: Starts at X = 1.85, Z = 2.70, climbs along +Z to Z = 4.68, Y = 3.06m (lands on 2nd floor mezzanine)
 */
export const STAIRCASE_GEOMETRY = {
  stepCountPerFlight: 9,
  treadWidth: 1.15,
  treadDepth: 0.22,
  stepRise: 0.17, // 9 * 0.17 = 1.53m per flight

  // Flight 1: Lower Flight (going along +Z from Z = 0.0 to Z = 1.98, Y = 0 to 1.53)
  flight1: {
    startX: 2.85,
    startZ: 0.0,
    directionZ: 1, // climbs South towards +Z
    startY: 0,
    endY: 1.53,
    steps: 9,
  },

  // Mid Landing
  landing: {
    minX: 1.25,
    maxX: 3.45,
    minZ: 1.98,
    maxZ: 2.70,
    y: 1.53,
  },

  // Flight 2: Upper Flight (parallel switchback, going along +Z from Z = 2.70 to Z = 4.68, Y = 1.53 to 3.06)
  flight2: {
    startX: 1.85,
    startZ: 2.70,
    directionZ: 1, // climbs South towards +Z
    startY: 1.53,
    endY: 3.06,
    steps: 9,
  },
};

/**
 * Calculates the walking ground surface Y coordinate under player position (x, z)
 * Supports:
 * 1. Ground floor (Y = 0)
 * 2. Staircase Flight 1 (smooth step height Y = 0 to 1.53)
 * 3. Mid-landing (Y = 1.53)
 * 4. Staircase Flight 2 (smooth step height Y = 1.53 to 3.06)
 * 5. 2nd Floor Mezzanine (Y = 3.06)
 */
export function getGroundHeightAt(x: number, z: number): number {
  const mez = MEZZANINE_CONFIG.bounds;

  // 1. Check if on Flight 1 (Lower flight climbing South from Z = 0.0 to 1.98)
  if (x >= 2.2 && x <= 3.5 && z >= -0.1 && z <= 2.05) {
    const progress = Math.max(0, Math.min(1, Math.max(0, z) / 1.98));
    return progress * 1.53;
  }

  // 2. Check if on Mid-Landing (Y = 1.53)
  if (x >= 1.25 && x <= 3.5 && z >= 1.98 && z <= 2.70) {
    return 1.53;
  }

  // 3. Check if on Flight 2 (Upper flight climbing South from Z = 2.70 to 4.68)
  if (x >= 1.25 && x <= 2.45 && z >= 2.65 && z <= 4.75) {
    const progress = Math.max(0, Math.min(1, (z - 2.70) / 1.98));
    return 1.53 + progress * 1.53;
  }

  // 4. Check if on 2nd Floor Mezzanine (excluding stairwell opening)
  if (x >= mez.minX && x <= mez.maxX && z >= mez.minZ && z <= mez.maxZ) {
    // If inside the stairwell opening below the top landing, keep flight 2 height
    if (x >= 1.25 && x <= 2.45 && z < 4.68) {
      const progress = Math.max(0, Math.min(1, (z - 2.70) / 1.98));
      return 1.53 + progress * 1.53;
    }
    return MEZZANINE_CONFIG.floorY; // 3.06
  }

  // Default ground floor
  return 0;
}

/**
 * 10 Wooden Lab Tables Layout & Coordinates
 * Arranged neatly across the 2nd floor research gallery with wide, comfortable walkways
 */
export interface LabTableConfig {
  id: string;
  name: string;
  tableNumber: number;
  position: [number, number, number];
  rotation: [number, number, number];
  specialty: string;
  floor: 1 | 2;
}

export const LAB_TABLES: LabTableConfig[] = [
  // Floor 2 Mezzanine Research Row A (South wall row, facing North with wide open space in front)
  {
    id: 'table_01',
    name: 'Bàn Quang Học & Tán Sắc Laser',
    tableNumber: 1,
    position: [-6.8, MEZZANINE_CONFIG.floorY, 6.3],
    rotation: [0, 0, 0],
    specialty: 'OPTICS_PRISM',
    floor: 2,
  },
  {
    id: 'table_02',
    name: 'Bàn Chuẩn Độ & Hóa Chất Phản Ứng',
    tableNumber: 2,
    position: [-3.8, MEZZANINE_CONFIG.floorY, 6.3],
    rotation: [0, 0, 0],
    specialty: 'TITRATION_BURET',
    floor: 2,
  },
  {
    id: 'table_03',
    name: 'Bàn Kính Hiển Vi Quang Học Phân Tích',
    tableNumber: 3,
    position: [-0.8, MEZZANINE_CONFIG.floorY, 6.3],
    rotation: [0, 0, 0],
    specialty: 'MICROSCOPE',
    floor: 2,
  },
  {
    id: 'table_04',
    name: 'Bàn Cân Điện Tử Phân Tích Độ Chính Xác Cao',
    tableNumber: 4,
    position: [3.8, MEZZANINE_CONFIG.floorY, 6.3],
    rotation: [0, 0, 0],
    specialty: 'ANALYTICAL_SCALE',
    floor: 2,
  },
  {
    id: 'table_05',
    name: 'Bàn Gia Nhiệt & Chưng Cất Dung Dịch',
    tableNumber: 5,
    position: [6.8, MEZZANINE_CONFIG.floorY, 6.3],
    rotation: [0, 0, 0],
    specialty: 'DISTILLATION_BUNSEN',
    floor: 2,
  },

  // Floor 2 Mezzanine Research Row B (Front row overlooking ground floor, leaving wide walkways)
  {
    id: 'table_06',
    name: 'Bàn Giá Ống Nghiệm & Thuốc Thử Màu',
    tableNumber: 6,
    position: [-6.8, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, Math.PI, 0],
    specialty: 'TEST_TUBES',
    floor: 2,
  },
  {
    id: 'table_07',
    name: 'Bàn Đo Dao Động Ký & Tín Hiệu Xung',
    tableNumber: 7,
    position: [-3.8, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, Math.PI, 0],
    specialty: 'OSCILLOSCOPE',
    floor: 2,
  },
  {
    id: 'table_08',
    name: 'Bàn Ly Tâm & Micropipette Định Lượng',
    tableNumber: 8,
    position: [-0.8, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, Math.PI, 0],
    specialty: 'CENTRIFUGE_PIPETTE',
    floor: 2,
  },
  {
    id: 'table_09',
    name: 'Bàn Bếp Khuấy Từ Gia Nhiệt Xoáy Nước',
    tableNumber: 9,
    position: [5.5, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, Math.PI, 0],
    specialty: 'MAGNETIC_STIRRER',
    floor: 2,
  },
  {
    id: 'table_10',
    name: 'Bàn Quang Phổ Hấp Thụ UV-Vis & Cuvet',
    tableNumber: 10,
    position: [7.8, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, Math.PI, 0],
    specialty: 'SPECTROPHOTOMETER',
    floor: 2,
  },
];

/**
 * Giant Ceramic Storage Shelf Configuration
 * Positioned on 2nd Floor Mezzanine against the West wall
 * Holds 20 round-bottom 2.5L stoneware bottles
 */
export const GIANT_SHELF_CONFIG = {
  id: 'giant_shelf_bottles',
  name: 'Kệ Siêu To Lưu Trữ 20 Bình Sành Đáy Tròn 2.5L',
  position: [-8.8, MEZZANINE_CONFIG.floorY, 5.3] as [number, number, number],
  rotation: [0, Math.PI / 2, 0] as [number, number, number],
  width: 3.2,
  height: 2.65,
  depth: 0.65,
  bottleCount: 20,
};

/**
 * Generates solid AABB Colliders for:
 * 1. 2nd Floor Mezzanine Safety Railings (with stair entrance opening left clear)
 * 2. 10 Wooden Lab Tables
 * 3. Giant Bottle Shelf
 */
export const EXTRA_COLLIDERS: AABBBox[] = [
  // 1. Mezzanine Balcony Railing: Left section from X = -9.5 to X = 1.25 at Z = 3.2
  {
    id: 'collider_mezzanine_rail_left',
    name: 'Lan Can Tầng 2 Trái',
    min: [-9.5, MEZZANINE_CONFIG.floorY, 3.1],
    max: [1.25, MEZZANINE_CONFIG.floorY + 1.2, 3.3],
  },
  // Mezzanine Balcony Railing: Right section from X = 2.45 to X = 9.5 at Z = 3.2
  {
    id: 'collider_mezzanine_rail_right',
    name: 'Lan Can Tầng 2 Phải',
    min: [2.45, MEZZANINE_CONFIG.floorY, 3.1],
    max: [9.5, MEZZANINE_CONFIG.floorY + 1.2, 3.3],
  },
  // Side Railing along Flight 2 stair opening from Z = 3.2 to Z = 4.68 at X = 1.25
  {
    id: 'collider_stair_side_rail_left',
    name: 'Lan Can Hông Trái Giếng Thang',
    min: [1.15, MEZZANINE_CONFIG.floorY, 3.15],
    max: [1.27, MEZZANINE_CONFIG.floorY + 1.2, 4.68],
  },
  // Side Railing along Flight 2 stair opening from Z = 3.2 to Z = 4.68 at X = 2.45
  {
    id: 'collider_stair_side_rail_right',
    name: 'Lan Can Hông Phải Giếng Thang',
    min: [2.43, MEZZANINE_CONFIG.floorY, 3.15],
    max: [2.55, MEZZANINE_CONFIG.floorY + 1.2, 4.68],
  },

  // 2. Giant Shelf Collider
  {
    id: 'collider_giant_shelf',
    name: 'Kệ Siêu To 20 Chai Sành',
    min: [-9.3, MEZZANINE_CONFIG.floorY, 3.7],
    max: [-8.3, MEZZANINE_CONFIG.floorY + 2.7, 6.9],
  },

  // 3. 10 Wooden Lab Tables Colliders (Width 1.4m, Depth 0.7m, Height 0.9m)
  ...LAB_TABLES.map((t) => ({
    id: `collider_${t.id}`,
    name: t.name,
    min: [t.position[0] - 0.7, t.position[1], t.position[2] - 0.35] as [number, number, number],
    max: [t.position[0] + 0.7, t.position[1] + 1.0, t.position[2] + 0.35] as [number, number, number],
  })),
];
