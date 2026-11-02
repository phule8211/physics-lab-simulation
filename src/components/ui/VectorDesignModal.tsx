import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLabStore } from '../../store/useLabStore';
import {
  PRESET_DESIGNS,
  Point2D,
  generateTextPaths,
  computeBoundingBox,
  autoFitToolpaths,
} from '../../data/vectorDesigns';
import {
  X,
  PenTool,
  Type,
  LayoutGrid,
  CheckCircle2,
  Trash2,
  Undo2,
  Zap,
  Cog,
  Atom,
  Cpu,
  Star,
  Heart,
  Sliders,
  Crosshair,
  Scan,
  Maximize2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Scissors,
  Flame,
  Compass,
} from 'lucide-react';

export function VectorDesignModal() {
  const {
    isDesignModalOpen,
    closeDesignModal,
    currentDesignId,
    selectPresetDesign,
    setCustomToolpaths,
    setCustomTextDesign,
    startCuttingJob,
    activeStationId,
    selectedMaterial,
    currentToolpaths,
    isFraming,
    startFraming,
    stopFraming,
    autoFitCurrentDesign,
    scaleCurrentDesign,
    nudgeCurrentDesign,
    processMode,
    setProcessMode,
  } = useLabStore();

  const [activeTab, setActiveTab] = useState<'PRESETS' | 'TEXT' | 'DRAW'>('PRESETS');
  const [customText, setCustomText] = useState('PHYSICS LAB');

  // Freehand drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Point2D[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point2D[]>([]);

  // Compute current bounding box metrics
  const bbox = useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);
  const isOutOfBounds = bbox.isOutOfBounds;

  // Automatically release pointer lock when modal opens so user has their cursor
  useEffect(() => {
    if (isDesignModalOpen) {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    }
  }, [isDesignModalOpen]);

  // Close modal on Escape
  useEffect(() => {
    if (!isDesignModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDesignModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesignModalOpen, closeDesignModal]);

  // Icons map for preset designs
  const iconMap: Record<string, React.ReactNode> = {
    Cog: <Cog className="w-5 h-5 text-amber-400" />,
    Atom: <Atom className="w-5 h-5 text-cyan-400" />,
    Cpu: <Cpu className="w-5 h-5 text-emerald-400" />,
    Star: <Star className="w-5 h-5 text-yellow-400" />,
    Heart: <Heart className="w-5 h-5 text-rose-400" />,
  };

  // Convert canvas pixel mouse coordinates to normalized [-1, 1] Point2D
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0];
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1); // Flip Y so +Y is up
    return [Math.max(-0.95, Math.min(0.95, x)), Math.max(-0.95, Math.min(0.95, y))];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pt = getCanvasPoint(e);
    setCurrentStroke([pt]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasPoint(e);
    // Add point if distance from last point is notable to optimize point count
    const last = currentStroke[currentStroke.length - 1];
    if (!last || Math.hypot(pt[0] - last[0], pt[1] - last[1]) > 0.02) {
      setCurrentStroke((prev) => [...prev, pt]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentStroke.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  // Render canvas strokes with Workpiece Safety Border and Bounding Box
  useEffect(() => {
    if (!isDesignModalOpen || activeTab !== 'DRAW') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Helper: Point2D to canvas coordinates
    const toPx = ([x, y]: Point2D): [number, number] => {
      const px = ((x + 1) / 2) * w;
      const py = ((1 - y) / 2) * h;
      return [px, py];
    };

    // 1. Background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // 2. Safe Workpiece Boundary Zone (Simulating plate 1.6m x 1.0m, aspect ratio ~ 1.6)
    const [p1x, p1y] = toPx([-0.82, 0.72]);
    const [p2x, p2y] = toPx([0.82, -0.72]);
    const plateW = p2x - p1x;
    const plateH = p2y - p1y;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(p1x, p1y, plateW, plateH);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p1x, p1y, plateW, plateH);

    // 3. Grid lines inside plate
    ctx.strokeStyle = '#162238';
    ctx.lineWidth = 1;
    for (let x = p1x; x < p2x; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, p1y);
      ctx.lineTo(x, p2y);
      ctx.stroke();
    }
    for (let y = p1y; y < p2y; y += 24) {
      ctx.beginPath();
      ctx.moveTo(p1x, y);
      ctx.lineTo(p2x, y);
      ctx.stroke();
    }

    // 4. Safe Cutting Margin (dashed border in cyan or amber)
    const [safe1x, safe1y] = toPx([-0.76, 0.66]);
    const [safe2x, safe2y] = toPx([0.76, -0.66]);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(safe1x, safe1y, safe2x - safe1x, safe2y - safe1y);
    ctx.setLineDash([]);

    // Margin label
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.fillText('GIỚI HẠN AN TOÀN PHÔI', safe1x + 6, safe1y + 12);

    // 5. Center Origin Crosshair (0,0)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w / 2, p1y);
    ctx.lineTo(w / 2, p2y);
    ctx.moveTo(p1x, h / 2);
    ctx.lineTo(p2x, h / 2);
    ctx.stroke();

    // Red Origin Circle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.font = '8px monospace';
    ctx.fillText('(0,0) GỐC TỌA ĐỘ', w / 2 + 6, h / 2 - 4);

    // 6. Draw strokes
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const allStrokes = [...strokes, ...(currentStroke.length ? [currentStroke] : [])];

    allStrokes.forEach((stroke) => {
      if (!stroke.length) return;
      ctx.strokeStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;

      ctx.beginPath();
      const [startX, startY] = toPx(stroke[0]);
      ctx.moveTo(startX, startY);

      for (let i = 1; i < stroke.length; i++) {
        const [px, py] = toPx(stroke[i]);
        ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Green start point indicator
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(startX, startY, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. If strokes exist, draw Bounding Box around them
    if (allStrokes.length > 0) {
      const strokeBbox = computeBoundingBox(allStrokes);
      const [b1x, b1y] = toPx([strokeBbox.minX, strokeBbox.maxY]);
      const [b2x, b2y] = toPx([strokeBbox.maxX, strokeBbox.minY]);
      const bw = b2x - b1x;
      const bh = b2y - b1y;

      const hasSpill = strokeBbox.isOutOfBounds;
      ctx.strokeStyle = hasSpill ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(b1x, b1y, bw, bh);
      ctx.setLineDash([]);

      // Bounding box size label
      const mmW = Math.round(strokeBbox.width * 100);
      const mmH = Math.round(strokeBbox.height * 100);
      ctx.fillStyle = hasSpill ? '#f87171' : '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${mmW} × ${mmH} mm ${hasSpill ? '[TRÀN PHÔI!]' : '[CHUẨN]'}`, b1x, Math.max(14, b1y - 4));
    }
  }, [activeTab, strokes, currentStroke, isDesignModalOpen]);

  // Handle Action: Send custom drawing to machine
  const handleApplyDrawing = () => {
    if (!strokes.length) return;
    setCustomToolpaths(strokes, `Bản vẽ tự do (${strokes.length} đường nét)`);
    closeDesignModal();
  };

  // Handle Action: Send text to machine
  const handleApplyText = () => {
    if (!customText.trim()) return;
    setCustomTextDesign(customText.trim());
    closeDesignModal();
  };

  if (!isDesignModalOpen) return null;

  const mmWidth = Math.round(bbox.width * 100);
  const mmHeight = Math.round(bbox.height * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl h-[88vh] max-h-[840px] flex flex-col rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/95 overflow-hidden text-slate-100">
        {/* =====================================================================
            1. MODAL HEADER
           ===================================================================== */}
        <header className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  STUDIO THIẾT KẾ VECTOR & G-CODE GIA CÔNG LASER
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lab-cyan/20 text-lab-cyan border border-lab-cyan/40 font-bold">
                  CAD V2.0
                </span>
              </div>
              <p className="text-xs text-lab-muted">
                Tự do thiết kế hình cắt, nhập chữ hoặc chọn mẫu kỹ thuật nạp trực tiếp vào máy laser 3D
              </p>
            </div>
          </div>

          <button
            onClick={closeDesignModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
            aria-label="Đóng bảng thiết kế"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* =====================================================================
            2. MODE SELECTOR TABS & PROCESS MODE SWITCH (THRU-CUT VS ENGRAVE)
           ===================================================================== */}
        <div className="border-b border-slate-800 bg-slate-950/60 px-4 pt-2 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('PRESETS')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-t border-x transition-all ${
                activeTab === 'PRESETS'
                  ? 'bg-slate-900 text-lab-cyan border-slate-700 border-b-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Thư Viện Mẫu (Presets)</span>
            </button>

            <button
              onClick={() => setActiveTab('TEXT')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-t border-x transition-all ${
                activeTab === 'TEXT'
                  ? 'bg-slate-900 text-lab-cyan border-slate-700 border-b-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Khắc Chữ (Vector Text)</span>
            </button>

            <button
              onClick={() => setActiveTab('DRAW')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-t border-x transition-all ${
                activeTab === 'DRAW'
                  ? 'bg-slate-900 text-lab-cyan border-slate-700 border-b-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Bàn Vẽ Tự Do (Studio)</span>
            </button>
          </nav>

          {/* PROCESS MODE TOGGLE: THROUGH-CUT VS SURFACE ENGRAVE */}
          <div className="flex items-center space-x-1 pb-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setProcessMode('CUT')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                processMode === 'CUT'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cắt đứt xuyên qua chiều dày vật liệu (3mm) - cho phép lấy rời chi tiết sau khi cắt"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Cắt Xuyên Phôi</span>
            </button>

            <button
              onClick={() => setProcessMode('ENGRAVE')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                processMode === 'ENGRAVE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Khắc đường nét nông trên bề mặt (0.1mm) - phôi giữ nguyên vẹn không đứt rời"
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Khắc Bề Mặt</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
            3. ORIGIN, BOUNDING BOX & ALIGNMENT / FRAMING CONTROL BAR
           ===================================================================== */}
        <section
          aria-label="Thanh công cụ căn chỉnh kích thước và gốc tọa độ"
          className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0"
        >
          {/* Dimensions & Spill Alert */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 font-mono">
              <Compass className="w-4 h-4 text-lab-cyan" />
              <span className="text-slate-400">Kích thước viền:</span>
              <span className="font-bold text-white">{mmWidth} × {mmHeight} mm</span>
            </div>

            {isOutOfBounds ? (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tràn phôi!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Trong phôi an toàn</span>
              </div>
            )}
          </div>

          {/* Transformation Tools: Zoom, Nudge, Auto-fit, Frame */}
          <div className="flex items-center space-x-2">
            {/* Auto-Fit Button */}
            <button
              onClick={autoFitCurrentDesign}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/80 text-cyan-300 font-semibold transition-all active:scale-95"
              title="Tự động thu phóng và đặt thiết kế vừa vặn vào giữa phôi gia công"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Căn Vừa (Auto-Fit)</span>
            </button>

            {/* Scale +/- Buttons */}
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              <button
                onClick={() => scaleCurrentDesign(0.9)}
                className="px-2 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Thu nhỏ 10%"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-4 bg-slate-800" />
              <button
                onClick={() => scaleCurrentDesign(1.1)}
                className="px-2 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Phóng to 10%"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* D-Pad Nudge Buttons */}
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => nudgeCurrentDesign(-0.06, 0)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Dịch sang trái"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeCurrentDesign(0, 0.06)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Dịch lên trên"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeCurrentDesign(0, -0.06)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Dịch xuống dưới"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => nudgeCurrentDesign(0.06, 0)}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Dịch sang phải"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Center Origin Button */}
            <button
              onClick={() => nudgeCurrentDesign(-bbox.centerX, -bbox.centerY)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold transition-all active:scale-95"
              title="Đặt tâm thiết kế trùng gốc tọa độ máy (0,0)"
            >
              <Crosshair className="w-3.5 h-3.5 text-lab-cyan" />
              <span>Gốc (0,0)</span>
            </button>

            {/* Frame Test Button */}
            <button
              onClick={() => {
                if (isFraming) stopFraming();
                else startFraming();
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all active:scale-95 ${
                isFraming
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-300 hover:border-cyan-500/50'
              }`}
              title="Đầu laser quét tia đỏ xung quanh 4 góc để bạn kiểm tra vị trí thực tế trên bàn máy (Phím F)"
            >
              <Scan className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFraming ? 'Dừng quét' : 'Frame [F]'}</span>
            </button>
          </div>
        </section>

        {/* =====================================================================
            4. TAB CONTENT
           ===================================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* A. PRESETS LIBRARY */}
          {activeTab === 'PRESETS' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {PRESET_DESIGNS.map((item) => {
                const isSelected = currentDesignId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => selectPresetDesign(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-cyan-950/30 border-lab-cyan ring-1 ring-lab-cyan shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform">
                          {iconMap[item.iconName] || <Cog className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1 group-hover:text-lab-cyan transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.paths.length} đường vector | ~{item.estimatedTimeSec}s
                      </span>
                      {isSelected ? (
                        <span className="text-xs font-bold text-lab-cyan flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đang nạp</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                          Chọn mẫu →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* B. CUSTOM TEXT MODE */}
          {activeTab === 'TEXT' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Nhập nội dung chữ muốn máy khắc:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    maxLength={20}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="VD: PHYSICS LAB, CNC-2026..."
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-lab-cyan uppercase tracking-wider"
                  />
                  <button
                    onClick={handleApplyText}
                    className="px-5 py-3 rounded-xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-950/50 active:scale-95 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nạp vào máy</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hệ thống tự động biên dịch các ký tự thành chuỗi đường cắt vector G-code và tự co giãn tỷ lệ để nằm gọn trong lòng phôi mà không tràn ra ngoài mép.
                </p>
              </div>

              {/* Text Preview Display */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
                <span className="text-[11px] font-mono text-slate-500 mb-2">Xem trước phôi khắc laser:</span>
                <div className="text-2xl md:text-3xl font-mono font-black text-lab-cyan tracking-widest drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                  {customText.toUpperCase() || 'CHƯA NHẬP NỘI DUNG'}
                </div>
                <span className="text-[10px] font-mono text-emerald-400 mt-2 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  {customText.length} ký tự | Tự động căn tâm & an toàn viền
                </span>
              </div>
            </div>
          )}

          {/* C. FREEHAND DRAWING STUDIO */}
          {activeTab === 'DRAW' && (
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
              {/* Canvas Area with boundary feedback */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={320}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="block touch-none"
                />

                {/* Floating Canvas Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-300">
                  <Crosshair className="w-3 h-3 text-lab-cyan" />
                  <span>Vùng cắt: 160 × 100 mm</span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 px-2 py-1 rounded-md bg-cyan-950/80 backdrop-blur-md border border-cyan-800/80 text-[10px] font-mono text-cyan-300">
                  <span>{strokes.length} đường nét</span>
                </div>
              </div>

              {/* Drawing Tools Panel */}
              <div className="flex lg:flex-col gap-2 w-full lg:w-48">
                <button
                  onClick={handleUndo}
                  disabled={!strokes.length}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition-all active:scale-95"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Hoàn tác</span>
                </button>

                <button
                  onClick={handleClear}
                  disabled={!strokes.length}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 disabled:opacity-50 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-rose-800/60 transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa hết</span>
                </button>

                <div className="hidden lg:block p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Hướng dẫn:</span>
                  <p>Nhấp giữ chuột và vẽ trong viền nét đứt màu xanh. Nếu nét vẽ tràn ra ngoài, bấm "Căn vừa (Auto-Fit)" để tự co vào phôi!</p>
                </div>

                <button
                  onClick={handleApplyDrawing}
                  disabled={!strokes.length}
                  className="flex-1 lg:mt-auto py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-emerald-400 shadow-lg shadow-emerald-950/50 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nạp bản vẽ này</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================================
            5. MODAL FOOTER & EXECUTE CTA
           ===================================================================== */}
        <footer className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
          <div className="flex items-center space-x-3 text-slate-400 font-mono">
            <span>Thiết bị: <b className="text-white">{activeStationId || 'CO2 LASER'}</b></span>
            <span>•</span>
            <span>Phôi: <b className="text-lab-cyan">{selectedMaterial}</b></span>
            <span>•</span>
            <span>Chế độ: <b className={processMode === 'CUT' ? 'text-amber-400' : 'text-cyan-400'}>{processMode === 'CUT' ? 'Cắt xuyên (Thru-Cut)' : 'Khắc mặt (Engrave)'}</b></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={closeDesignModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all border border-slate-700"
            >
              Đóng
            </button>

            <button
              onClick={() => {
                closeDesignModal();
                startCuttingJob();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 border border-emerald-400 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Thực Hiện {processMode === 'CUT' ? 'Cắt Xuyên' : 'Khắc'} [C]</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
