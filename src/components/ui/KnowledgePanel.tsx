import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { PHYSICS_DATA } from '../../data/physicsData';
import { InfoTab } from '../../types/lab';
import { MATERIALS_CATALOG, MaterialType } from '../../data/materialsConfig';
import { SpectrumVisualizer } from './SpectrumVisualizer';
import { AbsorptionCurvesChart } from './AbsorptionCurvesChart';
import {
  X,
  Zap,
  Layers,
  Sliders,
  ShieldAlert,
  Play,
  Pause,
  Atom,
  CheckCircle2,
  AlertTriangle,
  Info,
  Bookmark,
  DoorOpen,
  DoorClosed,
  Square,
  Sparkles,
} from 'lucide-react';

function formatFormula(raw: string) {
  return raw
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\approx/g, '≈')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\quad/g, '   ')
    .replace(/\\text\{([^\}]+)\}/g, '$1')
    .replace(/\\mu/g, 'µ')
    .replace(/\^4/g, '⁴')
    .replace(/\^2/g, '²')
    .replace(/_2/g, '₂')
    .replace(/_0/g, '₀')
    .replace(/\\xrightarrow\{([^\}]+)\}/g, ' ──[$1]──> ')
    .replace(/\\,/g, ' ');
}

export function KnowledgePanel() {
  const {
    activeStationId,
    activeTab,
    setActiveTab,
    exitInspection,
    isMachineRunning,
    toggleMachineRunning,
    isLidOpen,
    toggleLid,
    selectedMaterial,
    setSelectedMaterial,
    isCuttingJob,
    cutProgress,
    startCuttingJob,
    stopCuttingJob,
  } = useLabStore();

  // Ensure pointer lock is released when entering station inspection so user has cursor to scroll & click tabs
  React.useEffect(() => {
    if (activeStationId && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [activeStationId]);

  if (!activeStationId) return null;

  const data = PHYSICS_DATA[activeStationId];
  if (!data) return null;

  const tabs: { id: InfoTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'PHYSICS_PRINCIPLE', label: 'Nguyên Lý Hoạt Động', icon: Zap },
    { id: 'COMPONENTS', label: 'Cấu Tạo Bộ Phận', icon: Layers },
    { id: 'OVERVIEW', label: 'Phân Loại & So Sánh', icon: Sliders },
    { id: 'SAFETY', label: 'Vật Liệu & An Toàn', icon: ShieldAlert },
  ];

  return (
    <aside
      aria-label={`Bảng tri thức chi tiết: ${data.title}`}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      className="pointer-events-auto fixed inset-y-0 right-0 w-full md:w-[540px] lg:w-[620px] z-50 flex flex-col bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl text-slate-100 animate-in slide-in-from-right duration-300 select-text"
    >
      {/* =========================================================================
          1. HEADER
         ========================================================================= */}
      <header className="p-5 border-b border-slate-800 bg-slate-950/60 relative flex-shrink-0">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2 pr-12">
          <span
            className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border"
            style={{
              borderColor: `${data.accentColor}60`,
              backgroundColor: `${data.accentColor}15`,
              color: data.accentColor,
            }}
          >
            {data.wavelengthBadge}
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            {data.categoryBadge}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          {data.title}
        </h2>
        <p className="text-xs text-lab-muted leading-relaxed">
          {data.subtitle}
        </p>

        {/* Inventor Info */}
        <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
          <Bookmark className="w-3.5 h-3.5 text-lab-cyan flex-shrink-0" />
          <span>{data.inventorInfo}</span>
        </div>

        {/* Close Button [X] */}
        <button
          onClick={exitInspection}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700 hover:border-slate-500"
          aria-label="Đóng bảng kiến thức và quay lại xưởng"
          title="Đóng (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Toggle Simulation Run */}
        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-800/60">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full animate-ping bg-emerald-400" />
            <span>Trạng thái mô phỏng 3D:</span>
            <span className="font-semibold text-emerald-400">
              {isMachineRunning ? 'Đang hoạt động' : 'Tạm dừng'}
            </span>
          </div>

          <button
            onClick={toggleMachineRunning}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 border ${
              isMachineRunning
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isMachineRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Tạm dừng máy</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Kích hoạt tia laser</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. TAB NAVIGATION
         ========================================================================= */}
      <nav
        aria-label="Điều hướng tab nội dung"
        className="flex border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 flex-shrink-0 overflow-x-auto gap-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-lab-cyan/15 text-lab-cyan border border-lab-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* =========================================================================
          3. SCROLLABLE TAB CONTENT AREA
         ========================================================================= */}
      <div
        className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6 text-sm scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600 scrollbar-track-slate-900/60"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* =====================================================================
            TAB 1: NGUYÊN LÝ HOẠT ĐỘNG (PHYSICS_PRINCIPLE)
           ===================================================================== */}
        {activeTab === 'PHYSICS_PRINCIPLE' && (
          <div className="space-y-6">
            {/* Core Concept Box */}
            <section className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60">
              <div className="flex items-center space-x-2 text-lab-cyan font-bold text-xs uppercase tracking-wider mb-2">
                <Atom className="w-4 h-4" />
                <span>Nguyên Lý Cốt Lõi</span>
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {data.principles.coreConcept}
              </p>
            </section>

            {/* Gas Mixture or Medium if applicable */}
            {data.principles.gasMixtureOrMedium && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-lab-cyan rounded-full" />
                  <span>{data.principles.gasMixtureOrMedium.title}</span>
                </h3>

                <div className="grid gap-2.5">
                  {data.principles.gasMixtureOrMedium.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-col space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs sm:text-sm">
                          {item.name}
                        </span>
                        {item.percentage && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-lab-cyan/10 text-lab-cyan border border-lab-cyan/30">
                            {item.percentage}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.role}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4-Step Energy Cycle */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-lab-violet rounded-full" />
                <span>Chu Trình Năng Lượng & Cơ Chế Phát Xạ</span>
              </h3>

              <div className="space-y-3">
                {data.principles.energyCycleSteps.map((step) => (
                  <div
                    key={step.step}
                    className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2.5 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-lab-cyan/20 border border-lab-cyan/40 text-lab-cyan font-mono text-xs flex items-center justify-center font-bold">
                        {step.step}
                      </span>
                      <h4 className="font-bold text-white text-xs sm:text-sm">
                        {step.name}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {step.description}
                    </p>

                    {step.formula && (
                      <div className="mt-2.5 ml-7 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs text-lab-cyan/95 overflow-x-auto shadow-inner flex items-center">
                        <span className="text-slate-500 select-none mr-2">fx =</span>
                        <code className="font-semibold tracking-wide text-cyan-300">{formatFormula(step.formula)}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Wavelength Interaction Detail */}
            <section className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs leading-relaxed text-cyan-200">
              <div className="flex items-center space-x-2 font-bold mb-1.5 text-cyan-400">
                <Info className="w-4 h-4" />
                <span>Đặc Tính Bước Sóng & Tương Tác Vật Liệu</span>
              </div>
              <p>{data.principles.wavelengthDetails}</p>
            </section>

            {/* Interactive Electromagnetic Spectrum Visualizer */}
            <SpectrumVisualizer activeId={activeStationId} />
          </div>
        )}

        {/* =====================================================================
            TAB 2: CẤU TẠO CHI TIẾT BỘ PHẬN (COMPONENTS)
           ===================================================================== */}
        {activeTab === 'COMPONENTS' && (
          <div className="space-y-6">
            {data.components.map((group, groupIndex) => (
              <section key={groupIndex} className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-lab-amber rounded-full" />
                  <span>{group.category}</span>
                </h3>

                <div className="space-y-2.5">
                  {group.parts.map((part, partIndex) => (
                    <div
                      key={partIndex}
                      className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {part.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {part.englishName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {part.description}
                      </p>

                      {part.materialOrSpec && (
                        <div className="pt-1.5 flex items-center space-x-1.5 text-[11px] text-lab-cyan font-mono">
                          <span className="text-slate-400 font-sans">Quy cách:</span>
                          <span>{part.materialOrSpec}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* =====================================================================
            TAB 3: PHÂN LOẠI & SO SÁNH (OVERVIEW)
           ===================================================================== */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            <div className="text-xs text-lab-muted leading-relaxed">
              Các biến thể công nghệ phổ biến trên thị trường và bảng so sánh chi tiết ưu - nhược điểm kỹ thuật:
            </div>

            <div className="space-y-4">
              {data.classifications.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3"
                >
                  <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-lab-cyan" />
                    <span>{item.type}</span>
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.features}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {/* Pros */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ưu điểm:</span>
                      </span>
                      <ul className="text-[11px] text-emerald-200/90 space-y-1 list-disc list-inside">
                        {item.pros.map((pro, pIdx) => (
                          <li key={pIdx}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Cons */}
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Nhược điểm:</span>
                      </span>
                      <ul className="text-[11px] text-rose-200/90 space-y-1 list-disc list-inside">
                        {item.cons.map((con, cIdx) => (
                          <li key={cIdx}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: VẬT LIỆU TƯƠNG THÍCH & QUY CHUẨN AN TOÀN (SAFETY)
           ===================================================================== */}
        {activeTab === 'SAFETY' && (
          <div className="space-y-6">
            {/* Safety Class Badge */}
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-300 text-sm">
                  {data.materialsAndSafety.safetyClass}
                </h4>
                <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                  Thiết bị phát bức xạ quang học cường độ cao. Bắt buộc tuân thủ nghiêm ngặt các quy tắc an toàn tiêu chuẩn phòng thí nghiệm.
                </p>
              </div>
            </div>

            {/* Real-Time Material Testing & Machine Control */}
            {activeStationId !== 'SENSOR_STATION' && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-700/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-lab-cyan" />
                    <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                      Thao Tác Máy 3D & Đặt Phôi Vật Liệu
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      isLidOpen
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isLidOpen ? 'Nắp đang mở [Interlock ngắt]' : 'Nắp đóng [Sẵn sàng]'}
                  </span>
                </div>

                {/* Quick Buttons: Lid & Cut */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={toggleLid}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                      isLidOpen
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    {isLidOpen ? (
                      <>
                        <DoorOpen className="w-4 h-4 text-amber-400" />
                        <span>Đóng nắp [O]</span>
                      </>
                    ) : (
                      <>
                        <DoorClosed className="w-4 h-4 text-slate-400" />
                        <span>Mở nắp [O]</span>
                      </>
                    )}
                  </button>

                  {isCuttingJob ? (
                    <button
                      onClick={stopCuttingJob}
                      className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-rose-500 animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Dừng cắt ({cutProgress.toFixed(0)}%)</span>
                    </button>
                  ) : (
                    <button
                      onClick={startCuttingJob}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-emerald-400 shadow-md shadow-emerald-950/60"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Bắt đầu cắt [C]</span>
                    </button>
                  )}
                </div>

                {/* Material Choice Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Chọn loại phôi thử nghiệm:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['WOOD', 'ACRYLIC', 'STEEL', 'ALUMINUM', 'SILICON', 'GLASS'] as MaterialType[]).map((matKey) => {
                      const matItem = MATERIALS_CATALOG[matKey];
                      const inter = matItem.interactions[activeStationId];
                      const isSel = selectedMaterial === matKey;

                      return (
                        <button
                          key={matKey}
                          onClick={() => setSelectedMaterial(matKey)}
                          className={`p-2 rounded-lg border text-left text-[11px] transition-all flex flex-col justify-between ${
                            isSel
                              ? 'bg-lab-cyan/15 border-lab-cyan text-white shadow-md shadow-lab-cyan/10'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 font-medium">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: matItem.color }}
                            />
                            <span className="truncate">{matItem.name.split(' ')[0]}</span>
                          </div>
                          <span
                            className="text-[9px] font-mono mt-1 font-semibold truncate"
                            style={{ color: inter.badgeColor }}
                          >
                            {inter.statusText.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Material Reaction Explanation */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {MATERIALS_CATALOG[selectedMaterial]?.name}
                    </span>
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: MATERIALS_CATALOG[selectedMaterial]?.interactions[activeStationId]?.badgeColor,
                        backgroundColor: `${MATERIALS_CATALOG[selectedMaterial]?.interactions[activeStationId]?.badgeColor}20`,
                      }}
                    >
                      {MATERIALS_CATALOG[selectedMaterial]?.interactions[activeStationId]?.statusText}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {MATERIALS_CATALOG[selectedMaterial]?.interactions[activeStationId]?.effectDescription}
                  </p>
                </div>
              </div>
            )}

            {/* Material Compatibility Grid */}
            <div className="grid sm:grid-cols-2 gap-3.5">
              {/* Recommended */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-emerald-900/40 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vật liệu khuyên dùng:</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-2">
                  {data.materialsAndSafety.recommendedMaterials.map((mat, mIdx) => (
                    <li key={mIdx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restricted */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-rose-900/40 space-y-2">
                <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Vật liệu cấm kỵ / Lưu ý:</span>
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-2">
                  {data.materialsAndSafety.restrictedMaterials.map((mat, rIdx) => (
                    <li key={rIdx} className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Optical Absorption Curves Chart */}
            <AbsorptionCurvesChart activeMachineId={activeStationId} />

            {/* Safety Protocols */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                <span>Quy trình vận hành an toàn bắt buộc:</span>
              </h4>

              <div className="space-y-2">
                {data.materialsAndSafety.safetyProtocols.map((protocol, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed"
                  >
                    <span className="font-mono text-rose-400 font-bold text-xs mt-0.5">
                      0{pIdx + 1}.
                    </span>
                    <span>{protocol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. FOOTER QUICK ACTION
         ========================================================================= */}
      <footer className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0 text-xs">
        <span className="text-slate-400 font-mono">
          Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-lab-cyan">ESC</kbd> để thoát
        </span>
        <button
          onClick={exitInspection}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all duration-200 border border-slate-700 active:scale-95"
        >
          Quay lại xưởng
        </button>
      </footer>
    </aside>
  );
}

