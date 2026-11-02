import { AABBBox } from '../types/lab';

/**
 * 2nd Floor Mezzanine Geometry & Layout Constants
 */
export const MEZZANINE_CONFIG = {
  // Height of 2nd floor surface above ground
  floorY: 3.06,
  floorThickness: 0.15,

  // Mezzanine Deck bounds on 2nd floor:
  // Spanning across South wall and East wall in a grand L-gallery
  // South gallery: X from -9.6 to 9.6, Z from 2.8 to 7.8 (area ~ 19.2m x 5.0m)
  bounds: {
    minX: -9.6,
    maxX: 9.6,
    minZ: 2.8,
    maxZ: 7.8,
  },
};

/**
 * Switchback Staircase Geometric Parameters (matching user reference images)
 * Lower flight: starts at X = 7.6, Z = 0.2 (ground level Y = 0)
 * ascends along -Z to mid-landing at Z = -2.3, Y = 1.53m
 * Landing: X from 6.2 to 8.8, Z from -2.3 to -3.8, Y = 1.53m
 * Upper flight: ascends along +Z from X = 6.4, Z = -2.3 to Z = 2.8, Y = 3.06m (connecting to 2nd floor)
 */
export const STAIRCASE_GEOMETRY = {
  stepCountPerFlight: 9,
  treadWidth: 1.15,
  treadDepth: 0.28,
  stepRise: 0.17, // 9 * 0.17 = 1.53m per flight

  // Flight 1: Lower Flight (going from Z = 0.2 down to Z = -2.32, Y = 0 to 1.53)
  flight1: {
    startX: 7.7,
    startZ: 0.2,
    directionZ: -1, // moves in -Z as it climbs
    startY: 0,
    endY: 1.53,
    steps: 9,
  },

  // Mid Landing
  landing: {
    minX: 5.9,
    maxX: 8.8,
    minZ: -3.8,
    maxZ: -2.3,
    y: 1.53,
  },

  // Flight 2: Upper Flight (parallel switchback, going from Z = -2.3 to Z = 2.8, Y = 1.53 to 3.06)
  flight2: {
    startX: 6.4,
    startZ: -2.3,
    directionZ: 1, // moves in +Z as it climbs
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

  // 1. Check if inside 2nd Floor Mezzanine bounds
  if (x >= mez.minX && x <= mez.maxX && z >= mez.minZ && z <= mez.maxZ) {
    // Top of upper flight opening
    return MEZZANINE_CONFIG.floorY;
  }

  // 2. Check if on Mid-Landing
  const l = STAIRCASE_GEOMETRY.landing;
  if (x >= l.minX && x <= l.maxX && z >= l.minZ && z <= l.maxZ) {
    return l.y;
  }

  // 3. Check if on Flight 1 (Lower Flight)
  // X between 7.1 and 8.3, Z between -2.3 and 0.4
  if (x >= 7.1 && x <= 8.3 && z >= -2.32 && z <= 0.3) {
    // As z goes from 0.2 down to -2.32, height rises from 0 to 1.53
    const progress = Math.max(0, Math.min(1, (0.2 - z) / 2.52));
    const stepIndex = Math.floor(progress * 9);
    return Math.min(1.53, stepIndex * 0.17);
  }

  // 4. Check if on Flight 2 (Upper Flight)
  // X between 5.8 and 7.0, Z between -2.3 and 2.8
  if (x >= 5.8 && x <= 7.0 && z >= -2.3 && z <= 2.8) {
    // As z goes from -2.3 up to 2.8, height rises from 1.53 to 3.06
    const progress = Math.max(0, Math.min(1, (z - (-2.3)) / 5.1));
    const stepIndex = Math.floor(progress * 9);
    return Math.min(3.06, 1.53 + stepIndex * 0.17);
  }

  // Default ground floor
  return 0;
}

/**
 * 10 Wooden Lab Tables Layout & Coordinates
 * Arranged neatly across the 2nd floor research gallery & ground floor testing area
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
  // Floor 2 Mezzanine Research Row A (Front viewing row)
  {
    id: 'table_01',
    name: 'Bàn Quang Học & Tán Sắc Laser',
    tableNumber: 1,
    position: [-7.2, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, 0, 0],
    specialty: 'OPTICS_PRISM',
    floor: 2,
  },
  {
    id: 'table_02',
    name: 'Bàn Chuẩn Độ & Hóa Chất Phản Ứng',
    tableNumber: 2,
    position: [-4.2, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, 0, 0],
    specialty: 'TITRATION_BURET',
    floor: 2,
  },
  {
    id: 'table_03',
    name: 'Bàn Kính Hiển Vi Quang Học Phân Tích',
    tableNumber: 3,
    position: [-1.2, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, 0, 0],
    specialty: 'MICROSCOPE',
    floor: 2,
  },
  {
    id: 'table_04',
    name: 'Bàn Cân Điện Tử Phân Tích Độ Chính Xác Cao',
    tableNumber: 4,
    position: [1.8, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, 0, 0],
    specialty: 'ANALYTICAL_SCALE',
    floor: 2,
  },
  {
    id: 'table_05',
    name: 'Bàn Gia Nhiệt & Chưng Cất Dung Dịch',
    tableNumber: 5,
    position: [4.6, MEZZANINE_CONFIG.floorY, 4.2],
    rotation: [0, 0, 0],
    specialty: 'DISTILLATION_BUNSEN',
    floor: 2,
  },

  // Floor 2 Mezzanine Research Row B (Rear study row)
  {
    id: 'table_06',
    name: 'Bàn Giá Ống Nghiệm & Thuốc Thử Màu',
    tableNumber: 6,
    position: [-7.2, MEZZANINE_CONFIG.floorY, 6.6],
    rotation: [0, Math.PI, 0],
    specialty: 'TEST_TUBES',
    floor: 2,
  },
  {
    id: 'table_07',
    name: 'Bàn Đo Dao Động Ký & Tín Hiệu Xung',
    tableNumber: 7,
    position: [-4.2, MEZZANINE_CONFIG.floorY, 6.6],
    rotation: [0, Math.PI, 0],
    specialty: 'OSCILLOSCOPE',
    floor: 2,
  },
  {
    id: 'table_08',
    name: 'Bàn Ly Tâm & Micropipette Định Lượng',
    tableNumber: 8,
    position: [-1.2, MEZZANINE_CONFIG.floorY, 6.6],
    rotation: [0, Math.PI, 0],
    specialty: 'CENTRIFUGE_PIPETTE',
    floor: 2,
  },
  {
    id: 'table_09',
    name: 'Bàn Bếp Khuấy Từ Gia Nhiệt Xoáy Nước',
    tableNumber: 9,
    position: [1.8, MEZZANINE_CONFIG.floorY, 6.6],
    rotation: [0, Math.PI, 0],
    specialty: 'MAGNETIC_STIRRER',
    floor: 2,
  },
  {
    id: 'table_10',
    name: 'Bàn Quang Phổ Hấp Thụ UV-Vis & Cuvet',
    tableNumber: 10,
    position: [4.6, MEZZANINE_CONFIG.floorY, 6.6],
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
  position: [-8.8, MEZZANINE_CONFIG.floorY, 5.4] as [number, number, number],
  rotation: [0, Math.PI / 2, 0] as [number, number, number],
  width: 3.4,
  height: 2.65,
  depth: 0.65,
  bottleCount: 20,
};

/**
 * Generates solid AABB Colliders for:
 * 1. 2nd Floor Mezzanine Safety Railings
 * 2. 10 Wooden Lab Tables
 * 3. Giant Bottle Shelf
 * 4. Staircase side safety barriers
 */
export const EXTRA_COLLIDERS: AABBBox[] = [
  // 1. Mezzanine Balcony Railing (South overlook rail along Z = 2.8, X = -9.6 to 5.6)
  {
    id: 'collider_mezzanine_rail_front_left',
    name: 'Lan Can Tầng 2 Trái',
    min: [-9.6, MEZZANINE_CONFIG.floorY, 2.7],
    max: [5.6, MEZZANINE_CONFIG.floorY + 1.2, 2.9],
  },
  // Mezzanine Railing along Upper Stair Opening
  {
    id: 'collider_mezzanine_rail_stair_side',
    name: 'Lan Can Hông Cầu Thang Tầng 2',
    min: [5.5, MEZZANINE_CONFIG.floorY, 2.8],
    max: [5.7, MEZZANINE_CONFIG.floorY + 1.2, 5.2],
  },

  // 2. Giant Shelf Collider
  {
    id: 'collider_giant_shelf',
    name: 'Kệ Siêu To 20 Chai Sành',
    min: [-9.3, MEZZANINE_CONFIG.floorY, 3.7],
    max: [-8.3, MEZZANINE_CONFIG.floorY + 2.7, 7.1],
  },

  // 3. 10 Wooden Lab Tables Colliders (Width 1.8m, Depth 0.85m, Height 0.9m)
  ...LAB_TABLES.map((t) => ({
    id: `collider_${t.id}`,
    name: t.name,
    min: [t.position[0] - 0.95, t.position[1], t.position[2] - 0.45] as [number, number, number],
    max: [t.position[0] + 0.95, t.position[1] + 1.2, t.position[2] + 0.45] as [number, number, number],
  })),
];

