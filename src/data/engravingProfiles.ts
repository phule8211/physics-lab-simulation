import { MaterialType } from './materialsConfig';

export type EngravingMode = 'vector-scoring' | 'raster-engraving' | 'relief-2.5d';

export type LaserSourceType = 'CO2' | 'FIBER_MOPA' | 'FIBER_Q_SWITCHED' | 'UV_DPSS';

export type AssistGasType = 'AIR' | 'N2' | 'O2' | 'ARGON' | 'NONE';

export type VisualPhenomenonType =
  | 'carbonization-haz'
  | 'frosted-cracking'
  | 'color-annealing'
  | 'zero-haz-cold-peel';

export interface EngravingPhysicalParameters {
  powerPercent: number;          // Laser output power percentage (1 - 100%)
  scanSpeedMmS: number;          // Traverse/galvo scanning speed in mm/s
  pulseFrequencyKhz: number;      // Pulse repetition rate in kHz (20 - 200 kHz, up to 4000 kHz)
  pulseWidthNs: number;          // Pulse duration in nanoseconds (2 - 500 ns for MOPA)
  lineIntervalMm: number;        // Hatch/raster line pitch in mm (0.01 - 0.25 mm)
  dpi: number;                   // Resolution equivalent (DPI = 25.4 / lineIntervalMm)
  passes: number;                // Multi-pass count (1 for vector, 1-3 raster, 5-40 relief)
  depthPerPassMm: number;        // Material ablation depth per scan pass in mm
  totalExpectedDepthMm: number;  // Cumulative expected ablation depth in mm
  focalOffsetMm: number;         // Focal plane offset (0 = surface, negative = below surface)
  assistGas: AssistGasType;      // Co-axial assist gas type
  gasPressureBar: number;        // Assist gas delivery pressure in bar
  kerfWidthMm: number;           // Focused laser spot diameter / kerf width in mm
  hazRadiusMm: number;           // Thermal Heat-Affected Zone (HAZ) radius in mm
}

export interface EngravingProfile {
  id: string;
  name: string;
  mode: EngravingMode;
  materialId: MaterialType;
  laserSource: LaserSourceType;
  description: string;
  params: EngravingPhysicalParameters;
  visualPhenomenon: {
    type: VisualPhenomenonType;
    baseColor: string;
    engravedColor: string;
    hazColor?: string;
    roughness: number;
    metalness: number;
    filmThicknessNm?: number;    // Nanometer oxide film thickness for thin-film interference
  };
}

export function calculateDPI(lineIntervalMm: number): number {
  if (lineIntervalMm <= 0) return 0;
  return Math.round(25.4 / lineIntervalMm);
}

export function calculateLineIntervalMm(dpi: number): number {
  if (dpi <= 0) return 0.1;
  return Number((25.4 / dpi).toFixed(4));
}

