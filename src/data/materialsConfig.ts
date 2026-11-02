import { MachineId } from '../types/lab';

export type MaterialType = 'ACRYLIC' | 'WOOD' | 'STEEL' | 'ALUMINUM' | 'SILICON' | 'GLASS';

export interface MaterialInteraction {
  status: 'OPTIMAL' | 'COMPATIBLE' | 'BLOCKED_REFLECTIVE' | 'INEFFECTIVE';
  statusText: string;
  badgeColor: string;
  effectDescription: string;
  sparkColor: string;
  canCutOrEngrave: boolean;
}

export interface MaterialItem {
  id: MaterialType;
  name: string;
  category: 'Phi kim hữu cơ' | 'Kim loại' | 'Vật liệu vô cơ / Bán dẫn';
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
  textureLabel: string;
  description: string;
  interactions: Record<MachineId, MaterialInteraction>;
}

export const MATERIALS_CATALOG: Record<MaterialType, MaterialItem> = {
  ACRYLIC: {
    id: 'ACRYLIC',
    name: 'Mica Trong Suốt (Acrylic)',
    category: 'Phi kim hữu cơ',
    color: '#38bdf8',
    metalness: 0.1,
    roughness: 0.05,
    opacity: 0.45,
    transparent: true,
    textureLabel: 'Tấm Acrylic Đúc 5mm',
    description: 'Vật liệu polymer nhiệt dẻo PMMA, có độ truyền quang 92% trong dải khả kiến nhưng hấp thụ cực mạnh hồng ngoại xa 10.6 µm.',
    interactions: {
      CO2_LASER: {
        status: 'OPTIMAL',
        statusText: 'CẮT CỰC ĐẸP (MÉP BÓNG GƯƠNG)',
        badgeColor: '#10b981',
        effectDescription: 'Tia CO2 10.6 µm bốc hơi vật liệu tức thời, mép cắt nóng chảy phẳng bóng như đánh bóng lửa (flame polished).',
        sparkColor: '#38bdf8',
        canCutOrEngrave: true,
      },
      UV_LASER: {
        status: 'COMPATIBLE',
        statusText: 'KHẮC VI MÔ SIÊU MỊN',
        badgeColor: '#8b5cf6',
        effectDescription: 'Gia công lạnh quang hóa, tạo vết khắc mờ trắng cực mịn trên bề mặt không bị bavia nhiệt.',
        sparkColor: '#c084fc',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'INEFFECTIVE',
        statusText: 'KHÔNG HIỆU QUẢ (TRONG SUỐT)',
        badgeColor: '#ef4444',
        effectDescription: 'Bước sóng 1064 nm đi xuyên qua tấm acrylic trong suốt gần như 100%, không sinh công nhiệt.',
        sparkColor: '#f59e0b',
        canCutOrEngrave: false,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'MẪU ĐO THỬ NGHIỆM',
        badgeColor: '#06b6d4',
        effectDescription: 'Đo bức xạ nhiệt bề mặt bằng cảm biến hồng ngoại MLX90614.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },

  WOOD: {
    id: 'WOOD',
    name: 'Gỗ Dán Tự Nhiên (Plywood)',
    category: 'Phi kim hữu cơ',
    color: '#d97706',
    metalness: 0.0,
    roughness: 0.8,
    opacity: 1.0,
    transparent: false,
    textureLabel: 'Gỗ Bạch Dương 3mm',
    description: 'Vật liệu xenlulôzơ tự nhiên, chứa liên kết hữu cơ C-H, C-C hấp thụ toàn diện dải sóng hồng ngoại xa.',
    interactions: {
      CO2_LASER: {
        status: 'OPTIMAL',
        statusText: 'CẮT NHANH (MÉP NÂU KHÓI)',
        badgeColor: '#10b981',
        effectDescription: 'Năng lượng 10.6 µm carbon hóa và bốc hơi xenlulôzơ, tạo mép cắt màu nâu đậm với khói thơm đặc trưng.',
        sparkColor: '#f59e0b',
        canCutOrEngrave: true,
      },
      UV_LASER: {
        status: 'COMPATIBLE',
        statusText: 'KHẮC CHI TIẾT CAO',
        badgeColor: '#8b5cf6',
        effectDescription: 'Khắc quang hóa không sinh nhiệt ngọn lửa, thích hợp cho tranh gỗ mini siêu nét.',
        sparkColor: '#a855f7',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'INEFFECTIVE',
        statusText: 'KHÔNG TƯƠNG THÍCH',
        badgeColor: '#ef4444',
        effectDescription: 'Gỗ hấp thụ kém bước sóng 1064 nm của Fiber; dễ gây cháy xém loang lổ không kiểm soát.',
        sparkColor: '#ef4444',
        canCutOrEngrave: false,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'MẪU KIỂM TRA CHÁY',
        badgeColor: '#06b6d4',
        effectDescription: 'Kiểm tra phát hiện khói quang điện khi gỗ bắt đầu sinh nhiệt.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },

  STEEL: {
    id: 'STEEL',
    name: 'Thép Không Gỉ (Inox 304)',
    category: 'Kim loại',
    color: '#94a3b8',
    metalness: 0.95,
    roughness: 0.15,
    opacity: 1.0,
    transparent: false,
    textureLabel: 'Tấm Inox 304 Cán Nguội',
    description: 'Hợp kim sắt - crom - niken dẫn điện và dẫn nhiệt tốt, bề mặt kim loại tự do phản xạ ánh sáng cao.',
    interactions: {
      CO2_LASER: {
        status: 'BLOCKED_REFLECTIVE',
        statusText: 'NGUY HIỂM: PHẢN XẠ QUANG HỌC',
        badgeColor: '#ef4444',
        effectDescription: 'Bề mặt thép phản xạ > 95% bước sóng 10.6 µm. Tia laser dội ngược có thể làm nứt vỡ thấu kính ZnSe và cháy đầu cắt!',
        sparkColor: '#ef4444',
        canCutOrEngrave: false,
      },
      UV_LASER: {
        status: 'COMPATIBLE',
        statusText: 'KHẮC ĐEN TƯƠNG PHẢN',
        badgeColor: '#8b5cf6',
        effectDescription: 'Khắc bóc lớp bề mặt kim loại với độ mịn micro-mét, không làm cong vênh tấm kim loại mỏng.',
        sparkColor: '#c084fc',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'OPTIMAL',
        statusText: 'KHẮC MÀU & Ủ NHIỆT (ANNEALING)',
        badgeColor: '#10b981',
        effectDescription: 'Bước sóng 1064 nm hấp thụ cực tốt. Quét Galvo tốc độ cao tạo màng oxit giao thoa màu sắc (Inox Annealing) rực rỡ.',
        sparkColor: '#fef08a',
        canCutOrEngrave: true,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'MẪU BỨC XẠ KIM LOẠI',
        badgeColor: '#06b6d4',
        effectDescription: 'Hiệu chuẩn hệ số phát xạ nhiệt ε của bề mặt kim loại bóng.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },

  ALUMINUM: {
    id: 'ALUMINUM',
    name: 'Nhôm Đen Anot Hóa (Black Anodized)',
    category: 'Kim loại',
    color: '#334155',
    metalness: 0.7,
    roughness: 0.35,
    opacity: 1.0,
    transparent: false,
    textureLabel: 'Hợp Kim Nhôm 6061 Anodized',
    description: 'Tấm nhôm phủ lớp màng nhôm oxit Al2O3 nhuộm đen xốp, độ cứng bề mặt cao.',
    interactions: {
      CO2_LASER: {
        status: 'COMPATIBLE',
        statusText: 'BÓC LỚP SƠN / MÀNG OXIT',
        badgeColor: '#06b6d4',
        effectDescription: 'Nhiệt năng bốc cháy lớp thuốc nhuộm hữu cơ màu đen, để lộ cốt nhôm trắng sáng bên dưới.',
        sparkColor: '#f8fafc',
        canCutOrEngrave: true,
      },
      UV_LASER: {
        status: 'COMPATIBLE',
        statusText: 'KHẮC MÃ QR SIÊU NÉT',
        badgeColor: '#8b5cf6',
        effectDescription: 'Bóc lớp anot sắc sảo từng điểm ảnh (pixel), độ tương phản trắng đen cực cao.',
        sparkColor: '#a855f7',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'OPTIMAL',
        statusText: 'KHẮC TỐC ĐỘ CỰC CAO',
        badgeColor: '#10b981',
        effectDescription: 'Tốc độ 8.000 mm/s bóc lớp anodized trong tích tắc, tạo nét chữ trắng tinh xảo.',
        sparkColor: '#fef08a',
        canCutOrEngrave: true,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'MẪU BẢN GÁ QUANG HỌC',
        badgeColor: '#06b6d4',
        effectDescription: 'Mặt bàn thí nghiệm nhôm định hình chống nhiễu từ tính.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },

  SILICON: {
    id: 'SILICON',
    name: 'Tấm Bán Dẫn (Silicon Wafer)',
    category: 'Vật liệu vô cơ / Bán dẫn',
    color: '#1e1b4b',
    metalness: 0.98,
    roughness: 0.05,
    opacity: 1.0,
    transparent: false,
    textureLabel: 'Wafer Silicon 4 inch Tinh Khiết',
    description: 'Đĩa bán dẫn đơn tinh thể phẳng bóng tráng gương, vật liệu chế tạo vi xử lý và cảm biến MEMS.',
    interactions: {
      CO2_LASER: {
        status: 'BLOCKED_REFLECTIVE',
        statusText: 'NGUY HIỂM: NỨT VỠ NHIỆT',
        badgeColor: '#ef4444',
        effectDescription: 'Sốc nhiệt đột ngột từ tia 10.6 µm làm nứt vỡ tinh thể silicon giòn tan thành nhiều mảnh.',
        sparkColor: '#ef4444',
        canCutOrEngrave: false,
      },
      UV_LASER: {
        status: 'OPTIMAL',
        statusText: 'CẮT LẠNH QUANG HÓA VI ĐIỆN TỬ',
        badgeColor: '#10b981',
        effectDescription: 'Năng lượng 3.49 eV bẻ gãy liên kết Si-Si mà không sinh nhiệt lan truyền. Không nứt mẻ mép rãnh vi mạch (Dicing wafer).',
        sparkColor: '#c084fc',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'COMPATIBLE',
        statusText: 'ĐÁNH DẤU SỐ SERI CHIP',
        badgeColor: '#f59e0b',
        effectDescription: 'Tạo vết khắc vi mô ở mặt sau chip để nhận diện lô sản xuất.',
        sparkColor: '#f59e0b',
        canCutOrEngrave: true,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'CẢM BIẾN QUANG PHÁT HIỆN',
        badgeColor: '#06b6d4',
        effectDescription: 'Kiểm tra độ phản hồi bề mặt bán dẫn quang học.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },

  GLASS: {
    id: 'GLASS',
    name: 'Kính Thủy Tinh Quang Học (Glass)',
    category: 'Vật liệu vô cơ / Bán dẫn',
    color: '#93c5fd',
    metalness: 0.1,
    roughness: 0.05,
    opacity: 0.4,
    transparent: true,
    textureLabel: 'Kính Borosilicate Siêu Mỏng',
    description: 'Vật liệu vô cơ thạch anh vô định hình, trong suốt ở dải khả kiến nhưng hấp thụ chọn lọc ở tử ngoại và hồng ngoại.',
    interactions: {
      CO2_LASER: {
        status: 'COMPATIBLE',
        statusText: 'KHẮC MỜ NHIỆT (FROSTED GLASS)',
        badgeColor: '#06b6d4',
        effectDescription: 'Hấp thụ mạnh tạo các vết nứt tế vi kiểm soát được trên bề mặt, tạo hiệu ứng thủy tinh mờ mờ thẩm mỹ.',
        sparkColor: '#f8fafc',
        canCutOrEngrave: true,
      },
      UV_LASER: {
        status: 'OPTIMAL',
        statusText: 'CẮT KHÔNG NỨT MẺ (ZERO-CHIP)',
        badgeColor: '#10b981',
        effectDescription: 'Gia công lạnh quang hóa cắt đứt kính mỏng màn hình cảm ứng điện thoại mà không làm rạn nứt mép kính.',
        sparkColor: '#c084fc',
        canCutOrEngrave: true,
      },
      FIBER_LASER: {
        status: 'INEFFECTIVE',
        statusText: 'TRONG SUỐT HOÀN TOÀN',
        badgeColor: '#ef4444',
        effectDescription: 'Tia 1064 nm xuyên qua tấm kính như không khí, không để lại bất kỳ dấu vết nào.',
        sparkColor: '#94a3b8',
        canCutOrEngrave: false,
      },
      SENSOR_STATION: {
        status: 'COMPATIBLE',
        statusText: 'CỬA SỔ QUANG HỌC',
        badgeColor: '#06b6d4',
        effectDescription: 'Lăng kính lọc tia bảo vệ đầu thu cảm biến quang học.',
        sparkColor: '#10b981',
        canCutOrEngrave: false,
      },
    },
  },
};

