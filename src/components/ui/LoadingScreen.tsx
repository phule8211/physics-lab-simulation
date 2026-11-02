import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { Atom } from 'lucide-react';

export function LoadingScreen() {
  const { active, progress, item } = useProgress();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only display loading screen if assets are actively downloading
    if (active && progress < 100) {
      setVisible(true);
    } else {
      // Gracefully hide loading overlay
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  // Safety fallback: if user has waited > 1.5s, auto-dismiss so they are never blocked
  useEffect(() => {
    const forceDismissTimer = setTimeout(() => {
      setVisible(false);
    }, 1500);
    return () => clearTimeout(forceDismissTimer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-lab-dark transition-opacity duration-500">
      <div className="w-16 h-16 rounded-2xl bg-lab-cyan/10 border border-lab-cyan/30 flex items-center justify-center text-lab-cyan mb-6 animate-pulse shadow-xl shadow-lab-cyan/10">
        <Atom className="w-9 h-9 animate-spin" style={{ animationDuration: '6s' }} />
      </div>

      <h2 className="text-xl font-bold tracking-wider text-white mb-2">
        KHỞI TẠO XƯỞNG THÍ NGHIỆM 3D
      </h2>
      <p className="text-xs text-lab-muted font-mono mb-6 max-w-xs text-center">
        {item ? `Đang nạp: ${item}` : 'Đang nạp cấu trúc phòng xưởng & thiết bị quang học...'}
      </p>

      {/* Progress Bar */}
      <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/80">
        <div
          className="h-full bg-gradient-to-r from-lab-cyan to-lab-violet transition-all duration-300 ease-out"
          style={{ width: `${Math.max(15, Math.round(progress))}%` }}
        />
      </div>

      <span className="text-xs font-mono text-lab-cyan mt-3">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
