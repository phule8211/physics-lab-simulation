import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useLabStore } from '../../../store/useLabStore';
import { COATING_FINISHES } from '../../../data/coatingFinishes';
import { MachineStatusBar } from './MachineStatusBar';

interface CoatingStationPanelProps {
  onExit: () => void;
}

/**
 * Step-by-step electrostatic spray coating & 395nm UV photo-polymerization curing dock.
 */
export const CoatingStationPanel: React.FC<CoatingStationPanelProps> = ({ onExit }) => {
  const [coatingStep, setCoatingStep] = React.useState<1 | 2 | 3 | 4>(1);

  const {
    selectedCoatingFinish,
    coatingCoverage,
    curingProgress,
    isSpraying,
    isCuring,
    isTurntableRotating,
    setSelectedCoatingFinish,
    startSpraying,
    stopSpraying,
    startCuring,
    stopCuring,
    resetCoating,
    toggleTurntable,
    openSpecimenModal,
  } = useLabStore(
    useShallow((s) => ({
      selectedCoatingFinish: s.selectedCoatingFinish,
      coatingCoverage: s.coatingCoverage,
      curingProgress: s.curingProgress,
      isSpraying: s.isSpraying,
      isCuring: s.isCuring,
      isTurntableRotating: s.isTurntableRotating,
      setSelectedCoatingFinish: s.setSelectedCoatingFinish,
      startSpraying: s.startSpraying,
      stopSpraying: s.stopSpraying,
      startCuring: s.startCuring,
      stopCuring: s.stopCuring,
      resetCoating: s.resetCoating,
      toggleTurntable: s.toggleTurntable,
      openSpecimenModal: s.openSpecimenModal,
    }))
  );

  const finishConfig = COATING_FINISHES[selectedCoatingFinish] || COATING_FINISHES.CLEAR_GLOSS;
  const finishList = Object.values(COATING_FINISHES);

  const coverageAndCuringBadges = (
    <div className="flex items-center space-x-2 font-mono text-xs">
      <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
        <span className="text-slate-400">Độ phủ:</span>
        <b className={coatingCoverage >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
          {coatingCoverage.toFixed(0)}%
        </b>
      </div>
      <div className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 flex items-center space-x-1.5">
        <span className="text-slate-400">Độ khô:</span>
        <b className={curingProgress >= 100 ? 'text-purple-400' : 'text-slate-300'}>
          {curingProgress.toFixed(0)}%
        </b>
      </div>
    </div>
  );

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label="Bảng điều khiển phủ sơn tĩnh điện và sấy UV"
      className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
    >
      <MachineStatusBar
        stationId="COATING_STATION"
        title="BUỒNG PHỦ SƠN TĨNH ĐIỆN & SẤY QUANG HÓA UV"
        badgeText="ELECTROSTATIC COATING & UV (395nm)"
        badgeClassName="bg-cyan-950/80 text-cyan-300 border-cyan-800"
        accentColor="#22d3ee"
        offlineWarningText="BUỒNG PHỦ SƠN ĐANG TẮT NGUỒN. Hãy bật công tắc nguồn để vận hành quạt hút, vòi phun & sấy UV."
        extraStatusContent={coverageAndCuringBadges}
        onExit={onExit}
      />

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
        {[
          { step: 1, title: '1. Chọn Lớp Sơn', desc: finishConfig.name.split(' (')[0] },
          { step: 2, title: '2. Phun Sơn Phủ', desc: `${coatingCoverage.toFixed(0)}% màng sơn` },
          { step: 3, title: '3. Sấy Khô UV', desc: `${curingProgress.toFixed(0)}% đóng rắn` },
          {
            step: 4,
            title: '4. Bàn Xoay 360°',
            desc: isTurntableRotating ? 'Đang xoay' : 'Hoàn thiện',
          },
        ].map((s) => {
          const isActive = coatingStep === s.step;
          const isPast =
            coatingStep > s.step ||
            (s.step === 2 && coatingCoverage >= 100) ||
            (s.step === 3 && curingProgress >= 100);
          return (
            <button
              key={s.step}
              onClick={() => setCoatingStep(s.step as 1 | 2 | 3 | 4)}
              className={`flex flex-col text-left p-1.5 md:p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-400/60 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : isPast
                  ? 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-transparent border border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold">
                {isPast ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.step}
                  </span>
                )}
                <span className="truncate">{s.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono truncate hidden sm:inline pl-5">
                {s.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: SELECT COATING FINISH */}
      {coatingStep === 1 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
            <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
            <span>
              Bước 1/4: Chọn loại sơn hoặc màng phủ bảo vệ phù hợp với yêu cầu cơ tính và thẩm mỹ
              của chi tiết.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {finishList.map((finish) => {
              const isSelected = selectedCoatingFinish === finish.id;
              return (
                <button
                  key={finish.id}
                  onClick={() => setSelectedCoatingFinish(finish.id)}
                  className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: finish.color }}
                    />
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {finish.glossUnit.split(' ')[0]}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate text-left">
                    {finish.name.split(' (')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 text-left">
                    {finish.dryFilmThickness}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>
                <b>Đặc tính kỹ thuật:</b> {finishConfig.description}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px] flex-shrink-0">
              <span>
                Màng khô: <b className="text-white">{finishConfig.dryFilmThickness}</b>
              </span>
              <span>•</span>
              <span>
                Độ bóng: <b className="text-white">{finishConfig.glossUnit}</b>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => setCoatingStep(2)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <span>Tiếp tục: Phun Sơn Tĩnh Điện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ELECTROSTATIC SPRAY COATING */}
      {coatingStep === 2 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
            <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
            <span>
              Bước 2/4: Nhấp giữ nút xịt sơn để đầu béc tích điện áp âm hút đều hạt sơn bao bọc bề
              mặt phôi.
            </span>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Tiến trình phủ sơn:</span>
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  coatingCoverage >= 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {coatingCoverage.toFixed(0)}% {coatingCoverage >= 100 ? '(Đã phủ kín)' : ''}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ease-linear ${
                  coatingCoverage >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${coatingCoverage}%` }}
              />
            </div>

            <button
              onMouseDown={startSpraying}
              onMouseUp={stopSpraying}
              onMouseLeave={stopSpraying}
              onTouchStart={startSpraying}
              onTouchEnd={stopSpraying}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all duration-150 border shadow-lg select-none active:scale-95 mt-1 ${
                isSpraying
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 border-cyan-300 shadow-cyan-900/50 animate-pulse'
                  : coatingCoverage >= 100
                  ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                  : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white border-cyan-400 shadow-cyan-950/50'
              }`}
              title="Nhấp giữ chuột để phun lớp sơn lên bề mặt chi tiết"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                {isSpraying
                  ? `Đang Phun Sơn... (${coatingCoverage.toFixed(0)}%)`
                  : coatingCoverage >= 100
                  ? '✓ Đã Phủ Kín 100% (Nhấp giữ để dặm thêm)'
                  : 'Giữ Chuột Để Phun Sơn [🔫]'}
              </span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Điện áp súng phun: V = -45.00 kV (Coulomb Wrap-Around)</span>
            <span>Tỷ lệ bám dính: η ≥ 85.00% (17/20)</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setCoatingStep(1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Chọn Sơn</span>
            </button>

            <button
              onClick={() => setCoatingStep(3)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <span>Tiếp tục: Sấy Khô UV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: UV PHOTO-POLYMERIZATION CURING */}
      {coatingStep === 3 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-center space-x-2">
            <span className="font-bold text-purple-400">💡 Hướng dẫn:</span>
            <span>
              Bước 3/4: Bật dàn đèn cực tím UV 395nm để quang hóa đóng rắn màng sơn tức thì mà không
              làm nóng biến dạng phôi.
            </span>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Tiến trình đóng rắn quang hóa (UV):</span>
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  curingProgress >= 100 ? 'text-purple-400' : 'text-slate-300'
                }`}
              >
                {curingProgress.toFixed(0)}% {curingProgress >= 100 ? '(Đóng rắn 100%)' : ''}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-100 ease-linear"
                style={{ width: `${curingProgress}%` }}
              />
            </div>

            <button
              onClick={() => (isCuring ? stopCuring() : startCuring())}
              disabled={coatingCoverage < 10}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 border shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-1 ${
                isCuring
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-950/60 animate-pulse'
                  : curingProgress >= 100
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-300 hover:border-purple-500/50'
              }`}
              title="Bật dàn đèn sấy tia cực tím UV 395nm để đóng rắn màng sơn"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>
                {isCuring
                  ? `Đang Sấy UV (${curingProgress.toFixed(0)}%)...`
                  : curingProgress >= 100
                  ? '✓ Đã Đóng Rắn 100% (Bấm để sấy lại)'
                  : 'Bật Đèn Sấy UV 395nm'}
              </span>
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Photon tử ngoại: λ = 395.00 nm (hν = 3.139 eV)</span>
            <span>Thời gian đóng rắn: t_curing = 3.50 s</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setCoatingStep(2)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Phun Sơn</span>
            </button>

            <button
              onClick={() => setCoatingStep(4)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
            >
              <span>Tiếp tục: Bàn Xoay & Hoàn Thiện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TURNTABLE & INSPECTION */}
      {coatingStep === 4 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
            <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
            <span>
              Bước 4/4: Bật bàn xoay để ngắm độ bóng phản chiếu từ mọi góc độ, hoặc nhấc phôi ra xem
              cận cảnh cầm tay.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={toggleTurntable}
              className={`py-3 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all active:scale-95 ${
                isTurntableRotating
                  ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Bật / tắt quay bàn xoay 360 độ"
            >
              <RotateCcw className={`w-4 h-4 ${isTurntableRotating ? 'animate-spin' : ''}`} />
              <span>{isTurntableRotating ? 'Dừng Bàn Xoay' : 'Bật Bàn Xoay 360°'}</span>
            </button>

            <button
              onClick={openSpecimenModal}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-2 transition-all active:scale-95"
              title="Nhấc phôi ra khỏi bàn gá để soi cận cảnh cầm tay [Phím G]"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Soi Cận Cảnh [G]</span>
            </button>

            <button
              onClick={resetCoating}
              className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-xs font-semibold border border-slate-700 hover:border-rose-700 flex items-center justify-center space-x-2 transition-all active:scale-95"
              title="Tẩy sạch lớp sơn, đưa phôi trở về ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tẩy Sơn Làm Lại</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-200">
                Màng sơn <b>{finishConfig.name.split(' (')[0]}</b> đã đạt độ phủ{' '}
                <b>{coatingCoverage.toFixed(0)}%</b>
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
              <span>
                Độ dày: <b className="text-cyan-300">{finishConfig.dryFilmThickness}</b>
              </span>
              <span>•</span>
              <span>
                {curingProgress >= 100 ? (
                  <b className="text-emerald-400">✓ Đã đóng rắn 100%</b>
                ) : (
                  <b className="text-amber-400">Chưa đóng rắn</b>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-start pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setCoatingStep(3)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Sấy UV</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
