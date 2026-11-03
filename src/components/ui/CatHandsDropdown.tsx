import React, { useState, useRef, useEffect } from 'react';
import { useLabStore, HeldItemType } from '../../store/useLabStore';
import {
  Hand,
  Cog,
  FlaskConical,
  TestTube,
  Pipette,
  Ruler,
  ChevronDown,
} from 'lucide-react';

interface DropdownItem {
  type: HeldItemType;
  label: string;
  sublabel: string;
  key: string;
  icon: React.ReactNode;
}

const ITEMS: DropdownItem[] = [
  {
    type: 'NONE',
    label: 'Tay không',
    sublabel: 'Thư giãn',
    key: '0',
    icon: <Hand className="w-3.5 h-3.5" />,
  },
  {
    type: 'WORKPIECE',
    label: 'Mẫu phôi laser',
    sublabel: 'Bánh răng',
    key: '1',
    icon: <Cog className="w-3.5 h-3.5" />,
  },
  {
    type: 'BEAKER',
    label: 'Cốc đong',
    sublabel: '250ml',
    key: '2',
    icon: <FlaskConical className="w-3.5 h-3.5" />,
  },
  {
    type: 'TEST_TUBE',
    label: 'Ống nghiệm',
    sublabel: 'Quang phổ',
    key: '3',
    icon: <TestTube className="w-3.5 h-3.5" />,
  },
  {
    type: 'PIPETTE',
    label: 'Ống hút',
    sublabel: 'Vi tích phân',
    key: '4',
    icon: <Pipette className="w-3.5 h-3.5" />,
  },
  {
    type: 'CALIPER',
    label: 'Thước kẹp',
    sublabel: 'Điện tử',
    key: '5',
    icon: <Ruler className="w-3.5 h-3.5" />,
  },
];

export function CatHandsDropdown() {
  const { heldItem, setHeldItem, mode } = useLabStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Don't show in inspection mode
  if (mode !== 'WALKING') return null;

  const activeItem = ITEMS.find((i) => i.type === heldItem) || ITEMS[0];
  const isHolding = heldItem !== 'NONE';

  return (
    <div ref={menuRef} className="relative pointer-events-auto">
      {/* Trigger Button in Top Utility Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-pill px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition-all duration-200 ${
          isHolding
            ? 'text-orange-300 border-orange-500/60 bg-orange-500/10 hover:bg-orange-500/20 shadow-md shadow-orange-500/20'
            : 'text-slate-400 border-slate-700/80 hover:text-white hover:bg-slate-800/60'
        }`}
        title="Dụng cụ trên tay mèo cam (Phím 0-5 hoặc Q)"
        aria-label="Chọn dụng cụ cầm trên tay mèo"
      >
        <span className="text-sm">🐾</span>
        <span className="hidden sm:inline font-medium text-[11px] max-w-[85px] truncate">
          {activeItem.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Floating Below Button */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-950/95 border border-slate-700/90 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-orange-400 flex items-center space-x-1">
              <span>🐾</span>
              <span>Dụng cụ tay mèo</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">[Phím 0-5 / Q]</span>
          </div>

          <div className="flex flex-col space-y-0.5">
            {ITEMS.map((item) => {
              const isActive = heldItem === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    setHeldItem(item.type);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-all duration-150 text-xs ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-200 font-semibold border border-orange-500/50'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={isActive ? 'text-orange-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-500">{item.sublabel}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-orange-500/30 text-orange-300'
                        : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {item.key}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
