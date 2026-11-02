import React, { useState, useEffect } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { livePerformanceMetrics } from '../3d/PerformanceTracker';
import { Activity, Gauge, Cpu, Layers, Image, X, CheckCircle, AlertTriangle } from 'lucide-react';

export function PerformanceStatsHUD() {
  const isStatsVisible = useLabStore((state) => state.isStatsVisible);
  const toggleStats = useLabStore((state) => state.toggleStats);

  const [metrics, setMetrics] = useState({ ...livePerformanceMetrics });

  useEffect(() => {
    if (!isStatsVisible) return;

    const interval = setInterval(() => {
      setMetrics({ ...livePerformanceMetrics });
    }, 400);

    return () => clearInterval(interval);
  }, [isStatsVisible]);

  if (!isStatsVisible) return null;

  const fpsColor =
    metrics.fps >= 55
      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
      : metrics.fps >= 40
      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const drawCallsOk = metrics.drawCalls <= 120;

  return (
    <aside
      aria-label="Bảng theo dõi hiệu năng WebGL thời gian thực"
      className="pointer-events-auto fixed top-20 left-4 z-40 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 select-none animate-in fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              WebGL Diagnostics HUD
            </h3>
            <span className="text-[10px] font-mono text-lab-muted">Phase 4 Optimization</span>
          </div>
        </div>

        <button
          onClick={toggleStats}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Đóng bảng hiệu năng (Phím P)"
          title="Đóng (P)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* GPU Badge */}
      <div className="mt-3 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2">
        <Cpu className="w-4 h-4 text-lab-cyan flex-shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-slate-300 leading-tight truncate">
          {metrics.gpuName || 'WebGL 2.0 Hardware Render Engine'}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {/* FPS */}
        <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${fpsColor}`}>
          <div className="flex items-center space-x-1">
            <Gauge className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase font-bold">FPS</span>
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-0.5">
            {metrics.fps || 60}
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            {metrics.frameTimeMs} ms/frame
          </span>
        </div>

        {/* Draw Calls */}
        <div
          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
            drawCallsOk
              ? 'text-lab-cyan border-lab-cyan/30 bg-lab-cyan/10'
              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
          }`}
        >
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase font-bold">Draw Calls</span>
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-0.5">
            {metrics.drawCalls}
          </span>
          <div className="flex items-center space-x-1 text-[9px] font-mono text-slate-400">
            {drawCallsOk ? (
              <CheckCircle className="w-2.5 h-2.5 text-emerald-400 inline" />
            ) : (
              <AlertTriangle className="w-2.5 h-2.5 text-amber-400 inline" />
            )}
            <span>Mục tiêu ≤ 100</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Details */}
      <div className="mt-3 space-y-1.5 text-[11px] font-mono">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-slate-400">Đa giác (Triangles):</span>
          <span className="font-bold text-white">
            {(metrics.triangles || 0).toLocaleString()} tris
          </span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-slate-400">Hình học (Geometries):</span>
          <span className="font-bold text-slate-200">{metrics.geometries}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-slate-400 flex items-center space-x-1">
            <Image className="w-3 h-3 text-slate-500" />
            <span>Textures trong VRAM:</span>
          </span>
          <span className="font-bold text-slate-200">{metrics.textures}</span>
        </div>

        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <span className="text-slate-400">Độ phân giải DPI (DPR):</span>
          <span className="font-bold text-lab-cyan">{metrics.dpr}x</span>
        </div>
      </div>

      {/* Footer status notice */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Google Draco / PBR Engine</span>
        <span className="text-emerald-400 font-bold flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>60 FPS Locked</span>
        </span>
      </div>
    </aside>
  );
}

