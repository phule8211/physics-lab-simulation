import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  Sparkles,
  Zap,
  Atom,
  ShieldCheck,
  ArrowRight,
  Layers,
  Award,
  Eye,
  X,
} from 'lucide-react';

export function PhanulabLandingPage() {
  const isLandingPageOpen = useLabStore((s) => s.isLandingPageOpen);
  const closeLandingPage = useLabStore((s) => s.closeLandingPage);

  if (!isLandingPageOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chào mừng đến với Phanulab - Phanu Corp."
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 overflow-y-auto bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300 select-none"
    >
      {/* Background sci-fi ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/15 blur-3xl pointer-events-none translate-x-1/2 translate-y-1/2" />
      <div className="fixed top-1/2 left-1/2 w-[32rem] h-[32rem] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />

      {/* Main Glassmorphic Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-cyan-950/50 p-6 sm:p-8 md:p-10 flex flex-col gap-6 text-slate-100 my-auto">
        
        {/* Top Header: Badge & Creator Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Atom className="w-6 h-6 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Phanu Corp.
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive 3D Simulation</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Virtual Photonics & Semiconductor Physics Laboratory
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
              <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Created by <strong className="text-cyan-300 font-semibold">Phanu Corp.</strong></span>
            </div>

            <button
              onClick={closeLandingPage}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-all cursor-pointer"
              title="Đóng bảng giới thiệu (X / ESC)"
              aria-label="Đóng bảng giới thiệu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Section: Welcome Title & Co-founders */}
        <div className="text-center flex flex-col items-center gap-3 pt-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mô phỏng thời gian thực • Độ chính xác vật lý cao</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Chào mừng đến với{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
              Phanulab
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Khám phá xưởng máy cắt laser công nghiệp thế hệ mới, tầng lửng nghiên cứu quang học bán dẫn và tương tác cùng các thiết bị đo lường chuẩn xác.
          </p>

          {/* Co-founders Showcase Card */}
          <div className="w-full max-w-xl mt-2 p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 shadow-inner flex flex-col sm:flex-row items-center justify-around gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                LP
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">Co-founder</div>
                <div className="text-sm font-bold text-white">Lê Ngọc Phú</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-800" />

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-sm">
                TA
              </div>
              <div className="text-left">
                <div className="text-[11px] font-mono text-violet-400 uppercase font-semibold">Co-founder</div>
                <div className="text-sm font-bold text-white">Đinh Thiên Ân</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Highlights Grid (Clean without small text) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-white leading-snug">Hệ Thống Máy Laser</h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-white leading-snug">10 Bàn Thí Nghiệm</h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-white leading-snug">An Toàn & Phủ Sơn UV</h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col sm:flex-row items-center gap-2.5 text-center sm:text-left">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-white leading-snug">Doraemon & Góc Nhìn 3D</h2>
          </div>
        </div>

        {/* Bottom Action Section: CTA Button */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            onClick={closeLandingPage}
            className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:via-sky-400 hover:to-violet-500 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/30 flex items-center justify-center space-x-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <span>BẮT ĐẦU KHÁM PHÁ PHÒNG THÍ NGHIỆM</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[11px] text-slate-500 font-mono text-center">
            Created by Phanu Corp. • Co-founder: Lê Ngọc Phú - Đinh Thiên Ân • Phiên bản mô phỏng 3D v1.0
          </p>
        </div>

      </div>
    </div>
  );
}
