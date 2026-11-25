import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Check,
  Droplets,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useLabStore } from '../../../store/useLabStore';
import { MachineStatusBar } from './MachineStatusBar';

interface SensorStationPanelProps {
  onExit: () => void;
}

/**
 * Safety telemetry & fault injection step-by-step control dock for SENSOR_STATION.
 */
export const SensorStationPanel: React.FC<SensorStationPanelProps> = ({ onExit }) => {
  const [sensorStep, setSensorStep] = React.useState<1 | 2 | 3>(1);

  const {
    chillerFlowRate,
    sampleTemperature,
    smokeDensity,
    isAlarmBuzzerActive,
    setChillerFlowRate,
    setSampleTemperature,
    setSmokeDensity,
    triggerEmergencyStop,
    resetSensors,
  } = useLabStore(
    useShallow((s) => ({
      chillerFlowRate: s.chillerFlowRate,
      sampleTemperature: s.sampleTemperature,
      smokeDensity: s.smokeDensity,
      isAlarmBuzzerActive: s.isAlarmBuzzerActive,
      setChillerFlowRate: s.setChillerFlowRate,
      setSampleTemperature: s.setSampleTemperature,
      setSmokeDensity: s.setSmokeDensity,
      triggerEmergencyStop: s.triggerEmergencyStop,
      resetSensors: s.resetSensors,
    }))
  );

  const isFlowTripped = chillerFlowRate < 2.0;
  const isTempTripped = sampleTemperature > 95;
  const isSmokeTripped = smokeDensity > 60;
  const hasAnyFault = isFlowTripped || isTempTripped || isSmokeTripped || isAlarmBuzzerActive;

  return (
    <section
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label="Bảng giả lập sự cố cảm biến và ngắt khẩn cấp"
      className="glass-panel w-full max-w-4xl rounded-2xl border border-slate-700/80 shadow-2xl p-3 md:p-4 pointer-events-auto text-slate-100 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/85"
    >
      <MachineStatusBar
        stationId="SENSOR_STATION"
        title="TRẠM CẢM BIẾN & KHÓA LIÊN ĐỘNG AN TOÀN"
        badgeText="SAFETY TELEMETRY & INTERLOCK"
        accentColor="#34d399"
        offlineWarningText="TRẠM CẢM BIẾN ĐANG TẮT NGUỒN. Hãy bật công tắc nguồn để kích hoạt telemetry và interlock."
        onExit={onExit}
      />

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
        {[
          {
            step: 1,
            title: '1. Định Mức An Toàn',
            desc: hasAnyFault ? '⚠️ Có sự cố' : '✓ Định mức chuẩn',
          },
          { step: 2, title: '2. Giả Lập Sự Cố', desc: 'Thử nghiệm Interlock' },
          { step: 3, title: '3. Dừng E-STOP & Reset', desc: 'Quy trình phục hồi' },
        ].map((s) => {
          const isActive = sensorStep === s.step;
          const isPast = sensorStep > s.step;
          return (
            <button
              key={s.step}
              onClick={() => setSensorStep(s.step as 1 | 2 | 3)}
              className={`flex flex-col text-left p-1.5 md:p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-400/60 text-emerald-200 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
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
                      isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
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

      {/* STEP 1: NORMAL TELEMETRY MONITORING */}
      {sensorStep === 1 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 flex items-center space-x-2">
            <span className="font-bold text-emerald-400">💡 Hướng dẫn:</span>
            <span>
              Bước 1/3: Giám sát 3 thông số định mức của cảm biến phần cứng để bảo đảm điều kiện vận
              hành an toàn.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SensorGaugeCard
              icon={<Droplets className="w-4 h-4 text-cyan-400" />}
              label="Lưu lượng Chiller (Q):"
              valueText={`${chillerFlowRate.toFixed(1)} L/min`}
              percent={Math.min(100, (chillerFlowRate / 6.0) * 100)}
              thresholdText="Định mức: ≥ 2.0 L/min"
              statusText={isFlowTripped ? '⚠️ Tụt áp' : '✓ An toàn'}
              isTripped={isFlowTripped}
              normalValueColor="text-cyan-300"
              normalBarColor="bg-cyan-400"
            />
            <SensorGaugeCard
              icon={<Thermometer className="w-4 h-4 text-amber-400" />}
              label="Nhiệt độ phôi cắt (T):"
              valueText={`${sampleTemperature.toFixed(0)} °C`}
              percent={Math.min(100, (sampleTemperature / 140) * 100)}
              thresholdText="Định mức: ≤ 95 °C"
              statusText={isTempTripped ? '⚠️ Quá nhiệt' : '✓ An toàn'}
              isTripped={isTempTripped}
              normalValueColor="text-amber-300"
              normalBarColor="bg-amber-400"
            />
            <SensorGaugeCard
              icon={<Wind className="w-4 h-4 text-purple-400" />}
              label="Mật độ khói Tyndall (D):"
              valueText={`${smokeDensity.toFixed(0)} ppm`}
              percent={Math.min(100, (smokeDensity / 100) * 100)}
              thresholdText="Định mức: ≤ 60 ppm"
              statusText={isSmokeTripped ? '⚠️ Nghẹt khói' : '✓ Thông thoáng'}
              isTripped={isSmokeTripped}
              normalValueColor="text-purple-300"
              normalBarColor="bg-purple-400"
            />
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              hasAnyFault
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 animate-pulse'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {hasAnyFault ? (
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span>
                {hasAnyFault
                  ? 'CẢNH BÁO: Phát hiện sự cố vượt ngưỡng định mức! Interlock đã ngắt tia laser.'
                  : 'HỆ THỐNG AN TOÀN: Tất cả cảm biến trong định mức · Khóa liên động Interlock sẵn sàng cấp điện.'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              onClick={() => setSensorStep(2)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-950/40 active:scale-95"
            >
              <span>Tiếp tục: Giả Lập Sự Cố</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: FAULT INJECTION SIMULATION */}
      {sensorStep === 2 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 flex items-center space-x-2">
            <span className="font-bold text-cyan-400">💡 Hướng dẫn:</span>
            <span>
              Bước 2/3: Thử kéo các thanh trượt bên dưới vượt ngưỡng để cố tình gây sự cố và quan
              sát phản ứng của rơ-le ngắt an toàn Interlock.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SensorFaultSlider
              icon={<Droplets className="w-3.5 h-3.5 text-cyan-400" />}
              label="Lưu lượng nước Chiller:"
              valueText={`${chillerFlowRate.toFixed(1)} L/min`}
              min={0.5}
              max={6.0}
              step={0.1}
              value={chillerFlowRate}
              onChange={setChillerFlowRate}
              isTripped={isFlowTripped}
              normalValueColor="text-cyan-300"
              accentClass="accent-cyan-400"
              hintText={
                isFlowTripped
                  ? '⚠️ Dưới 2.0 L/min: Nguy cơ nổ bóng laser!'
                  : '✓ Ngưỡng an toàn ≥ 2.0 L/min'
              }
            />
            <SensorFaultSlider
              icon={<Thermometer className="w-3.5 h-3.5 text-amber-400" />}
              label="Nhiệt độ phôi cắt:"
              valueText={`${sampleTemperature.toFixed(0)} °C`}
              min={20}
              max={140}
              step={1}
              value={sampleTemperature}
              onChange={setSampleTemperature}
              isTripped={isTempTripped}
              normalValueColor="text-amber-300"
              accentClass="accent-amber-400"
              hintText={
                isTempTripped ? '⚠️ Trên 95°C: Nguy cơ bốc cháy!' : '✓ Ngưỡng an toàn ≤ 95°C'
              }
            />
            <SensorFaultSlider
              icon={<Wind className="w-3.5 h-3.5 text-purple-400" />}
              label="Mật độ khói (Tyndall):"
              valueText={`${smokeDensity.toFixed(0)} ppm`}
              min={0}
              max={100}
              step={1}
              value={smokeDensity}
              onChange={setSmokeDensity}
              isTripped={isSmokeTripped}
              normalValueColor="text-purple-300"
              accentClass="accent-purple-400"
              hintText={
                isSmokeTripped
                  ? '⚠️ Trên 60 ppm: Buồng quá nhiều khói!'
                  : '✓ Quạt hút hoạt động tốt'
              }
            />
          </div>

          {hasAnyFault && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/70 text-rose-300 text-xs flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  <b>SỰ CỐ ĐÃ KÍCH HOẠT:</b> Còi báo động hú vang và rơ-le an toàn ngắt trực tiếp
                  nguồn cao áp phát laser trong 20ms!
                </span>
              </div>
              <button
                onClick={resetSensors}
                className="underline font-bold text-white hover:text-cyan-300 flex-shrink-0 cursor-pointer"
              >
                Reset Nhanh
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setSensorStep(1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Giám Sát</span>
            </button>

            <button
              onClick={() => setSensorStep(3)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-950/40 active:scale-95"
            >
              <span>Tiếp tục: Dừng E-STOP & Reset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EMERGENCY STOP & RECOVERY */}
      {sensorStep === 3 && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3">
          <div className="p-2 px-3 rounded-lg bg-rose-950/30 border border-rose-800/40 text-xs text-rose-200 flex items-center space-x-2">
            <span className="font-bold text-rose-400">💡 Hướng dẫn:</span>
            <span>
              Bước 3/3: Thao tác nút Dừng Khẩn Cấp E-STOP khi có hỏa hoạn và thực hiện quy trình
              phục hồi hệ thống về trạng thái định mức.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={triggerEmergencyStop}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white font-bold text-xs flex items-center justify-center space-x-2 border border-rose-400 shadow-xl shadow-rose-950/60 active:scale-95 transition-all"
              title="Kích hoạt ngắt khẩn cấp E-STOP toàn bộ hệ thống xưởng"
            >
              <AlertOctagon className="w-5 h-5 text-white fill-rose-900 animate-pulse" />
              <span>NÚT DỪNG KHẨN CẤP (EMERGENCY STOP)</span>
            </button>

            <button
              onClick={resetSensors}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 border border-emerald-500/60 shadow-lg transition-all active:scale-95"
              title="Khôi phục trạng thái cảm biến về mức bình thường"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Reset Cảm Biến Về Định Mức</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Quy trình xử lý sự cố an toàn chuẩn ISO 11553-1:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 text-[11px] text-slate-300">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <b className="text-rose-400 block mb-0.5">1. Đập nút E-STOP</b>
                <span>Cắt đứt ngay lập tức đường cấp cao áp laser và khóa van khí hỗ trợ.</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <b className="text-amber-400 block mb-0.5">2. Kiểm tra hiện trường</b>
                <span>Chờ quạt hút thổi sạch khói, làm mát phôi và kiểm tra lưu thông đường nước.</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <b className="text-emerald-400 block mb-0.5">3. Reset & Tái cấp nguồn</b>
                <span>Bấm nút Reset cảm biến và xoay nhả nút E-STOP để sẵn sàng vận hành tiếp.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setSensorStep(2)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại: Giả Lập Sự Cố</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

interface SensorGaugeCardProps {
  icon: React.ReactNode;
  label: string;
  valueText: string;
  percent: number;
  thresholdText: string;
  statusText: string;
  isTripped: boolean;
  normalValueColor: string;
  normalBarColor: string;
}

const SensorGaugeCard: React.FC<SensorGaugeCardProps> = ({
  icon,
  label,
  valueText,
  percent,
  thresholdText,
  statusText,
  isTripped,
  normalValueColor,
  normalBarColor,
}) => (
  <div
    className={`p-3 rounded-xl border flex flex-col justify-between ${
      isTripped ? 'bg-rose-950/40 border-rose-600/80' : 'bg-slate-950/80 border-slate-800'
    }`}
  >
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
        {icon}
        <span>{label}</span>
      </span>
      <span className={`font-mono font-bold text-sm ${isTripped ? 'text-rose-400' : normalValueColor}`}>
        {valueText}
      </span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-1.5 my-2">
      <div
        className={`h-full rounded-full transition-all ${isTripped ? 'bg-rose-500' : normalBarColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
    <span className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
      <span>{thresholdText}</span>
      <b className={isTripped ? 'text-rose-400' : 'text-emerald-400'}>{statusText}</b>
    </span>
  </div>
);

interface SensorFaultSliderProps {
  icon: React.ReactNode;
  label: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  isTripped: boolean;
  normalValueColor: string;
  accentClass: string;
  hintText: string;
}

const SensorFaultSlider: React.FC<SensorFaultSliderProps> = ({
  icon,
  label,
  valueText,
  min,
  max,
  step,
  value,
  onChange,
  isTripped,
  normalValueColor,
  accentClass,
  hintText,
}) => (
  <div
    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
      isTripped ? 'bg-rose-950/40 border-rose-600/80' : 'bg-slate-900/60 border-slate-800'
    }`}
  >
    <div className="flex items-center justify-between text-xs mb-1.5">
      <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
        {icon}
        <span>{label}</span>
      </span>
      <span className={`font-mono font-bold ${isTripped ? 'text-rose-400' : normalValueColor}`}>
        {valueText}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full ${accentClass} cursor-pointer h-1.5 bg-slate-800 rounded-lg`}
    />
    <span className="text-[10px] mt-1.5 font-mono text-slate-400">{hintText}</span>
  </div>
);
