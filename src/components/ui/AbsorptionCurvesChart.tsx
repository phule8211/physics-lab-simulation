import React, { useState } from 'react';
import { MachineId } from '../../types/lab';

interface ChartProps {
  activeMachineId?: MachineId;
}

export function AbsorptionCurvesChart({ activeMachineId }: ChartProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');

  // SVG dimensions
  const width = 540;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Wavelength mapping (Logarithmic scale from 200 nm to 12,000 nm)
  const minLog = Math.log10(200);
  const maxLog = Math.log10(12000);

  const getX = (wl: number) => {
    const val = (Math.log10(wl) - minLog) / (maxLog - minLog);
    return padding.left + val * plotW;
  };

  const getY = (absorptionPercent: number) => {
    return padding.top + plotH - (absorptionPercent / 100) * plotH;
  };

  // Materials data curves
  const materials = [
    {
      id: 'METAL',
      name: 'Kim loại (Thép / Nhôm)',
      color: '#f59e0b',
      points: [
        { wl: 200, val: 80 },
        { wl: 355, val: 72 }, // UV
        { wl: 532, val: 55 },
        { wl: 1064, val: 42 }, // Fiber
        { wl: 2000, val: 20 },
        { wl: 5000, val: 6 },
        { wl: 10600, val: 2 }, // CO2
        { wl: 12000, val: 1.5 },
      ],
      description: 'Hấp thụ mạnh ở UV và Cận hồng ngoại (Fiber). Phản xạ > 98% ở 10.6 µm (CO2).',
    },
    {
      id: 'ORGANIC',
      name: 'Phi kim (Gỗ / Mica / Da)',
      color: '#06b6d4',
      points: [
        { wl: 200, val: 65 },
        { wl: 355, val: 50 },
        { wl: 532, val: 25 },
        { wl: 1064, val: 15 },
        { wl: 2500, val: 60 },
        { wl: 6000, val: 85 },
        { wl: 10600, val: 94 }, // CO2
        { wl: 12000, val: 92 },
      ],
      description: 'Hấp thụ cực đại tại 10.6 µm (> 90%), biến năng lượng thành nhiệt bốc hơi hoàn hảo.',
    },
    {
      id: 'GLASS',
      name: 'Kính quang học & Thạch anh',
      color: '#a855f7',
      points: [
        { wl: 200, val: 90 },
        { wl: 355, val: 82 }, // UV
        { wl: 532, val: 1 },
        { wl: 1064, val: 0.5 }, // Transparent
        { wl: 2500, val: 20 },
        { wl: 5000, val: 80 },
        { wl: 10600, val: 95 }, // CO2
        { wl: 12000, val: 96 },
      ],
      description: 'Trong suốt hoàn toàn ở 1064 nm (Fiber), nhưng hấp thụ gần 100% ở UV 355nm và CO2 10.6µm.',
    },
    {
      id: 'POLYMER',
      name: 'Nhựa Polymer (PE / PVC / Silicon)',
      color: '#ec4899',
      points: [
        { wl: 200, val: 95 },
        { wl: 355, val: 88 }, // UV
        { wl: 532, val: 40 },
        { wl: 1064, val: 30 },
        { wl: 3000, val: 75 },
        { wl: 7000, val: 85 },
        { wl: 10600, val: 88 }, // CO2
        { wl: 12000, val: 86 },
      ],
      description: 'Năng lượng UV 355nm bẻ gãy trực tiếp mạch carbon-hydro (gia công lạnh không cháy sém).',
    },
  ];

  // Laser Wavelength Reference Markers
  const lasers = [
    { id: 'UV_LASER', name: 'UV Laser', wl: 355, color: '#8b5cf6' },
    { id: 'FIBER_LASER', name: 'Fiber Laser', wl: 1064, color: '#f59e0b' },
    { id: 'CO2_LASER', name: 'CO2 Laser', wl: 10600, color: '#06b6d4' },
  ];

  // Build SVG smooth path command
  const makePath = (points: { wl: number; val: number }[]) => {
    return points.reduce((acc, pt, idx) => {
      const x = getX(pt.wl);
      const y = getY(pt.val);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  return (
    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-4">
      {/* Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-lab-amber" />
            <span>Đồ Thị Đường Cong Hấp Thụ Năng Lượng Quang Học</span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Tỉ lệ hấp thụ quang (%) theo bước sóng vật liệu (λ = 200 nm - 12 µm)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedMaterial('ALL')}
            className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
              selectedMaterial === 'ALL'
                ? 'bg-lab-cyan text-slate-950 border-lab-cyan'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Tất cả
          </button>
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMaterial(m.id)}
              className={`px-2 py-1 rounded text-[10px] font-semibold border transition-all ${
                selectedMaterial === m.id
                  ? 'bg-slate-800 text-white border-slate-600 shadow'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
              style={{
                color: selectedMaterial === m.id ? m.color : undefined,
                borderColor: selectedMaterial === m.id ? `${m.color}80` : undefined,
              }}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Plot */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-[600px] mx-auto overflow-visible select-none"
        >
          {/* Grid lines & Y-Axis ticks */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = getY(val);
            return (
              <g key={`grid-y-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize={10}
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* X-Axis Logarithmic Ticks */}
          {[
            { wl: 200, label: '200nm' },
            { wl: 355, label: '355nm' },
            { wl: 500, label: '500nm' },
            { wl: 1064, label: '1.06µm' },
            { wl: 2500, label: '2.5µm' },
            { wl: 5000, label: '5µm' },
            { wl: 10600, label: '10.6µm' },
          ].map((tick) => {
            const x = getX(tick.wl);
            return (
              <g key={`grid-x-${tick.wl}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#334155"
                  strokeDasharray="2 2"
                  strokeOpacity={0.25}
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  fill="#94a3b8"
                  fontSize={9}
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* 3 Laser Vertical Position Reference Lines */}
          {lasers.map((ls) => {
            const x = getX(ls.wl);
            const isHighlight = activeMachineId === ls.id;
            return (
              <g key={ls.id}>
                <line
                  x1={x}
                  y1={padding.top - 5}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke={ls.color}
                  strokeWidth={isHighlight ? 2 : 1}
                  strokeDasharray={isHighlight ? 'none' : '4 3'}
                  strokeOpacity={isHighlight ? 1 : 0.6}
                />
                <text
                  x={x}
                  y={padding.top - 10}
                  fill={ls.color}
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {ls.name}
                </text>
              </g>
            );
          })}

          {/* Material Curves */}
          {materials.map((mat) => {
            if (selectedMaterial !== 'ALL' && selectedMaterial !== mat.id) return null;
            return (
              <g key={mat.id}>
                {/* Thick glow outline */}
                <path
                  d={makePath(mat.points)}
                  fill="none"
                  stroke={mat.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.85}
                />
                {/* Data point dots */}
                {mat.points.map((pt, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={getX(pt.wl)}
                    cy={getY(pt.val)}
                    r={3.5}
                    fill={mat.color}
                    stroke="#0f172a"
                    strokeWidth={1.5}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Explanation Card */}
      <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1">
        {materials.map((mat) => {
          if (selectedMaterial !== 'ALL' && selectedMaterial !== mat.id) return null;
          return (
            <div
              key={mat.id}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1"
            >
              <div className="flex items-center space-x-1.5 font-bold" style={{ color: mat.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mat.color }} />
                <span>{mat.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {mat.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
