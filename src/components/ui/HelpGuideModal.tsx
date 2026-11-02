import React, { useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  Keyboard,
  X,
  Compass,
  Zap,
  Layers,
  Sparkles,
  ShieldCheck,
  MousePointer,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function HelpGuideModal() {
  const isHelpModalOpen = useLabStore((state) => state.isHelpModalOpen);
  const closeHelpModal = useLabStore((state) => state.closeHelpModal);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isHelpModalOpen) {
        closeHelpModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpModalOpen, closeHelpModal]);

  if (!isHelpModalOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: 'Di Chuyển & Điều Khiển Góc Nhìn',
      icon: Compass,
      color: 'text-lab-cyan',
      shortcuts: [
        { key: 'W / A / S / D', desc: 'Di chuyển tiến, lùi, sang trái, sang phải' },
        { key: 'Shift + W', desc: 'Chạy nhanh trong phòng thí nghiệm (7.5 m/s)' },
        { key: 'Space', desc: 'Nhảy nhẹ vượt chướng ngại vật' },
        { key: 'Chuột trái', desc: 'Click màn hình để khóa góc nhìn (PointerLock), rê chuột để nhìn' },
      ],
    },
    {
      title: 'Tương Tác Trạm Máy & Gia Công 3D',
      icon: Zap,
      color: 'text-amber-400',
      shortcuts: [
        { key: 'E', desc: 'Tiến gần máy và nhấn E để vào chế độ kiểm tra & học tập' },
        { key: 'ESC', desc: 'Thoát chế độ kiểm tra và quay lại đi dạo xưởng' },
        { key: '1, 2, 3, 4, 5', desc: 'Chuyển nhanh giữa 5 trạm máy (CO2, UV, Fiber, Sensor, Buồng Sơn)' },
        { key: 'O', desc: 'Mở / Đóng nắp máy (Tự động kích hoạt Safety Interlock)' },
        { key: 'C', desc: 'Bắt đầu / Dừng chu trình cắt và khắc laser' },
        { key: 'M', desc: 'Chuyển đổi phôi vật liệu (Gỗ, Mica, Inox, Nhôm, Silicon, Kính)' },
      ],
    },
    {
      title: 'Studio Thiết Kế, X-Ray & Đánh Giá Mẫu',
      icon: Sparkles,
      color: 'text-lab-violet',
      shortcuts: [
        { key: 'T', desc: 'Mở Xưởng Thiết Kế Vector CAD Studio (vẽ tự do, khắc văn bản)' },
        { key: 'G', desc: 'Xem chi tiết mẫu phôi 3D sau khi gia công (Tách phôi, đo đạc)' },
        { key: 'F', desc: 'Chạy khung viền đỏ định vị (Framing test)' },
        { key: 'X', desc: 'Bật / Tắt chế độ X-Ray nhìn thấu cấu tạo quang học máy' },
        { key: 'P', desc: 'Bật / Tắt bảng chẩn đoán hiệu năng WebGL 60 FPS & Draw Calls' },
        { key: 'H', desc: 'Mở / Đóng bảng hướng dẫn phím tắt này' },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hướng dẫn điều khiển & phím tắt phòng thí nghiệm"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={closeHelpModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                HƯỚNG DẪN THAO TÁC & PHÍM TẮT
              </h2>
              <p className="text-xs text-lab-muted">
                Phòng thí nghiệm vật lý & xưởng gia công quang học ảo
              </p>
            </div>
          </div>

          <button
            onClick={closeHelpModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Đóng bảng hướng dẫn (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-4 space-y-6 flex-grow pr-1">
          {SHORTCUT_GROUPS.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div key={idx} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${group.color}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {group.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.shortcuts.map((sc, scIdx) => (
                    <div
                      key={scIdx}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3"
                    >
                      <kbd className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-lab-cyan text-xs font-mono font-bold flex-shrink-0 shadow-sm">
                        {sc.key}
                      </kbd>
                      <span className="text-xs text-slate-300 leading-snug">
                        {sc.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quick tips */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <span className="font-bold">Mẹo trải nghiệm:</span> Trên điện thoại hoặc máy tính bảng, bạn có thể dùng thanh điều hướng nhanh dưới đáy màn hình để chuyển tức thời giữa các trạm máy mà không cần bàn phím!
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0 text-xs font-mono text-slate-400">
          <span>Nhấn phím <kbd className="text-lab-cyan">ESC</kbd> hoặc <kbd className="text-lab-cyan">H</kbd> để đóng</span>
          <button
            onClick={closeHelpModal}
            className="px-5 py-2 rounded-xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-lab-cyan/20"
          >
            Đã hiểu & Bắt đầu
          </button>
        </div>
      </div>
    </div>
  );
}
