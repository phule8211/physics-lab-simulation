import React from 'react';
import { useLabStore } from '../../store/useLabStore';
import { X, TestTubes, Pipette, FlaskConical, Check, Plus, PackageCheck } from 'lucide-react';

export function LabEquipmentRackModal() {
  const {
    isEquipmentModalOpen,
    closeEquipmentModal,
    collectedEquipment,
    takeEquipmentItem,
  } = useLabStore();

  if (!isEquipmentModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-lab-cyan/20 border border-lab-cyan/40 flex items-center justify-center text-lab-cyan">
              <TestTubes className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                GIÁ ĐỠ DỤNG CỤ THÍ NGHIỆM TIÊU CHUẨN
              </h2>
              <p className="text-xs text-slate-400">
                Lấy cốc thí nghiệm to, tuýp thí nghiệm nhỏ và ống hút dung dịch vào bàn làm việc
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              closeEquipmentModal();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Equipment Items Grid */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* ITEM 1: CỐC THÍ NGHIỆM TO (LARGE GLASS BEAKER) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-lab-cyan/40 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">
                    Cốc Thí Nghiệm To (Large Glass Beaker 500mL)
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-400/30">
                    Borosilicate 3.3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cốc thủy tinh chịu nhiệt và kháng hóa chất axit mạnh. Có mỏ rót chính xác và vạch chia thể tích tới 500mL, chuyên dùng để pha trộn dung dịch ăn mòn và chuẩn bị wafer.
                </p>
                <div className="text-[11px] font-mono text-cyan-400 mt-1">
                  Đã trang bị: <span className="font-bold">{collectedEquipment.beakers} chiếc</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => takeEquipmentItem('BEAKER')}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap self-end sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Lấy Thêm Cốc To</span>
            </button>
          </div>

          {/* ITEM 2: TUÝP THÍ NGHIỆM NHỎ (SMALL TEST TUBES) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <TestTubes className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">
                    Tuýp Thí Nghiệm Nhỏ (Small Glass Test Tubes)
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-400/30">
                    Ø12 x 100mm
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ống nghiệm đáy tròn bằng thủy tinh trong suốt, thích hợp cho việc lấy mẫu vi lượng, kiểm tra phổ màu phản ứng và kiểm nghiệm nồng độ axit trước khi đưa vào dây chuyền.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">
                  Đã trang bị: <span className="font-bold">{collectedEquipment.testTubes} ống</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => takeEquipmentItem('TEST_TUBE')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap self-end sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Lấy Tuýp Nhỏ</span>
            </button>
          </div>

          {/* ITEM 3: ỐNG HÚT DUNG DỊCH (MICROPIPETTE & PIPET PASTEUR) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Pipette className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">
                    Ống Hút Dung Dịch (Micropipette Định Lượng 100-1000 µL)
                  </h3>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-400/30">
                    Độ chính xác cao
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ống hút micropipette piston hành trình kép kèm đầu tip vô trùng. Dùng để hút chính xác từng micro-lít dung dịch chất ăn mòn, chất trợ tán sắc hoặc photoresist lên wafer bán dẫn.
                </p>
                <div className="text-[11px] font-mono text-amber-400 mt-1">
                  Đã trang bị: <span className="font-bold">{collectedEquipment.pipettes} ống</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => takeEquipmentItem('PIPETTE')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap self-end sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Lấy Ống Hút</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              takeEquipmentItem('BEAKER');
              takeEquipmentItem('TEST_TUBE');
              takeEquipmentItem('PIPETTE');
            }}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center space-x-2"
            title="Lấy nhanh 1 Cốc to, 1 Tuýp nhỏ và 1 Micropipette"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Lấy Trọn Bộ Dụng Cụ Cơ Bản (1 Cốc + 1 Tuýp + 1 Ống Hút)</span>
          </button>

          <button
            onClick={() => {
              closeEquipmentModal();
              document.querySelector('canvas')?.requestPointerLock();
            }}
            className="px-6 py-2.5 rounded-2xl bg-lab-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-lab-cyan/30 flex items-center space-x-2"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Xác Nhận & Đóng Giá Dụng Cụ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
