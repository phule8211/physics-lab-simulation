import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { STATIONS } from '../../data/labConfig';
import { MATERIALS_CATALOG } from '../../data/materialsConfig';
import {
  getRecommendedParameters,
  simulateLaserPhysics,
  MACHINE_OPTICAL_SPECS,
  MATERIAL_PHYSICAL_SPECS,
} from '../../utils/laserPhysicsEngine';
import {
  X,
  BookOpen,
  Zap,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  Thermometer,
  Sliders,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function ScientificRationaleModal() {
  const {
    isRationaleModalOpen,
    setRationaleModalOpen,
    activeStationId,
    selectedMaterial,
    processMode,
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    applyRecommendedParameters,
  } = useLabStore();

  if (!isRationaleModalOpen) return null;

  const machineId = activeStationId || 'CO2_LASER';
  const station = STATIONS[machineId] || STATIONS.CO2_LASER;
  const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;
  const matPhysics = MATERIAL_PHYSICAL_SPECS[selectedMaterial] || MATERIAL_PHYSICAL_SPECS.WOOD;
  const machineOptical = MACHINE_OPTICAL_SPECS[machineId] || MACHINE_OPTICAL_SPECS.CO2_LASER;

  const rec = getRecommendedParameters(machineId, selectedMaterial, processMode);
  const currentSim = simulateLaserPhysics(
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
    machineId,
    selectedMaterial,
    processMode
  );
  const recSim = simulateLaserPhysics(
    rec.powerWatts,
    rec.speedMmS,
    rec.frequencyKhz,
    machineId,
    selectedMaterial,
    processMode
  );

  const absorptivityPercent = ((matPhysics.absorptivity[machineId] ?? 0.1) * 100).toFixed(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/95 overflow-hidden text-slate-100">
        {/* =====================================================================
            1. MODAL HEADER
           ===================================================================== */}
        <header className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  CƠ SỞ KHOA HỌC & LÝ DO CHỌN THÔNG SỐ CÔNG NGHỆ
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {rec.standardScenarioCode}
                </span>
              </div>
              <p className="text-xs text-lab-muted">
                Dựa trên mô hình Toán lý Quang - Nhiệt & Báo cáo kỹ thuật gia công thực nghiệm
              </p>
            </div>
          </div>

          <button
            onClick={() => setRationaleModalOpen(false)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
            aria-label="Đóng bảng cơ sở lý thuyết"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* =====================================================================
            2. MODAL BODY (SCROLLABLE)
           ===================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 text-xs text-slate-200">
          {/* Target Workpiece & Machine Overview Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Vật liệu đích:</span>
              <span className="font-bold text-sm text-cyan-300">{matConfig.name}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Chiều dày phôi tiêu chuẩn: <strong className="text-white">{matPhysics.plateThicknessMm} mm</strong>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Thiết bị nguồn phát:</span>
              <span className="font-bold text-sm text-amber-300">
                {station.name} ({station.wavelength})
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Vệt hội tụ 2w₀: <strong className="text-white">{(machineOptical.beamWaferRadiusW0Mm * 2).toFixed(3)} mm</strong>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Hệ số hấp thụ quang học A(λ):</span>
              <span className="font-bold text-sm text-emerald-300">{absorptivityPercent}%</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Chế độ: <strong className="text-white">{processMode === 'CUT' ? 'CẮT XUYÊN (Cut)' : 'KHẮC MẶT (Engrave)'}</strong>
              </span>
            </div>
          </div>

          {/* Scientific Rationale Detail Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-cyan-300 font-bold font-mono text-xs uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Phân Tích Lý Do Lựa Chọn Thông Số Khuyến Nghị</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {rec.scientificRationale}
            </p>
          </div>

          {/* Physics Mathematical Equations Box */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Hệ Phương Trình Toán Lý Quang - Nhiệt Áp Dụng</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-cyan-400 font-bold block">1. Độ sâu vết cắt d_cut (Cân bằng nhiệt động):</span>
                <div className="p-2 rounded bg-slate-950 text-amber-200 text-center text-xs">
                  d_cut = (A(λ) × P_avg) ÷ [ 2w₀ × v × ρ × (cp·ΔT + Lm + Lv) ]
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Quyết định độ sâu bóc tách vật liệu. Nếu P quá nhỏ hoặc v quá lớn, d_cut sẽ nhỏ hơn chiều dày phôi ({matPhysics.plateThicknessMm}mm) dẫn tới <strong>không đứt phôi</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold block">2. Tỷ lệ chồng lấp xung η_overlap (Độ mịn / Nhám):</span>
                <div className="p-2 rounded bg-slate-950 text-emerald-200 text-center text-xs">
                  η_overlap = [ 1 − (v ÷ (2w₀ × f)) ] × 100%
                </div>
                <p className="text-[10px] text-slate-400 font-sans">
                  Khi η_overlap &gt; 75%: nhiệt tích lũy làm mịn bóng mép cắt (flame-polishing / dark annealing). Khi &lt; 30%: các hố vi mô tách rời làm bề mặt sần sùi bavia.
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table: Current User Parameters vs Recommended Parameters */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-lab-cyan" />
              <span>Bảng Đối Chiếu: Thông Số Hiện Tại vs Thông Số Khuyến Nghị Chuẩn</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2.5">Chỉ số công nghệ</th>
                    <th className="py-2 px-2.5 text-amber-400">Bạn đang chỉnh</th>
                    <th className="py-2 px-2.5 text-cyan-400">Khuyến nghị chuẩn ({rec.standardScenarioCode})</th>
                    <th className="py-2 px-2.5">Đánh giá kỹ thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Công suất (P):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{laserPowerWatts} W</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{rec.powerWatts} W</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      {laserPowerWatts < rec.powerWatts * 0.7
                        ? '⚠️ Hơi thấp, có thể không đứt phôi'
                        : laserPowerWatts > rec.powerWatts * 1.4
                        ? '⚠️ Quá cao, dễ gây cháy đen mép cắt'
                        : '✓ Hợp lý'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Tốc độ quét (v):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{scanSpeedMmS} mm/s</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{rec.speedMmS} mm/s</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      {scanSpeedMmS > rec.speedMmS * 1.5
                        ? '⚠️ Quá nhanh, năng lượng không kịp truyền'
                        : scanSpeedMmS < rec.speedMmS * 0.6
                        ? '⚠️ Quá chậm, nhiệt tích tụ làm biến tính phôi'
                        : '✓ Hợp lý'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Tần số xung (f):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{pulseFrequencyKhz} kHz</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{rec.frequencyKhz} kHz</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      {pulseFrequencyKhz < 15
                        ? 'Xung tách rời, mép cắt sần sùi'
                        : 'Mép cắt liên tục mượt mà'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Năng lượng đường (E_line = P/v):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{currentSim.energyDensityJPerMm} J/mm</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{recSim.energyDensityJPerMm} J/mm</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      Mật độ năng lượng quyết định độ sâu & HAZ
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Độ sâu dự kiến (d_cut):</td>
                    <td className={`py-2 px-2.5 font-bold ${currentSim.isCutThrough ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentSim.actualDepthMm} mm ({currentSim.cutThroughPercentage}%)
                    </td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">
                      {recSim.actualDepthMm} mm ({recSim.cutThroughPercentage}%)
                    </td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      {currentSim.isCutThrough ? (
                        <span className="text-emerald-400 font-bold">✓ Cắt đứt 100% phôi</span>
                      ) : processMode === 'CUT' ? (
                        <span className="text-rose-400 font-bold">❌ CHƯA ĐỨT PHÔI</span>
                      ) : (
                        <span className="text-cyan-400">Khắc rãnh bề mặt</span>
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Độ nhám rãnh cắt (Ra):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{currentSim.surfaceRoughnessRaUm} µm</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{recSim.surfaceRoughnessRaUm} µm</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      {currentSim.surfaceRoughnessRaUm <= 0.5 ? 'Bóng gương / Cực mịn' : 'Nhẵn tiêu chuẩn'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-2.5 text-slate-300 font-sans">Độ rộng rãnh cắt (Kerf):</td>
                    <td className="py-2 px-2.5 font-bold text-amber-300">{currentSim.kerfWidthMm} mm</td>
                    <td className="py-2 px-2.5 font-bold text-cyan-300">{recSim.kerfWidthMm} mm</td>
                    <td className="py-2 px-2.5 text-slate-400 font-sans">
                      Sai số đường cắt gia công
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. MODAL FOOTER
           ===================================================================== */}
        <footer className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Thông số đã được hiệu chuẩn qua 6 kịch bản vật lý tiêu chuẩn (KB-01 đến KB-06).</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setRationaleModalOpen(false)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            >
              Đóng
            </button>

            <button
              onClick={() => {
                applyRecommendedParameters();
                setRationaleModalOpen(false);
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ÁP DỤNG THÔNG SỐ CHUẨN NGAY</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

