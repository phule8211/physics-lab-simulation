import type { StateCreator } from 'zustand';
import type { ChillerStatus, MachineId, ProcessedJobInfo } from '../../types/lab';
import type { LabState } from '../useLabStore';
import { STATIONS } from '../../data/labConfig';
import { MATERIALS_CATALOG } from '../../data/materialsConfig';
import {
  Point2D,
  PRESET_DESIGNS,
  autoFitToolpaths,
  computeBoundingBox,
  generateTextPaths,
} from '../../data/vectorDesigns';
import { sound } from '../../utils/audioSystem';
import { simulateLaserPhysics } from '../../utils/laserPhysicsEngine';
import {
  INITIAL_LASER_PARAMETERS,
  INITIAL_MACHINE_POWER,
  INITIAL_SENSOR_TELEMETRY,
  SENSOR_SAFETY_THRESHOLDS,
  createActionToast,
} from '../initialState';

/**
 * Store slice covering power breakers, laser hardware, CAD toolpaths,
 * alignment/framing, X-ray anatomy, operating parameters, chiller, and safety sensors.
 */
export interface MachineSlice {
  // Laser operational state & interlock
  isMachineRunning: boolean;
  isLidOpen: boolean;
  isCuttingJob: boolean;
  cutProgress: number; // 0 - 100
  interlockTriggered: boolean;
  toggleMachineRunning: () => void;
  toggleLid: () => void;
  setLidOpen: (open: boolean) => void;
  startCuttingJob: () => boolean;
  stopCuttingJob: () => void;
  setCutProgress: (progress: number) => void;

  // Custom Vector CAD Design & Toolpath State
  currentDesignId: string;
  currentDesignName: string;
  currentToolpaths: Point2D[][];
  selectPresetDesign: (designId: string) => void;
  setCustomToolpaths: (paths: Point2D[][], name?: string) => void;
  setCustomTextDesign: (text: string) => void;

  // Origin, Alignment & Frame Preview State
  isFraming: boolean;
  startFraming: () => void;
  stopFraming: () => void;
  autoFitCurrentDesign: () => void;
  scaleCurrentDesign: (factor: number) => void;
  nudgeCurrentDesign: (dx: number, dy: number) => void;

  // Industrial auxiliary chiller state
  chillerStatus: ChillerStatus;
  setChillerStatus: (status: ChillerStatus) => void;
  toggleChillerStatus: () => void;

  // Laser Process Technology Tuning Parameters (P, v, f)
  laserPowerWatts: number;
  scanSpeedMmS: number;
  pulseFrequencyKhz: number;
  setLaserPowerWatts: (p: number) => void;
  setScanSpeedMmS: (v: number) => void;
  setPulseFrequencyKhz: (f: number) => void;

  // Sensor Station Telemetry & Interactive Fault Injection
  sampleTemperature: number; // °C (Normal: 26.5, Trip: > 95)
  chillerFlowRate: number; // L/min (Normal: 4.8, Trip: < 2.0)
  smokeDensity: number; // ppm (Normal: 5, Trip: > 60)
  isAlarmBuzzerActive: boolean;
  setSampleTemperature: (temp: number) => void;
  setChillerFlowRate: (flow: number) => void;
  setSmokeDensity: (smoke: number) => void;
  triggerEmergencyStop: () => void;
  resetSensors: () => void;

  // Machine Anatomy X-Ray Mode & Bi-directional Component Highlighting
  isXRayMode: boolean;
  hoveredComponentId: string | null;
  setXRayMode: (enabled: boolean) => void;
  toggleXRayMode: () => void;
  setHoveredComponentId: (id: string | null) => void;

  // Machine Power Switch State for Floor 1 machines
  machinePower: Record<MachineId, boolean>;
  toggleMachinePower: (id: MachineId) => void;
  setMachinePower: (id: MachineId, on: boolean) => void;

  // Aptomat Circuit Breaker State (4 tube lights & 8 ceiling lamps)
  isAptomatOn: boolean;
  toggleAptomat: () => void;
  setAptomat: (on: boolean) => void;
  isCeilingLampsAptomatOn: boolean;
  toggleCeilingLampsAptomat: () => void;
  setCeilingLampsAptomat: (on: boolean) => void;
}

