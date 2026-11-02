import { CoatingFinishConfig, CoatingFinishId } from '../types/lab';

export const COATING_FINISHES: Record<CoatingFinishId, CoatingFinishConfig> = {
  CLEAR_GLOSS: {
    id: 'CLEAR_GLOSS',
    name: 'Sơn Phủ Bóng Cao Cấp (Clear Gloss Polyurethane)',
    category: 'Bảo vệ trong suốt & Tôn vân',
    color: '#38bdf8',
    roughness: 0.05,
    metalness: 0.12,
    glossUnit: '98 GU (Độ bóng gương)',
    dryFilmThickness: '35 µm',
    cureTimeSec: 4,
    description:
      'Lớp phủ trong suốt quang học gốc Polyurethane 2 thành phần, tạo màng bóng gương, chống trầy xước và chống thấm nước cho gỗ tự nhiên, mica acrylic và nhôm phay.',
  },
  MATTE_BLACK: {
    id: 'MATTE_BLACK',
    name: 'Sơn Tĩnh Điện Nhám Mờ (Matte Black Powder Coat)',
    category: 'Sơn tĩnh điện công nghiệp',
    color: '#18181b',
    roughness: 0.85,
    metalness: 0.15,
    glossUnit: '8 GU (Đen nhám sâu)',
    dryFilmThickness: '60 µm',
    cureTimeSec: 5,
    description:
      'Màu đen nhám mờ quân sự (Tactical Stealth Black). Hạt bột sơn tích điện bám đều mọi góc khuất, chống oxy hóa muối biển và triệt tiêu phản xạ ánh sáng.',
  },
  CANDY_RED: {
    id: 'CANDY_RED',
    name: 'Sơn Đỏ Ánh Kim Candy (Metallic Candy Apple Red)',
    category: 'Sơn hiệu ứng kim loại cao cấp',
    color: '#ef4444',
    roughness: 0.18,
    metalness: 0.88,
    glossUnit: '92 GU (Lấp lánh kim loại)',
    dryFilmThickness: '50 µm',
    cureTimeSec: 5,
    description:
      'Hệ sơn nhiều lớp với vảy nhũ kim loại phản quang (Metallic Flakes) chìm dưới lớp men đỏ trong suốt, tạo chiều sâu thị giác lộng lẫy dưới ánh đèn rọi.',
  },
  SAFETY_ORANGE: {
    id: 'SAFETY_ORANGE',
    name: 'Sơn Cam Cảnh Báo An Toàn (Safety High-Vis Orange)',
    category: 'Chuẩn an toàn máy móc ANSI Z535',
    color: '#f97316',
    roughness: 0.35,
    metalness: 0.25,
    glossUnit: '75 GU (Bán bóng)',
    dryFilmThickness: '55 µm',
    cureTimeSec: 4,
    description:
      'Sơn công nghiệp chịu dầu mỡ và chống va đập cơ học cao, dùng để sơn các bộ phận cơ khí chuyển động, tay kẹp phôi và thiết bị an toàn xưởng gia công.',
  },
  TITANIUM_GOLD: {
    id: 'TITANIUM_GOLD',
    name: 'Lớp Phủ Mạ Titan Vàng PVD (Titanium Nitride TiN)',
    category: 'Lớp phủ chân không gốm kim loại',
    color: '#eab308',
    roughness: 0.12,
    metalness: 0.95,
    glossUnit: '95 GU (Ánh vàng gương)',
    dryFilmThickness: '3 µm',
    cureTimeSec: 6,
    description:
      'Lớp phủ gốm hợp kim Titanium Nitride siêu cứng (2500 HV), chống mài mòn ma sát cực hạn và tạo vẻ đẹp vương giả hoàng gia cho chi tiết máy kim loại.',
  },
  NEON_CYAN_GLOW: {
    id: 'NEON_CYAN_GLOW',
    name: 'Sơn Phát Quang Huỳnh Quang (Fluorescent Neon Cyan)',
    category: 'Phát quang huỳnh quang dạ quang',
    color: '#06b6d4',
    roughness: 0.22,
    metalness: 0.3,
    emissive: '#06b6d4',
    emissiveIntensity: 0.85,
    glossUnit: '85 GU (Phát sáng neon)',
    dryFilmThickness: '40 µm',
    cureTimeSec: 4,
    description:
      'Sơn chứa tinh thể phospho phát quang hấp thụ photon tia cực tím UV và phát xạ ánh sáng xanh neon rực rỡ trong bóng tối, làm nổi bật các rãnh khắc laser.',
  },
  NANO_HYDROPHOBIC: {
    id: 'NANO_HYDROPHOBIC',
    name: 'Màng Phủ Gốm Nano Kỵ Nước (Hydrophobic Ceramic)',
    category: 'Công nghệ nano bảo vệ bề mặt',
    color: '#e0f2fe',
    roughness: 0.04,
    metalness: 0.1,
    glossUnit: '99 GU (Siêu trong suốt)',
    dryFilmThickness: '0.8 µm',
    cureTimeSec: 3,
    description:
      'Màng phủ đơn lớp nano tự sắp xếp gốc Silane, tạo góc tiếp xúc giọt nước > 115° (Hiệu ứng lá sen). Chống bám bụi, kháng hóa chất cho Silicon Wafer và Kính.',
  },
};

