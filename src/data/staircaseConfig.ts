import { AABBBox } from '../types/lab';

/**
 * 2nd Floor Mezzanine Geometry & Layout Constants
 * Expanded southwards to Z = 11.6 to accommodate the new Computer Desk,
 * NPC KS. Nguyễn Văn Dũng, Chemical Rack, Equipment Rack, and Water Sink.
 */
export const MEZZANINE_CONFIG = {
  // Height of 2nd floor walking surface above ground
  floorY: 3.06,
  floorThickness: 0.15,

  // Mezzanine Deck bounds on 2nd floor (South area of the lab):
  // X: -9.5 to 9.5 (width 19m)
  // Z: 3.2 to 11.6 (depth 8.4m - expanded)
  bounds: {
    minX: -9.5,
    maxX: 9.5,
    minZ: 3.2,
    maxZ: 11.6,
  },
};

/**
 * Industrial Aptomat Wall Sub-Panels on North Wall
 * CB-01: 4 Long Tube Lights at [-2.4, 1.55, -7.88]
 * CB-02: 8 Ceiling Troffer Lamps at [-1.95, 1.55, -7.88]
 */
export const WALL_SWITCHES = {
  aptomat_tube_lights: {
    id: 'aptomat_tube_lights' as const,
    name: 'Aptomat 4 Đèn Dài (CB-01)',
    shortName: 'CB-01 (4 Đèn Dài)',
    position: [-2.38, 1.55, -7.88] as [number, number, number],
  },
  aptomat_ceiling_lamps: {
    id: 'aptomat_ceiling_lamps' as const,
    name: 'Aptomat 8 Đèn Trần (CB-02)',
    shortName: 'CB-02 (8 Đèn Trần)',
    position: [-1.92, 1.55, -7.88] as [number, number, number],
  },
} as const;

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
  steps: 18,
  treadWidth: 2.2, // Wide grand straight staircase (2.2m)
  treadDepth: 0.255, // 18 * 0.255 = 4.59m (~4.6m run)
  stepRise: 0.17, // 18 * 0.17 = 3.06m rise
  startX: 2.4, // Center on X = 2.4 (runs from X = 1.3 to X = 3.5)
  startZ: 0.0,
  endZ: 4.6,
  startY: 0.0,
  endY: 3.06,
};

/**
 * Calculates the walking ground surface Y coordinate under player position (x, z)
 * Supports:
 * 1. Ground floor (Y = 0)
 * 2. Wide Single Straight Staircase (Smooth monotonic ramp from Y = 0 to 3.06m)
 * 3. 2nd Floor Mezzanine Deck (Y = 3.06m) up to Z = 11.6
 */