type SensorField = 'sampleTemperature' | 'chillerFlowRate' | 'smokeDensity';

export const createMachineSlice: StateCreator<LabState, [], [], MachineSlice> = (set, get) => {
  const applyLoadedDesign = (
    designId: string,
    designName: string,
    toolpaths: Point2D[][],
    toastText: string
  ) => {
    sound.playClick();
    set({
      currentDesignId: designId,
      currentDesignName: designName,
      currentToolpaths: toolpaths,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: createActionToast(toastText, 'success'),
    });
  };

  const applyAptomatState = (
    field: 'isAptomatOn' | 'isCeilingLampsAptomatOn',
    on: boolean
  ) => {
    sound.playRelayClick();
    const text =
      field === 'isAptomatOn'
        ? on
          ? 'ĐÃ ĐÓNG APTOMAT 4 ĐÈN DÀI (ON) — 4 cụm đèn LED tuýp xưởng đã bật nguồn!'
          : 'ĐÃ NGẮT APTOMAT 4 ĐÈN DÀI (OFF) — 4 cụm đèn LED tuýp xưởng đã ngắt điện an toàn!'
        : on
        ? 'ĐÃ ĐÓNG APTOMAT 8 ĐÈN ÂM TRẦN (ON) — 8 cụm đèn trần phòng lab đã bật sáng!'
        : 'ĐÃ NGẮT APTOMAT 8 ĐÈN ÂM TRẦN (OFF) — 8 cụm đèn trần phòng lab đã ngắt điện an toàn!';

    set({
      [field]: on,
      actionMessage: createActionToast(text, on ? 'success' : 'warning'),
    });
  };

  const applySafetySensorReading = (
    field: SensorField,
    value: number,
    isTripped: boolean,
    otherSensorsTripped: boolean,
    tripAlertText: string
  ) => {
    if (isTripped && !get().isAlarmBuzzerActive) {
      sound.startAlarmBuzzer();
    } else if (!isTripped && !otherSensorsTripped) {
      sound.stopAlarmBuzzer();
    }

    if (isTripped && get().isCuttingJob) {
      sound.playInterlockTripSound();
      sound.stopLaserHum();
      set({
        [field]: value,
        isCuttingJob: false,
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: createActionToast(tripAlertText, 'error'),
      });
      return;
    }

    set({
      [field]: value,
      isAlarmBuzzerActive: isTripped || otherSensorsTripped,
    });
  };

  const tripStartCuttingSensorGuard = (message: string): false => {
    sound.playInterlockTripSound();
    sound.startAlarmBuzzer();
    set({
      interlockTriggered: true,
      isAlarmBuzzerActive: true,
      actionMessage: createActionToast(message, 'error'),
    });
    return false;
  };

  return {
    isMachineRunning: true,
    isLidOpen: false,
    isCuttingJob: false,
    cutProgress: 0,
    interlockTriggered: false,

    // Default vector CAD design: Spur Gear
    currentDesignId: PRESET_DESIGNS[0].id,
    currentDesignName: PRESET_DESIGNS[0].name,
    currentToolpaths: PRESET_DESIGNS[0].paths,
    isFraming: false,
    chillerStatus: 'normal',

    // Laser Process Technology Tuning Parameters (P, v, f)
    laserPowerWatts: INITIAL_LASER_PARAMETERS.laserPowerWatts,
    scanSpeedMmS: INITIAL_LASER_PARAMETERS.scanSpeedMmS,
    pulseFrequencyKhz: INITIAL_LASER_PARAMETERS.pulseFrequencyKhz,

    // Sensor Station Telemetry & Interactive Fault Injection
    sampleTemperature: INITIAL_SENSOR_TELEMETRY.sampleTemperature,
    chillerFlowRate: INITIAL_SENSOR_TELEMETRY.chillerFlowRate,
    smokeDensity: INITIAL_SENSOR_TELEMETRY.smokeDensity,
    isAlarmBuzzerActive: INITIAL_SENSOR_TELEMETRY.isAlarmBuzzerActive,

    // Machine Anatomy X-Ray Mode & Bi-directional Component Highlighting
    isXRayMode: false,
    hoveredComponentId: null,

    // Power switches & Aptomat breakers
    machinePower: { ...INITIAL_MACHINE_POWER },
    isAptomatOn: true,
    isCeilingLampsAptomatOn: true,

    toggleAptomat: () => applyAptomatState('isAptomatOn', !get().isAptomatOn),
    setAptomat: (on) => applyAptomatState('isAptomatOn', on),

    toggleCeilingLampsAptomat: () =>
      applyAptomatState('isCeilingLampsAptomatOn', !get().isCeilingLampsAptomatOn),
    setCeilingLampsAptomat: (on) => applyAptomatState('isCeilingLampsAptomatOn', on),

    setXRayMode: (enabled) => set({ isXRayMode: enabled }),
    toggleXRayMode: () => {
      sound.playClick();
      set({ isXRayMode: !get().isXRayMode });
    },
    setHoveredComponentId: (id) => set({ hoveredComponentId: id }),

    toggleMachinePower: (id) => {
      sound.playRelayClick();
      const current = get().machinePower[id] ?? true;
      const next = !current;
      const machineName = STATIONS[id]?.shortName || id;

      set({
        machinePower: {
          ...get().machinePower,
          [id]: next,
        },
        actionMessage: createActionToast(
          next
            ? `Đã BẬT công tắc nguồn điện động lực cho ${machineName}.`
            : `Đã TẮT toàn bộ nguồn điện cho ${machineName}.`,
          next ? 'success' : 'warning'
        ),
      });
    },

    setMachinePower: (id, on) => {
      sound.playRelayClick();
      set({
        machinePower: {
          ...get().machinePower,
          [id]: on,
        },
      });
    },

    toggleMachineRunning: () => {
      sound.playRelayClick();
      const willBeRunning = !get().isMachineRunning;
      const activeId = get().activeStationId;

      if (willBeRunning && activeId && !get().isLidOpen) {
        sound.startLaserHum(activeId);
      } else {
        sound.stopLaserHum();
      }

      set({ isMachineRunning: willBeRunning });
    },

    toggleLid: () => {
      const willBeOpen = !get().isLidOpen;
      sound.playHingeSound(willBeOpen);

      const isRunning = get().isMachineRunning;
      const isCutting = get().isCuttingJob;

      if (willBeOpen) {
        // Opening lid while laser active trips safety interlock
        if (isRunning || isCutting) {
          sound.playInterlockTripSound();
          sound.stopLaserHum();
          set({
            isLidOpen: true,
            isCuttingJob: false,
            cutProgress: 0,
            interlockTriggered: true,
            actionMessage: createActionToast(
              'CẢNH BÁO: Khóa liên động (Safety Interlock) đã ngắt tia laser vì nắp máy đang mở!',
              'error'
            ),
          });
          return;
        }

        set({
          isLidOpen: true,
          interlockTriggered: false,
          actionMessage: createActionToast(
            'Đã mở nắp khoang máy. Bạn có thể thay đổi phôi vật liệu hoặc kiểm tra bàn gia công.',
            'info'
          ),
        });
      } else {
        const activeId = get().activeStationId;
        if (isRunning && activeId) {
          sound.startLaserHum(activeId);
        }

        set({
          isLidOpen: false,
          interlockTriggered: false,
          actionMessage: createActionToast(
            'Đã đóng nắp máy an toàn. Mạch liên động bảo vệ (Interlock) đã kích hoạt.',
            'success'
          ),
        });
      }
    },

    setLidOpen: (open) => {
      if (open !== get().isLidOpen) {
        get().toggleLid();
      }
    },

    startCuttingJob: () => {
      const {
        isLidOpen,
        activeStationId,
        selectedMaterial,
        currentDesignName,
        chillerFlowRate,
        sampleTemperature,
        smokeDensity,
      } = get();

      // 0. Safety Sensor Threshold Checks
      if (chillerFlowRate < SENSOR_SAFETY_THRESHOLDS.minChillerFlowLMin) {
        return tripStartCuttingSensorGuard(
          `KHÔNG THỂ PHÁT TIA: Lưu lượng nước làm mát Chiller quá thấp (${chillerFlowRate.toFixed(1)} L/min < 2.0 L/min)! Cảnh báo nổ bóng laser.`
        );
      }

      if (sampleTemperature > SENSOR_SAFETY_THRESHOLDS.maxSampleTempC) {
        return tripStartCuttingSensorGuard(
          `KHÔNG THỂ PHÁT TIA: Cảm biến phát hiện phôi quá nhiệt (${sampleTemperature.toFixed(1)}°C > 95°C)! Nguy cơ cháy nổ.`
        );
      }

      if (smokeDensity > SENSOR_SAFETY_THRESHOLDS.maxSmokeDensityPpm) {
        return tripStartCuttingSensorGuard(
          `KHÔNG THỂ PHÁT TIA: Mật độ khói khoang cắt vượt ngưỡng (${smokeDensity.toFixed(0)} ppm > 60 ppm)! Kiểm tra quạt hút.`
        );
      }

      // 1. Safety Interlock check: lid must be closed
      if (isLidOpen) {
        sound.playInterlockTripSound();
        set({
          interlockTriggered: true,
          actionMessage: createActionToast(
            'KHÔNG THỂ PHÁT TIA: Khóa liên động (Interlock) đang ngắt mạch! Hãy đóng nắp máy trước khi cắt (Phím O).',
            'error'
          ),
        });
        return false;
      }

      const machineId = activeStationId || 'CO2_LASER';
      const matConfig = MATERIALS_CATALOG[selectedMaterial] || MATERIALS_CATALOG.WOOD;
      const interaction = matConfig?.interactions?.[machineId];

      // 2. Physical Reflectivity / Damage check
      if (interaction && interaction.status === 'BLOCKED_REFLECTIVE') {
        sound.playInterlockTripSound();
        set({
          actionMessage: createActionToast(
            `NGUY HIỂM: ${interaction.statusText}! ${interaction.effectDescription}`,
            'error'
          ),
        });
        return false;
      }

      // 3. Ineffective check
      if (interaction && interaction.status === 'INEFFECTIVE') {
        sound.playClick();
        set({
          actionMessage: createActionToast(
            `KHÔNG HIỆU QUẢ: ${interaction.statusText}. ${interaction.effectDescription}`,
            'warning'
          ),
        });
        return false;
      }

      // 4. Valid cut/engrave operation
      sound.playRelayClick();
      sound.startLaserHum(machineId);

      set({
        isCuttingJob: true,
        isKnowledgePanelCollapsed: true,
        cutProgress: 0,
        isMachineRunning: true,
        interlockTriggered: false,
        isPartDetached: false,
        actionMessage: createActionToast(
          `Bắt đầu cắt vector "${currentDesignName}" trên ${matConfig.name}...`,
          'info'
        ),
      });

      return true;
    },

    stopCuttingJob: () => {
      sound.stopLaserHum();
      sound.playRelayClick();
      set({
        isCuttingJob: false,
        cutProgress: 0,
        actionMessage: createActionToast('Đã hủy chu trình cắt/khắc.', 'info'),
      });
    },

    setCutProgress: (progress) => {
      const prev = get().cutProgress;
      if (prev < 100 && progress >= 100) {
        const machineId = get().activeStationId || 'CO2_LASER';
        const station = STATIONS[machineId] || STATIONS.CO2_LASER;
        const mat = MATERIALS_CATALOG[get().selectedMaterial];
        const p = get().laserPowerWatts;
        const v = Math.max(1, get().scanSpeedMmS);
        const f = get().pulseFrequencyKhz;
        const mode = get().processMode;

        // Dynamic Laser Physics Simulation according to PDF Equations
        const sim = simulateLaserPhysics(p, v, f, machineId, get().selectedMaterial, mode);

        const job: ProcessedJobInfo = {
          machineId,
          machineName: station.name,
          wavelength: station.wavelength,
          material: get().selectedMaterial,
          materialName: mat.name,
          designName: get().currentDesignName,
          processMode: mode,
          powerWatts: p,
          speedMmS: v,
          frequencyKhz: f,
          energyDensityJPerMm: sim.energyDensityJPerMm,
          kerfWidthMm: sim.kerfWidthMm,
          hazQuality: sim.hazQuality,
          actualDepthMm: sim.actualDepthMm,
          targetThicknessMm: sim.targetThicknessMm,
          isCutThrough: sim.isCutThrough,
          cutThroughPercentage: sim.cutThroughPercentage,
          pulseOverlapPercent: sim.pulseOverlapPercent,
          surfaceRoughnessRaUm: sim.surfaceRoughnessRaUm,
          contrastRatioCm: sim.contrastRatioCm,
          surfaceFinishDescription: sim.surfaceFinishDescription,
          qualityRating: sim.qualityRating,
          scientificFeedback: sim.scientificFeedback,
          timestamp: Date.now(),
        };

        sound.stopLaserHum();
        sound.playCutCompleteSound();

        let toastText = `HOÀN THÀNH: Đã gia công xong "${job.designName}" trên ${mat.name}! Nhấn [G] hoặc nhấp nút để lấy mẫu ra kiểm tra.`;
        let toastType: 'success' | 'warning' = 'success';

        if (mode === 'CUT' && !sim.isCutThrough) {
          toastText = `CẢNH BÁO: Đã chạy xong nhưng VẾT CẮT CHƯA ĐỨT PHÔI (độ sâu ${sim.actualDepthMm}mm / ${sim.targetThicknessMm}mm - ${sim.cutThroughPercentage}%)! Chi tiết bị dính kẹt. Nhấn [G] xem mẫu.`;
          toastType = 'warning';
        }

        set({
          cutProgress: 100,
          isCuttingJob: false,
          lastProcessedJob: job,
          actionMessage: createActionToast(toastText, toastType),
        });
        return;
      }
      set({ cutProgress: progress });
    },

    selectPresetDesign: (designId) => {
      const preset = PRESET_DESIGNS.find((d) => d.id === designId);
      if (!preset) return;
      applyLoadedDesign(
        preset.id,
        preset.name,
        preset.paths,
        `Đã nạp file thiết kế: "${preset.name}" vào bộ nhớ máy CNC laser.`
      );
    },

    setCustomToolpaths: (paths, name = 'Bản vẽ tay tự do (Custom CAD)') => {
      applyLoadedDesign(
        'CUSTOM_DRAWING',
        name,
        paths,
        `Đã biên dịch ${paths.length} đường vector và nạp vào máy laser!`
      );
    },

    setCustomTextDesign: (text) => {
      const paths = generateTextPaths(text);
      if (!paths.length) return;
      applyLoadedDesign(
        'CUSTOM_TEXT',
        `Khắc chữ "${text}"`,
        paths,
        `Đã biên dịch chữ vector "${text}" thành mã lệnh G-code!`
      );
    },

    startFraming: () => {
      sound.playClick();
      const bbox = computeBoundingBox(get().currentToolpaths);
      const mmW = Math.round(bbox.width * 100);
      const mmH = Math.round(bbox.height * 100);

      set({
        isFraming: true,
        actionMessage: createActionToast(
          `Đang quét khung bao viền (Frame): ${mmW}mm × ${mmH}mm. Đầu laser dẫn hướng không phát tia cắt.`,
          'info'
        ),
      });

      // Auto-stop framing after ~4 seconds if not stopped manually
      setTimeout(() => {
        if (get().isFraming) {
          set({ isFraming: false });
        }
      }, 4200);
    },

    stopFraming: () => {
      set({ isFraming: false });
    },

    autoFitCurrentDesign: () => {
      sound.playClick();
      const fitted = autoFitToolpaths(get().currentToolpaths, 0.76);
      set({
        currentToolpaths: fitted,
        cutProgress: 0,
        actionMessage: createActionToast(
          'Đã căn chỉnh tự động: Thiết kế đã được thu phóng và đặt ngay ngắn trong lòng phôi.',
          'success'
        ),
      });
    },

    scaleCurrentDesign: (factor) => {
      sound.playClick();
      const paths = get().currentToolpaths;
      const bbox = computeBoundingBox(paths);
      const scaled: Point2D[][] = paths.map((stroke) =>
        stroke.map(
          ([x, y]) =>
            [
              bbox.centerX + (x - bbox.centerX) * factor,
              bbox.centerY + (y - bbox.centerY) * factor,
            ] as Point2D
        )
      );
      set({ currentToolpaths: scaled, cutProgress: 0 });
    },

    nudgeCurrentDesign: (dx, dy) => {
      sound.playClick();
      const paths = get().currentToolpaths;
      const nudged: Point2D[][] = paths.map((stroke) =>
        stroke.map(([x, y]) => [x + dx, y + dy] as Point2D)
      );
      set({ currentToolpaths: nudged, cutProgress: 0 });
    },

    setChillerStatus: (status) =>
      set({
        chillerStatus: status,
        actionMessage: createActionToast(
          status === 'overheat'
            ? 'CẢNH BÁO MÁY LÀM LẠNH (CHILLER): Quá nhiệt cảnh báo! Nhiệt độ nước vượt ngưỡng an toàn.'
            : 'MÁY LÀM LẠNH (CHILLER): Trạng thái hoạt động bình thường (22.4°C, 4.8 L/M).',
          status === 'overheat' ? 'warning' : 'info'
        ),
      }),

    toggleChillerStatus: () => {
      const nextStatus: ChillerStatus = get().chillerStatus === 'normal' ? 'overheat' : 'normal';
      get().setChillerStatus(nextStatus);
    },

    setLaserPowerWatts: (p) => set({ laserPowerWatts: Math.max(1, Math.min(100, p)) }),
    setScanSpeedMmS: (v) => set({ scanSpeedMmS: Math.max(1, Math.min(1000, v)) }),
    setPulseFrequencyKhz: (f) => set({ pulseFrequencyKhz: Math.max(1, Math.min(100, f)) }),

    setSampleTemperature: (temp) =>
      applySafetySensorReading(
        'sampleTemperature',
        temp,
        temp > SENSOR_SAFETY_THRESHOLDS.maxSampleTempC,
        get().chillerFlowRate < SENSOR_SAFETY_THRESHOLDS.minChillerFlowLMin ||
          get().smokeDensity > SENSOR_SAFETY_THRESHOLDS.maxSmokeDensityPpm,
        `CẢNH BÁO NHIỆT ĐỘ: Cảm biến phát hiện phôi quá nhiệt (${temp.toFixed(1)}°C > 95°C)! Đã tự động ngắt phát tia laser.`
      ),

    setChillerFlowRate: (flow) =>
      applySafetySensorReading(
        'chillerFlowRate',
        flow,
        flow < SENSOR_SAFETY_THRESHOLDS.minChillerFlowLMin,
        get().sampleTemperature > SENSOR_SAFETY_THRESHOLDS.maxSampleTempC ||
          get().smokeDensity > SENSOR_SAFETY_THRESHOLDS.maxSmokeDensityPpm,
        `CẢNH BÁO LƯU LƯỢNG NƯỚC: Nước giải nhiệt Chiller tụt dưới 2.0 L/min (${flow.toFixed(1)} L/min)! Khóa liên động đã ngắt nguồn laser.`
      ),

    setSmokeDensity: (smoke) =>
      applySafetySensorReading(
        'smokeDensity',
        smoke,
        smoke > SENSOR_SAFETY_THRESHOLDS.maxSmokeDensityPpm,
        get().sampleTemperature > SENSOR_SAFETY_THRESHOLDS.maxSampleTempC ||
          get().chillerFlowRate < SENSOR_SAFETY_THRESHOLDS.minChillerFlowLMin,
        `CẢNH BÁO MẬT ĐỘ KHÓI: Cảm biến Tyndall phát hiện khói đậm đặc (${smoke.toFixed(0)} ppm > 60 ppm)! Đã ngắt tia laser khẩn cấp.`
      ),

    triggerEmergencyStop: () => {
      sound.playInterlockTripSound();
      sound.stopLaserHum();
      sound.startAlarmBuzzer();
      set({
        isMachineRunning: false,
        isCuttingJob: false,
        cutProgress: 0,
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: createActionToast(
          'DỪNG KHẨN CẤP (E-STOP): Đã ngắt toàn bộ nguồn cao áp, hệ thống laser và chiller!',
          'error'
        ),
      });
    },

    resetSensors: () => {
      sound.stopAlarmBuzzer();
      sound.playClick();
      set({
        sampleTemperature: INITIAL_SENSOR_TELEMETRY.sampleTemperature,
        chillerFlowRate: INITIAL_SENSOR_TELEMETRY.chillerFlowRate,
        smokeDensity: INITIAL_SENSOR_TELEMETRY.smokeDensity,
        isAlarmBuzzerActive: false,
        interlockTriggered: false,
        actionMessage: createActionToast(
          'Hệ thống cảm biến đã được reset về trạng thái định mức bình thường.',
          'success'
        ),
      });
    },
  };
};
