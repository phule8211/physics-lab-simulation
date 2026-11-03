import React, { useState, useMemo } from 'react';
import { useLabStore } from '../../store/useLabStore';
import { LAB_TABLES, LabTableConfig } from '../../data/staircaseConfig';
import {
  X,
  Sparkles,
  FlaskConical,
  Eye,
  Sliders,
  Play,
  RotateCcw,
  Scale,
  Flame,
  Activity,
  Droplets,
  Layers,
  CheckCircle2,
  Atom,
  Info,
} from 'lucide-react';

export function LabWorkbenchModal() {
  const isWorkbenchModalOpen = useLabStore((s) => s.isWorkbenchModalOpen);
  const selectedWorkbenchId = useLabStore((s) => s.selectedWorkbenchId);
  const closeWorkbenchModal = useLabStore((s) => s.closeWorkbenchModal);
  const openWorkbenchModal = useLabStore((s) => s.openWorkbenchModal);

  // Default active table
  const activeTable = useMemo(() => {
    return LAB_TABLES.find((t) => t.id === selectedWorkbenchId) || LAB_TABLES[0];
  }, [selectedWorkbenchId]);

  // State for Table 1: Optics Prism
  const [laserColor, setLaserColor] = useState<'red' | 'green' | 'blue' | 'white'>('white');
  const [incidentAngle, setIncidentAngle] = useState<number>(38); // degrees
  const [prismMaterial, setPrismMaterial] = useState<'crown' | 'flint' | 'diamond'>('flint');

  // State for Table 2: Titration
  const [titrantVolume, setTitrantVolume] = useState<number>(0); // mL of NaOH added
  const [isIndicatorAdded, setIsIndicatorAdded] = useState<boolean>(true);

  // State for Table 3: Microscope
  const [microscopeSample, setMicroscopeSample] = useState<'wafer' | 'nacl' | 'fiber' | 'coating'>('wafer');
  const [magnification, setMagnification] = useState<number>(400); // 40x, 100x, 400x, 1000x
  const [focusOffset, setFocusOffset] = useState<number>(0); // -10 to +10

  // State for Table 4: Analytical Scale
  const [scaleShieldClosed, setScaleShieldClosed] = useState<boolean>(true);
  const [scaleTare, setScaleTare] = useState<number>(0);
  const [scaleSamples, setScaleSamples] = useState<{ id: string; name: string; weight: number }[]>([]);

  // State for Table 5: Distillation
  const [heaterTemp, setHeaterTemp] = useState<number>(25);
  const [condenserActive, setCondenserActive] = useState<boolean>(true);

  // State for Table 7: Oscilloscope
  const [oscFreq, setOscFreq] = useState<number>(1000);
  const [oscWaveform, setOscWaveform] = useState<'sine' | 'square' | 'triangle'>('sine');

  // State for Table 9: Magnetic Stirrer
  const [stirrerRpm, setStirrerRpm] = useState<number>(450);
  const [stirrerHeater, setStirrerHeater] = useState<boolean>(false);

  if (!isWorkbenchModalOpen) return null;

  // Prism refractive indices
  const refractiveIndex = {
    crown: 1.52,
    flint: 1.66,
    diamond: 2.42,
  }[prismMaterial];

  // Titration calculation: 50mL 0.1M HCl titrated with 0.1M NaOH
  // Equivalence point is at 50.0 mL
  const calculatePH = (vol: number) => {
    const vAcid = 50.0;
    const cAcid = 0.1;
    const cBase = 0.1;
    const molAcid = (vAcid / 1000) * cAcid;
    const molBase = (vol / 1000) * cBase;
    const totalV = (vAcid + vol) / 1000;

    if (vol < 49.9) {
      const remH = (molAcid - molBase) / totalV;
      return Math.max(1.0, -Math.log10(remH));
    } else if (vol > 50.1) {
      const excOH = (molBase - molAcid) / totalV;
      const pOH = -Math.log10(excOH);
      return Math.min(13.5, 14.0 - pOH);
    } else {
      return 7.0 + (vol - 50.0) * 15;
    }
  };

  const currentPH = calculatePH(titrantVolume);
  // Phenolphthalein color: colorless below pH 8.2, pink above, dark magenta above 10
  const getFlaskLiquidColor = () => {
    if (!isIndicatorAdded) return 'rgba(224, 242, 254, 0.4)';
    if (currentPH < 8.2) return 'rgba(240, 249, 255, 0.35)';
    if (currentPH < 9.5) return 'rgba(244, 114, 182, 0.65)';
    return 'rgba(219, 39, 119, 0.88)';
  };

  // Analytical Scale Total Weight
  const rawWeight = scaleSamples.reduce((acc, s) => acc + s.weight, 0);
  const displayedWeight = Math.max(0, rawWeight - scaleTare);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none"
      onClick={closeWorkbenchModal}
    >
      <div
        className="glass-panel w-full max-w-5xl rounded-3xl border border-lab-cyan/60 shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col gap-4 backdrop-blur-2xl bg-slate-950/90 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =====================================================================
            1. MODAL HEADER & TABLE SELECTOR TABS
           ===================================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300">
                  BÀN #{activeTable.tableNumber}
                </span>
                <span className="text-xs font-mono text-slate-400">TẦNG 2 MEZZANINE DECK</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide mt-0.5">
                {activeTable.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">Phím tắt: X / ESC</span>
            <button
              onClick={() => {
                useLabStore.getState().closeActiveLabUI();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition-all active:scale-95 cursor-pointer"
              title="Đóng bảng thí nghiệm (X / ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 10-Table Quick Switcher Strip */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
          {LAB_TABLES.map((t) => {
            const isCur = t.id === activeTable.id;
            return (
              <button
                key={t.id}
                onClick={() => openWorkbenchModal(t.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all flex items-center space-x-1.5 ${
                  isCur
                    ? 'bg-lab-cyan/20 border-lab-cyan text-lab-cyan font-bold shadow-md shadow-lab-cyan/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>#{t.tableNumber}</span>
                <span className="hidden md:inline truncate max-w-[120px]">{t.name.replace('Bàn ', '')}</span>
              </button>
            );
          })}
        </div>

        {/* =====================================================================
            2. ACTIVE EXPERIMENT LAB WORKBENCH VIEW
           ===================================================================== */}
        {/* TABLE 01: OPTICS PRISM DISPERSION */}
        {activeTable.id === 'table_01' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visual Ray Tracing Canvas Simulation */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lab-cyan flex items-center space-x-1.5">
                  <Atom className="w-4 h-4" />
                  <span>MÔ PHỎNG QUANG HỌC: ĐỊNH LUẬT KHÚC XẠ SNELL & TÁN SẮC</span>
                </span>
                <span className="text-xs font-mono text-slate-400">n = {refractiveIndex.toFixed(2)}</span>
              </div>

              {/* Dynamic SVG Prism Ray Diagram */}
              <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 500 260" className="w-full h-full">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="500" height="260" fill="url(#grid)" />

                  {/* Optical Rail Base */}
                  <rect x="30" y="210" width="440" height="12" fill="#334155" rx="3" />

                  {/* Triangular Glass Prism (Equilateral Triangle at center [250, 130]) */}
                  <polygon
                    points="250,60 190,190 310,190"
                    fill="rgba(224, 242, 254, 0.15)"
                    stroke="#38bdf8"
                    strokeWidth="2"
                  />

                  {/* Laser Emitter Box */}
                  <rect x="40" y="115" width="45" height="30" fill="#0f172a" stroke="#475569" strokeWidth="1.5" rx="2" />
                  <circle cx="85" cy="130" r="4" fill="#ef4444" />

                  {/* Incident Beam (From emitter to prism left surface) */}
                  {/* Angle controls incident beam direction */}
                  {(() => {
                    const startX = 85;
                    const startY = 130;
                    const hitX = 220;
                    const hitY = 130 - (incidentAngle - 40) * 1.5;

                    const beamColor =
                      laserColor === 'red'
                        ? '#ef4444'
                        : laserColor === 'green'
                        ? '#22c55e'
                        : laserColor === 'blue'
                        ? '#3b82f6'
                        : '#ffffff';

                    return (
                      <>
                        {/* Incident laser line */}
                        <line x1={startX} y1={startY} x2={hitX} y2={hitY} stroke={beamColor} strokeWidth="3" strokeLinecap="round" />

                        {/* If white light -> dispersion into 7 rainbow rays inside and exiting prism */}
                        {laserColor === 'white' ? (
                          <>
                            {/* Dispersed Rays exiting to detection screen */}
                            <line x1={hitX} y1={hitY} x2={270} y2={hitY - 2} stroke="#f87171" strokeWidth="1.5" />
                            <line x1={hitX} y1={hitY} x2={270} y2={hitY + 6} stroke="#60a5fa" strokeWidth="1.5" />
                            <line x1={hitX} y1={hitY} x2={270} y2={hitY + 10} stroke="#a78bfa" strokeWidth="1.5" />

                            {/* Spectrum screen at right [420, y] */}
                            <rect x="420" y="40" width="12" height="170" fill="#0f172a" stroke="#64748b" rx="2" />
                            {/* Rainbow spectrum cast on screen */}
                            <line x1={270} y1={hitY - 2} x2={420} y2="65" stroke="#ef4444" strokeWidth="2.5" />
                            <line x1={270} y1={hitY} x2={420} y2="82" stroke="#f97316" strokeWidth="2.5" />
                            <line x1={270} y1={hitY + 2} x2={420} y2="99" stroke="#eab308" strokeWidth="2.5" />
                            <line x1={270} y1={hitY + 4} x2={420} y2="116" stroke="#22c55e" strokeWidth="2.5" />
                            <line x1={270} y1={hitY + 6} x2={420} y2="133" stroke="#06b6d4" strokeWidth="2.5" />
                            <line x1={270} y1={hitY + 8} x2={420} y2="150" stroke="#3b82f6" strokeWidth="2.5" />
                            <line x1={270} y1={hitY + 10} x2={420} y2="167" stroke="#a855f7" strokeWidth="2.5" />
                          </>
                        ) : (
                          <>
                            {/* Monochromatic refracted beam */}
                            <line x1={hitX} y1={hitY} x2={270} y2={hitY + (refractiveIndex - 1.5) * 20} stroke={beamColor} strokeWidth="3" />
                            <line
                              x1={270}
                              y1={hitY + (refractiveIndex - 1.5) * 20}
                              x2={420}
                              y2={hitY + (refractiveIndex - 1.5) * 55 + (incidentAngle - 30)}
                              stroke={beamColor}
                              strokeWidth="3"
                            />
                            <rect x="420" y="40" width="12" height="170" fill="#0f172a" stroke="#64748b" rx="2" />
                            <circle
                              cx="420"
                              cy={hitY + (refractiveIndex - 1.5) * 55 + (incidentAngle - 30)}
                              r="5"
                              fill={beamColor}
                            />
                          </>
                        )}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Khúc xạ theo định luật Snell: n₁·sin(θ₁) = n₂·sin(θ₂)</span>
                <span className="text-emerald-400 font-mono">Quang phổ tán sắc Newton</span>
              </div>
            </div>

            {/* Optics Controls Side Panel */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col gap-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
                <span>BẢNG ĐIỀU KHIỂN QUANG HỌC</span>
              </h4>

              {/* Source Color */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold">Nguồn phát Laser / Ánh sáng:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'white', label: 'Tia Trắng (Phổ 7 Màu)', color: 'text-white' },
                    { id: 'red', label: 'Laser Đỏ (650nm)', color: 'text-rose-400' },
                    { id: 'green', label: 'Laser Lục (532nm)', color: 'text-emerald-400' },
                    { id: 'blue', label: 'Laser Lam (405nm)', color: 'text-blue-400' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setLaserColor(s.id as any)}
                      className={`p-2 rounded-xl border text-xs text-left transition-all ${
                        laserColor === s.id
                          ? 'bg-slate-800 border-lab-cyan font-bold text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className={s.color}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Angle Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Góc tới tia sáng (θ₁):</span>
                  <span className="font-mono text-cyan-300 font-bold">{incidentAngle}°</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={incidentAngle}
                  onChange={(e) => setIncidentAngle(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              {/* Prism Material */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold">Vật liệu lăng kính:</label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'crown', label: 'Thủy tinh Crown (n = 1.52)' },
                    { id: 'flint', label: 'Thủy tinh Flint đặc (n = 1.66)' },
                    { id: 'diamond', label: 'Lăng kính Kim cương (n = 2.42)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPrismMaterial(m.id as any)}
                      className={`px-3 py-1.5 rounded-xl border text-xs text-left transition-all ${
                        prismMaterial === m.id
                          ? 'bg-lab-cyan/20 border-lab-cyan text-lab-cyan font-bold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLE 02: ACID-BASE TITRATION */}
        {activeTable.id === 'table_02' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Visual Titration Rig */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lab-cyan flex items-center space-x-1.5">
                  <FlaskConical className="w-4 h-4" />
                  <span>THÍ NGHIỆM CHUẨN ĐỘ AXIT - BAZƠ (HCl 0.1M + NaOH 0.1M)</span>
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  currentPH > 8.2 ? 'bg-pink-950/60 text-pink-300 border border-pink-700' : 'bg-slate-800 text-slate-300'
                }`}>
                  pH: {currentPH.toFixed(2)}
                </span>
              </div>

              {/* Titration Visual Simulation Canvas */}
              <div className="w-full h-72 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden p-3">
                <div className="flex items-end space-x-12">
                  {/* Buret & Retort Stand */}
                  <div className="flex flex-col items-center relative">
                    {/* Buret Top Funnel & Graduated Tube */}
                    <div className="w-4 h-44 rounded-t-sm border border-cyan-400/60 bg-cyan-950/20 relative overflow-hidden flex flex-col justify-end">
                      {/* NaOH Liquid inside Buret */}
                      <div
                        className="w-full bg-cyan-400/40 transition-all duration-300"
                        style={{ height: `${Math.max(0, 100 - (titrantVolume / 60) * 100)}%` }}
                      />
                      {/* Buret tick marks */}
                      <div className="absolute inset-0 flex flex-col justify-between py-1 opacity-50">
                        {[0, 10, 20, 30, 40, 50].map((v) => (
                          <div key={v} className="w-2 h-0.5 bg-white/70 self-end" />
                        ))}
                      </div>
                    </div>

                    {/* Buret Stopcock Valve */}
                    <div className="w-6 h-3 bg-slate-700 rounded-sm my-0.5" />
                    {/* Dispensing Tip */}
                    <div className="w-1.5 h-6 bg-cyan-300/80 rounded-b-full relative">
                      {/* Falling drop animation if volume added recently */}
                      <div className="w-1.5 h-2 rounded-full bg-cyan-300 absolute -bottom-3 animate-ping" />
                    </div>

                    {/* Erlenmeyer Flask below Buret */}
                    <div className="relative mt-3 flex flex-col items-center">
                      <div className="w-7 h-8 border-x-2 border-slate-400/80 bg-slate-900/40" />
                      <div
                        className="w-28 h-24 border-2 border-slate-400/80 rounded-b-3xl relative overflow-hidden transition-all duration-500"
                        style={{
                          backgroundColor: getFlaskLiquidColor(),
                          boxShadow: currentPH >= 8.2 ? '0 0 25px rgba(244, 114, 182, 0.4)' : 'none',
                        }}
                      >
                        {/* Liquid surface line */}
                        <div className="absolute top-6 inset-x-0 h-1 bg-white/30 rounded-full" />
                        {/* Swirling indicator bubbles */}
                        <div className="absolute bottom-2 inset-x-0 flex justify-center text-[10px] font-mono text-white/90">
                          {isIndicatorAdded ? (currentPH > 8.2 ? 'ĐÃ ĐỔI MÀU HỒNG' : 'CHỈ THỊ KHÔNG MÀU') : 'CHƯA THÊM CHỈ THỊ'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Titration Curve Mini Chart */}
                  <div className="w-64 h-56 rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col justify-between">
                    <span className="text-[11px] font-mono text-slate-300 font-bold">
                      ĐƯỜNG CONG CHUẨN ĐỘ pH
                    </span>
                    {/* SVG Curve */}
                    <svg viewBox="0 0 200 120" className="w-full h-32 bg-slate-950 rounded border border-slate-800">
                      {/* Neutral pH 7 dashed line */}
                      <line x1="0" y1="60" x2="200" y2="60" stroke="#475569" strokeDasharray="3,3" />
                      {/* Equivalence line at 50mL */}
                      <line x1="100" y1="0" x2="100" y2="120" stroke="#f43f5e" strokeDasharray="2,2" />
                      {/* Curve path */}
                      <path
                        d="M 10 110 Q 70 105 90 90 T 100 60 T 110 30 Q 130 15 190 12"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      {/* Current point */}
                      <circle
                        cx={Math.min(190, 10 + (titrantVolume / 60) * 180)}
                        cy={120 - (currentPH / 14) * 120}
                        r="4"
                        fill="#ec4899"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>V(NaOH): {titrantVolume.toFixed(1)} mL</span>
                      <span className="text-pink-400">Điểm tương đương: 50.0 mL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Phản ứng trung hòa: HCl + NaOH → NaCl + H₂O. Chỉ thị Phenolphthalein chuyển hồng ở pH &gt; 8.2.
              </div>
            </div>

            {/* Titration Controls */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5 mb-3">
                  <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
                  <span>THAO TÁC BURET CHUẨN ĐỘ</span>
                </h4>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setTitrantVolume((v) => Math.min(60, v + 0.5))}
                    className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
                  >
                    <Droplets className="w-4 h-4" />
                    <span>Nhỏ 1 giọt NaOH (0.5 mL)</span>
                  </button>

                  <button
                    onClick={() => setTitrantVolume((v) => Math.min(60, v + 5.0))}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 border border-slate-700 transition-all active:scale-95"
                  >
                    <span>Xả nhanh 5.0 mL NaOH</span>
                  </button>

                  <button
                    onClick={() => setTitrantVolume(50.0)}
                    className="py-2.5 px-3 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-semibold text-xs flex items-center justify-center space-x-2 border border-amber-500/40 transition-all active:scale-95"
                  >
                    <span>Tiến đến điểm tương đương (50 mL)</span>
                  </button>

                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs mt-1">
                    <span className="text-slate-400">Chỉ thị Phenolphthalein:</span>
                    <button
                      onClick={() => setIsIndicatorAdded(!isIndicatorAdded)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-all ${
                        isIndicatorAdded
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isIndicatorAdded ? 'ĐÃ NHỎ VÀO' : 'CHƯA THÊM'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTitrantVolume(0)}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rửa sạch & Đổ lại Buret ban đầu</span>
              </button>
            </div>
          </div>
        )}

        {/* TABLE 03: PRECISION OPTICAL MICROSCOPE */}
        {activeTable.id === 'table_03' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Microscope Circular Reticle Eyepiece View */}
            <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lab-cyan flex items-center space-x-1.5">
                  <Eye className="w-4 h-4" />
                  <span>THỊ KÍNH HIỂN VI QUANG HỌC PHÂN TÍCH VI CẤU TRÚC</span>
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">{magnification}X ĐỘ PHÓNG ĐẠI</span>
              </div>

              {/* Eyepiece Circular Viewport */}
              <div className="w-full h-72 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                {/* Circular Mask Lens */}
                <div
                  className="w-64 h-64 rounded-full border-4 border-slate-800 bg-slate-900 relative overflow-hidden flex items-center justify-center shadow-inner"
                  style={{
                    filter: `blur(${Math.abs(focusOffset) * 0.75}px)`,
                    transition: 'filter 0.15s ease',
                  }}
                >
                  {/* Procedural Specimen Pattern */}
                  {microscopeSample === 'wafer' && (
                    <div className="w-full h-full bg-slate-950 relative flex flex-wrap p-2 gap-1.5 opacity-90">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/30 flex items-center justify-center">
                          <div className="w-4 h-4 border border-amber-400/50" />
                        </div>
                      ))}
                    </div>
                  )}

                  {microscopeSample === 'nacl' && (
                    <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
                      <div className="w-24 h-24 rotate-45 border-2 border-emerald-400/70 bg-emerald-950/40 shadow-xl" />
                      <div className="w-16 h-16 rotate-12 border-2 border-emerald-300/80 bg-emerald-900/30 absolute" />
                    </div>
                  )}

                  {microscopeSample === 'fiber' && (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border-2 border-blue-400/80 bg-blue-950/40 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2 border-amber-400/90 bg-amber-500/20" />
                      </div>
                    </div>
                  )}

                  {microscopeSample === 'coating' && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950 to-slate-950 p-4 flex flex-wrap gap-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-purple-400/20 border border-purple-400/40" />
                      ))}
                    </div>
                  )}

                  {/* Crosshair Micrometer Reticle Graticule */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-full h-0.5 bg-emerald-400" />
                    <div className="h-full w-0.5 bg-emerald-400 absolute" />
                    <div className="w-24 h-24 rounded-full border border-emerald-400 absolute" />
                  </div>
                </div>

                {focusOffset !== 0 && (
                  <span className="absolute bottom-3 text-xs font-mono text-amber-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                    ⚠️ Chưa lấy nét hoàn hảo (Sai số: {focusOffset > 0 ? `+${focusOffset}` : focusOffset}μm)
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400 flex justify-between">
                <span>Quan sát lát cắt bề mặt micro & cấu trúc tinh thể vật liệu</span>
                <span className="text-cyan-400 font-mono">Thước đo vi mô: 1 vạch = 2.5 μm</span>
              </div>
            </div>

            {/* Microscope Controls */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
                  <span>ĐIỀU CHỈNH KÍNH HIỂN VI</span>
                </h4>

                {/* Sample Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Chọn tiêu bản mẫu:</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'wafer', label: 'Wafer Silicon khắc vi mạch' },
                      { id: 'nacl', label: 'Tinh thể muối tinh khiết NaCl' },
                      { id: 'fiber', label: 'Mặt cắt sợi quang thạch anh' },
                      { id: 'coating', label: 'Màng phủ nano đóng rắn UV' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setMicroscopeSample(s.id as any)}
                        className={`px-3 py-1.5 rounded-xl border text-xs text-left transition-all ${
                          microscopeSample === s.id
                            ? 'bg-lab-cyan/20 border-lab-cyan text-lab-cyan font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Magnification */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Độ phóng đại vật kính:</label>
                  <div className="grid grid-cols-4 gap-1.5 font-mono text-xs">
                    {[40, 100, 400, 1000].map((mag) => (
                      <button
                        key={mag}
                        onClick={() => setMagnification(mag)}
                        className={`py-1.5 rounded-lg border text-center transition-all ${
                          magnification === mag
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {mag}X
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Adjustment */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Ốc vi cấp lấy nét:</span>
                    <span className={`font-mono font-bold ${focusOffset === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {focusOffset === 0 ? 'NÉT HOÀN TOÀN' : `${focusOffset} μm`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={focusOffset}
                    onChange={(e) => setFocusOffset(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={() => setFocusOffset(0)}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                Auto-Focus Lấy Nét Tự Động
              </button>
            </div>
          </div>
        )}

        {/* TABLE 04: HIGH PRECISION ANALYTICAL BALANCE */}
        {activeTable.id === 'table_04' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-lab-cyan flex items-center space-x-1.5">
                  <Scale className="w-4 h-4" />
                  <span>CÂN ĐIỆN TỬ PHÂN TÍCH ĐỘ CHÍNH XÁC CAO (0.0001g)</span>
                </span>
                <span className="text-xs font-mono text-emerald-400">CHỨNG NHẬN ISO/IEC 17025</span>
              </div>

              {/* Digital Scale LED Readout Visual */}
              <div className="w-full h-72 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-6 relative">
                {/* Draft Chamber Shield Glass Enclosure Graphic */}
                <div className="w-72 h-44 rounded-2xl border-2 border-cyan-400/40 bg-slate-900/40 relative flex flex-col justify-between p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>LỒNG KÍNH CHẮN GIÓ:</span>
                    <span className={scaleShieldClosed ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {scaleShieldClosed ? 'ĐÃ ĐÓNG KÍN' : 'ĐANG MỞ CỬA'}
                    </span>
                  </div>

                  {/* Stainless Steel Weighing Pan */}
                  <div className="self-center flex flex-col items-center">
                    {/* Objects on Pan */}
                    <div className="flex items-end justify-center space-x-2 mb-1">
                      {scaleSamples.map((s, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 text-[10px] font-mono shadow-md animate-bounce"
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                    <div className="w-32 h-2.5 rounded-full bg-slate-300 border border-slate-400 shadow-md" />
                    <div className="w-8 h-4 bg-slate-600 rounded-b" />
                  </div>

                  {/* 7-Segment Digital Readout Display */}
                  <div className="w-full rounded-xl bg-slate-950 border border-emerald-500/40 p-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">STABLE [S]</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">
                      {displayedWeight.toFixed(4)} <span className="text-sm text-emerald-300">g</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400 flex justify-between">
                <span>Cân vi lượng với lồng kính ngăn ngừa sai số do luồng không khí</span>
                <span className="text-emerald-400 font-mono">Độ phân giải: 0.1 mg</span>
              </div>
            </div>

            {/* Scale Controls */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-lab-cyan" />
                  <span>THAO TÁC CÂN MẪU</span>
                </h4>

                <button
                  onClick={() => setScaleShieldClosed(!scaleShieldClosed)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    scaleShieldClosed
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-amber-500/20 border-amber-500 text-amber-300'
                  }`}
                >
                  {scaleShieldClosed ? 'Mở cửa lồng kính' : 'Đóng kín cửa lồng kính'}
                </button>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Đặt vật phẩm lên đĩa cân:</label>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'wafer', name: 'Wafer Silicon', weight: 5.2341 },
                      { id: 'copper', name: 'Mảnh Đồng tinh khiết', weight: 12.8523 },
                      { id: 'powder', name: 'Bột oxit xúc tác', weight: 1.5024 },
                      { id: 'beaker', name: 'Cốc thủy tinh 100mL', weight: 48.7215 },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (scaleSamples.some((s) => s.id === item.id)) {
                            setScaleSamples(scaleSamples.filter((s) => s.id !== item.id));
                          } else {
                            setScaleSamples([...scaleSamples, item]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${
                          scaleSamples.some((s) => s.id === item.id)
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className="font-mono text-[11px]">{item.weight}g</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setScaleTare(rawWeight)}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all active:scale-95"
                >
                  TARE (VỀ 0)
                </button>
                <button
                  onClick={() => {
                    setScaleSamples([]);
                    setScaleTare(0);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
                >
                  Dọn đĩa cân
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLES 05 TO 10: OTHER EXPERIMENTS */}
        {!['table_01', 'table_02', 'table_03', 'table_04'].includes(activeTable.id) && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col items-center justify-center gap-4 text-center py-12">
            <div className="w-16 h-16 rounded-3xl bg-lab-cyan/15 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
              <Activity className="w-8 h-8 animate-pulse" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-white mb-1">{activeTable.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trạm thí nghiệm chuyên dụng tầng 2 với cấu hình thiết bị phân tích hiện đại. Đã kết nối đầy đủ các bộ điều khiển ngoại vi và sẵn sàng cho các quy trình nghiên cứu tiếp theo.
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trạng thái: Sẵn sàng vận hành</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