export function getGroundHeightAt(x: number, z: number): number {
  const mez = MEZZANINE_CONFIG.bounds;

  // 1. Check if on the Straight Grand Staircase (Width 2.2m centered at X = 2.4, Z from -0.1 to 4.65)
  if (x >= 1.25 && x <= 3.55 && z >= -0.15 && z <= 4.65) {
    const progress = Math.max(0, Math.min(1, Math.max(0, z) / 4.6));
    return progress * 3.06;
  }

  // 2. Check if on 2nd Floor Mezzanine (Z: 3.2 to 11.6, X: -9.5 to 9.5)
  if (x >= mez.minX && x <= mez.maxX && z >= mez.minZ && z <= mez.maxZ) {
    // If inside the stairwell opening below the top step (x in [1.25, 3.55], z < 4.6)
    if (x >= 1.25 && x <= 3.55 && z < 4.6) {
      const progress = Math.max(0, Math.min(1, Math.max(0, z) / 4.6));
      return progress * 3.06;
    }
    return MEZZANINE_CONFIG.floorY; // 3.06
  }

  // Default ground floor
  return 0;
}

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
  // Floor 2 Mezzanine Research Row A (Middle row, facing North with wide open space in front)
  {
    id: 'table_01',
    name: 'Bàn Quang Học & Tán Sắc Laser',
    tableNumber: 1,
    position: [-6.8, MEZZANINE_CONFIG.floorY, 6.8],
    rotation: [0, 0, 0],
    specialty: 'OPTICS_PRISM',
    floor: 2,
  },
  {
    id: 'table_02',
    name: 'Bàn Chuẩn Độ & Hóa Chất Phản Ứng',
    tableNumber: 2,
    position: [-3.8, MEZZANINE_CONFIG.floorY, 6.8],
    rotation: [0, 0, 0],
    specialty: 'TITRATION_BURET',
    floor: 2,
  },
  {
    id: 'table_03',
    name: 'Bàn Kính Hiển Vi Quang Học Phân Tích',
    tableNumber: 3,
    position: [-0.8, MEZZANINE_CONFIG.floorY, 6.8],
    rotation: [0, 0, 0],
    specialty: 'MICROSCOPE',
    floor: 2,
  },
  {
    id: 'table_04',
    name: 'Bàn Cân Điện Tử Phân Tích Độ Chính Xác Cao',
    tableNumber: 4,
    position: [3.0, MEZZANINE_CONFIG.floorY, 6.8],
    rotation: [0, 0, 0],
    specialty: 'ANALYTICAL_SCALE',
    floor: 2,
  },
  {
    id: 'table_05',
    name: 'Bàn Gia Nhiệt & Chưng Cất Dung Dịch',
    tableNumber: 5,
    position: [6.8, MEZZANINE_CONFIG.floorY, 6.8],
    rotation: [0, 0, 0],
    specialty: 'DISTILLATION_BUNSEN',
    floor: 2,
  },

  // Floor 2 Mezzanine Research Row B (Front row overlooking ground floor, leaving wide walkways)
  {
    id: 'table_06',
    name: 'Bàn Giá Ống Nghiệm & Thuốc Thử Màu',
    tableNumber: 6,
    position: [-6.8, MEZZANINE_CONFIG.floorY, 4.8],
    rotation: [0, Math.PI, 0],
    specialty: 'TEST_TUBES',
    floor: 2,
  },
  {
    id: 'table_07',
    name: 'Bàn Đo Dao Động Ký & Tín Hiệu Xung',
    tableNumber: 7,
    position: [-3.8, MEZZANINE_CONFIG.floorY, 4.8],
    rotation: [0, Math.PI, 0],
    specialty: 'OSCILLOSCOPE',
    floor: 2,
  },
  {
    id: 'table_08',
    name: 'Bàn Ly Tâm & Micropipette Định Lượng',
    tableNumber: 8,
    position: [-0.8, MEZZANINE_CONFIG.floorY, 4.8],
    rotation: [0, Math.PI, 0],
    specialty: 'CENTRIFUGE_PIPETTE',
    floor: 2,
  },
  {
    id: 'table_09',
    name: 'Bàn Bếp Khuấy Từ Gia Nhiệt Xoáy Nước',
    tableNumber: 9,
    position: [5.5, MEZZANINE_CONFIG.floorY, 4.8],
    rotation: [0, Math.PI, 0],
    specialty: 'MAGNETIC_STIRRER',
    floor: 2,
  },
  {
    id: 'table_10',
    name: 'Bàn Quang Phổ Hấp Thụ UV-Vis & Cuvet',
    tableNumber: 10,
    position: [7.8, MEZZANINE_CONFIG.floorY, 4.8],
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
  position: [-8.8, MEZZANINE_CONFIG.floorY, 5.8] as [number, number, number],
  rotation: [0, Math.PI / 2, 0] as [number, number, number],
  width: 3.2,
  height: 2.65,
  depth: 0.65,
  bottleCount: 20,
};

/**
 * New 2nd Floor Research Wing Stations Configuration
 */
