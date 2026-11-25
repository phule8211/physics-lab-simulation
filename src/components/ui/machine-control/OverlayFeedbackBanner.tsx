import React, { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  AlertTriangle,
  CheckCircle2,
  MousePointerClick,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { useLabStore, ActionToast } from '../../../store/useLabStore';

/**
 * Isolated floating toast host shown when the machine dock is dismissed/hidden.
 */
export function FloatingToastOnly() {
  const { actionMessage, clearActionMessage } = useLabStore(
    useShallow((s) => ({
      actionMessage: s.actionMessage,
      clearActionMessage: s.clearActionMessage,
    }))
  );

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => {
      clearActionMessage();
    }, 4500);
    return () => clearTimeout(timer);
  }, [actionMessage, clearActionMessage]);

  if (!actionMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[92vw] sm:max-w-md w-full px-2">
      <ToastNotification message={actionMessage} onClose={clearActionMessage} />
    </div>
  );
}

/**
 * Top banners rendered above the active machine dock (action feedback toast & pointer-lock guide).
 * Subscribes independently to actionMessage, isPointerLocked, and isCuttingJob.
 */
export function OverlayFeedbackBanners() {
  const { actionMessage, clearActionMessage, isPointerLocked, isCuttingJob } = useLabStore(
    useShallow((s) => ({
      actionMessage: s.actionMessage,
      clearActionMessage: s.clearActionMessage,
      isPointerLocked: s.isPointerLocked,
      isCuttingJob: s.isCuttingJob,
    }))
  );

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => {
      clearActionMessage();
    }, 4500);
    return () => clearTimeout(timer);
  }, [actionMessage, clearActionMessage]);

  return (
    <>
      {actionMessage && (
        <div className="mb-3 pointer-events-auto max-w-xl w-full">
          <ToastNotification message={actionMessage} onClose={clearActionMessage} />
        </div>
      )}
      <CursorGuideBanner isPointerLocked={isPointerLocked} isCuttingJob={isCuttingJob} />
    </>
  );
}

function CursorGuideBanner({
  isPointerLocked,
  isCuttingJob = false,
}: {
  isPointerLocked: boolean;
  isCuttingJob?: boolean;
}) {
  const [isDismissed, setIsDismissed] = React.useState(false);
  if (isPointerLocked || isCuttingJob || isDismissed) return null;

  const handleLockCursor = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.requestPointerLock();
    }
  };

  return (
    <div
      onClick={handleLockCursor}
      className="w-full max-w-4xl mb-2 px-3.5 py-2 rounded-xl bg-slate-950/95 border border-cyan-500/50 backdrop-blur-xl shadow-xl shadow-cyan-950/40 flex items-center justify-between pointer-events-auto cursor-pointer hover:bg-slate-900/95 hover:border-cyan-400 transition-all group"
      title="Nhấp vào đây, ấn W/A/S/D hoặc ESC để tự động ẩn con trỏ chuột và tiếp tục điều khiển"
    >
      <div className="flex items-center space-x-2.5 text-xs text-white">
        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 flex-shrink-0">
          <MousePointerClick className="w-3.5 h-3.5 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-cyan-300">Đã tự động hiện con trỏ chuột khi vào máy</span>
            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Không cần ấn ESC
            </span>
          </div>
          <p className="text-slate-300 text-[11px] mt-0.5">
            Khi dừng dùng máy: ấn phím <b className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">W, A, S, D</b> hoặc{' '}
            <b className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">ESC</b> hoặc{' '}
            <b className="text-amber-300 underline font-semibold">Click</b> để tự động ẩn con trỏ chuột di chuyển.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/90 group-hover:bg-cyan-500 group-hover:text-slate-950 px-3 py-1.5 rounded-lg border border-cyan-700 transition-all flex-shrink-0">
          <span className="hidden sm:inline">Ẩn con trỏ chuột</span>
          <span className="font-mono text-xs font-bold">[ESC / WASD] ↵</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Tắt thanh nhắc nhở này"
          aria-label="Tắt nhắc nhở"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ToastNotification({
  message,
  onClose,
}: {
  message: Pick<ActionToast, 'text' | 'type'>;
  onClose: () => void;
}) {
  const styles = {
    info: 'bg-cyan-950/95 border-cyan-500/70 text-cyan-200 shadow-cyan-950/50',
    warning: 'bg-amber-950/95 border-amber-500/70 text-amber-200 shadow-amber-950/50',
    error: 'bg-rose-950/95 border-rose-500/70 text-rose-200 shadow-rose-950/50 animate-shake',
    success: 'bg-emerald-950/95 border-emerald-500/70 text-emerald-200 shadow-emerald-950/50',
  };

  const icons = {
    info: <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
    error: <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`p-2.5 sm:p-3.5 rounded-2xl border shadow-2xl flex items-start justify-between gap-2.5 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200 ${styles[message.type]}`}
    >
      <div className="flex items-start space-x-2 sm:space-x-2.5">
        {icons[message.type]}
        <p className="text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed">{message.text}</p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Đóng thông báo"
      >
        ✕
      </button>
    </div>
  );
}
