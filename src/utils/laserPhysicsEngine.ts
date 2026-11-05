import { MachineId } from '../types/lab';
import { MaterialType } from '../data/materialsConfig';

/**
 * Optical and Thermal Constants per Laser Machine Type
 * Source: Báo cáo kỹ thuật Mô phỏng Vật lý Cắt & Khắc Laser Đa Vật Liệu
 */
export interface MachineOpticalSpec {
  wavelengthNm: number;
  beamWaferRadiusW0Mm: number; // w0 (mm) -> beam diameter = 2*w0
  rayleighLengthZrMm: number;
  photonEnergyEv: number;
  interactionMechanism: string;
}

export const MACHINE_OPTICAL_SPECS: Record<MachineId, MachineOpticalSpec> = {
  CO2_LASER: {
    wavelengthNm: 10600,
    beamWaferRadiusW0Mm: 0.075, // 2w0 = 0.15 mm
    rayleighLengthZrMm: 1.8,
    photonEnergyEv: 0.117,
    interactionMechanism: 'Kích thích dao động nhiệt phân tử mạnh (Photothermal heating & vaporization)',
  },
  FIBER_LASER: {
    wavelengthNm: 1064,
    beamWaferRadiusW0Mm: 0.0175, // 2w0 = 0.035 mm
    rayleighLengthZrMm: 0.9,
    photonEnergyEv: 1.165,
    interactionMechanism: 'Hấp thụ điện tử tự do trong kim loại (Free-electron plasma & annealing)',
  },
  UV_LASER: {
    wavelengthNm: 355,
    beamWaferRadiusW0Mm: 0.0075, // 2w0 = 0.015 mm
    rayleighLengthZrMm: 0.45,
    photonEnergyEv: 3.493,
    interactionMechanism: 'Quang phân bẻ gãy liên kết hóa học trực tiếp (Photolytic cold ablation, HAZ ≈ 0)',
  },
  SENSOR_STATION: {
    wavelengthNm: 650,
    beamWaferRadiusW0Mm: 0.1,
    rayleighLengthZrMm: 2.0,
    photonEnergyEv: 1.9,
    interactionMechanism: 'Cảm biến quang học đo lường & thử nghiệm',
  },
  COATING_STATION: {
    wavelengthNm: 365,
    beamWaferRadiusW0Mm: 0.2,
    rayleighLengthZrMm: 3.0,
    photonEnergyEv: 3.4,
    interactionMechanism: 'Sấy trùng hợp màng sơn UV',
  },
};

/**
 * Material Thermal & Optical Physical Parameters
 */
export interface MaterialPhysicalSpec {
  materialId: MaterialType;
  name: string;
  plateThicknessMm: number; // Standard workpiece stock thickness
  densityKgM3: number; // ρ
  ablationThresholdFthJPerCm2: number; // F_th
  heatCapacityCp: number; // J / (kg * K)
  vaporizationEnergyJPerMm3: number; // Enthalpy to vaporize (c_p * ΔT + L_m + L_v) in J/mm^3
  absorptivity: Record<MachineId, number>; // A(λ) = 1 - R(λ)
  thermalConductivityWPerMK: number;
}