export const SECOND_FLOOR_STATIONS = {
  // Computer Desk with PC Tower, Dual Monitors, and Laptop on Stand
  COMPUTER_DESK: {
    id: 'computer_desk',
    name: 'Bàn Máy Tính Phân Tích & Giám Sát Laser',
    position: [-6.0, MEZZANINE_CONFIG.floorY, 9.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  // NPC Instructor Nguyễn Văn Dũng
  NPC_DUNG: {
    id: 'npc_dung',
    name: 'KS. Nguyễn Văn Dũng',
    title: 'Kỹ sư Trưởng / Cố vấn Kỹ thuật Xưởng Bán Dẫn & Laser',
    position: [-4.0, MEZZANINE_CONFIG.floorY, 9.8] as [number, number, number],
    rotation: [0, -Math.PI / 4, 0] as [number, number, number],
  },
  // Laboratory Gooseneck Water Sink & Faucet
  LAB_SINK: {
    id: 'lab_sink',
    name: 'Bồn Nước & Vòi Cổ Ngỗng Cấp Nước Khử Ion DI',
    position: [0.0, MEZZANINE_CONFIG.floorY, 9.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  // Chemical Reagent Storage Rack (HCl, HNO3, H2O2 & Large Beakers) - Positioned directly West (-X) of Equipment Rack
  CHEMICAL_RACK: {
    id: 'chemical_rack',
    name: 'Giá Đỡ Hóa Chất Ăn Mòn Wafer (HCl, HNO3, H2O2)',
    position: [5.4, MEZZANINE_CONFIG.floorY, 9.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
  // Laboratory Glassware & Equipment Rack (Large Beakers, Test Tubes, Pipettes)
  EQUIPMENT_RACK: {
    id: 'equipment_rack',
    name: 'Giá Đỡ Dụng Cụ Thí Nghiệm (Cốc to, Tuýp nhỏ, Ống hút)',
    position: [7.5, MEZZANINE_CONFIG.floorY, 9.8] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
  },
} as const;

/**
 * Generates solid AABB Colliders for:
 * 1. 2nd Floor Mezzanine Safety Railings
 * 2. 10 Wooden Lab Tables
 * 3. Giant Bottle Shelf
 * 4. Computer Desk, Water Sink, Chemical Rack, Equipment Rack
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
    min: [3.55, MEZZANINE_CONFIG.floorY, 3.1],
    max: [9.5, MEZZANINE_CONFIG.floorY + 1.2, 3.3],
  },
  // Side Railing along Flight 2 stair opening from Z = 3.2 to Z = 4.68 at X = 1.25
  {
    id: 'collider_stair_side_rail_left',
    name: 'Lan Can Hông Trái Giếng Thang',
    min: [1.15, MEZZANINE_CONFIG.floorY, 3.15],
    max: [1.27, MEZZANINE_CONFIG.floorY + 1.2, 4.6],
  },
  // Side Railing along Flight 2 stair opening from Z = 3.2 to Z = 4.68 at X = 2.45
  {
    id: 'collider_stair_side_rail_right',
    name: 'Lan Can Hông Phải Giếng Thang',
    min: [3.53, MEZZANINE_CONFIG.floorY, 3.15],
    max: [3.65, MEZZANINE_CONFIG.floorY + 1.2, 4.6],
  },

  // 1b. Sloped Staircase Railings (Left side: X in [1.18, 1.38], Right side: X in [3.42, 3.62] from Z = -0.1 to 4.65)
  ...Array.from({ length: 8 }).map((_, i) => {
    const zMin = -0.1 + i * (4.75 / 8);
    const zMax = -0.1 + (i + 1) * (4.75 / 8);
    const groundY = Math.max(0, (i / 8) * 3.06);
    const topY = ((i + 1) / 8) * 3.06 + 1.25;
    return {
      id: `collider_stair_rail_left_seg_${i}`,
      name: `Lan Can Cầu Thang Trái - Đoạn ${i + 1}`,
      min: [1.18, groundY, zMin] as [number, number, number],
      max: [1.38, topY, zMax] as [number, number, number],
    };
  }),
  ...Array.from({ length: 8 }).map((_, i) => {
    const zMin = -0.1 + i * (4.75 / 8);
    const zMax = -0.1 + (i + 1) * (4.75 / 8);
    const groundY = Math.max(0, (i / 8) * 3.06);
    const topY = ((i + 1) / 8) * 3.06 + 1.25;
    return {
      id: `collider_stair_rail_right_seg_${i}`,
      name: `Lan Can Cầu Thang Phải - Đoạn ${i + 1}`,
      min: [3.42, groundY, zMin] as [number, number, number],
      max: [3.62, topY, zMax] as [number, number, number],
    };
  }),

  // 2. Giant Shelf Collider
  {
    id: 'collider_giant_shelf',
    name: 'Kệ Siêu To 20 Chai Sành',
    min: [-9.3, MEZZANINE_CONFIG.floorY, 4.2],
    max: [-8.3, MEZZANINE_CONFIG.floorY + 2.7, 7.4],
  },

  // 3. 10 Wooden Lab Tables Colliders (Width 1.4m, Depth 0.7m, Height 0.9m)
  ...LAB_TABLES.map((t) => ({
    id: `collider_${t.id}`,
    name: t.name,
    min: [t.position[0] - 0.7, t.position[1], t.position[2] - 0.35] as [number, number, number],
    max: [t.position[0] + 0.7, t.position[1] + 1.0, t.position[2] + 0.35] as [number, number, number],
  })),

  // 4. New Wing Colliders (Computer Desk, Sink, Chemical Rack, Equipment Rack)
  {
    id: 'collider_computer_desk',
    name: 'Bàn Máy Tính Phân Tích & KS Dũng',
    min: [-6.8, MEZZANINE_CONFIG.floorY, 9.4],
    max: [-5.2, MEZZANINE_CONFIG.floorY + 1.3, 10.4],
  },
  {
    id: 'collider_lab_sink',
    name: 'Bồn Nước & Vòi Rửa Cổ Ngỗng',
    min: [-0.9, MEZZANINE_CONFIG.floorY, 9.4],
    max: [0.9, MEZZANINE_CONFIG.floorY + 1.3, 10.4],
  },
  {
    id: 'collider_chemical_rack',
    name: 'Giá Đỡ Hóa Chất Wafer',
    min: [4.6, MEZZANINE_CONFIG.floorY, 9.4],
    max: [6.2, MEZZANINE_CONFIG.floorY + 1.5, 10.4],
  },
  {
    id: 'collider_equipment_rack',
    name: 'Giá Đỡ Dụng Cụ Thí Nghiệm',
    min: [6.7, MEZZANINE_CONFIG.floorY, 9.4],
    max: [8.3, MEZZANINE_CONFIG.floorY + 1.5, 10.4],
  },

  // 5. Auxiliary Equipment Colliders (Industrial Chillers CW-5200 on Ground Floor)
  {
    id: 'collider_chiller_co2',
    name: 'Máy Làm Mát Chiller CW-5200 (CO2)',
    min: [-8.2, 0, -5.8],
    max: [-7.4, 1.2, -5.0],
  },
  {
    id: 'collider_chiller_uv',
    name: 'Máy Làm Mát Chiller CW-5200 (UV)',
    min: [7.4, 0, -5.8],
    max: [8.2, 1.2, -5.0],
  },
];