export const ENGRAVING_PROFILES: Record<string, EngravingProfile> = {
  // ==========================================
  // 1. WOOD (Birch Plywood / Natural Hardwood)
  // ==========================================
  WOOD_CO2_VECTOR_SCORE: {
    id: 'WOOD_CO2_VECTOR_SCORE',
    name: 'Gỗ - Vạch Vector Tốc Độ Cao (Outline Scoring)',
    mode: 'vector-scoring',
    materialId: 'WOOD',
    laserSource: 'CO2',
    description: 'Vạch đường viền mảnh tốc độ cao tạo nét cháy nâu tinh xảo, rãnh sâu nông 0.08mm không cháy loang.',
    params: {
      powerPercent: 18,
      scanSpeedMmS: 480,
      pulseFrequencyKhz: 30,
      pulseWidthNs: 150,
      lineIntervalMm: 0.15,
      dpi: calculateDPI(0.15),
      passes: 1,
      depthPerPassMm: 0.08,
      totalExpectedDepthMm: 0.08,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.5,
      kerfWidthMm: 0.14,
      hazRadiusMm: 0.35,
    },
    visualPhenomenon: {
      type: 'carbonization-haz',
      baseColor: '#d97706',
      engravedColor: '#1c140e',
      hazColor: '#78350f',
      roughness: 0.95,
      metalness: 0.0,
    },
  },

  WOOD_CO2_RASTER_ENGRAVE: {
    id: 'WOOD_CO2_RASTER_ENGRAVE',
    name: 'Gỗ - Khắc Mảng Raster Bi-directional (Halftone Charcoal)',
    mode: 'raster-engraving',
    materialId: 'WOOD',
    laserSource: 'CO2',
    description: 'Quét raster hai chiều kết hợp tán sắc Floyd-Steinberg, tạo mảng khắc carbon hóa đen tuyền độ tương phản cao.',
    params: {
      powerPercent: 32,
      scanSpeedMmS: 650,
      pulseFrequencyKhz: 45,
      pulseWidthNs: 180,
      lineIntervalMm: 0.08,
      dpi: calculateDPI(0.08),
      passes: 1,
      depthPerPassMm: 0.18,
      totalExpectedDepthMm: 0.18,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.8,
      kerfWidthMm: 0.15,
      hazRadiusMm: 0.45,
    },
    visualPhenomenon: {
      type: 'carbonization-haz',
      baseColor: '#d97706',
      engravedColor: '#140d07',
      hazColor: '#5c2d12',
      roughness: 0.98,
      metalness: 0.0,
    },
  },

  WOOD_CO2_DEEP_RELIEF: {
    id: 'WOOD_CO2_DEEP_RELIEF',
    name: 'Gỗ - Khắc Nổi Phù Điêu 3D (Deep 2.5D Bas-Relief)',
    mode: 'relief-2.5d',
    materialId: 'WOOD',
    laserSource: 'CO2',
    description: 'Bóc lớp nhiều chu kỳ (15 lượt) theo bản đồ độ sâu grayscale, tạo phù điêu xúc giác nổi sâu 1.2mm.',
    params: {
      powerPercent: 82,
      scanSpeedMmS: 240,
      pulseFrequencyKhz: 25,
      pulseWidthNs: 220,
      lineIntervalMm: 0.05,
      dpi: calculateDPI(0.05),
      passes: 15,
      depthPerPassMm: 0.08,
      totalExpectedDepthMm: 1.20,
      focalOffsetMm: -0.5,
      assistGas: 'AIR',
      gasPressureBar: 2.5,
      kerfWidthMm: 0.16,
      hazRadiusMm: 0.60,
    },
    visualPhenomenon: {
      type: 'carbonization-haz',
      baseColor: '#d97706',
      engravedColor: '#0a0604',
      hazColor: '#451a03',
      roughness: 1.0,
      metalness: 0.0,
    },
  },

  // ==========================================
  // 2. ACRYLIC (Cast PMMA Plexiglass)
  // ==========================================
  ACRYLIC_CO2_VECTOR_SCORE: {
    id: 'ACRYLIC_CO2_VECTOR_SCORE',
    name: 'Mica - Vạch Nét Viền Sắc Cạnh (Flame Polished Groove)',
    mode: 'vector-scoring',
    materialId: 'ACRYLIC',
    laserSource: 'CO2',
    description: 'Tia CO2 bốc hơi PMMA cục bộ, để lại rãnh dẫn sáng bóng kính trong suốt sâu 0.07mm.',
    params: {
      powerPercent: 15,
      scanSpeedMmS: 420,
      pulseFrequencyKhz: 22,
      pulseWidthNs: 100,
      lineIntervalMm: 0.12,
      dpi: calculateDPI(0.12),
      passes: 1,
      depthPerPassMm: 0.07,
      totalExpectedDepthMm: 0.07,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.4,
      kerfWidthMm: 0.12,
      hazRadiusMm: 0.06,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#38bdf8',
      engravedColor: '#e0f2fe',
      hazColor: '#bae6fd',
      roughness: 0.15,
      metalness: 0.05,
    },
  },

  ACRYLIC_CO2_RASTER_ENGRAVE: {
    id: 'ACRYLIC_CO2_RASTER_ENGRAVE',
    name: 'Mica - Khắc Mờ Tán Xạ Trắng Sữa (Frosted Micro-Bubble)',
    mode: 'raster-engraving',
    materialId: 'ACRYLIC',
    laserSource: 'CO2',
    description: 'Tạo bọt khí vi mô và bề mặt vi cầu khuếch tán ánh sáng trắng sữa rực rỡ dưới đèn nền LED.',
    params: {
      powerPercent: 26,
      scanSpeedMmS: 820,
      pulseFrequencyKhz: 40,
      pulseWidthNs: 120,
      lineIntervalMm: 0.06,
      dpi: calculateDPI(0.06),
      passes: 1,
      depthPerPassMm: 0.14,
      totalExpectedDepthMm: 0.14,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.6,
      kerfWidthMm: 0.13,
      hazRadiusMm: 0.08,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#38bdf8',
      engravedColor: '#ffffff',
      hazColor: '#f0f9ff',
      roughness: 0.88,
      metalness: 0.02,
    },
  },

  ACRYLIC_CO2_DEEP_RELIEF: {
    id: 'ACRYLIC_CO2_DEEP_RELIEF',
    name: 'Mica - Khắc Nổi Lớp Thấu Quang 2.5D (Light Guide Relief)',
    mode: 'relief-2.5d',
    materialId: 'ACRYLIC',
    laserSource: 'CO2',
    description: 'Gia công phù điêu nhiều lớp sâu 1.0mm với góc nghiêng vát quang học gom ánh sáng mép.',
    params: {
      powerPercent: 68,
      scanSpeedMmS: 320,
      pulseFrequencyKhz: 32,
      pulseWidthNs: 160,
      lineIntervalMm: 0.05,
      dpi: calculateDPI(0.05),
      passes: 12,
      depthPerPassMm: 0.085,
      totalExpectedDepthMm: 1.02,
      focalOffsetMm: -0.4,
      assistGas: 'AIR',
      gasPressureBar: 1.5,
      kerfWidthMm: 0.14,
      hazRadiusMm: 0.10,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#38bdf8',
      engravedColor: '#f8fafc',
      hazColor: '#e2e8f0',
      roughness: 0.72,
      metalness: 0.05,
    },
  },

  // ==========================================
  // 3. STEEL (Stainless Steel 304 / Titanium)
  // ==========================================
  STEEL_FIBER_COLOR_ANNEAL_GOLD: {
    id: 'STEEL_FIBER_COLOR_ANNEAL_GOLD',
    name: 'Inox 304 - Khắc Màu Vàng Hoàng Gia (Gold Oxide Annealing)',
    mode: 'surface-engrave' as unknown as EngravingMode, // compatible fallback
    materialId: 'STEEL',
    laserSource: 'FIBER_MOPA',
    description: 'Ủ nhiệt MOPA Fiber tạo màng oxit titan/crom giao thoa sóng mỏng 50nm màu vàng kim, không lõm phôi.',
    params: {
      powerPercent: 28,
      scanSpeedMmS: 420,
      pulseFrequencyKhz: 140,
      pulseWidthNs: 45,
      lineIntervalMm: 0.015,
      dpi: calculateDPI(0.015),
      passes: 1,
      depthPerPassMm: 0.002,
      totalExpectedDepthMm: 0.002,
      focalOffsetMm: 0.2, // defocus slightly for controlled oxide heating
      assistGas: 'NONE',
      gasPressureBar: 0.0,
      kerfWidthMm: 0.035,
      hazRadiusMm: 0.05,
    },
    visualPhenomenon: {
      type: 'color-annealing',
      baseColor: '#94a3b8',
      engravedColor: '#facc15',
      hazColor: '#ca8a04',
      roughness: 0.20,
      metalness: 0.92,
      filmThicknessNm: 52,
    },
  },

  STEEL_FIBER_COLOR_ANNEAL_BLUE: {
    id: 'STEEL_FIBER_COLOR_ANNEAL_BLUE',
    name: 'Inox 304 - Khắc Màu Lam Cobalt (Cobalt Blue Annealing)',
    mode: 'raster-engraving',
    materialId: 'STEEL',
    laserSource: 'FIBER_MOPA',
    description: 'Ủ nhiệt tạo màng oxit pha dày 210nm giao thoa màu xanh coban huyền ảo, bề mặt nhẵn bóng.',
    params: {
      powerPercent: 36,
      scanSpeedMmS: 340,
      pulseFrequencyKhz: 110,
      pulseWidthNs: 65,
      lineIntervalMm: 0.012,
      dpi: calculateDPI(0.012),
      passes: 1,
      depthPerPassMm: 0.003,
      totalExpectedDepthMm: 0.003,
      focalOffsetMm: 0.15,
      assistGas: 'NONE',
      gasPressureBar: 0.0,
      kerfWidthMm: 0.035,
      hazRadiusMm: 0.06,
    },
    visualPhenomenon: {
      type: 'color-annealing',
      baseColor: '#94a3b8',
      engravedColor: '#2563eb',
      hazColor: '#1d4ed8',
      roughness: 0.22,
      metalness: 0.90,
      filmThicknessNm: 215,
    },
  },

  STEEL_FIBER_VECTOR_SCORE: {
    id: 'STEEL_FIBER_VECTOR_SCORE',
    name: 'Inox 304 - Vạch Viền Đen Tương Phản (High-Contrast Black Mark)',
    mode: 'vector-scoring',
    materialId: 'STEEL',
    laserSource: 'FIBER_MOPA',
    description: 'Khắc vạch vi mô tốc độ cao quét Galvo 1500 mm/s, tạo rãnh đen nano chống mài mòn hóa chất.',
    params: {
      powerPercent: 42,
      scanSpeedMmS: 1500,
      pulseFrequencyKhz: 85,
      pulseWidthNs: 25,
      lineIntervalMm: 0.03,
      dpi: calculateDPI(0.03),
      passes: 1,
      depthPerPassMm: 0.05,
      totalExpectedDepthMm: 0.05,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 1.0,
      kerfWidthMm: 0.035,
      hazRadiusMm: 0.04,
    },
    visualPhenomenon: {
      type: 'color-annealing',
      baseColor: '#94a3b8',
      engravedColor: '#1e293b',
      hazColor: '#334155',
      roughness: 0.45,
      metalness: 0.85,
      filmThicknessNm: 20,
    },
  },

  STEEL_FIBER_DEEP_RELIEF: {
    id: 'STEEL_FIBER_DEEP_RELIEF',
    name: 'Inox 304 - Bóc Lõi Khuôn Kim Loại 2.5D (Deep Mold Engraving)',
    mode: 'relief-2.5d',
    materialId: 'STEEL',
    laserSource: 'FIBER_MOPA',
    description: 'Bóc phôi kim loại chính xác cao 30 chu kỳ bóc sâu 0.75mm, ứng dụng gia công khắc dấu kim loại.',
    params: {
      powerPercent: 90,
      scanSpeedMmS: 850,
      pulseFrequencyKhz: 40,
      pulseWidthNs: 200,
      lineIntervalMm: 0.02,
      dpi: calculateDPI(0.02),
      passes: 30,
      depthPerPassMm: 0.025,
      totalExpectedDepthMm: 0.75,
      focalOffsetMm: -0.3,
      assistGas: 'N2',
      gasPressureBar: 4.0,
      kerfWidthMm: 0.04,
      hazRadiusMm: 0.08,
    },
    visualPhenomenon: {
      type: 'color-annealing',
      baseColor: '#94a3b8',
      engravedColor: '#0f172a',
      hazColor: '#1e293b',
      roughness: 0.65,
      metalness: 0.80,
    },
  },

  // ==========================================
  // 4. ALUMINUM (Black Anodized 6061)
  // ==========================================
  ALUMINUM_FIBER_VECTOR_SCORE: {
    id: 'ALUMINUM_FIBER_VECTOR_SCORE',
    name: 'Nhôm Đen - Vạch Viền Bóc Màng Anot (Outline Strip)',
    mode: 'vector-scoring',
    materialId: 'ALUMINUM',
    laserSource: 'FIBER_MOPA',
    description: 'Vạch đường viền bóc lớp oxit màu đen bề mặt để lộ nhôm nguyên chất sáng lấp lánh.',
    params: {
      powerPercent: 24,
      scanSpeedMmS: 4500,
      pulseFrequencyKhz: 120,
      pulseWidthNs: 20,
      lineIntervalMm: 0.04,
      dpi: calculateDPI(0.04),
      passes: 1,
      depthPerPassMm: 0.02,
      totalExpectedDepthMm: 0.02,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.5,
      kerfWidthMm: 0.035,
      hazRadiusMm: 0.02,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#334155',
      engravedColor: '#f8fafc',
      hazColor: '#64748b',
      roughness: 0.20,
      metalness: 0.95,
    },
  },

  ALUMINUM_FIBER_RASTER_ENGRAVE: {
    id: 'ALUMINUM_FIBER_RASTER_ENGRAVE',
    name: 'Nhôm Đen - Khắc Mảng Siêu Tốc 8000 mm/s (Bright White Strip)',
    mode: 'raster-engraving',
    materialId: 'ALUMINUM',
    laserSource: 'FIBER_MOPA',
    description: 'Tốc độ Galvo 7000 mm/s bóc lớp anodize đen trong chớp mắt, tạo nét chữ trắng tinh xảo độ phân giải cao.',
    params: {
      powerPercent: 22,
      scanSpeedMmS: 7000,
      pulseFrequencyKhz: 160,
      pulseWidthNs: 20,
      lineIntervalMm: 0.035,
      dpi: calculateDPI(0.035),
      passes: 1,
      depthPerPassMm: 0.025,
      totalExpectedDepthMm: 0.025,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.6,
      kerfWidthMm: 0.035,
      hazRadiusMm: 0.015,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#334155',
      engravedColor: '#ffffff',
      hazColor: '#94a3b8',
      roughness: 0.18,
      metalness: 0.96,
    },
  },

  ALUMINUM_FIBER_DEEP_RELIEF: {
    id: 'ALUMINUM_FIBER_DEEP_RELIEF',
    name: 'Nhôm Đen - Bóc Lõi Phù Điêu 2.5D (Deep Relief Cavity)',
    mode: 'relief-2.5d',
    materialId: 'ALUMINUM',
    laserSource: 'FIBER_MOPA',
    description: 'Bóc sâu vào cốt nhôm 6061 qua 25 chu kỳ, loại bỏ xỉ bằng khí N2 áp lực cao 3.0 bar.',
    params: {
      powerPercent: 80,
      scanSpeedMmS: 1200,
      pulseFrequencyKhz: 45,
      pulseWidthNs: 120,
      lineIntervalMm: 0.03,
      dpi: calculateDPI(0.03),
      passes: 25,
      depthPerPassMm: 0.03,
      totalExpectedDepthMm: 0.75,
      focalOffsetMm: -0.3,
      assistGas: 'N2',
      gasPressureBar: 3.0,
      kerfWidthMm: 0.04,
      hazRadiusMm: 0.05,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#334155',
      engravedColor: '#cbd5e1',
      hazColor: '#64748b',
      roughness: 0.55,
      metalness: 0.90,
    },
  },

  // ==========================================
  // 5. SILICON (Semiconductor Wafer)
  // ==========================================
  SILICON_UV_VECTOR_SCORE: {
    id: 'SILICON_UV_VECTOR_SCORE',
    name: 'Wafer Bán Dẫn - Cắt Lạnh Rãnh Dicing (Zero-HAZ Scribe)',
    mode: 'vector-scoring',
    materialId: 'SILICON',
    laserSource: 'UV_DPSS',
    description: 'Năng lượng photon 3.49 eV bẻ gãy trực tiếp liên kết Si-Si không sinh nhiệt, mép cắt sắc bén dao cạo (knife-edge).',
    params: {
      powerPercent: 28,
      scanSpeedMmS: 900,
      pulseFrequencyKhz: 60,
      pulseWidthNs: 15,
      lineIntervalMm: 0.02,
      dpi: calculateDPI(0.02),
      passes: 1,
      depthPerPassMm: 0.06,
      totalExpectedDepthMm: 0.06,
      focalOffsetMm: 0.0,
      assistGas: 'N2',
      gasPressureBar: 1.5,
      kerfWidthMm: 0.015,
      hazRadiusMm: 0.0,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#1e1b4b',
      engravedColor: '#e2e8f0',
      hazColor: '#1e1b4b',
      roughness: 0.10,
      metalness: 0.98,
    },
  },

  SILICON_UV_RASTER_ENGRAVE: {
    id: 'SILICON_UV_RASTER_ENGRAVE',
    name: 'Wafer Bán Dẫn - Bóc Lớp Photoresist Mạch Vi Mô (Photoresist Peel)',
    mode: 'raster-engraving',
    materialId: 'SILICON',
    laserSource: 'UV_DPSS',
    description: 'Quét bóc chọn lọc màng mỏng quang trở bảo vệ, làm lộ các bus đồng/vàng nano dẫn điện của vi chip.',
    params: {
      powerPercent: 18,
      scanSpeedMmS: 2200,
      pulseFrequencyKhz: 85,
      pulseWidthNs: 12,
      lineIntervalMm: 0.018,
      dpi: calculateDPI(0.018),
      passes: 1,
      depthPerPassMm: 0.012,
      totalExpectedDepthMm: 0.012,
      focalOffsetMm: 0.0,
      assistGas: 'N2',
      gasPressureBar: 1.0,
      kerfWidthMm: 0.015,
      hazRadiusMm: 0.0,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#1e1b4b',
      engravedColor: '#fbbf24', // Exposed gold/copper metallization
      hazColor: '#1e1b4b',
      roughness: 0.12,
      metalness: 0.96,
    },
  },

  SILICON_UV_DEEP_RELIEF: {
    id: 'SILICON_UV_DEEP_RELIEF',
    name: 'Wafer Bán Dẫn - Khắc Hốc MEMS Vi Cơ Điện Tử 2.5D (MEMS Cavity)',
    mode: 'relief-2.5d',
    materialId: 'SILICON',
    laserSource: 'UV_DPSS',
    description: 'Gia công hốc vi cơ MEMS sâu 0.50mm bằng chùm UV hội tụ 15 µm không nứt vỡ tinh thể silicon giòn.',
    params: {
      powerPercent: 62,
      scanSpeedMmS: 500,
      pulseFrequencyKhz: 45,
      pulseWidthNs: 15,
      lineIntervalMm: 0.015,
      dpi: calculateDPI(0.015),
      passes: 20,
      depthPerPassMm: 0.025,
      totalExpectedDepthMm: 0.50,
      focalOffsetMm: -0.2,
      assistGas: 'N2',
      gasPressureBar: 2.5,
      kerfWidthMm: 0.018,
      hazRadiusMm: 0.0,
    },
    visualPhenomenon: {
      type: 'zero-haz-cold-peel',
      baseColor: '#1e1b4b',
      engravedColor: '#475569',
      hazColor: '#1e1b4b',
      roughness: 0.35,
      metalness: 0.92,
    },
  },

  // ==========================================
  // 6. GLASS (Borosilicate Optical Glass)
  // ==========================================
  GLASS_CO2_VECTOR_SCORE: {
    id: 'GLASS_CO2_VECTOR_SCORE',
    name: 'Kính Thủy Tinh - Vạch Mờ Nhiệt Vi Mô (Thermal Micro-Score)',
    mode: 'vector-scoring',
    materialId: 'GLASS',
    laserSource: 'CO2',
    description: 'Tia hồng ngoại 10.6 µm tạo vết rạn vi mô có kiểm soát, tạo đường vạch nét mờ mỹ thuật.',
    params: {
      powerPercent: 14,
      scanSpeedMmS: 360,
      pulseFrequencyKhz: 20,
      pulseWidthNs: 120,
      lineIntervalMm: 0.10,
      dpi: calculateDPI(0.10),
      passes: 1,
      depthPerPassMm: 0.05,
      totalExpectedDepthMm: 0.05,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.4,
      kerfWidthMm: 0.15,
      hazRadiusMm: 0.12,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#93c5fd',
      engravedColor: '#f1f5f9',
      hazColor: '#e2e8f0',
      roughness: 0.82,
      metalness: 0.05,
    },
  },

  GLASS_CO2_RASTER_ENGRAVE: {
    id: 'GLASS_CO2_RASTER_ENGRAVE',
    name: 'Kính Thủy Tinh - Khắc Phun Cát Mờ Đục (Frosted Glass Effect)',
    mode: 'raster-engraving',
    materialId: 'GLASS',
    laserSource: 'CO2',
    description: 'Tạo hàng triệu vết vi nứt bề mặt tán xạ ánh sáng như phun cát mờ đục cao cấp không làm vỡ kính.',
    params: {
      powerPercent: 22,
      scanSpeedMmS: 480,
      pulseFrequencyKhz: 28,
      pulseWidthNs: 140,
      lineIntervalMm: 0.075,
      dpi: calculateDPI(0.075),
      passes: 1,
      depthPerPassMm: 0.08,
      totalExpectedDepthMm: 0.08,
      focalOffsetMm: 0.0,
      assistGas: 'AIR',
      gasPressureBar: 0.6,
      kerfWidthMm: 0.16,
      hazRadiusMm: 0.15,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#93c5fd',
      engravedColor: '#ffffff',
      hazColor: '#f8fafc',
      roughness: 0.92,
      metalness: 0.02,
    },
  },

  GLASS_UV_DEEP_RELIEF: {
    id: 'GLASS_UV_DEEP_RELIEF',
    name: 'Kính Thủy Tinh - Khắc Lòng Kính Tử Ngoại 2.5D (Subsurface Mark)',
    mode: 'relief-2.5d',
    materialId: 'GLASS',
    laserSource: 'UV_DPSS',
    description: 'Chùm UV 355nm quang hóa ăn mòn kính vi mô nhiều lớp sâu 0.40mm mép cắt láng mịn không mẻ cạnh.',
    params: {
      powerPercent: 55,
      scanSpeedMmS: 450,
      pulseFrequencyKhz: 50,
      pulseWidthNs: 15,
      lineIntervalMm: 0.03,
      dpi: calculateDPI(0.03),
      passes: 16,
      depthPerPassMm: 0.025,
      totalExpectedDepthMm: 0.40,
      focalOffsetMm: -0.25,
      assistGas: 'N2',
      gasPressureBar: 1.8,
      kerfWidthMm: 0.025,
      hazRadiusMm: 0.02,
    },
    visualPhenomenon: {
      type: 'frosted-cracking',
      baseColor: '#93c5fd',
      engravedColor: '#f8fafc',
      hazColor: '#e0f2fe',
      roughness: 0.60,
      metalness: 0.08,
    },
  },
};