export const MATERIAL_PHYSICAL_SPECS: Record<MaterialType, MaterialPhysicalSpec> = {
  WOOD: {
    materialId: 'WOOD',
    name: 'Gỗ Dán Tự Nhiên (Plywood)',
    plateThicknessMm: 3.0,
    densityKgM3: 650,
    ablationThresholdFthJPerCm2: 1.8,
    heatCapacityCp: 1700,
    vaporizationEnergyJPerMm3: 8.5, // Cellulose carbonization & vaporization
    absorptivity: {
      CO2_LASER: 0.92,
      UV_LASER: 0.90,
      FIBER_LASER: 0.05,
      SENSOR_STATION: 0.85,
      COATING_STATION: 0.90,
    },
    thermalConductivityWPerMK: 0.25,
  },
  ACRYLIC: {
    materialId: 'ACRYLIC',
    name: 'Mica Trong Suốt (Cast Acrylic PMMA)',
    plateThicknessMm: 5.0,
    densityKgM3: 1190,
    ablationThresholdFthJPerCm2: 2.4,
    heatCapacityCp: 1460,
    vaporizationEnergyJPerMm3: 6.2, // Depolymerization into boiling MMA monomer
    absorptivity: {
      CO2_LASER: 0.95,
      UV_LASER: 0.75,
      FIBER_LASER: 0.03, // Optical transmission window
      SENSOR_STATION: 0.75,
      COATING_STATION: 0.80,
    },
    thermalConductivityWPerMK: 0.19,
  },
  STEEL: {
    materialId: 'STEEL',
    name: 'Thép Không Gỉ (Inox 304)',
    plateThicknessMm: 1.0,
    densityKgM3: 7930,
    ablationThresholdFthJPerCm2: 6.0,
    heatCapacityCp: 500,
    vaporizationEnergyJPerMm3: 54.0, // High melting & vaporization latent heat
    absorptivity: {
      CO2_LASER: 0.04, // Highly reflective at 10.6 µm
      FIBER_LASER: 0.38,
      UV_LASER: 0.60,
      SENSOR_STATION: 0.40,
      COATING_STATION: 0.60,
    },
    thermalConductivityWPerMK: 16.2,
  },
  ALUMINUM: {
    materialId: 'ALUMINUM',
    name: 'Nhôm Đen Anot Hóa (Black Anodized 6061)',
    plateThicknessMm: 1.5,
    densityKgM3: 2700,
    ablationThresholdFthJPerCm2: 1.1, // Dye bleaching threshold
    heatCapacityCp: 897,
    vaporizationEnergyJPerMm3: 29.0,
    absorptivity: {
      CO2_LASER: 0.30,
      FIBER_LASER: 0.82, // Black dye strongly absorbs 1064 nm
      UV_LASER: 0.88,
      SENSOR_STATION: 0.70,
      COATING_STATION: 0.85,
    },
    thermalConductivityWPerMK: 167.0,
  },
  SILICON: {
    materialId: 'SILICON',
    name: 'Tấm Bán Dẫn (Silicon Wafer)',
    plateThicknessMm: 0.5,
    densityKgM3: 2330,
    ablationThresholdFthJPerCm2: 1.5,
    heatCapacityCp: 712,
    vaporizationEnergyJPerMm3: 38.0,
    absorptivity: {
      CO2_LASER: 0.05, // Thermal shock hazard
      UV_LASER: 0.88,
      FIBER_LASER: 0.45,
      SENSOR_STATION: 0.50,
      COATING_STATION: 0.80,
    },
    thermalConductivityWPerMK: 148.0,
  },
  GLASS: {
    materialId: 'GLASS',
    name: 'Kính Quang Học Borosilicate',
    plateThicknessMm: 1.0,
    densityKgM3: 2230,
    ablationThresholdFthJPerCm2: 2.2,
    heatCapacityCp: 830,
    vaporizationEnergyJPerMm3: 26.0,
    absorptivity: {
      CO2_LASER: 0.90, // Surface micro-fracture frosted
      UV_LASER: 0.75, // Cold ablation micro-cutting
      FIBER_LASER: 0.02, // 100% transparent
      SENSOR_STATION: 0.70,
      COATING_STATION: 0.75,
    },
    thermalConductivityWPerMK: 1.14,
  },
};

/**
 * Recommended Process Parameters Standard based on PDF Scenarios (KB-01 to KB-06)
 */
export interface RecommendedSettings {
  powerWatts: number;
  speedMmS: number;
  frequencyKhz: number;
  mode: 'CUT' | 'ENGRAVE';
  expectedDepthMm: number;
  expectedKerfMm: number;
  expectedRoughnessRaUm: number;
  expectedContrastCm: number;
  surfaceFinishDescription: string;
  scientificRationale: string;
  standardScenarioCode: string; // e.g. KB-02
  isCompatible: boolean;
  warningNote?: string;
}

export const RECOMMENDED_PROCESS_MATRIX: Record<
  string, // Key: `${MachineId}_${MaterialType}_${'CUT'|'ENGRAVE'}`
  RecommendedSettings
