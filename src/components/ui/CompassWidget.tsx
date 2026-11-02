import React, { useMemo } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { Navigation, Layers, Compass } from 'lucide-react';

export function CompassWidget() {
  const { cameraHeading, playerElevation, currentFloor, mode } = useLabStore();

  // Determine Cardinal direction string
  const cardinal = useMemo(() => {
    const deg = (cameraHeading + 360) % 360;
    if (deg >= 337.5 || deg < 22.5) return 'N (Bắc)';
    if (deg >= 22.5 && deg < 67.5) return 'NE (Đông Bắc)';
    if (deg >= 67.5 && deg < 112.5) return 'E (Đông)';
    if (deg >= 112.5 && deg < 157.5) return 'SE (Đông Nam)';
    if (deg >= 157.5 && deg < 202.5) return 'S (Nam)';
    if (deg >= 202.5 && deg < 247.5) return 'SW (Tây Nam)';
    if (deg >= 247.5 && deg < 292.5) return 'W (Tây)';
    return 'NW (Tây Bắc)';
  }, [cameraHeading]);

  // Contextual landmark in view direction
  const landmarkInfo = useMemo(() => {
    const deg = (cameraHeading + 360) % 360;
    if (deg >= 315 || deg < 45) {
      return {
        label: 'Máy Laser CO2, Laser UV & Buồng Sơn',
        color: 'text-lab-cyan',
        border: 'border-lab-cyan/30',
        bg: 'bg-cyan-950/40',
      };
    }
    if (deg >= 45 && deg < 135) {
      return {
        label: 'Cụm Cảm Biến & Khu Vực Máy UV',
        color: 'text-emerald-400',
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/40',
      };
    }
    if (deg >= 135 && deg < 225) {
      return {
        label: 'Cầu Thang & Dãy Bàn Lab Tầng 2',
        color: 'text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-950/40',
      };
    }
    return {
      label: 'Máy Laser Fiber & Bàn Kính Hiển Vi',
      color: 'text-violet-400',
      border: 'border-violet-500/30',
      bg: 'bg-violet-950/40',
    };
  }, [cameraHeading]);

  // Hide in pure modal states if desired, but WALKING & INSPECTING benefit from orientation
  if (mode !== 'WALKING') return null;

  return (
    <div className="flex flex-col items-end pointer-events-auto select-none space-y-1.5 animate-fadeIn">
      {/* Compass Circular HUD Dial */}
      <div className="glass-panel px-3 py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center space-x-3">
        {/* Rotating Circular Compass Rose */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full border border-slate-700/60 bg-slate-900/80 shadow-inner" />

          {/* Fixed lubber line / heading indicator (top arrow pointing forward) */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]" />
          </div>

          {/* Rotating Compass Ring (rotates with -cameraHeading so N stays aligned with 3D North) */}
          <div
            className="absolute inset-1 rounded-full transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
              transform: `rotate(${-cameraHeading}deg)`,
            }}
          >
            {/* SVG Compass Dial Details */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Subtle circular grid lines */}
              <circle cx="50" cy="50" r="46" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="50" cy="50" r="32" fill="none" stroke="#1e293b" strokeWidth="1" />

              {/* Tick marks every 30 degrees */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const isCardinal = i % 3 === 0;
                const x1 = 50 + Math.sin(angle) * (isCardinal ? 42 : 44);
                const y1 = 50 - Math.cos(angle) * (isCardinal ? 42 : 44);
                const x2 = 50 + Math.sin(angle) * 47;
                const y2 = 50 - Math.cos(angle) * 47;
                return (
                  <line
                    key={`tick_${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isCardinal ? '#94a3b8' : '#475569'}
                    strokeWidth={isCardinal ? 1.5 : 1}
                  />
                );
              })}

              {/* North Arrow Pointer (Pointed Triangle in red/cyan) */}
              <polygon
                points="50,14 46,30 54,30"
                fill="#06b6d4"
                className="drop-shadow-[0_0_3px_#06b6d4]"
              />
              {/* South Marker Tail */}
              <polygon
                points="50,86 47,70 53,70"
                fill="#f59e0b"
                opacity="0.8"
              />

              {/* Cardinal Labels */}
              <text x="50" y="24" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold" fontFamily="monospace">N</text>
              <text x="82" y="53" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold" fontFamily="monospace">E</text>
              <text x="50" y="80" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">S</text>
              <text x="18" y="53" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold" fontFamily="monospace">W</text>
            </svg>
          </div>

          {/* Central Mini Reticle */}
          <div className="absolute w-2 h-2 rounded-full bg-slate-900 border border-lab-cyan/80 z-10 shadow-sm" />
        </div>

        {/* Textual Heading & Floor Readout */}
        <div className="flex flex-col min-w-[110px]">
          {/* Degree & Cardinal Direction */}
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-bold font-mono text-white tracking-tight">
              {String(cameraHeading).padStart(3, '0')}°
            </span>
            <span className="text-xs font-semibold text-lab-cyan uppercase font-mono">
              {cardinal.split(' ')[0]}
            </span>
          </div>

          {/* Current Floor & Elevation Badge */}
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center space-x-1 border ${
                currentFloor === 2
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                  : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
              }`}
            >
              <Layers className="w-2.5 h-2.5 inline mr-1" />
              TẦNG {currentFloor}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              +{playerElevation.toFixed(1)}m
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Direction Landmark Banner */}
      <div
        className={`glass-panel px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center space-x-1.5 shadow-md ${landmarkInfo.bg} ${landmarkInfo.border} ${landmarkInfo.color}`}
      >
        <Navigation className="w-3 h-3 flex-shrink-0 animate-pulse" />
        <span className="truncate max-w-[220px]">{landmarkInfo.label}</span>
      </div>
    </div>
  );
}
