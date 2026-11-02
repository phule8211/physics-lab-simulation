import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Atom, Zap, ChevronRight, Sparkles } from 'lucide-react';

const LASER_FACTS = [
  'Tia Laser đầu tiên trong lịch sử được chế tạo bởi Theodore Maiman vào năm 1960 sử dụng tinh thể Ruby tổng hợp.',
  'Laser CO2 phát bức xạ tại bước sóng hồng ngoại xa 10.6 µm, được nước và các phân tử hữu cơ hấp thụ cực mạnh.',
  'Laser UV (355 nm) thực hiện "gia công lạnh" quang hóa: Photon 3.49 eV bẻ gãy liên kết hóa học trực tiếp mà không sinh nhiệt.',
  'Đầu khắc Galvo điều khiển cặp gương mạ vàng bằng motor điện từ cực nhạy, đạt tốc độ quét lên tới 10,000 mm/s.',
  'Cảm biến an toàn khóa liên động (Interlock) ngắt nguồn phát laser trong vòng dưới 10ms ngay khi phát hiện nắp máy mở.',
  'Sơn phủ tĩnh điện và sấy bức xạ UV 395 nm tạo lớp bảo vệ nano chống ăn mòn và tăng độ bóng quang học cho sản phẩm.',
];

export function LoadingScreen() {
  const { active, progress, item } = useProgress();
  const [visible, setVisible] = useState(true);
  const [factIndex, setFactIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);

  // Rotate scientific facts every 2.6s
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % LASER_FACTS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  // Smooth progress calculation (blends real useProgress with smooth ramp)
  useEffect(() => {
    const timer = setInterval(() => {
      setFakeProgress((prev) => {
        const target = Math.max(prev, Math.round(progress));
        if (prev < 90) return prev + Math.floor(Math.random() * 8) + 4;
        if (progress >= 100) return 100;
        return target;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [progress]);

  // Once loaded, fade out smoothly
  useEffect(() => {
    if ((progress >= 100 || fakeProgress >= 100) && !active) {
      const dismissTimer = setTimeout(() => {
        setVisible(false);
      }, 500);
      return () => clearTimeout(dismissTimer);
    }
  }, [active, progress, fakeProgress]);

  // Safety fallback: if user has waited > 2.2s, auto-dismiss so they are never blocked
  useEffect(() => {
    const forceDismissTimer = setTimeout(() => {
      setVisible(false);
    }, 2200);
    return () => clearTimeout(forceDismissTimer);
  }, []);

  if (!visible) return null;

  const currentPercent = Math.min(100, Math.max(fakeProgress, Math.round(progress)));

  return (
    <div
      role="progressbar"
      aria-label="Khởi tạo phòng xưởng thí nghiệm 3D"
      aria-valuenow={currentPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-lab-dark text-slate-100 transition-opacity duration-500 select-none px-4"
    >
      {/* Background ambient glow */}
      <div className="absolute w-96 h-96 rounded-full bg-lab-cyan/10 blur-3xl pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-lab-violet/10 blur-3xl pointer-events-none translate-x-20 translate-y-20" />

      {/* Center Icon */}
      <div className="relative w-20 h-20 rounded-3xl bg-slate-900/90 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan mb-8 shadow-2xl shadow-lab-cyan/20">
        <Atom className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lab-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-lab-cyan" />
        </span>
      </div>

      {/* Main Title */}
      <h2 className="text-2xl font-black tracking-widest text-white mb-2 text-center uppercase">
        VIRTUAL PHYSICS & LASER LAB
      </h2>
      <p className="text-xs text-lab-muted font-mono mb-8 max-w-sm text-center">
        {item ? `Đang nạp mô-đun: ${item}` : 'Đang đồng bộ hình học 3D, vật liệu PBR & dữ liệu quang học...'}
      </p>

      {/* Progress Bar Container */}
      <div className="w-full max-w-md h-3 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner mb-4">
        <div
          className="h-full bg-gradient-to-r from-lab-cyan via-sky-400 to-lab-violet rounded-full transition-all duration-300 ease-out shadow-lg shadow-lab-cyan/30"
          style={{ width: `${Math.max(12, currentPercent)}%` }}
        />
      </div>

      {/* Numeric Percentage & Status */}
      <div className="flex items-center justify-between w-full max-w-md px-1 mb-8 text-xs font-mono">
        <span className="text-slate-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-lab-cyan inline animate-pulse" />
          <span>Khởi tạo WebGL 2.0 Engine...</span>
        </span>
        <span className="text-lab-cyan font-bold text-sm">{currentPercent}%</span>
      </div>

      {/* Rotating Science Trivia Card */}
      <div className="w-full max-w-md p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md mb-8 min-h-[82px] flex items-start space-x-3 transition-all duration-300">
        <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-[10px] font-mono uppercase font-bold text-amber-400/90 mb-1">
            Góc tri thức quang học:
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic">
            "{LASER_FACTS[factIndex]}"
          </p>
        </div>
      </div>

      {/* Skip button for instant entry */}
      <button
        onClick={() => setVisible(false)}
        className="px-6 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center space-x-2"
        aria-label="Bỏ qua màn hình chờ và vào xưởng ngay"
      >
        <span>Vào xưởng thí nghiệm ngay</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