> = {
  // 1. CO2 LASER
  CO2_LASER_WOOD_CUT: {
    powerWatts: 45,
    speedMmS: 12,
    frequencyKhz: 10,
    mode: 'CUT',
    expectedDepthMm: 3.15,
    expectedKerfMm: 0.18,
    expectedRoughnessRaUm: 1.8,
    expectedContrastCm: 0.91,
    surfaceFinishDescription: 'Cắt đứt 100% vách thẳng đứng, cạnh than hóa nâu đen đậm đồng nhất',
    scientificRationale:
      'Bước sóng 10.6 µm hấp thụ cực đại trên xenlulôzơ (A = 0.92). Năng lượng tuyến tính E_L = 3.75 J/mm đủ để bốc hơi hoàn toàn chiều dày 3.0mm phôi dán Plywood mà không để lại xơ gỗ. Vách cắt nghiêng < 1.8° với viền than hóa c_char = 0.89 bảo vệ mép cắt sắc bén.',
    standardScenarioCode: 'KB-02',
    isCompatible: true,
  },
  CO2_LASER_WOOD_ENGRAVE: {
    powerWatts: 15,
    speedMmS: 220,
    frequencyKhz: 25,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.22,
    expectedKerfMm: 0.14,
    expectedRoughnessRaUm: 2.1,
    expectedContrastCm: 0.86,
    surfaceFinishDescription: 'Khắc màu nâu cánh gián sang trọng, chuyển sắc độ mịn màng, không cháy lan',
    scientificRationale:
      'Nhiệt độ bề mặt đạt xấp xỉ 320 °C kích hoạt động học than hóa Arrhenius c_char ≈ 0.85. Albedo giảm từ 0.68 xuống 0.08 tạo độ tương phản Michelson C_M = 0.86. Tốc độ quét 220 mm/s ngăn hiện tượng quá nhiệt tích tụ gây ám khói vàng.',
    standardScenarioCode: 'KB-01',
    isCompatible: true,
  },
  CO2_LASER_ACRYLIC_CUT: {
    powerWatts: 55,
    speedMmS: 8,
    frequencyKhz: 5,
    mode: 'CUT',
    expectedDepthMm: 5.15,
    expectedKerfMm: 0.22,
    expectedRoughnessRaUm: 0.35,
    expectedContrastCm: 0.12,
    surfaceFinishDescription: 'Cắt đứt 5.0mm mép cắt bóng gương trong suốt như đánh bóng lửa (Flame-polished)',
    scientificRationale:
      'Nhiệt lượng bốc hơi polymer PMMA thành khí monomer MMA. Vận tốc thấp 8 mm/s duy trì nhiệt lượng làm lớp nhựa mỏng trên vách cắt chảy lỏng và tự làm phẳng phẳng tuyệt đối do sức căng bề mặt (Flame-polished), độ nhám Ra đạt chuẩn quang học 0.35 µm.',
    standardScenarioCode: 'KB-04',
    isCompatible: true,
  },
  CO2_LASER_ACRYLIC_ENGRAVE: {
    powerWatts: 12,
    speedMmS: 300,
    frequencyKhz: 20,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.09,
    expectedKerfMm: 0.24,
    expectedRoughnessRaUm: 1.2,
    expectedContrastCm: 0.78,
    surfaceFinishDescription: 'Khắc trắng mờ sương tuyết (Frosted White, độ đục 86%), bề mặt mịn không bavia',
    scientificRationale:
      'Nhiệt độ cục bộ làm đứt gãy chuỗi polymer giải phóng hàng triệu vi bọt khí (micro-voids) nằm ngay dưới bề mặt. Ánh sáng chiếu vào bị tán xạ Mie toàn phần tạo ra màu trắng đục như tuyết tương phản cực cao trên nền mica trong suốt.',
    standardScenarioCode: 'KB-03',
    isCompatible: true,
  },
  CO2_LASER_STEEL_CUT: {
    powerWatts: 90,
    speedMmS: 10,
    frequencyKhz: 20,
    mode: 'CUT',
    expectedDepthMm: 0.08,
    expectedKerfMm: 0.35,
    expectedRoughnessRaUm: 8.0,
    expectedContrastCm: 0.05,
    surfaceFinishDescription: 'CẮT THẤT BẠI: Bề mặt kim loại trần phản xạ 96% tia 10.6 µm',
    scientificRationale:
      'NGUY HIỂM QUANG HỌC: Inox 304 phản xạ > 96% bước sóng 10.6 µm. Tia laser bị dội ngược có thể phá hủy thấu kính ZnSe và cháy buồng quang học. Không nên dùng CO2 cho kim loại trần!',
    standardScenarioCode: 'KB-REFLECTIVE-HAZARD',
    isCompatible: false,
    warningNote: 'Kim loại trần phản xạ 96% tia CO2 gây nguy cơ hỏng thấu kính ZnSe!',
  },
  CO2_LASER_STEEL_ENGRAVE: {
    powerWatts: 80,
    speedMmS: 30,
    frequencyKhz: 20,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.02,
    expectedKerfMm: 0.25,
    expectedRoughnessRaUm: 6.5,
    expectedContrastCm: 0.1,
    surfaceFinishDescription: 'Không hiệu quả: Vết xước mờ nhiệt không rõ nét do hệ số hấp thụ A < 0.04',
    scientificRationale:
      'Hệ số hấp thụ của Inox trần ở 10.6 µm chỉ đạt 4%. Năng lượng gần như không truyền được vào tinh thể kim loại mà chỉ gây phản xạ nguy hiểm.',
    standardScenarioCode: 'KB-REFLECTIVE-HAZARD',
    isCompatible: false,
    warningNote: 'Khuyến nghị chuyển sang máy Laser Fiber để khắc kim loại!',
  },
  CO2_LASER_ALUMINUM_ENGRAVE: {
    powerWatts: 30,
    speedMmS: 180,
    frequencyKhz: 25,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.04,
    expectedKerfMm: 0.16,
    expectedRoughnessRaUm: 1.5,
    expectedContrastCm: 0.82,
    surfaceFinishDescription: 'Bóc lớp phẩm màu nhuộm đen, để lộ nền nhôm oxit trắng sáng tương phản cao',
    scientificRationale:
      'Lớp màng Al2O3 xốp chứa phẩm nhuộm hữu cơ hấp thụ tốt nhiệt lượng, làm phân hủy phẩm nhuộm ở 350 °C, tạo nét chữ trắng sắc sảo.',
    standardScenarioCode: 'KB-ANODIZED-CO2',
    isCompatible: true,
  },
  CO2_LASER_ALUMINUM_CUT: {
    powerWatts: 90,
    speedMmS: 10,
    frequencyKhz: 10,
    mode: 'CUT',
    expectedDepthMm: 0.1,
    expectedKerfMm: 0.3,
    expectedRoughnessRaUm: 8.0,
    expectedContrastCm: 0.05,
    surfaceFinishDescription: 'Không cắt được nhôm: Độ dẫn nhiệt của nhôm quá cao (167 W/m·K)',
    scientificRationale:
      'Nhôm tản nhiệt cực nhanh và phản xạ mạnh ở 10.6 µm. Máy CO2 tiêu chuẩn không thể cắt đứt tấm nhôm dày.',
    standardScenarioCode: 'KB-ALU-UNCUT',
    isCompatible: false,
    warningNote: 'Độ dẫn nhiệt nhôm quá cao, năng lượng bị tản mát tức thời!',
  },

  // 2. FIBER LASER (1064 nm)
  FIBER_LASER_STEEL_ENGRAVE: {
    powerWatts: 20,
    speedMmS: 150,
    frequencyKhz: 80,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.003,
    expectedKerfMm: 0.07,
    expectedRoughnessRaUm: 0.25,
    expectedContrastCm: 0.88,
    surfaceFinishDescription: 'Khắc đen ủ nhiệt Annealing (Dark Annealing), bề mặt mịn phẳng không gờ nhám',
    scientificRationale:
      'Tần số xung siêu cao 80 kHz tạo tỷ lệ chồng lấp xung η_overlap = 94.6%. Nhiệt độ đỉnh duy trì 820 °C kích thích hình thành màng oxit sắt từ Fe3O4 / Cr2O3 dày ~260 nm cho màu đen tuyền sang trọng, hoàn toàn không làm lõm hay ăn mòn kim loại.',
    standardScenarioCode: 'KB-05',
    isCompatible: true,
  },
  FIBER_LASER_STEEL_CUT: {
    powerWatts: 95,
    speedMmS: 15,
    frequencyKhz: 25,
    mode: 'CUT',
    expectedDepthMm: 1.05,
    expectedKerfMm: 0.08,
    expectedRoughnessRaUm: 2.2,
    expectedContrastCm: 0.75,
    surfaceFinishDescription: 'Cắt đứt tấm Inox 304 mỏng 1.0mm, rãnh cắt siêu hẹp 0.08mm, gờ xỉ dross mỏng',
    scientificRationale:
      'Chùm tia Fiber hội tụ siêu nhỏ (2w0 = 0.035mm) tạo mật độ công suất đỉnh cực lớn làm nóng chảy tức thời kim loại ở 1450 °C, cắt đứt ngọt qua phôi 1.0mm.',
    standardScenarioCode: 'KB-FIBER-CUT',
    isCompatible: true,
  },
  FIBER_LASER_ALUMINUM_ENGRAVE: {
    powerWatts: 22,
    speedMmS: 400,
    frequencyKhz: 50,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.015,
    expectedKerfMm: 0.05,
    expectedRoughnessRaUm: 0.6,
    expectedContrastCm: 0.95,
    surfaceFinishDescription: 'Bóc lớp anodize siêu tốc, đường nét trắng tinh xảo, HAZ < 10 µm sắc nét tuyệt đối',
    scientificRationale:
      'Quét gương Galvo tốc độ cao 400 mm/s vượt ngưỡng F_th = 1.1 J/cm2 bóc tách lớp oxit nhộm màu đen, để lộ cốt oxit nhôm trắng bạc sáng loáng với độ phân giải vi mô.',
    standardScenarioCode: 'KB-ALU-FIBER',
    isCompatible: true,
  },
  FIBER_LASER_ACRYLIC_CUT: {
    powerWatts: 50,
    speedMmS: 50,
    frequencyKhz: 30,
    mode: 'CUT',
    expectedDepthMm: 0.0,
    expectedKerfMm: 0.0,
    expectedRoughnessRaUm: 0.0,
    expectedContrastCm: 0.0,
    surfaceFinishDescription: 'KHÔNG HIỆU QUẢ: Tia 1064 nm xuyên qua Mica trong suốt 100%',
    scientificRationale:
      'Mica PMMA hoàn toàn trong suốt với bước sóng hồng ngoại gần 1064 nm (độ truyền quang > 96%). Không có photon nào bị hấp thụ để chuyển thành nhiệt.',
    standardScenarioCode: 'KB-TRANSPARENT-INEFFECTIVE',
    isCompatible: false,
    warningNote: 'Chuyển sang máy CO2 Laser để cắt/khắc Mica!',
  },
  FIBER_LASER_WOOD_ENGRAVE: {
    powerWatts: 30,
    speedMmS: 100,
    frequencyKhz: 30,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.1,
    expectedKerfMm: 0.12,
    expectedRoughnessRaUm: 4.5,
    expectedContrastCm: 0.4,
    surfaceFinishDescription: 'Cháy sém loang lổ không đều do gỗ hấp thụ kém dải 1064 nm',
    scientificRationale:
      'Gỗ hữu cơ thiếu electron tự do để hấp thụ bước sóng 1.064 µm. Quá trình đốt nhiệt diễn ra bất đối xứng và tạo nhiều khói đen không sạch.',
    standardScenarioCode: 'KB-POOR-ORGANIC',
    isCompatible: false,
    warningNote: 'Nên dùng máy Laser CO2 chuyên dụng cho vật liệu phi kim hữu cơ!',
  },

  // 3. UV LASER (355 nm)
  UV_LASER_SILICON_ENGRAVE: {
    powerWatts: 8,
    speedMmS: 180,
    frequencyKhz: 60,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.008,
    expectedKerfMm: 0.02,
    expectedRoughnessRaUm: 0.15,
    expectedContrastCm: 0.85,
    surfaceFinishDescription: 'Khắc vi mô bán dẫn sắc nét hoàn hảo, gia công lạnh quang hóa HAZ = 0',
    scientificRationale:
      'Năng lượng photon 3.49 eV vượt năng lượng liên kết hóa học Si-Si (2.3 eV), kích hoạt quá trình quang phân (Cold Ablation) bẻ gãy mạng tinh thể mà không sinh nhiệt lan truyền. Không nứt vi mô, đạt chuẩn wafer vi điện tử.',
    standardScenarioCode: 'KB-UV-SILICON',
    isCompatible: true,
  },
  UV_LASER_SILICON_CUT: {
    powerWatts: 15,
    speedMmS: 25,
    frequencyKhz: 40,
    mode: 'CUT',
    expectedDepthMm: 0.52,
    expectedKerfMm: 0.025,
    expectedRoughnessRaUm: 0.35,
    expectedContrastCm: 0.9,
    surfaceFinishDescription: 'Cắt dicing rãnh vi mạch xuyên tấm wafer 0.5mm, mép cắt nhẵn bóng không mẻ mép',
    scientificRationale:
      'Chùm tia UV hội tụ điểm cực nhỏ 15 µm cắt chính xác từng vi rãnh tách chip silicon (Wafer dicing), không biến tính cấu trúc bán dẫn xung quanh.',
    standardScenarioCode: 'KB-UV-DICING',
    isCompatible: true,
  },
  UV_LASER_GLASS_CUT: {
    powerWatts: 18,
    speedMmS: 20,
    frequencyKhz: 50,
    mode: 'CUT',
    expectedDepthMm: 1.05,
    expectedKerfMm: 0.028,
    expectedRoughnessRaUm: 0.4,
    expectedContrastCm: 0.8,
    surfaceFinishDescription: 'Cắt lạnh kính mỏng 1.0mm không rạn nứt (Zero-chip cold cut)',
    scientificRationale:
      'Quang phân phá vỡ liên kết Si-O mà không tạo vùng tập trung ứng suất nhiệt. Cắt đứt tấm kính borosilicate mà không gây mẻ vi mô dọc mép cắt.',
    standardScenarioCode: 'KB-UV-GLASS',
    isCompatible: true,
  },
  UV_LASER_ACRYLIC_ENGRAVE: {
    powerWatts: 6,
    speedMmS: 250,
    frequencyKhz: 50,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.03,
    expectedKerfMm: 0.022,
    expectedRoughnessRaUm: 0.2,
    expectedContrastCm: 0.88,
    surfaceFinishDescription: 'Khắc mờ siêu nét, không bavia, không ố vàng mép cắt',
    scientificRationale:
      'Gia công lạnh UV triệt tiêu hoàn toàn vùng ảnh hưởng nhiệt HAZ. Vết khắc đạt độ mịn micromet cao nhất trong tất cả các dòng máy laser.',
    standardScenarioCode: 'KB-UV-ACRYLIC',
    isCompatible: true,
  },
  UV_LASER_WOOD_ENGRAVE: {
    powerWatts: 10,
    speedMmS: 120,
    frequencyKhz: 40,
    mode: 'ENGRAVE',
    expectedDepthMm: 0.08,
    expectedKerfMm: 0.03,
    expectedRoughnessRaUm: 1.0,
    expectedContrastCm: 0.92,
    surfaceFinishDescription: 'Khắc tranh gỗ vi mô siêu sắc nét, nét mảnh bằng sợi tóc',
    scientificRationale:
      'Bóc lớp tế vi mà không sinh ngọn lửa than hóa. Rất thích hợp cho các sản phẩm thủ công mỹ nghệ kích thước micro.',
    standardScenarioCode: 'KB-UV-WOOD',
    isCompatible: true,
  },
};

