import React from 'react';
import { useLabStore, HeldItemType } from '../../store/useLabStore';
import {
  Hand,
  Cog,
  FlaskConical,
  TestTube,
  Pipette,
  Ruler,
} from 'lucide-react';

interface HotbarItem {
  type: HeldItemType;
  label: string;
  sublabel: string;
  key: string;
  icon: React.ReactNode;
}

const HOTBAR_ITEMS: HotbarItem[] = [
  {
    type: 'NONE',
    label: 'Tay không',
    sublabel: 'Thư giãn',
    key: '0',
    icon: <Hand className="w-4 h-4" />,
  },
  {
    type: 'WORKPIECE',
    label: 'Mẫu phôi laser',
    sublabel: 'Bánh răng',
    key: '1',
    icon: <Cog className="w-4 h-4" />,
  },
  {
    type: 'BEAKER',
    label: 'Cốc đong',
    sublabel: '250ml',
    key: '2',
    icon: <FlaskConical className="w-4 h-4" />,
  },
  {
    type: 'TEST_TUBE',
    label: 'Ống nghiệm',
    sublabel: 'Quang phổ',
    key: '3',
    icon: <TestTube className="w-4 h-4" />,
  },
  {
    type: 'PIPETTE',
    label: 'Ống hút',
    sublabel: 'Vi tích phân',
    key: '4',
    icon: <Pipette className="w-4 h-4" />,
  },
  {
    type: 'CALIPER',
    label: 'Thước kẹp',
    sublabel: 'Điện tử',
    key: '5',
    icon: <Ruler className="w-4 h-4" />,
  },
];

export function CatHandsHotbar() {
  const { mode, heldItem, setHeldItem } = useLabStore();

  // Only display while exploring in first-person walking mode
  if (mode !== 'WALKING') return null;

  return (
    <div className="fixed bottom-24 right-6 z-30 pointer-events-auto select-none transition-all duration-300">
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-1.5 shadow-2xl flex items-center space-x-1.5">
        <div className="px-2 py-1 text-[11px] font-bold text-orange-400 border-r border-slate-800 flex items-center space-x-1">
          <span>🐾 Tay mèo:</span>
        </div>

        {HOTBAR_ITEMS.map((item) => {
          const isActive = heldItem === item.type;
          return (
            <button
              key={item.type}
              onClick={() => setHeldItem(item.type)}
              title={`${item.label} [Phím ${item.key}]`}
              className={`group relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-xs font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-500/60 text-orange-200 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.icon}
              </div>
              <span className="hidden md:inline font-semibold">{item.label}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  isActive
                    ? 'bg-orange-500/30 text-orange-300'
                    : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
                }`}
              >
                {item.key}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
