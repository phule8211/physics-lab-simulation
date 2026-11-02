import { MachineId } from '../types/lab';

export interface ComponentPart {
  name: string;
  englishName: string;
  description: string;
  materialOrSpec?: string;
}

export interface MachineDetailedSpec {
  id: MachineId;
  title: string;
  englishTitle: string;
  subtitle: string;
  inventorInfo: string;
  wavelengthBadge: string;
  categoryBadge: string;
  accentColor: string;
  
  // Section I: Nguyên lý hoạt động
  principles: {
    coreConcept: string;
    gasMixtureOrMedium?: {
      title: string;
      items: { name: string; role: string; percentage?: string }[];
    };
    energyCycleSteps: {
      step: number;
      name: string;
      description: string;
      formula?: string;
    }[];
    wavelengthDetails: string;
  };

  // Section II: Cấu tạo các bộ phận chính
  components: {
    category: string;
    parts: ComponentPart[];
  }[];

  // Section III: Phân loại phổ biến & So sánh
  classifications: {
    type: string;
    features: string;
    pros: string[];
    cons: string[];
  }[];

  // Section IV: Vật liệu tương thích & An toàn
  materialsAndSafety: {
    recommendedMaterials: string[];
    restrictedMaterials: string[];
    safetyClass: string;
    safetyProtocols: string[];
  };
}

