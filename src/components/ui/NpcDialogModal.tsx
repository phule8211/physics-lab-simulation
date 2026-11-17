import React, { useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  X,
  MessageSquare,
  Sparkles,
  Zap,
  Activity,
  Layers,
  FlaskConical,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface TopicData {
  id: string;
  title: string;
  category: string;
  icon: any;
  accent: string;
  speech: string[];
  keySpecs: { label: string; value: string }[];
}

const NPC_TOPICS: TopicData[] = [
  {
    id: 'CO2_LASER',
    title: 'Máy Cắt Laser Khí CO2 Công Nghiệp (10.6 µm)',
    category: 'Gia Công Nhiệt Quang Học (Thermal Cutting)',
    icon: Zap,
    accent: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    speech: [
      'Chào bạn! Máy cắt Laser CO2 là cỗ máy chủ lực để gia công các vật liệu phi kim và hữu cơ như gỗ, mica (acrylic), cao su và thủy tinh.',
      'Nguyên lý hoạt động dựa trên kích thích hỗn hợp khí (CO2, N2, He) bằng dòng điện cao tần để phát ra bức xạ laser bước sóng 10.6 µm thuộc dải hồng ngoại xa. Bước sóng này có hệ số hấp thụ cực kỳ cao trên liên kết phân tử của phi kim, làm bốc hơi vật liệu tức thì tại khe cắt.',
      'Lưu ý quan trọng: Tuyệt đối không dùng laser CO2 để cắt kim loại có độ phản xạ cao như đồng thau hay nhôm trần nếu không có khí hỗ trợ O2/N2 áp suất cao, vì chùm tia phản xạ ngược có thể phá hủy thấu kính hội tụ ZnSe đắt tiền!',
    ],
    keySpecs: [
      { label: 'Bước sóng', value: '10.6 µm (Hồng ngoại xa)' },
      { label: 'Cơ chế', value: 'Bốc hơi nhiệt & Kích thích khí' },
      { label: 'Vật liệu tối ưu', value: 'Gỗ, Mica, Cao su, Thủy tinh' },
      { label: 'Khí trợ lực', value: 'Khí nén Air Assist / O2' },
    ],
  },
  {
    id: 'UV_LASER',
    title: 'Máy Khắc Laser Tử Ngoại UV (355 nm)',
    category: 'Gia Công Lạnh Quang Hóa (Cold Ablation)',
    icon: Sparkles,
    accent: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    speech: [
      'Đây là công nghệ "Gia công lạnh" (Cold Ablation) đỉnh cao của xưởng chúng ta! Sử dụng tinh thể DPSS nhân tần 3 lần để tạo ra tia tử ngoại bước sóng cực ngắn 355 nm.',
      'Photon tử ngoại mang năng lượng cực lớn (khoảng 3.49 eV), đủ sức bẻ gãy trực tiếp các liên kết hóa học mà không sinh nhiệt dư thừa. Nhờ đó, vật liệu bị loại bỏ mà hoàn toàn không để lại vết cháy, biến dạng nhiệt hay vùng ảnh hưởng nhiệt (HAZ).',
      'Trong công nghệ nano và bán dẫn, máy laser UV là công cụ tối ưu để vi gia công bề mặt wafer Silicon, khoan lỗ vi mô (micro-vias) trên bo mạch dẻo FPC và đánh dấu chống giả trên kính quang học.',
    ],
    keySpecs: [
      { label: 'Bước sóng', value: '355 nm (Tử ngoại DPSS)' },
      { label: 'Năng lượng photon', value: '3.49 eV' },
      { label: 'Ưu điểm', value: 'Không biến dạng nhiệt (Zero HAZ)' },
      { label: 'Ứng dụng chính', value: 'Wafer Silicon, PCB, Thủy tinh' },
    ],
  },
  {
    id: 'FIBER_LASER',
    title: 'Máy Khắc Laser Fiber Sợi Quang & Đầu Galvo (1064 nm)',
    category: 'Khắc Tốc Độ Cao Kim Loại (Near-IR Galvo)',
    icon: Zap,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    speech: [
      'Máy Laser Fiber sử dụng sợi quang pha tạp nguyên tố đất hiếm Ytterbium, phát ra bước sóng 1064 nm với chất lượng chùm tia đơn mốt tuyệt hảo (M² < 1.3).',
      'Điểm đặc biệt nhất là hệ thống quét chùm tia bằng đầu gương điện từ Galvanometer (Galvo). Thay vì di chuyển trục cơ khí nặng nề, tia laser được định hướng bởi 2 gương siêu nhẹ xoay với tốc độ lên đến 7.000 - 10.000 mm/s!',
      'Máy chuyên dùng để khắc sâu, khắc số serial, mã QR và anodize màu trên bề mặt kim loại như thép không gỉ SUS304, titan, nhôm và các linh kiện bán dẫn.',
    ],
    keySpecs: [
      { label: 'Bước sóng', value: '1064 nm (Cận hồng ngoại)' },
      { label: 'Tốc độ quét', value: 'Lên đến 7,000 mm/s' },
      { label: 'Tuổi thọ module', value: '> 100,000 giờ liên tục' },
      { label: 'Vật liệu', value: 'Inox, Thép, Nhôm, Titan' },
    ],
  },
  {
    id: 'SENSOR_STATION',
    title: 'Cụm Cảm Biến An Toàn & Giám Sát Đa Kênh',
    category: 'Quang Học, Nhiệt Bức Xạ & Khí Khói',
    icon: Activity,
    accent: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    speech: [
      'An toàn là ưu tiên số một trong mọi phòng thí nghiệm bán dẫn và gia công laser công suất cao!',
      'Trạm cảm biến này tích hợp 4 hệ thống giám sát thời gian thực: Cảm biến quang nhiệt (Thermopile) đo công suất chùm tia; Pyrometer hồng ngoại theo dõi nhiệt độ điểm cắt; Cảm biến lưu lượng nước làm mát chiller; và cảm biến phát hiện nồng độ khói/khí độc VOC.',
      'Bất kỳ khi nào nhiệt độ vượt ngưỡng an toàn hoặc nắp máy bị mở trong lúc laser đang phát tia, khóa liên động an toàn (Safety Interlock) sẽ lập tức ngắt nguồn kích phát trong vòng chưa đầy 15 mili-giây để bảo vệ bạn!',
    ],
    keySpecs: [
      { label: 'Cảm biến công suất', value: 'Thermopile quang nhiệt' },
      { label: 'Cảm biến nhiệt độ', value: 'Pyrometer hồng ngoại 0-1000°C' },
      { label: 'Thời gian ngắt', value: '< 15 ms (Interlock)' },
      { label: 'Giám sát khí', value: 'VOC, CO, Khói quang học' },
    ],
  },
  {
    id: 'COATING_STATION',
    title: 'Buồng Phủ Sơn Tĩnh Điện & Sấy Đóng Rắn UV (395 nm)',
    category: 'Xử Lý Bề Mặt & Đóng Rắn Quang Học (Finishing Cleanroom)',
    icon: Layers,
    accent: 'text-sky-400 border-sky-500/40 bg-sky-950/40',
    speech: [
      'Sau khi các phôi mẫu được cắt hoặc khắc laser, chúng cần được xử lý bảo vệ bề mặt chống oxy hóa và tăng cường tính thẩm mỹ.',
      'Tại buồng sơn phòng sạch phía Bắc, phôi được đặt trên bàn xoay 360 độ và phủ đều lớp sơn tĩnh điện. Sau đó, giàn đèn UV bước sóng 395 nm sẽ chiếu xạ để kích hoạt các gốc tự do (photoinitiator), làm màng polymer khô cứng tức thì chỉ sau vài giây.',
      'Bạn có thể thử nghiệm các lớp phủ khác nhau: Men bóng trong suốt (Clear Gloss), Sơn nhám đen quân sự (Matte Black), Men xanh công nghệ (Metallic Cyan), hoặc Lớp phủ chống tĩnh điện ESD cho vi mạch bán dẫn!',
    ],
    keySpecs: [
      { label: 'Đèn sấy đóng rắn', value: 'UV LED 395 nm công suất cao' },
      { label: 'Bàn xoay', value: '360° đồng tốc tự động' },
      { label: 'Thời gian sấy', value: 'Chỉ từ 5 - 15 giây' },
      { label: 'Các lớp hoàn thiện', value: 'Clear Gloss, Matte, ESD, Ceramic' },
    ],
  },
  {
    id: 'CHEMISTRY_WET_ETCH',
    title: 'Giàn Thí Nghiệm Hóa Chất & Khắc Ướt Wafer (Tầng 2)',
    category: 'Ăn Mòn Hóa Học & Chuẩn Bị Bề Mặt Bán Dẫn',
    icon: FlaskConical,
    accent: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    speech: [
      'Chào mừng bạn đến với khu vực thực nghiệm hóa chất trên tầng 2! Đây là nơi chuẩn bị các dung dịch khắc ướt (Wet Chemical Etching) và tẩy rửa wafer bán dẫn.',
      'Tại giá hóa chất, chúng ta có 3 dung môi quan trọng: Axit Clohidric (HCl), Axit Nitric (HNO3), và Oxy già (H2O2). Khi pha trộn HCl và HNO3 theo tỉ lệ 3:1, bạn sẽ thu được "Nước Cường Toan" (Aqua Regia) có khả năng hòa tan cả vàng và bạch kim!',
      'Nếu trộn H2O2 với axit, dung dịch có tính oxy hóa cực mạnh giúp loại bỏ hoàn toàn cặn hữu cơ trên wafer Silicon trước khi đưa vào buồng quang khắc.',
      'Quy tắc an toàn sống còn: Luôn luôn đổ axit vào nước (không bao giờ đổ nước vào axit đặc) để tránh sôi cục bộ bắn axit! Sau khi thí nghiệm xong, hãy dùng vòi nước khử ion DI Water ở bồn rửa để tráng sạch dụng cụ.',
    ],
    keySpecs: [
      { label: 'Hóa chất chính', value: 'HCl 37%, HNO3 68%, H2O2 30%' },
      { label: 'Dung dịch đặc biệt', value: 'Nước Cường Toan (Aqua Regia), Piranha' },
      { label: 'Nước rửa', value: 'Nước khử ion siêu tinh khiết DI Water' },
      { label: 'An toàn GHS', value: 'Găng tay chịu axit, Kính bảo hộ, Bồn hút' },
    ],
  },
];

export function NpcDialogModal() {
  const { isNpcDialogOpen, closeNpcDialog, npcCurrentTopic, setNpcTopic } = useLabStore();

  useEffect(() => {
    if (isNpcDialogOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isNpcDialogOpen]);

  const handleCloseDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeNpcDialog();
    try {
      const canvas = document.querySelector('canvas');
      if (canvas && typeof canvas.requestPointerLock === 'function') {
        const p = canvas.requestPointerLock();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      }
    } catch {
      // Safe fallback if browser blocks pointer lock
    }
  };

  if (!isNpcDialogOpen) return null;

  const currentTopicData = NPC_TOPICS.find((t) => t.id === npcCurrentTopic) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Sidebar: Character Portrait & Status */}
        <div className="w-full md:w-80 bg-gradient-to-b from-slate-800/90 to-slate-950 p-3.5 sm:p-6 flex flex-row md:flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-700/60 flex-shrink-0">
          <div className="flex flex-row md:flex-col items-center text-left md:text-center space-x-3 md:space-x-0 w-full">
            {/* Portrait Frame */}
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-br from-lab-cyan via-blue-500 to-indigo-600 shadow-xl shadow-lab-cyan/20 flex-shrink-0 md:mb-4">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border-2 border-slate-800">
                {/* Stylized Avatar Illustration */}
                <div className="relative flex flex-col items-center justify-center scale-75 sm:scale-90 md:scale-100">
                  <div className="w-12 h-12 rounded-full bg-amber-200 border-2 border-slate-700 relative">
                    {/* Glasses */}
                    <div className="absolute top-4 left-1.5 right-1.5 h-3 rounded-sm border border-cyan-400 bg-cyan-400/30" />
                  </div>
                  {/* Lab Coat Shoulders */}
                  <div className="w-20 h-10 bg-slate-100 rounded-t-2xl mt-1 border-t-2 border-slate-300" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] sm:text-xs shadow-md">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide truncate">
                KS. Nguyễn Văn Dũng
              </h2>
              <span className="text-[10px] sm:text-xs text-lab-cyan font-mono font-medium block mt-0.5 truncate">
                Kỹ sư Trưởng / Cố vấn Kỹ thuật
              </span>
              <p className="hidden md:block text-[11px] text-slate-400 mt-2 leading-relaxed">
                Chuyên gia Quang học Laser & Công nghệ Bán dẫn Nano với 15 năm kinh nghiệm nghiên cứu và vận hành xưởng mô phỏng.
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden md:block w-full bg-slate-900/80 rounded-2xl p-3 border border-slate-800 text-left space-y-1.5 mt-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Trạng thái:</span>
              <span className="text-emerald-400 font-mono font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sẵn sàng hướng dẫn</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Vị trí:</span>
              <span className="text-white font-mono">Bàn Máy Tính Tầng 2</span>
            </div>
          </div>
        </div>

        {/* Right Content: Dialogue & Topic Selection */}
        <div className="flex-1 flex flex-col p-3.5 sm:p-6 overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-lab-cyan" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {currentTopicData ? currentTopicData.title : 'TRUNG TÂM HƯỚNG DẪN & TƯ VẤN KỸ THUẬT'}
              </h3>
            </div>
            <button
              onClick={handleCloseDialog}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đóng hộp thoại (Phím X / Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dialogue Speech Box */}
          <div className="flex-1 my-4 space-y-3">
            {!currentTopicData ? (
              // Welcome Default Speech
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-2">
                  <p className="font-semibold text-lab-cyan">
                    "Chào mừng bạn đến với Xưởng Mô phỏng Bán dẫn & Chế tạo Laser Quang học 3D!"
                  </p>
                  <p>
                    Tôi là <span className="font-bold text-white">Nguyễn Văn Dũng</span>. Tôi ở đây để hỗ trợ bạn tìm hiểu toàn bộ nguyên lý vật lý, cơ chế chùm tia, và quy trình vận hành an toàn của mọi thiết bị trong xưởng.
                  </p>
                  <p className="text-slate-400 text-xs">
                    Hãy bấm vào một trong các chủ đề dưới đây để tôi giải thích chi tiết cho bạn:
                  </p>
                </div>

                {/* Topic Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {NPC_TOPICS.map((topic) => {
                    const IconComponent = topic.icon;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setNpcTopic(topic.id)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 flex items-start space-x-3 group hover:scale-[1.02] ${topic.accent}`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center flex-shrink-0 group-hover:border-lab-cyan">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {topic.title.split('(')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {topic.category}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white flex-shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Detailed Topic Speech
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-3">
                  {currentTopicData.speech.map((paragraph, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs sm:text-sm text-slate-200 leading-relaxed"
                    >
                      {paragraph}
                    </div>
                  ))}
                </div>

                {/* Technical Specs Table */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-lab-cyan mb-2.5 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Thông Số Kỹ Thuật Trọng Tâm</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {currentTopicData.keySpecs.map((spec, sidx) => (
                      <div key={sidx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">{spec.label}</div>
                        <div className="text-xs font-bold font-mono text-white mt-0.5">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Return button */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setNpcTopic(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5"
                  >
                    <span>← Quay lại danh sách câu hỏi</span>
                  </button>
                  <button
                    onClick={handleCloseDialog}
                    className="px-4 py-2 rounded-xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-lab-cyan/30"
                  >
                    Tôi đã hiểu, cảm ơn KS. Dũng! [X]
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
