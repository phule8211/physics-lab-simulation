import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ArrowRight, Flame, Layers, Scissors, Sparkles } from 'lucide-react';
import { useLabStore } from '../../../store/useLabStore';
import { MATERIALS_CATALOG, MaterialType } from '../../../data/materialsConfig';
import { useMaterialInteraction } from './hooks/useMachineTelemetry';

const MATERIALS_LIST: MaterialType[] = [
  'WOOD',
  'ACRYLIC',
  'STEEL',
  'ALUMINUM',
  'SILICON',
  'GLASS',
];

interface MaterialAndLensSelectorProps {
  stationId: string;
  variant: 'guided' | 'pro';
  onNext?: () => void;
}

/**
 * Material specimen selector & CUT/ENGRAVE process mode switcher with optical interaction readout.
 * Subscribes only to material and process-mode slice keys so slider dragging never re-renders it.
 */
export const MaterialAndLensSelector: React.FC<MaterialAndLensSelectorProps> = ({
  stationId,
  variant,
  onNext,
}) => {
  const { setSelectedMaterial, setProcessMode } = useLabStore(
    useShallow((s) => ({
      setSelectedMaterial: s.setSelectedMaterial,
      setProcessMode: s.setProcessMode,
    }))
  );
  const { selectedMaterial, processMode, interaction } = useMaterialInteraction(stationId);

  if (variant === 'pro') {
    return (
      <div className="md:col-span-6 flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-thin">
        {MATERIALS_LIST.map((mType) => {
          const mat = MATERIALS_CATALOG[mType];
          const isSelected = selectedMaterial === mType;
          return (
            <button
              key={mType}
              onClick={() => setSelectedMaterial(mType)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 border transition-all ${
                isSelected
                  ? 'bg-lab-cyan/20 border-lab-cyan text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: mat?.color || '#cbd5e1' }}
              />
              <span>{mat?.name ? mat.name.split(' ')[0] : mType}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
      <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
        <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
        <span>
          Bước 1/4: Chọn vật liệu cần gia công và chế độ: <b>Cắt đứt phôi</b> (3mm) hoặc{' '}
          <b>Khắc bề mặt</b> (0.1mm) theo nhu cầu.
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Bước 1: Chọn Chế Độ Gia Công & Phôi Vật Liệu
          </span>
        </div>

        {/* Cut vs Engrave Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800">
          <button
            onClick={() => setProcessMode('CUT')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              processMode === 'CUT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Cắt Xuyên (3mm)</span>
          </button>
          <button
            onClick={() => setProcessMode('ENGRAVE')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              processMode === 'ENGRAVE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Khắc Mặt (0.1mm)</span>
          </button>
        </div>
      </div>

      {/* Material Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {MATERIALS_LIST.map((mType) => {
          const mat = MATERIALS_CATALOG[mType];
          const matInter = mat?.interactions?.[stationId];
          const isSelected = selectedMaterial === mType;

          return (
            <button
              key={mType}
              onClick={() => setSelectedMaterial(mType)}
              className={`p-2 rounded-xl text-left border flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: mat?.color || '#cbd5e1' }}
                />
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: matInter?.badgeColor || '#10b981' }}
                  title={matInter?.statusText}
                />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 truncate">{mat?.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {matInter?.statusText || 'Khả dụng'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Optical & Physical Interaction Description Banner */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <b>Tương tác quang học:</b> {interaction.effectDescription}
          </span>
        </div>
        <span
          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded border flex-shrink-0"
          style={{
            color: interaction?.badgeColor || '#10b981',
            borderColor: (interaction?.badgeColor || '#10b981') + '40',
            backgroundColor: (interaction?.badgeColor || '#10b981') + '15',
          }}
        >
          {interaction?.statusText || 'KHẢ DỤNG'}
        </span>
      </div>

      {onNext && (
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-cyan-950/40 active:scale-95"
          >
            <span>Tiếp tục: Bản Vẽ & Canh Phôi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
