import React, { useEffect } from 'react';
import { useLabStore, DeviceMode } from '../../store/useLabStore';
import {
  Monitor,
  Smartphone,
  MousePointer,
  Gamepad2,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  HelpCircle,
  X,
} from 'lucide-react';

export function DeviceSelectModal() {
  const {
    isDeviceSelectModalOpen,
    deviceMode,
    setDeviceMode,
    closeDeviceSelectModal,
  } = useLabStore();

  useEffect(() => {
    if (isDeviceSelectModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isDeviceSelectModalOpen]);

  if (!isDeviceSelectModalOpen) return null;

  const handleSelect = (mode: DeviceMode) => {
    setDeviceMode(mode);
    if (mode === 'desktop') {
      setTimeout(() => {
        document.querySelector('canvas')?.requestPointerLock();
      }, 100);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chọn thiết bị điều khiển xưởng thí nghiệm"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 max-h-[92vh]">
        {/* Close button (only shown if user previously had a mode selected) */}
        {localStorage.getItem('preferred_device_mode') && (
          <button
            onClick={closeDeviceSelectModal}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng bảng chọn thiết bị"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>TÙY CHỌN TRẢI NGHIỆM ĐIỀU KHIỂN</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
            BẠN ĐANG DÙNG THIẾT BỊ NÀO?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Vui lòng chọn để xưởng kích hoạt đúng hệ thống điều khiển tối ưu nhất cho bạn
          </p>
        </div>

        {/* Options Grid: Computer vs Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
          {/* OPTION 1: MÁY TÍNH / PC / LAPTOP */}
          <div
            onClick={() => handleSelect('desktop')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between group hover:scale-[1.02] ${
              deviceMode === 'desktop'
                ? 'bg-slate-800/90 border-cyan-400 shadow-xl shadow-cyan-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  BÀN PHÍM & CHUỘT
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-wide">
                Máy Tính / Laptop (PC)
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Trải nghiệm 3D truyền thống dành cho màn hình lớn.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Di chuyển: <b>W, A, S, D</b></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Xoay góc nhìn: <b>Chuột trái 360°</b></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>Tương tác: <b>Phím [E], [Space], [O]</b></span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span><b>Ẩn hoàn toàn cần gạt Joystick</b></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelect('desktop')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/30"
            >
              <span>Vào Chế Độ Máy Tính</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* OPTION 2: ĐIỆN THOẠI / TABLET / CẢM ỨNG */}
          <div
            onClick={() => handleSelect('mobile')}
            className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between group hover:scale-[1.02] ${
              deviceMode === 'mobile'
                ? 'bg-slate-800/90 border-emerald-400 shadow-xl shadow-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  CẢM ỨNG & JOYSTICK
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-wide">
                Điện Thoại / Tablet
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tối ưu hóa ngón tay cho màn hình cảm ứng di động.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Di chuyển: <b>Cần gạt ảo Joystick</b></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Xoay góc nhìn: <b>Vuốt màn hình phải</b></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Nút chạm nhanh: <b>[E], [Nhảy], [Chạy]</b></span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span><b>Chuyển tầng 1 ⇄ 2 bằng 1 chạm</b></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelect('mobile')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/30"
            >
              <span>Vào Chế Độ Điện Thoại</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500 font-mono mt-4">
          💡 Bạn có thể đổi lại bất cứ lúc nào qua nút <b>[💻 Máy tính / 📱 Điện thoại]</b> trên góc màn hình.
        </p>
      </div>
    </div>
  );
}