/**
 * Retrieves the recommended engraving profile for a given material and engraving mode
 */
export function getEngravingProfile(
  material: MaterialType,
  mode: EngravingMode,
  laserSource?: LaserSourceType
): EngravingProfile {
  // 1. Direct match with source filter
  for (const profile of Object.values(ENGRAVING_PROFILES)) {
    if (
      profile.materialId === material &&
      profile.mode === mode &&
      (!laserSource || profile.laserSource === laserSource)
    ) {
      return profile;
    }
  }

  // 2. Match material and mode regardless of laserSource
  for (const profile of Object.values(ENGRAVING_PROFILES)) {
    if (profile.materialId === material && profile.mode === mode) {
      return profile;
    }
  }

  // 3. Match any profile for this material
  for (const profile of Object.values(ENGRAVING_PROFILES)) {
    if (profile.materialId === material) {
      return profile;
    }
  }

  // 4. Ultimate fallback to wood vector scoring
  return ENGRAVING_PROFILES.WOOD_CO2_VECTOR_SCORE;
}

/**
 * Returns all available profiles for a given material
 */
export function getProfilesForMaterial(material: MaterialType): EngravingProfile[] {
  return Object.values(ENGRAVING_PROFILES).filter((p) => p.materialId === material);
}

/**
 * Returns the entire catalog of engraving profiles
 */
export function getAllProfiles(): EngravingProfile[] {
  return Object.values(ENGRAVING_PROFILES);
}
