import React, { useEffect, useState } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { GraphicsQuality, TargetFps } from '../../types/lab';
import { livePerformanceMetrics } from '../3d/PerformanceTracker';
import {
  Settings,
  X,
  Zap,
  Gauge,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  Check,
  ShieldCheck,
  BatteryCharging,
  Flame,
  Monitor,
} from 'lucide-react';

export function SettingsModal() {
  const isSettingsModalOpen = useLabStore((s) => s.isSettingsModalOpen);
  const closeSettingsModal = useLabStore((s) => s.closeSettingsModal);
  const graphicsQuality = useLabStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useLabStore((s) => s.setGraphicsQuality);
  const targetFps = useLabStore((s) => s.targetFps);
  const setTargetFps = useLabStore((s) => s.setTargetFps);

  const [metrics, setMetrics] = useState({ ...livePerformanceMetrics });

  useEffect(() => {
    if (!isSettingsModalOpen) return;

    const interval = setInterval(() => {
      setMetrics({ ...livePerformanceMetrics });
    }, 400);

    return () => clearInterval(interval);
  }, [isSettingsModalOpen]);

  // Release pointer lock when modal opens
  useEffect(() => {
    if (isSettingsModalOpen && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isSettingsModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsModalOpen) {
        closeSettingsModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsModalOpen, closeSettingsModal]);

  if (!isSettingsModalOpen) return null;

  const QUALITY_OPTIONS: {
    id: GraphicsQuality;
    name: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
    bgActive: string;
    desc: string;
    features: string[];
  }[] = [
    {
      id: 'LOW',
      name: 'Low (Mượt mà)',
      badge: '⚡ Tối ưu máy yếu',
      icon: Zap,
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgActive: 'bg-emerald-500/10 border-emerald-500',
      desc: 'Bỏ qua toàn bộ Post-processing nặng, tắt bóng đổ chi tiết, cố định DPR = 1.0. Tối ưu tối đa tốc độ khung hình cho máy yếu, laptop văn phòng, card onboard.',
      features: [
        'Tắt EffectComposer (không raymarching AO/Bloom)',
        'Tắt Shadow Map (giảm hàng chục draw calls)',
        'Giới hạn DPR 1.0 (giảm 75% pixel render thừa)',
        'Tăng +35 đến 50 FPS trên GPU onboard',
      ],
    },
    {
      id: 'MEDIUM',
      name: 'Medium (Cân bằng)',
      badge: '⚖️ Khuyên dùng (60 FPS)',
      icon: Gauge,
      accentColor: 'text-sky-400',
      borderColor: 'border-sky-500/50',
      bgActive: 'bg-sky-500/10 border-sky-500',
      desc: 'Hiệu ứng ánh sáng laser rực rỡ với Bloom nhẹ và Vignette. Đổ bóng mềm PCF Soft Shadows vừa phải. Cân bằng tuyệt vời giữa thẩm mỹ và độ mượt.',
      features: [
        'Bloom đơn tầng nhẹ cho đèn LED & tia laser',
        'Đổ bóng mềm tối ưu (Shadow Map 512px)',
        'Độ sắc nét DPI thích ứng (DPR 1.0 - 1.25)',
        'Độ ổn định cao trên hầu hết các dòng máy tính',
      ],
    },
    {
      id: 'HIGH',
      name: 'High (Đồ họa cao)',
      badge: '✨ Sắc nét nhất',
      icon: Sparkles,
      accentColor: 'text-purple-400',
      borderColor: 'border-purple-500/50',
      bgActive: 'bg-purple-500/10 border-purple-500',
      desc: 'Đầy đủ hiệu ứng tiếp xúc N8AO Lumen Contact Shadows, Cinematic Bloom đa tầng, khử răng cưa SMAA sắc mịn. Dành cho máy có card đồ họa rời.',
      features: [
        'N8AO Ambient Occlusion đổ bóng kẽ góc chân thực',
        'Cinematic Multi-layer Mipmap Bloom',
        'Khử răng cưa subpixel SMAA mịn màng',
        'Đổ bóng chi tiết 1024px chất lượng cao',
      ],
    },
  ];

  const FPS_OPTIONS: {
    id: TargetFps;
    title: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgActive: string;
    desc: string;
  }[] = [
    {
      id: 30,
      title: '30 FPS',
      badge: '🔋 Tiết kiệm pin & chống nóng',
      icon: BatteryCharging,
      accentColor: 'text-amber-400',
      bgActive: 'bg-amber-500/10 border-amber-500',
      desc: 'Khóa tốc độ ở 30 khung hình/giây. Giảm tới 50% tải tính toán GPU/CPU, giữ nhiệt độ mát mẻ và chống tụt FPS thất thường trên máy yếu.',
    },
    {
      id: 60,
      title: '60 FPS',
      badge: '🚀 Mượt mà tiêu chuẩn',
      icon: Flame,
      accentColor: 'text-emerald-400',
      bgActive: 'bg-emerald-500/10 border-emerald-500',
      desc: 'Tốc độ khung hình 60 FPS tiêu chuẩn. Chuyển động camera trơn tru, phản hồi phím và chuột tức thì cho trải nghiệm nhập vai tốt nhất.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bảng cài đặt đồ họa và hiệu năng"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center space-x-2">
                <span>Cài Đặt Đồ Họa & Hiệu Năng</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Phanulab
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tùy chỉnh 3 mức đồ họa và khóa FPS 30 / 60 tối ưu cho cấu hình máy của bạn
              </p>
            </div>
          </div>

          <button
            onClick={closeSettingsModal}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Đóng bảng cài đặt (ESC)"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-grow pr-1">
          {/* SECTION 1: 3 MỨC TÙY CHỌN ĐỒ HỌA */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Mức Đồ Họa (Graphics Quality)</span>
              </label>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                Đang dùng: {graphicsQuality}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {QUALITY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = graphicsQuality === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setGraphicsQuality(opt.id)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? opt.bgActive + ' shadow-lg'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl bg-slate-900/90 border border-slate-800 ${opt.accentColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5">
                        <h4 className="text-sm font-bold text-white">{opt.name}</h4>
                        <span className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md mt-1 bg-slate-900 border border-slate-800 ${opt.accentColor}`}>
                          {opt.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        {opt.desc}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-1 text-[10px] text-slate-400">
                      {opt.features.slice(0, 2).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start space-x-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span className="leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: TÙY CHỌN FPS: 30 / 60 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Khóa Tốc Độ Khung Hình (Target FPS)</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Đang khóa: {targetFps} FPS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FPS_OPTIONS.map((fpsOpt) => {
                const Icon = fpsOpt.icon;
                const isSelected = targetFps === fpsOpt.id;
                return (
                  <button
                    key={fpsOpt.id}
                    onClick={() => setTargetFps(fpsOpt.id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? fpsOpt.bgActive + ' shadow-lg'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${fpsOpt.accentColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-black text-white font-mono tracking-wide">
                            {fpsOpt.title}
                          </div>
                          <span className={`inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 ${fpsOpt.accentColor}`}>
                            {fpsOpt.badge}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                      {fpsOpt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: THÔNG SỐ PHẦN CỨNG & HIỆU NĂNG THỜI GIAN THỰC */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Chẩn Đoán Phần Cứng & WebGL</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Hoạt động ổn định</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">FPS Thực tế:</span>
                <span className="text-base font-bold text-emerald-400">{metrics.fps || targetFps} FPS</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Thời gian render:</span>
                <span className="text-base font-bold text-white">{metrics.frameTimeMs} ms</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Draw Calls:</span>
                <span className="text-base font-bold text-cyan-400">{metrics.drawCalls}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
                <span className="text-[10px] text-slate-400 block">Độ phân giải DPI:</span>
                <span className="text-base font-bold text-purple-400">{metrics.dpr}x</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center space-x-2 text-[10px] font-mono text-slate-400 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">GPU: {metrics.gpuName || 'WebGL 2.0 Hardware Accelerated'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0 text-xs font-mono text-slate-400">
          <span>Nhấn <kbd className="text-cyan-400">ESC</kbd> hoặc <kbd className="text-cyan-400">X</kbd> để đóng</span>
          <button
            onClick={closeSettingsModal}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Áp Dụng & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