/**
 * Result of Dynamic Physics Simulation for Given Parameters
 */
export interface LaserPhysicsResult {
  actualDepthMm: number;
  targetThicknessMm: number;
  isCutThrough: boolean;
  cutThroughPercentage: number;
  kerfWidthMm: number;
  pulseOverlapPercent: number;
  surfaceRoughnessRaUm: number;
  energyDensityJPerMm: number;
  contrastRatioCm: number;
  hazQuality: string;
  surfaceFinishDescription: string;
  qualityRating: 'PERFECT' | 'OPTIMAL' | 'ACCEPTABLE' | 'POOR_OVERBURNT' | 'FAILED_UNCUT';
  scientificFeedback: string;
}

/**
 * Computes Exact Dynamic Physics Calculations according to formulas in the PDF report
 */
export function simulateLaserPhysics(
  powerWatts: number,
  speedMmS: number,
  frequencyKhz: number,
  machineId: MachineId,
  materialId: MaterialType,
  mode: 'CUT' | 'ENGRAVE'
): LaserPhysicsResult {
  const machine = MACHINE_OPTICAL_SPECS[machineId] || MACHINE_OPTICAL_SPECS.CO2_LASER;
  const mat = MATERIAL_PHYSICAL_SPECS[materialId] || MATERIAL_PHYSICAL_SPECS.WOOD;

  const P = Math.max(1, powerWatts);
  const v = Math.max(1, speedMmS);
  const f = Math.max(1, frequencyKhz) * 1000; // to Hz
  const w0 = machine.beamWaferRadiusW0Mm;
  const spotDiameterMm = 2 * w0;

  // 1. Linear Energy Density E_L = P / v (J/mm)
  const energyDensityJPerMm = Number((P / v).toFixed(4));

  // 2. Pulse Overlap: η_overlap = [1 - (v / (2 * w0 * f))] * 100%
  const spatialPitch = v / f; // mm
  const overlapRatio = 1 - spatialPitch / spotDiameterMm;
  const pulseOverlapPercent = Number((Math.max(-100, Math.min(99.9, overlapRatio * 100))).toFixed(1));

  // 3. Absorptivity A(λ)
  const A = mat.absorptivity[machineId] ?? 0.1;

  // If material is blocked or highly reflective:
  const isReflective = A < 0.08 && (materialId === 'STEEL' || materialId === 'ACRYLIC');

  // 4. Theoretical Cut Depth d_cut (mm)
  // Formula: d_cut = (A * P) / [ 2*w0 * v * E_vaporization ]
  // E_vaporization is in J/mm^3
  let rawDepthMm = 0;
  if (!isReflective) {
    const volumetricAblationEnergy = mat.vaporizationEnergyJPerMm3; // J/mm^3
    const effectivePower = P * A;
    // Swept area per second = spotDiameterMm * v (mm^2/s)
    // d = effectivePower / (spotDiameterMm * v * Ev)
    rawDepthMm = effectivePower / (spotDiameterMm * v * volumetricAblationEnergy);

    // Apply frequency coupling boost when pulse overlap > 75% (heat accumulation effect)
    if (pulseOverlapPercent > 75) {
      const heatAccumulationFactor = 1.0 + ((pulseOverlapPercent - 75) / 25) * 0.25;
      rawDepthMm *= heatAccumulationFactor;
    }
  }

  // Round raw depth
  const actualDepthMm = Number(Math.max(0.001, rawDepthMm).toFixed(3));
  const targetThicknessMm = mat.plateThicknessMm;

  // Check cut-through status
  const cutThroughPercentage = Number(
    Math.min(100, Math.max(0, (actualDepthMm / targetThicknessMm) * 100)).toFixed(1)
  );
  const isCutThrough = mode === 'CUT' && cutThroughPercentage >= 98.0 && !isReflective;

  // 5. Kerf Width (mm)
  // Expands beyond 2w0 due to excess thermal dissipation
  let thermalExpansion = (energyDensityJPerMm / 4.0) * (mat.thermalConductivityWPerMK / 50.0);
  if (machineId === 'UV_LASER') thermalExpansion *= 0.1; // cold ablation
  const kerfWidthMm = Number(Math.max(spotDiameterMm, spotDiameterMm * (1 + thermalExpansion * 0.4)).toFixed(3));

  // 6. Surface Roughness Ra (µm)
  // Low overlap (< 30%) leaves micro-craters -> rough.
  // High overlap (> 85%) polishes or creates smooth oxides.
  let roughnessRaUm = 1.5;
  if (pulseOverlapPercent < 30) {
    roughnessRaUm = 4.2 + (1 - pulseOverlapPercent / 30) * 3.5;
  } else if (pulseOverlapPercent > 80) {
    if (materialId === 'ACRYLIC' && machineId === 'CO2_LASER' && mode === 'CUT') {
      roughnessRaUm = 0.25 + (100 - pulseOverlapPercent) * 0.01; // flame polished
    } else if (materialId === 'STEEL' && machineId === 'FIBER_LASER') {
      roughnessRaUm = 0.2 + (100 - pulseOverlapPercent) * 0.008; // dark annealing
    } else if (machineId === 'UV_LASER') {
      roughnessRaUm = 0.15 + (100 - pulseOverlapPercent) * 0.005;
    } else {
      roughnessRaUm = 0.8 + (100 - pulseOverlapPercent) * 0.02;
    }
  } else {
    roughnessRaUm = 1.5 + ((80 - pulseOverlapPercent) / 50) * 1.5;
  }
  roughnessRaUm = Number(Math.max(0.1, roughnessRaUm).toFixed(2));

  // 7. Optical Contrast CM & Surface Appearance
  let contrastRatioCm = 0.85;
  let hazQuality = 'Tối ưu (Mép cắt sắc nét, không biến tính)';
  let surfaceFinishDescription = 'Đường nét gia công chuẩn xác theo mô hình vật lý quang học';
  let qualityRating: LaserPhysicsResult['qualityRating'] = 'OPTIMAL';
  let scientificFeedback = '';

  if (isReflective) {
    qualityRating = 'FAILED_UNCUT';
    contrastRatioCm = 0.05;
    hazQuality = 'NGUY HIỂM: Phản xạ quang học > 95%';
    surfaceFinishDescription = 'Tia laser dội ngược, không hấp thụ năng lượng. Nguy cơ hỏng thấu kính!';
    scientificFeedback = `Hệ số hấp thụ A(λ) của ${mat.name} tại bước sóng của máy chỉ đạt ${(A * 100).toFixed(0)}%. Hầu như toàn bộ chùm tia bị phản xạ.`;
  } else if (mode === 'CUT') {
    if (isCutThrough) {
      if (energyDensityJPerMm > 5.5 && materialId === 'WOOD') {
        qualityRating = 'POOR_OVERBURNT';
        contrastRatioCm = 0.95;
        hazQuality = 'Quá nhiệt (Cháy sém nặng & viền ám khói rộng HAZ > 0.45mm)';
        surfaceFinishDescription = 'Cắt đứt hoàn toàn nhưng mép cắt bị than hóa sâu và ám khói đậm do năng lượng tuyến tính E_L quá cao.';
        scientificFeedback = `Mật độ năng lượng đường E_L = ${energyDensityJPerMm} J/mm vượt ngưỡng tối ưu. Lớp than hóa chuyển sang tro xám và viền khói nhựa gỗ ngưng tụ rộng. Khuyên giảm công suất P hoặc tăng tốc độ v.`;
      } else if (materialId === 'ACRYLIC' && roughnessRaUm <= 0.4) {
        qualityRating = 'PERFECT';
        contrastRatioCm = 0.12;
        hazQuality = 'Hoàn hảo (Mép cắt bóng gương Flame-polished)';
        surfaceFinishDescription = 'Cắt đứt 100% cực đẹp, nhiệt độ làm phẳng thành vách tự nhiên, độ nhám Ra = 0.35 µm như kính.';
        scientificFeedback = `Vận tốc và công suất duy trì trạng thái nóng chảy êm dịu, sức căng bề mặt tự làm phẳng vách cắt PMMA theo cơ chế Flame-polished chuẩn kịch bản KB-04.`;
      } else {
        qualityRating = 'PERFECT';
        contrastRatioCm = 0.9;
        hazQuality = 'Chuẩn công nghiệp (Vách cắt thẳng đứng, HAZ tối thiểu)';
        surfaceFinishDescription = `Cắt đứt xuyên thấu 100% (${actualDepthMm}mm / ${targetThicknessMm}mm). Chi tiết tách rời nhẹ nhàng.`;
        scientificFeedback = `Năng lượng nạp vừa đủ để hóa hơi toàn bộ tiết diện rãnh cắt (${A * 100}% hấp thụ). Tỷ lệ chồng lấp xung η_overlap = ${pulseOverlapPercent}% đảm bảo vách thẳng.`;
      }
    } else {
      qualityRating = 'FAILED_UNCUT';
      contrastRatioCm = 0.6;
      hazQuality = `CẮT KHÔNG ĐỨT (Độ sâu chỉ đạt ${actualDepthMm}mm / ${targetThicknessMm}mm - ${cutThroughPercentage}%)`;
      surfaceFinishDescription = 'Chi tiết bị dính kẹt trong phôi, không thể nhấc rời do năng lượng không đủ xuyên thủng tấm!';
      scientificFeedback = `Năng lượng tuyến tính E_L = ${energyDensityJPerMm} J/mm không đủ bù đắp ẩn nhiệt hóa hơi của vật liệu. Cần tăng công suất P hoặc giảm tốc độ v để đạt độ sâu ${targetThicknessMm}mm.`;
    }
  } else {
    // ENGRAVE MODE
    if (energyDensityJPerMm > 1.2 && materialId === 'WOOD') {
      qualityRating = 'POOR_OVERBURNT';
      contrastRatioCm = 0.92;
      hazQuality = 'Khắc quá sâu & cháy đen mép biên';
      surfaceFinishDescription = `Rãnh khắc sâu ${actualDepthMm}mm với viền ám khói rộng do nhiệt phân quá mức.`;
      scientificFeedback = `Năng lượng E_L quá cao làm than hóa không kiểm soát. Nên giảm P xuống 10-18W hoặc tăng v lên 200-300mm/s.`;
    } else if (materialId === 'STEEL' && machineId === 'FIBER_LASER' && frequencyKhz >= 60) {
      qualityRating = 'PERFECT';
      contrastRatioCm = 0.88;
      hazQuality = 'Đạt chuẩn Dark Annealing (Màng oxit mịn bóng, không ăn mòn)';
      surfaceFinishDescription = `Vết khắc màu đen sâu sang trọng, lớp oxit Fe3O4/Cr2O3 dày ~260nm bảo vệ kim loại, Ra = ${roughnessRaUm} µm.`;
      scientificFeedback = `Tần số cao ${frequencyKhz} kHz (η_overlap = ${pulseOverlapPercent}%) tạo trường nhiệt đồng nhất 820 °C, kích hoạt màng mỏng oxit chống gỉ chuẩn kịch bản KB-05.`;
    } else if (materialId === 'ACRYLIC' && machineId === 'CO2_LASER') {
      qualityRating = 'PERFECT';
      contrastRatioCm = 0.78;
      hazQuality = 'Khắc sương tuyết Frosted White (Độ đục 86%)';
      surfaceFinishDescription = `Vết khắc trắng đục mịn màng từ hàng triệu vi bọt khí tán xạ Mie, độ sâu ${actualDepthMm}mm.`;
      scientificFeedback = `Mật độ năng lượng bóc tách vừa đủ kích hoạt monomer MMA sôi mà không làm chảy dính thành vách, chuẩn kịch bản KB-03.`;
    } else if (machineId === 'UV_LASER') {
      qualityRating = 'PERFECT';
      contrastRatioCm = 0.9;
      hazQuality = 'Gia công lạnh quang hóa Cold Ablation (HAZ = 0)';
      surfaceFinishDescription = `Rãnh khắc vi mô ${actualDepthMm}mm sắc sảo từng nanomet, không sinh nhiệt lan truyền.`;
      scientificFeedback = `Năng lượng photon 3.49 eV phá vỡ trực tiếp liên kết hóa học mà không cần nung nóng mạng tinh thể.`;
    } else {
      qualityRating = 'OPTIMAL';
      contrastRatioCm = 0.82;
      hazQuality = 'Đạt yêu cầu tương phản quang học';
      surfaceFinishDescription = `Độ sâu vết khắc ${actualDepthMm}mm, độ nhám Ra = ${roughnessRaUm} µm.`;
      scientificFeedback = `Động học nhiệt phân diễn ra ổn định với hệ số chồng lấp xung η_overlap = ${pulseOverlapPercent}%.`;
    }
  }

  return {
    actualDepthMm,
    targetThicknessMm,
    isCutThrough,
    cutThroughPercentage,
    kerfWidthMm,
    pulseOverlapPercent,
    surfaceRoughnessRaUm: roughnessRaUm,
    energyDensityJPerMm,
    contrastRatioCm,
    hazQuality,
    surfaceFinishDescription,
    qualityRating,
    scientificFeedback,
  };
}