export const PHYSICS_DATA: Record<MachineId, MachineDetailedSpec> = {
  CO2_LASER: {
    id: 'CO2_LASER',
    title: 'Máy Cắt / Khắc Laser Khí CO2',
    englishTitle: 'Carbon Dioxide Gas Laser Cutter',
    subtitle: 'Hệ thống laser khí phân tử công suất cao cho gia công phi kim',
    inventorInfo: 'Phát minh năm 1964 bởi Kumar Patel tại Bell Labs (Hoa Kỳ)',
    wavelengthBadge: '10.6 µm · Hồng ngoại xa (Far-IR)',
    categoryBadge: 'Gia công nhiệt quang học (Thermal Ablation)',
    accentColor: '#06b6d4',

    principles: {
      coreConcept:
        'Nguyên lý cốt lõi của laser CO2 dựa trên sự chuyển dời năng lượng giữa các mức dao động - quay (vibrational-rotational energy levels) của phân tử khí carbon dioxide (CO2), được hỗ trợ bởi các khí phụ trợ là Nitơ (N2) và Hê-li (He) trong chu trình 4 mức năng lượng.',
      gasMixtureOrMedium: {
        title: 'Thành phần hỗn hợp khí trong ống phóng (Tỷ lệ điển hình CO2 : N2 : He ≈ 1 : 1 : 8)',
        items: [
          {
            name: 'Khí CO2 (Khí hoạt tính)',
            role: 'Trực tiếp phát ra bức xạ laser chính thông qua quá trình kích thích dao động bất đối xứng.',
            percentage: '10 - 15%',
          },
          {
            name: 'Khí N2 (Khí truyền năng lượng)',
            role: 'Hấp thụ năng lượng từ dòng phóng điện tử và truyền năng lượng cộng hưởng gần như hoàn hảo sang mức dao động của CO2.',
            percentage: '15 - 20%',
          },
          {
            name: 'Khí He (Khí tản nhiệt & khử kích thích)',
            role: 'Có độ dẫn nhiệt cực cao, làm mát tâm ống phóng ra thành áo nước; đồng thời va chạm làm rỗng mức năng lượng dưới của CO2 để duy trì đảo lộn mật độ cư trú (Population Inversion).',
            percentage: '65 - 75%',
          },
        ],
      },
      energyCycleSteps: [
        {
          step: 1,
          name: 'Kích thích điện tử (Electron Impact)',
          description:
            'Khi đặt điện áp cao (hàng chục kV) qua hai điện cực, các electron tự do được gia tốc mạnh trong điện trường và va chạm trực tiếp với các phân tử Nitơ (N2). Phân tử N2 chuyển lên trạng thái kích thích dao động v=1 có thời gian sống rất dài (trạng thái giả bền - metastable state).',
          formula: 'e^- + N_2 \\rightarrow N_2^* (v=1) + e^-',
        },
        {
          step: 2,
          name: 'Truyền năng lượng cộng hưởng (Resonant Energy Transfer)',
          description:
            'Phân tử N2 kích thích va chạm va chạm loại 2 với phân tử CO2 ở trạng thái cơ bản. Vì mức năng lượng dao động v=1 của N2 (2331 cm^-1) gần như trùng khít với mức dao động kéo giãn bất đối xứng (00^01, 2349 cm^-1) của CO2, năng lượng được truyền qua gần như 100%.',
          formula: 'N_2^* (v=1) + CO_2 (00^00) \\rightarrow N_2 (v=0) + CO_2 (00^01) - \\Delta E',
        },
        {
          step: 3,
          name: 'Phát xạ cảm ứng (Stimulated Emission)',
          description:
            'Phân tử CO2 từ trạng thái 00^01 bị kích thích bởi một photon cùng pha để chuyển dời cưỡng bức xuống mức dao động kéo giãn đối xứng 10^00, giải phóng photon có bước sóng λ = 10.6 µm. Đây là bước sóng chiếm ưu thế quang học với tiết diện phát xạ lớn nhất.',
          formula: 'CO_2^* (00^01) + h\\nu \\rightarrow CO_2 (10^00) + 2h\\nu \\quad (\\lambda = 10.6\\,\\mu\\text{m})',
        },
        {
          step: 4,
          name: 'Làm rỗng mức dưới & Tản nhiệt (De-excitation via Helium)',
          description:
            'Từ mức 10^00, phân tử CO2 va chạm liên tục với các nguyên tử Helium (He) nhẹ để khử kích thích nhanh chóng về mức cơ bản 00^00. Nhiệt năng sinh ra được He dẫn nhanh ra thành ống làm mát bằng nước tuần hoàn.',
          formula: 'CO_2 (10^00) + He \\rightarrow CO_2 (00^00) + He + \\text{Nhiệt năng}',
        },
      ],
      wavelengthDetails:
        'Bước sóng 10.6 µm thuộc vùng hồng ngoại xa (Far-IR). Tại bước sóng này, các liên kết hữu cơ và polymer (gỗ, mica, da, nhựa) có độ hấp thụ quang học cực cao (> 90%), biến năng lượng ánh sáng thành nhiệt tức thời để bốc hơi vật liệu. Tuy nhiên, kim loại bóng phản xạ đến 98% bước sóng này.',
    },

    components: [
      {
        category: '1. Ống phóng & Buồng cộng hưởng quang học',
        parts: [
          {
            name: 'Ống phóng điện (Discharge Tube)',
            englishName: 'CO2 Laser Tube',
            description: 'Ống thủy tinh borosilicate 3 lớp hoặc gốm kim loại kín khí, tích hợp áo nước làm mát tuần hoàn quanh buồng phóng điện.',
            materialOrSpec: 'Thủy tinh thạch anh / Borosilicate 3.3',
          },
          {
            name: 'Gương phản xạ toàn phần (Rear Mirror)',
            englishName: 'Total Reflector Mirror',
            description: 'Đặt ở đuôi ống phóng, phản hồi 99.7% chùm quang trở lại môi trường hoạt chất để khuếch đại tiếp tục.',
            materialOrSpec: 'Đồng mạ vàng (Au coated) hoặc Si/Ge',
          },
          {
            name: 'Gương trích xuất bán phản xạ (Output Coupler)',
            englishName: 'Output Coupler (OC)',
            description: 'Đặt ở đầu ra ống phóng, cho phép 10 - 20% chùm bức xạ thoát ra tạo thành tia laser làm việc, phản xạ 80 - 90% còn lại.',
            materialOrSpec: 'Kẽm Selenide (ZnSe) trong suốt với dải hồng ngoại',
          },
        ],
      },
      {
        category: '2. Hệ thống quang học dẫn đường & Hội tụ',
        parts: [
          {
            name: 'Bộ 3 gương đổi hướng (Bending Mirrors)',
            englishName: 'Optics Reflective Mirrors',
            description: 'Gương phẳng dẫn hướng chùm tia 90 độ từ ống laser đến trục Y, trục X và chúc xuống đầu cắt.',
            materialOrSpec: 'Silicon (Si) hoặc Molypden (Mo) tráng phủ vàng kim',
          },
          {
            name: 'Thấu kính hội tụ (Focusing Lens)',
            englishName: 'ZnSe Focal Lens',
            description: 'Hội tụ chùm tia song song đường kính 5mm thành điểm tiêu cự siêu nhỏ (0.1 - 0.2mm) với mật độ công suất hàng triệu W/cm2.',
            materialOrSpec: 'Kẽm Selenua (ZnSe) phủ lớp chống phản xạ AR vàng',
          },
        ],
      },
      {
        category: '3. Nguồn điện & Hệ thống làm mát',
        parts: [
          {
            name: 'Bộ nguồn cao áp (High Voltage PSU)',
            englishName: 'HV DC Power Supply',
            description: 'Cung cấp điện áp mồi 20 - 40 kV để ion hóa chất khí, và duy trì dòng ổn định 15 - 30 mA trong lúc cắt.',
            materialOrSpec: 'Flyback Transformer PWM điều khiển',
          },
          {
            name: 'Máy làm mát nước tuần hoàn (Water Chiller)',
            englishName: 'Industrial Water Chiller',
            description: 'Duy trì nước cất tinh khiết ở 20 - 24°C để làm mát ống phóng liên tục, ngăn ngừa tụt công suất và nứt vỡ ống.',
            materialOrSpec: 'Chiller công nghiệp CW-5000 / CW-5200',
          },
        ],
      },
      {
        category: '4. Hệ cơ khí & Trợ khí phụ trợ',
        parts: [
          {
            name: 'Đầu trợ khí nén (Air Assist Nozzle)',
            englishName: 'Air Assist Compressor Nozzle',
            description: 'Thổi khí nén áp lực cao ngay tại tiêu điểm để dập tắt ngọn lửa, thổi sạch xỉ cháy và bảo vệ mặt thấu kính ZnSe khỏi khói bụi.',
            materialOrSpec: 'Đầu phun đồng thau / Khí nén không dầu',
          },
          {
            name: 'Quạt hút & Lọc khói công nghiệp',
            englishName: 'Exhaust Fume Extractor',
            description: 'Hút toàn bộ khói độc hại, bụi mịn và khí hữu cơ VOCs sinh ra khi đốt acrylic/gỗ ra khỏi buồng làm việc kín.',
            materialOrSpec: 'Quạt ly tâm công suất 550W - 750W',
          },
        ],
      },
    ],

    classifications: [
      {
        type: '1. Ống Laser Thủy tinh một chiều (Glass DC Tube)',
        features: 'Sử dụng điện áp DC cao áp kích thích hỗn hợp khí trong ống thủy tinh 3 lớp có áo nước làm mát tuần hoàn.',
        pros: ['Chi phí đầu tư ban đầu rất thấp', 'Dễ dàng thay thế linh kiện', 'Công suất lớn (40W đến 180W)'],
        cons: ['Tuổi thọ trung bình thấp (2.000 - 8.000 giờ)', 'Chùm tia có góc phân kỳ lớn hơn', 'Kích thước cồng kềnh (dài 1m - 1.8m)'],
      },
      {
        type: '2. Ống Laser Kim loại tần số vô tuyến (Metal RF Sealed Tube)',
        features: 'Vỏ kim loại kín nguyên khối, kích thích bằng sóng vô tuyến RF dải MHz, làm mát bằng quạt gió hoặc nước tuần hoàn.',
        pros: ['Chất lượng chùm tia cực đỉnh (M^2 ≈ 1.1)', 'Tuổi thọ rất cao (> 20.000 - 45.000 giờ)', 'Tần số xung cực nhanh, phù hợp khắc siêu tốc'],
        cons: ['Giá thành đắt gấp 5 - 10 lần ống thủy tinh', 'Đòi hỏi bộ nguồn RF chuyên biệt'],
      },
    ],

    materialsAndSafety: {
      recommendedMaterials: ['Mica (Acrylic trong & màu)', 'Gỗ tự nhiên, MDF, Plywood', 'Da thật, giả da PU', 'Cao su làm con dấu', 'Vải dệt, Giấy carton'],
      restrictedMaterials: ['Kim loại trần (Phản xạ ngược làm vỡ thấu kính)', 'Nhựa PVC / Vinyl (Tạo khí Clo & Axit HCl phá hủy máy)', 'Sợi Carbon / Teflon'],
      safetyClass: 'Class 4 Laser Product (Cấp độ nguy hiểm cao nhất)',
      safetyProtocols: [
        'Bức xạ 10.6 µm vô hình có thể gây bỏng giác mạc tức thì; tuyệt đối không nhìn trực tiếp chùm tia.',
        'Đeo kính bảo hộ quang học chuyên dụng có độ suy giảm OD 5+ tại dải 10,600 nm.',
        'Không bao giờ vận hành máy mà không có hệ thống nước làm mát (Chiller) và quạt hút khói hoạt động.',
        'Trang bị bình chữa cháy CO2 cạnh máy do nguy cơ bắt lửa vật liệu phi kim.',
      ],
    },
  },

  UV_LASER: {
    id: 'UV_LASER',
    title: 'Máy Khắc Laser Tử Ngoại UV',
    englishTitle: 'Ultraviolet Cold Laser Marking System',
    subtitle: 'Công nghệ gia công lạnh quang hóa cho vật liệu siêu nhạy cảm và vi mạch',
    inventorInfo: 'Phát triển dựa trên công nghệ laser thể rắn bơm diode (DPSS) và tinh thể phi tuyến',
    wavelengthBadge: '355 nm · Tử ngoại sóng ngắn (UV-A)',
    categoryBadge: 'Gia công lạnh quang hóa (Photochemical Ablation)',
    accentColor: '#8b5cf6',

    principles: {
      coreConcept:
        'Khác với cơ chế bốc hơi nhiệt của CO2, laser UV hoạt động theo cơ chế gia công lạnh (Cold Processing / Photochemical Ablation). Năng lượng của từng photon tử ngoại cực cao, đủ sức bẻ gãy trực tiếp các liên kết hóa học của phân tử mà không sinh nhiệt phá hủy cấu trúc xung quanh.',
      gasMixtureOrMedium: {
        title: 'Môi trường hoạt chất rắn & Tinh thể quang học phi tuyến',
        items: [
          {
            name: 'Laser tinh thể rắn Nd:YVO4 hoặc Nd:YAG',
            role: 'Được bơm quang học bằng laser diode bán dẫn 808 nm, phát ra chùm tia laser gốc ở bước sóng hồng ngoại 1064 nm.',
          },
          {
            name: 'Tinh thể phi tuyến LBO bậc hai (SHG)',
            role: 'Nhân đôi tần số dao động quang học từ 1064 nm xuống 532 nm (ánh sáng xanh lá cây khả kiến).',
          },
          {
            name: 'Tinh thể phi tuyến LBO bậc ba (THG)',
            role: 'Trộn tần số giữa chùm 1064 nm và 532 nm để tạo ra chùm tia tử ngoại cực ngắn 355 nm.',
          },
        ],
      },
      energyCycleSteps: [
        {
          step: 1,
          name: 'Bơm Diode & Phát xạ hồng ngoại gốc',
          description:
            'Diode laser 808 nm bơm kích thích các ion Neodymium trong tinh thể Nd:YVO4, tạo hiện tượng đảo lộn mật độ và phát xung laser ngắn ở bước sóng 1064 nm.',
          formula: '\\lambda_0 = 1064\\,\\text{nm} \\quad (h\\nu_0 \\approx 1.17\\,\\text{eV})',
        },
        {
          step: 2,
          name: 'Nhân đôi tần số quang học (SHG - Second Harmonic)',
          description:
            'Chùm tia 1064 nm đi qua tinh thể phi tuyến LBO được căn chỉnh góc pha chính xác, hai photon 1064 nm kết hợp thành một photon 532 nm (bước sóng giảm một nửa).',
          formula: '\\omega_1 = 2\\omega_0 \\rightarrow \\lambda_1 = 532\\,\\text{nm} \\quad (h\\nu_1 \\approx 2.33\\,\\text{eV})',
        },
        {
          step: 3,
          name: 'Trộn tổng tần số (THG - Third Harmonic Generation)',
          description:
            'Chùm tia 532 nm trộn pha với phần còn lại của chùm 1064 nm trong tinh thể phi tuyến thứ hai để sinh ra photon có năng lượng bằng tổng hai photon, tạo ra bước sóng 355 nm.',
          formula: '\\omega_2 = \\omega_0 + \\omega_1 \\rightarrow \\lambda_2 = 355\\,\\text{nm} \\quad (h\\nu_2 \\approx 3.49\\,\\text{eV})',
        },
        {
          step: 4,
          name: 'Bẻ gãy liên kết phân tử lạnh (Photochemical Ablation)',
          description:
            'Năng lượng photon 3.49 eV lớn hơn năng lượng liên kết của hầu hết các liên kết cộng hóa trị (C-C: 3.6 eV, C-H: 4.3 eV, C-O: 3.7 eV). Vật liệu bị phân ly trực tiếp thành các phân tử khí nhỏ mà không nung nóng chảy, vùng ảnh hưởng nhiệt (HAZ) gần như bằng không.',
        },
      ],
      wavelengthDetails:
        'Bước sóng 355 nm có kích thước điểm hội tụ cực nhỏ (do giới hạn nhiễu xạ tỉ lệ thuận với bước sóng d ≈ 1.22 λ f / D). Vết khắc có độ mịn đến mức micromet, không có vết cháy sém hay gờ nhiệt.',
    },

    components: [
      {
        category: '1. Module Nguồn Laser UV DPSS',
        parts: [
          {
            name: 'Buồng cộng hưởng tinh thể rắn (DPSS Cavity)',
            englishName: 'Diode-Pumped Solid-State Resonator',
            description: 'Chứa tinh thể Nd:YVO4 gắn đế đồng làm mát nhiệt điện TEC, buồng chân không làm kín chống ẩm.',
            materialOrSpec: 'Nd:YVO4 / Nd:YAG quang học cao cấp',
          },
          {
            name: 'Bộ tinh thể nhân ba tần số (Harmonic Crystals)',
            englishName: 'LBO Non-linear Crystals',
            description: 'Hệ thống tinh thể LBO điều khiển nhiệt độ chính xác bằng lò vi nhiệt (Oven) để duy trì góc phối hợp pha tối ưu.',
            materialOrSpec: 'Lithium Triborate (LBO)',
          },
          {
            name: 'Bộ chuyển mạch Q (Acousto-Optic Q-Switch)',
            englishName: 'Acousto-Optic Q-Switch',
            description: 'Nén năng lượng thành các xung cực ngắn (nanosecond, 10 - 30 ns) với công suất đỉnh lên tới hàng chục kilowatt.',
            materialOrSpec: 'Thạch anh truyền sóng âm cao tần RF',
          },
        ],
      },
      {
        category: '2. Hệ thống quang dẫn Galvo tử ngoại',
        parts: [
          {
            name: 'Gương quét Galvo phủ UV (UV Galvanometer Mirrors)',
            englishName: 'UV Coated Galvo Mirrors',
            description: 'Gặp gương siêu nhẹ tráng phủ màng điện môi phản xạ cao tại 355 nm, quét tốc độ hàng ngàn mm/s.',
            materialOrSpec: 'Fused Silica tráng phủ Dielectric 355nm',
          },
          {
            name: 'Thấu kính trường phẳng F-Theta UV',
            englishName: 'UV F-Theta Telecentric Lens',
            description: 'Đảm bảo chùm tia luôn chiếu thẳng góc 90 độ xuống mặt phôi trên toàn bộ vùng làm việc, triệt tiêu méo hình.',
            materialOrSpec: 'Thạch anh nung chảy (Fused Silica) chống hấp thụ UV',
          },
        ],
      },
      {
        category: '3. Cơ điện & Buồng bảo hộ',
        parts: [
          {
            name: 'Buồng bảo hộ Class 1 có cửa kính lọc tia UV',
            englishName: 'Laser Enclosure & UV Window',
            description: 'Ngăn chặn bức xạ tán xạ tử ngoại độc hại thoát ra môi trường, kính quan sát hấp thụ tuyệt đối bước sóng 355 nm.',
            materialOrSpec: 'Acrylic chuyên dụng màu hổ phách/xanh lục OD 6+',
          },
          {
            name: 'Bộ điều khiển nhiệt độ kép (Dual TEC Chiller)',
            englishName: 'High-Precision Dual Chiller',
            description: 'Kiểm soát nhiệt độ tinh thể LBO và diode bơm với độ chính xác ±0.1°C nhằm duy trì hiệu suất biến đổi tần số ổn định.',
            materialOrSpec: 'Làm mát Peltier TEC kết hợp máy nén lạnh',
          },
        ],
      },
    ],

    classifications: [
      {
        type: '1. Laser UV Nanosecond (DPSS Nanosecond)',
        features: 'Độ rộng xung từ 10 đến 30 nanosecond, tần số lặp xung từ 20 kHz đến 200 kHz. Là dòng máy phổ biến nhất hiện nay.',
        pros: ['Giá thành hợp lý trong phân khúc UV', 'Độ bền cao, vận hành ổn định', 'Rất đa dụng trên nhựa và kính'],
        cons: ['Vẫn có một lượng vi nhiệt rất nhỏ trên một số kim loại mềm'],
      },
      {
        type: '2. Laser UV Picosecond / Femtosecond (Ultrafast UV)',
        features: 'Độ rộng xung siêu ngắn (hàng pico hoặc femto-giây). Quá trình bẻ gãy liên kết diễn ra trước khi nhiệt kịp truyền sang mạng tinh thể.',
        pros: ['Hoàn toàn không có vùng ảnh hưởng nhiệt HAZ = 0', 'Cắt kính siêu mỏng màn hình điện thoại, cắt wafer bán dẫn không nứt'],
        cons: ['Chi phí thiết bị cực kỳ đắt đỏ', 'Đòi hỏi môi trường phòng sạch khắt khe'],
      },
    ],

    materialsAndSafety: {
      recommendedMaterials: ['Nhựa polymer (HDPE, PE, PVC, ABS, Silicon y tế)', 'Thủy tinh mỏng, Kính quang học, Tinh thể Sapphire', 'Mạch in PCB / FPC, Wafer Silicon bán dẫn', 'Vàng, Bạc, Đồng mạ, Kim loại quý không gây biến dạng'],
      restrictedMaterials: ['Gỗ dày, Mica dày (Cần công suất nhiệt lớn của CO2, UV cắt rất chậm)', 'Vật liệu tán xạ phản quang không có buồng che'],
      safetyClass: 'Class 4 (khi mở nắp) / Class 1 (khi đóng nắp buồng bảo hộ)',
      safetyProtocols: [
        'Bức xạ tử ngoại 355 nm cực kỳ nguy hiểm cho giác mạc và võng mạc, có thể gây đục thủy tinh thể và tổn thương da tương tự bỏng nắng cấp tính.',
        'Bắt buộc đeo kính bảo hộ lọc tia UV chuyên dụng (OD 6+ tại 355 nm).',
        'Khóa liên động (Interlock) cửa buồng bảo hộ phải luôn kích hoạt: mở cửa là tự động ngắt nguồn phát laser.',
      ],
    },
  },

  FIBER_LASER: {
    id: 'FIBER_LASER',
    title: 'Máy Khắc Laser Fiber Sợi Quang',
    englishTitle: 'Ytterbium Fiber Laser Marking System',
    subtitle: 'Nguồn phát laser sợi quang học thế hệ mới chuyên trị kim loại và gia công tốc độ cao',
    inventorInfo: 'Công nghệ laser sợi quang phát triển mạnh mẽ từ những năm 1990 bởi IPG Photonics',
    wavelengthBadge: '1064 nm · Cận hồng ngoại (Near-IR)',
    categoryBadge: 'Quét chùm tia Galvo tốc độ cao (Galvanometer)',
    accentColor: '#f59e0b',

    principles: {
      coreConcept:
        'Laser Fiber sử dụng một sợi cáp quang tích cực có lõi pha tạp ion đất hiếm Ytterbium (Yb3+) làm môi trường khuếch đại quang học. Ánh sáng được tạo ra và dẫn truyền hoàn toàn bên trong sợi cáp quang, mang lại độ tin cậy tuyệt đối, không cần căn chỉnh gương cộng hưởng cơ khí.',
      gasMixtureOrMedium: {
        title: 'Môi trường sợi quang & Nguồn bơm',
        items: [
          {
            name: 'Lõi sợi quang pha tạp Ytterbium (Yb3+ doped)',
            role: 'Hấp thụ photon bơm ở 915 nm hoặc 976 nm và phát xạ cưỡng bức tạo chùm tia 1064 nm với hiệu suất lượng tử cực cao (> 70%).',
          },
          {
            name: 'Cách tử Bragg sợi quang (Fiber Bragg Gratings - FBG)',
            role: 'Được ghi trực tiếp lên hai đầu sợi quang, đóng vai trò là gương phản xạ toàn phần và gương bán phản xạ tích hợp.',
          },
          {
            name: 'Module Laser Diode đa kênh (Pump Diodes)',
            role: 'Bơm năng lượng quang học liên tục vào lớp vỏ bọc quang học (cladding) của sợi cáp quang.',
          },
        ],
      },
      energyCycleSteps: [
        {
          step: 1,
          name: 'Bơm quang học từ Diode bán dẫn',
          description:
            'Nhiều diode laser bán dẫn công suất cao phát bước sóng 976 nm bơm năng lượng vào vỏ sợi quang kép (Double-clad fiber). Ánh sáng bơm phản xạ toàn phần bên trong và cắt qua lõi pha tạp Ytterbium nhiều lần.',
        },
        {
          step: 2,
          name: 'Khuếch đại photon trong lõi sợi quang (FBG Cavity)',
          description:
            'Các ion Yb3+ bị kích thích chuyển dời năng lượng và phát ra photon 1064 nm. Cặp cách tử sợi quang FBG ở hai đầu phản hồi chùm photon qua lại hàng triệu lần trong lõi sợi, tạo hiện tượng khuếch đại ánh sáng cảm ứng.',
        },
        {
          step: 3,
          name: 'Dẫn truyền qua cáp sợi quang mềm (Beam Delivery)',
          description:
            'Chùm tia laser sau khi ra khỏi buồng cộng hưởng được dẫn trực tiếp qua cáp bọc thép quang học đến đầu khắc mà không cần hệ thống gương chuyển hướng cồng kềnh.',
        },
        {
          step: 4,
          name: 'Điều hướng bằng cặp gương Galvo điện động siêu tốc',
          description:
            'Thay vì dùng cụm trục cơ khí XY nặng nề, chùm tia phản xạ qua 2 gương siêu nhẹ gắn trên trục động cơ servo độ chính xác cao. Chùm tia có thể vẽ ký tự, mã QR hoặc hình ảnh với tốc độ lên đến 7.000 - 12.000 mm/s.',
        },
      ],
      wavelengthDetails:
        'Bước sóng 1064 nm được hấp thụ rất mạnh bởi các kim loại (sắt, thép, nhôm, đồng, titan). Năng lượng tập trung làm nóng chảy hoặc bốc hơi lớp bề mặt kim loại trong khoảng thời gian phần tỷ giây, tạo nên các đường khắc sắc nét hoặc lớp màu oxy hóa thẩm mỹ.',
    },

    components: [
      {
        category: '1. Nguồn phát Laser Fiber (Laser Source)',
        parts: [
          {
            name: 'Module nguồn sợi quang Ytterbium',
            englishName: 'Fiber Laser Source Engine',
            description: 'Khối kim loại kín chứa sợi quang pha tạp Yb, diode bơm và bộ cách ly quang học (Optical Isolator) chống phản xạ ngược.',
            materialOrSpec: 'Nguồn IPG / Raycus / JPT (20W - 100W)',
          },
          {
            name: 'Bộ cách ly quang học đầu ra (Optical Isolator)',
            englishName: 'Collimator & Isolator',
            description: 'Ngăn chặn chùm tia 1064 nm bị phản xạ ngược từ bề mặt kim loại bóng (vàng, bạc, đồng) quay lại làm cháy nguồn laser.',
            materialOrSpec: 'Tinh thể Faraday TGG và bản phân cực',
          },
        ],
      },
      {
        category: '2. Đầu quét Galvo & Thấu kính hội tụ',
        parts: [
          {
            name: 'Đầu quét Galvanometer Scanner',
            englishName: 'High-Speed Galvo Head',
            description: 'Chứa 2 động cơ servo góc xoay phản hồi quang học cực nhạy, điều khiển cặp gương trục X và trục Y chuyển động đồng bộ.',
            materialOrSpec: 'Động cơ Galvo độ trễ micro-giây (Sino-Galvo)',
          },
          {
            name: 'Thấu kính F-Theta 1064 nm',
            englishName: 'F-Theta Scan Field Lens',
            description: 'Biến đổi chuyển động quét góc θ của gương thành độ dịch chuyển tuyến tính phẳng $y = f \\cdot \\theta$ trên bàn làm việc.',
            materialOrSpec: 'Vùng quét: 110x110mm hoặc 200x200mm, tiêu cự F=160mm',
          },
        ],
      },
      {
        category: '3. Cơ khí bàn gá & Điều khiển',
        parts: [
          {
            name: 'Trụ nâng cơ khí trục Z (Z-Axis Column)',
            englishName: 'Vertical Focus Adjust Column',
            description: 'Điều chỉnh nâng hạ đầu Galvo để căn đúng tiêu cự thấu kính xuống bề mặt phôi bằng thước đo millimet chính xác.',
            materialOrSpec: 'Thanh răng hợp kim nhôm định hình 500mm / 800mm',
          },
          {
            name: 'Bàn thao tác nhôm lỗ ren M6 (Optical Breadboard)',
            englishName: 'Aluminum Workplate M6 Grid',
            description: 'Mặt bàn nhôm anodized dày dặn với lưới lỗ ren M6 khoảng cách 25mm giúp bắt đồ gá kẹp phôi nhanh chóng.',
            materialOrSpec: 'Hợp kim nhôm 6061-T6 xử lý bề mặt',
          },
        ],
      },
    ],

    classifications: [
      {
        type: '1. Nguồn Laser Fiber Q-Switched (Q-Switched Fiber)',
        features: 'Độ rộng xung cố định (~100 ns), tần số từ 20 đến 80 kHz. Dòng máy kinh tế và bền bỉ nhất cho khắc mã vạch, số seri kim loại.',
        pros: ['Giá thành rẻ nhất trong dòng fiber', 'Bền bỉ, hoạt động liên tục 100.000 giờ không cần bảo trì', 'Khắc sâu kim loại rất tốt'],
        cons: ['Không thể điều chỉnh độ rộng xung', 'Khó khắc màu trên inox, dễ làm cháy đen mép chi tiết siêu mỏng'],
      },
      {
        type: '2. Nguồn Laser Fiber MOPA (Master Oscillator Power Amplifier)',
        features: 'Cho phép tùy chỉnh độc lập độ rộng xung (từ 2 ns đến 500 ns) và tần số quét (lên đến 4.000 kHz).',
        pros: ['Khắc màu tuyệt đẹp trên thép không gỉ (Inox Annealing) và titan', 'Bóc lớp sơn đen trên nhôm Anodized mà không làm hỏng kim loại', 'Khắc đen độ tương phản cao trên bề mặt nhôm'],
        cons: ['Giá thành cao hơn dòng Q-switched khoảng 30 - 50%'],
      },
    ],

    materialsAndSafety: {
      recommendedMaterials: ['Thép không gỉ (Inox 304, 316)', 'Nhôm nguyên chất, Nhôm Anodized', 'Vàng, Bạc, Đồng thau, Đồng đỏ', 'Titanium, Hợp kim Carbide, Thép khuôn', 'Nhựa công nghiệp tối màu (ABS, POM)'],
      restrictedMaterials: ['Gỗ, Da, Vải (Gần như không hấp thụ 1064 nm, bị trơ)', 'Thủy tinh trong suốt (Tia laser xuyên qua hoàn toàn)'],
      safetyClass: 'Class 4 Laser Product',
      safetyProtocols: [
        'Bước sóng 1064 nm xuyên qua giác mạc và hội tụ trực tiếp lên võng mạc mà không gây chói mắt (vì là hồng ngoại vô hình), có thể gây mù mắt vĩnh viễn trước khi kịp chớp mắt!',
        'Bắt buộc đeo kính bảo hộ lọc bước sóng 1064 nm (OD 6+ hoặc OD 7+).',
        'Cẩn thận phản xạ gương khi khắc các bề mặt kim loại đánh bóng loáng (vàng, gương inox).',
      ],
    },
  },

  SENSOR_STATION: {
    id: 'SENSOR_STATION',
    title: 'Cụm Cảm Biến An Toàn & Giám Sát Xưởng',
    englishTitle: 'Industrial Laser Safety & Monitoring Sensors',
    subtitle: 'Hệ thống bảo vệ đa kênh: Quang học, Nhiệt độ bức xạ, Lưu lượng dòng chảy và Khí khói',
    inventorInfo: 'Tiêu chuẩn an toàn công nghiệp quốc tế ISO 11553 & ANSI Z136 cho gia công laser',
    wavelengthBadge: 'Cảm biến đa kênh (Optical / IR / Hall / Photoelectric)',
    categoryBadge: 'Hệ thống an toàn & Khóa liên động (Interlock)',
    accentColor: '#10b981',

    principles: {
      coreConcept:
        'Hệ thống cảm biến trong xưởng laser đóng vai trò mắt xích sinh tử để bảo vệ con người khỏi bức xạ vô hình, bảo vệ ống phóng laser khỏi quá nhiệt phá hủy, và ngăn ngừa thảm họa cháy nổ do tia laser công suất cao gây ra.',
      energyCycleSteps: [
        {
          step: 1,
          name: 'Đo nhiệt hồng ngoại không tiếp xúc (Định luật Stefan-Boltzmann)',
          description:
            'Mọi vật thể tại nhiệt độ T phát ra bức xạ nhiệt theo định luật E = ε σ T^4. Cảm biến nhiệt điện trở (Thermopile) thu nhận quang phổ hồng ngoại 5.5 - 14 µm từ điểm gia công và chuyển thành tín hiệu điện áp tỷ lệ với nhiệt độ thực tế mà không cần chạm vào vật.',
          formula: 'E = \\epsilon \\cdot \\sigma \\cdot T^4 \\quad (\\sigma = 5.67 \\times 10^{-8}\\,\\text{W/m}^2\\text{K}^4)',
        },
        {
          step: 2,
          name: 'Giám sát lưu lượng nước giải nhiệt (Hiệu ứng Hall)',
          description:
            'Nước làm mát từ Chiller chảy qua buồng cảm biến làm quay cánh quạt từ tính. Khi các cực từ quét qua chip bán dẫn Hall, điện áp Hall biến thiên sinh ra xung vuông số. Tần số xung tỉ lệ thuận với lưu lượng nước (Lít/phút).',
          formula: 'V_H = \\frac{I \\cdot B}{n \\cdot e \\cdot t} \\rightarrow f_{\\text{xung}} \\propto Q_{\\text{lưu lượng}}',
        },
        {
          step: 3,
          name: 'Phát hiện khói quang điện (Hiệu ứng tán xạ Tyndall)',
          description:
            'Một diode phát hồng ngoại và một photodiode thu đặt lệch góc nhau 90 độ trong buồng tối chữ Mê cung (Labyrinth). Ở trạng thái bình thường, ánh sáng đi thẳng và không chạm photodiode. Khi có hạt khói/bụi lọt vào buồng, ánh sáng bị tán xạ đập vào photodiode, kích hoạt mạch ngắt khẩn cấp.',
        },
        {
          step: 4,
          name: 'Khóa an toàn nắp máy quang học (Photo-Interrupter Switch)',
          description:
            'Khi nắp bảo vệ máy bị mở, chùm quang hồng ngoại rãnh chữ U bị ngắt, rơ-le an toàn ngắt trực tiếp đường cấp cao áp của nguồn laser trong vòng 10 phần triệu giây (10 µs), ngăn tia laser phát ra khi người dùng đang thao tác tay.',
        },
      ],
      wavelengthDetails:
        'Kết hợp cảm biến hồng ngoại nhiệt (5.5 - 14 µm), cảm biến quang điện tán xạ (880 - 940 nm) và cảm biến hiệu ứng Hall tạo thành vành đai an toàn 3 lớp cho toàn bộ phòng thí nghiệm.',
    },

    components: [
      {
        category: '1. Cảm biến giám sát nhiệt độ gia công',
        parts: [
          {
            name: 'Đầu đo nhiệt hồng ngoại không tiếp xúc (IR Thermometer)',
            englishName: 'MLX90614 Non-Contact IR Thermopile',
            description: 'Thu nhận bức xạ nhiệt hồng ngoại từ phôi cắt; xuất dữ liệu nhiệt độ số qua chuẩn giao tiếp I2C / SMBus.',
            materialOrSpec: 'Dải đo: -70°C đến +380°C, độ phân giải 0.02°C',
          },
          {
            name: 'Mạch ngắt ngưỡng nhiệt độ quá mức',
            englishName: 'Over-temperature Interlock Trigger',
            description: 'Nếu nhiệt độ phôi vượt quá 120°C (dấu hiệu phôi bị kẹt và bốc cháy), mạch kích hoạt còi báo động và ngắt nguồn laser ngay lập tức.',
          },
        ],
      },
      {
        category: '2. Cảm biến lưu lượng nước làm mát Chiller',
        parts: [
          {
            name: 'Đầu đo lưu lượng dòng chảy (Flow Sensor)',
            englishName: 'Hall-Effect Water Flow Turbine Sensor',
            description: 'Lắp nối tiếp trên đường ống nước giải nhiệt cấp cho laser CO2; phát hiện dòng chảy bị ngưng trệ, gập ống hoặc chiller tắt.',
            materialOrSpec: 'Dải lưu lượng: 1 - 30 L/phút, áp lực chịu đựng < 1.75 MPa',
          },
          {
            name: 'Rơ-le bảo vệ ống phóng nước (Water Protection Relay)',
            englishName: 'Water Protection Signal Relay',
            description: 'Nối trực tiếp vào chân tín hiệu `WP` (Water Protect) trên bo mạch điều khiển máy laser. Không có nước = Máy không cho phép phát tia.',
          },
        ],
      },
      {
        category: '3. Cảm biến khói quang & Báo cháy tự động',
        parts: [
          {
            name: 'Đầu báo khói quang điện buồng tối (Optical Smoke Detector)',
            englishName: 'Photoelectric Dark-Chamber Smoke Sensor',
            description: 'Gắn ngay miệng họng hút khói để phát hiện khói bất thường hoặc quạt hút bị hỏng.',
            materialOrSpec: 'Bước sóng thu phát hồng ngoại: 940 nm',
          },
          {
            name: 'Cảm biến nồng độ khí độc hữu cơ (VOC / CO Gas Sensor)',
            englishName: 'Electrochemical Toxic Gas Sensor',
            description: 'Giám sát nồng độ khí CO và khí monome độc hại sinh ra khi cắt nhựa acrylic trong phòng thí nghiệm.',
            materialOrSpec: 'Cảm biến MQ-7 / MQ-135',
          },
        ],
      },
      {
        category: '4. Khóa liên động nắp buồng (Interlock)',
        parts: [
          {
            name: 'Công tắc quang ngắt an toàn nắp máy',
            englishName: 'Safety Optical Limit / Interlock Switch',
            description: 'Tự động cô lập mạch kích phát tia laser khi người vận hành nhấc nắp mica hoặc mở cửa phòng bảo hộ.',
            materialOrSpec: 'Tiêu chuẩn an toàn SIL 3 / PL e',
          },
        ],
      },
    ],

    classifications: [
      {
        type: '1. Hệ thống giám sát thụ động (Passive Monitoring)',
        features: 'Chỉ hiển thị thông số (nhiệt độ, lưu lượng) lên màn hình đồng hồ để người dùng tự theo dõi bằng mắt.',
        pros: ['Cấu trúc đơn giản, chi phí rẻ'],
        cons: ['Phụ thuộc vào sự chú ý của người vận hành; không tự ngăn được tai nạn khi người dùng vắng mặt'],
      },
      {
        type: '2. Hệ thống khóa liên động chủ động (Active Hardware Interlock)',
        features: 'Tín hiệu từ cảm biến được đấu dây cứng (hardware interlocked) trực tiếp qua chuỗi rơ-le an toàn ngắt nguồn điện.',
        pros: ['Độ tin cậy tối đa, thời gian đáp ứng cực nhanh (< 20 ms), tự động bảo vệ kể cả khi phần mềm máy tính bị treo'],
        cons: ['Cần thiết kế mạch điện chuyên nghiệp và kiểm tra định kỳ'],
      },
    ],

    materialsAndSafety: {
      recommendedMaterials: ['Bắt buộc trang bị trên mọi hệ thống máy laser công nghiệp Class 3B và Class 4'],
      restrictedMaterials: ['Tuyệt đối không được bypass (đấu tắt) dây cảm biến lưu lượng nước hoặc công tắc nắp máy'],
      safetyClass: 'Hệ thống an toàn phòng thí nghiệm tiêu chuẩn',
      safetyProtocols: [
        'Quy tắc Vàng 1: Kiểm tra dòng nước chiller chảy đều đặn trước khi bật nguồn cao áp laser.',
        'Quy tắc Vàng 2: Không bao giờ rời mắt khỏi máy laser đang cắt vật liệu dễ bắt lửa (gỗ, mica).',
        'Quy tắc Vàng 3: Kiểm tra định kỳ độ nhạy của cảm biến khói và công tắc liên động nắp máy mỗi tháng một lần.',
      ],
    },
  },
};