/**
 * Returns the recommended parameters and rationale for a given machine, material, and mode
 */
export function getRecommendedParameters(
  machineId: MachineId,
  materialId: MaterialType,
  mode: 'CUT' | 'ENGRAVE'
): RecommendedSettings {
  const key = `${machineId}_${materialId}_${mode}`;
  const directMatch = RECOMMENDED_PROCESS_MATRIX[key];
  if (directMatch) return directMatch;

  // Fallback defaults
  const mat = MATERIAL_PHYSICAL_SPECS[materialId] || MATERIAL_PHYSICAL_SPECS.WOOD;
  if (mode === 'CUT') {
    return {
      powerWatts: Math.min(100, Math.round(mat.vaporizationEnergyJPerMm3 * 1.5 + 30)),
      speedMmS: 15,
      frequencyKhz: 20,
      mode: 'CUT',
      expectedDepthMm: mat.plateThicknessMm + 0.2,
      expectedKerfMm: 0.15,
      expectedRoughnessRaUm: 1.8,
      expectedContrastCm: 0.85,
      surfaceFinishDescription: `Cắt đứt xuyên phôi ${mat.plateThicknessMm}mm tiêu chuẩn`,
      scientificRationale: `Thông số tiêu chuẩn giúp năng lượng tuyến tính đạt ngưỡng bốc hơi vật liệu ${mat.name} với hệ số an toàn 15%.`,
      standardScenarioCode: 'KB-STD-CUT',
      isCompatible: true,
    };
  } else {
    return {
      powerWatts: 18,
      speedMmS: 200,
      frequencyKhz: 30,
      mode: 'ENGRAVE',
      expectedDepthMm: 0.1,
      expectedKerfMm: 0.12,
      expectedRoughnessRaUm: 1.2,
      expectedContrastCm: 0.82,
      surfaceFinishDescription: 'Khắc bề mặt sắc nét, tương phản quang học cao',
      scientificRationale: `Tốc độ quét 200 mm/s tạo độ chồng lấp xung tối ưu trên ${mat.name}, đảm bảo không cháy xém hay biến tính cấu trúc lân cận.`,
      standardScenarioCode: 'KB-STD-ENGRAVE',
      isCompatible: true,
    };
  }
}

