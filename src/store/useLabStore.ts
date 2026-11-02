import { create } from 'zustand';
import { MachineId, AppMode, InfoTab, CoatingFinishId, ProcessedJobInfo } from '../types/lab';
import { STATIONS } from '../data/labConfig';
import { MaterialType, MATERIALS_CATALOG } from '../data/materialsConfig';
import { COATING_FINISHES } from '../data/coatingFinishes';
import {
  Point2D,
  PRESET_DESIGNS,
  generateTextPaths,
  computeBoundingBox,
  autoFitToolpaths,
} from '../data/vectorDesigns';
import { sound } from '../utils/audioSystem';

export interface ActionToast {
  id: number;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface LabState {
  // Navigation & Core State
  mode: AppMode;
  hoveredStationId: MachineId | null;
  hoveredDistance: number | null;
  activeStationId: MachineId | null;
  isPointerLocked: boolean;

  // Saved transform prior to inspection
  savedPlayerPosition: [number, number, number];

  // UI state
  activeTab: InfoTab;
  isMachineRunning: boolean;
  soundEnabled: boolean;

  // Interactive Machine & Material State
  isLidOpen: boolean;
  selectedMaterial: MaterialType;
  isCuttingJob: boolean;
  cutProgress: number; // 0 - 100
  interlockTriggered: boolean;
  actionMessage: ActionToast | null;

  // Custom Vector CAD Design & Toolpath State
  currentDesignId: string;
  currentDesignName: string;
  currentToolpaths: Point2D[][];
  isDesignModalOpen: boolean;

  // Finished Specimen Inspection State
  isSpecimenModalOpen: boolean;
  openSpecimenModal: () => void;
  closeSpecimenModal: () => void;
  resetWorkpiece: () => void;

  // Origin, Alignment & Frame Preview State
  isFraming: boolean;
  startFraming: () => void;
  stopFraming: () => void;
  autoFitCurrentDesign: () => void;
  scaleCurrentDesign: (factor: number) => void;
  nudgeCurrentDesign: (dx: number, dy: number) => void;

  // Laser Processing Mode: Cắt xuyên (Through Cut) vs Khắc bề mặt (Surface Engrave)
  processMode: 'CUT' | 'ENGRAVE';
  setProcessMode: (mode: 'CUT' | 'ENGRAVE') => void;
  isPartDetached: boolean;
  togglePartDetached: () => void;
  setPartDetached: (detached: boolean) => void;

  // Laser Process Technology Tuning Parameters (P, v, f)
  laserPowerWatts: number;
  scanSpeedMmS: number;
  pulseFrequencyKhz: number;
  setLaserPowerWatts: (p: number) => void;
  setScanSpeedMmS: (v: number) => void;
  setPulseFrequencyKhz: (f: number) => void;

  // Last Processed Job Snapshot (Guarantees 100% state accuracy in Inspection Modal)
  lastProcessedJob: ProcessedJobInfo | null;

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

  // Spray Coating & Finishing State
  selectedCoatingFinish: CoatingFinishId;
  coatingCoverage: number; // 0 - 100%
  curingProgress: number; // 0 - 100%
  isSpraying: boolean;
  isCuring: boolean;
  isTurntableRotating: boolean;
  setSelectedCoatingFinish: (finish: CoatingFinishId) => void;
  startSpraying: () => void;
  stopSpraying: () => void;
  setCoatingCoverage: (cov: number) => void;
  startCuring: () => void;
  stopCuring: () => void;
  setCuringProgress: (prog: number) => void;
  resetCoating: () => void;
  toggleTurntable: () => void;

  // Machine Anatomy X-Ray Mode & Bi-directional Component Highlighting
  isXRayMode: boolean;
  hoveredComponentId: string | null;
  setXRayMode: (enabled: boolean) => void;
  toggleXRayMode: () => void;
  setHoveredComponentId: (id: string | null) => void;

  // Actions
  setHoveredStation: (id: MachineId | null, distance?: number | null) => void;
  setPointerLocked: (locked: boolean) => void;
  enterInspection: (id: MachineId) => void;
  exitInspection: () => void;
  setActiveTab: (tab: InfoTab) => void;
  toggleMachineRunning: () => void;
  toggleSound: () => void;
  setSavedPlayerPosition: (pos: [number, number, number]) => void;
  setMode: (mode: AppMode) => void;

  // Machine lid & material interactions
  toggleLid: () => void;
  setLidOpen: (open: boolean) => void;
  setSelectedMaterial: (material: MaterialType) => void;
  startCuttingJob: () => boolean;
  stopCuttingJob: () => void;
  setCutProgress: (progress: number) => void;
  clearActionMessage: () => void;
  setActionMessage: (text: string, type?: 'info' | 'warning' | 'error' | 'success') => void;

  // CAD Vector Design actions
  openDesignModal: () => void;
  closeDesignModal: () => void;
  selectPresetDesign: (designId: string) => void;
  setCustomToolpaths: (paths: Point2D[][], name?: string) => void;
  setCustomTextDesign: (text: string) => void;
}

let toastIdCounter = 0;

export const useLabStore = create<LabState>((set, get) => ({
  mode: 'WALKING',
  hoveredStationId: null,
  hoveredDistance: null,
  activeStationId: null,
  isPointerLocked: false,
  savedPlayerPosition: [0, 1.7, 4],

  activeTab: 'PHYSICS_PRINCIPLE',
  isMachineRunning: true,
  soundEnabled: true,

  // Default lid closed, default wood plywood
  isLidOpen: false,
  selectedMaterial: 'WOOD',
  isCuttingJob: false,
  cutProgress: 0,
  interlockTriggered: false,
  actionMessage: null,

  // Default vector CAD design: Spur Gear
  currentDesignId: PRESET_DESIGNS[0].id,
  currentDesignName: PRESET_DESIGNS[0].name,
  currentToolpaths: PRESET_DESIGNS[0].paths,
  isDesignModalOpen: false,
  isSpecimenModalOpen: false,
  isFraming: false,
  processMode: 'CUT',
  isPartDetached: false,

  // Laser Process Technology Tuning Parameters (P, v, f)
  laserPowerWatts: 60,
  scanSpeedMmS: 300,
  pulseFrequencyKhz: 30,

  // Last Processed Job Snapshot (Guarantees 100% state accuracy in Inspection Modal)
  lastProcessedJob: null,

  // Sensor Station Telemetry & Interactive Fault Injection
  sampleTemperature: 26.5,
  chillerFlowRate: 4.8,
  smokeDensity: 5,
  isAlarmBuzzerActive: false,

  // Machine Anatomy X-Ray Mode & Bi-directional Component Highlighting
  isXRayMode: false,
  hoveredComponentId: null,
  setXRayMode: (enabled) => set({ isXRayMode: enabled }),
  toggleXRayMode: () => {
    sound.playClick();
    set({ isXRayMode: !get().isXRayMode });
  },
  setHoveredComponentId: (id) => set({ hoveredComponentId: id }),

  // Spray Coating & Finishing State
  selectedCoatingFinish: 'CLEAR_GLOSS',
  coatingCoverage: 0,
  curingProgress: 0,
  isSpraying: false,
  isCuring: false,
  isTurntableRotating: true,

  setHoveredStation: (id, distance = null) =>
    set({ hoveredStationId: id, hoveredDistance: distance }),

  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  enterInspection: (id) => {
    sound.playWhoosh();
    setTimeout(() => {
      sound.playRelayClick();
      if (get().isMachineRunning && !get().isLidOpen) {
        sound.startLaserHum(id);
      }
    }, 450);

    set({
      mode: 'TRANSITIONING',
      activeStationId: id,
      activeTab: 'PHYSICS_PRINCIPLE',
      isCuttingJob: false,
    });
  },

  exitInspection: () => {
    sound.playWhoosh();
    sound.stopLaserHum();

    set({
      mode: 'TRANSITIONING',
      activeStationId: null,
      isCuttingJob: false,
      isDesignModalOpen: false,
      isXRayMode: false,
      hoveredComponentId: null,
    });
  },

  setMode: (mode) => set({ mode }),

  setActiveTab: (tab) => {
    sound.playClick();
    const isComponents = tab === 'COMPONENTS';
    set({
      activeTab: tab,
      isXRayMode: isComponents ? true : get().isXRayMode,
      hoveredComponentId: null,
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

  toggleSound: () => {
    const willBeEnabled = !get().soundEnabled;
    if (!willBeEnabled) {
      sound.stopLaserHum();
    }
    set({ soundEnabled: willBeEnabled });
  },

  setSavedPlayerPosition: (pos) => set({ savedPlayerPosition: pos }),

  // =========================================================================
  // MACHINE OPEN/CLOSE & MATERIAL INTERACTIONS
  // =========================================================================
  toggleLid: () => {
    const willBeOpen = !get().isLidOpen;
    sound.playHingeSound(willBeOpen);

    const isRunning = get().isMachineRunning;
    const isCutting = get().isCuttingJob;

    if (willBeOpen) {
      // Opening lid while laser active trips safety interlock!
      if (isRunning || isCutting) {
        sound.playInterlockTripSound();
        sound.stopLaserHum();
        set({
          isLidOpen: true,
          isCuttingJob: false,
          cutProgress: 0,
          interlockTriggered: true,
          actionMessage: {
            id: ++toastIdCounter,
            text: 'CẢNH BÁO: Khóa liên động (Safety Interlock) đã ngắt tia laser vì nắp máy đang mở!',
            type: 'error',
          },
        });
        return;
      }

      set({
        isLidOpen: true,
        interlockTriggered: false,
        actionMessage: {
          id: ++toastIdCounter,
          text: 'Đã mở nắp khoang máy. Bạn có thể thay đổi phôi vật liệu hoặc kiểm tra bàn gia công.',
          type: 'info',
        },
      });
    } else {
      // Closing lid
      const activeId = get().activeStationId;
      if (isRunning && activeId) {
        sound.startLaserHum(activeId);
      }

      set({
        isLidOpen: false,
        interlockTriggered: false,
        actionMessage: {
          id: ++toastIdCounter,
          text: 'Đã đóng nắp máy an toàn. Mạch liên động bảo vệ (Interlock) đã kích hoạt.',
          type: 'success',
        },
      });
    }
  },

  setLidOpen: (open) => {
    if (open !== get().isLidOpen) {
      get().toggleLid();
    }
  },

  setSelectedMaterial: (material) => {
    sound.playMaterialPlaceSound();
    const item = MATERIALS_CATALOG[material];
    set({
      selectedMaterial: material,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đã đặt phôi: ${item.name} (${item.category}) vào buồng làm việc.`,
        type: 'success',
      },
    });
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
    if (chillerFlowRate < 2.0) {
      sound.playInterlockTripSound();
      sound.startAlarmBuzzer();
      set({
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `KHÔNG THỂ PHÁT TIA: Lưu lượng nước làm mát Chiller quá thấp (${chillerFlowRate.toFixed(1)} L/min < 2.0 L/min)! Cảnh báo nổ bóng laser.`,
          type: 'error',
        },
      });
      return false;
    }

    if (sampleTemperature > 95) {
      sound.playInterlockTripSound();
      sound.startAlarmBuzzer();
      set({
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `KHÔNG THỂ PHÁT TIA: Cảm biến phát hiện phôi quá nhiệt (${sampleTemperature.toFixed(1)}°C > 95°C)! Nguy cơ cháy nổ.`,
          type: 'error',
        },
      });
      return false;
    }

    if (smokeDensity > 60) {
      sound.playInterlockTripSound();
      sound.startAlarmBuzzer();
      set({
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `KHÔNG THỂ PHÁT TIA: Mật độ khói khoang cắt vượt ngưỡng (${smokeDensity.toFixed(0)} ppm > 60 ppm)! Kiểm tra quạt hút.`,
          type: 'error',
        },
      });
      return false;
    }

    // 1. Safety Interlock check: lid must be closed!
    if (isLidOpen) {
      sound.playInterlockTripSound();
      set({
        interlockTriggered: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: 'KHÔNG THỂ PHÁT TIA: Khóa liên động (Interlock) đang ngắt mạch! Hãy đóng nắp máy trước khi cắt (Phím O).',
          type: 'error',
        },
      });
      return false;
    }

    const machineId = activeStationId || 'CO2_LASER';
    const matConfig = MATERIALS_CATALOG[selectedMaterial];
    const interaction = matConfig.interactions[machineId];

    // 2. Physical Reflectivity / Damage check
    if (interaction.status === 'BLOCKED_REFLECTIVE') {
      sound.playInterlockTripSound();
      set({
        actionMessage: {
          id: ++toastIdCounter,
          text: `NGUY HIỂM: ${interaction.statusText}! ${interaction.effectDescription}`,
          type: 'error',
        },
      });
      return false;
    }

    // 3. Ineffective check
    if (interaction.status === 'INEFFECTIVE') {
      sound.playClick();
      set({
        actionMessage: {
          id: ++toastIdCounter,
          text: `KHÔNG HIỆU QUẢ: ${interaction.statusText}. ${interaction.effectDescription}`,
          type: 'warning',
        },
      });
      return false;
    }

    // 4. Valid cut/engrave operation
    sound.playRelayClick();
    sound.startLaserHum(machineId);

    set({
      isCuttingJob: true,
      cutProgress: 0,
      isMachineRunning: true,
      interlockTriggered: false,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Bắt đầu cắt vector "${currentDesignName}" trên ${matConfig.name}...`,
        type: 'info',
      },
    });

    return true;
  },

  stopCuttingJob: () => {
    sound.stopLaserHum();
    sound.playRelayClick();
    set({
      isCuttingJob: false,
      cutProgress: 0,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Đã hủy chu trình cắt/khắc.',
        type: 'info',
      },
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
      const energyDensity = Number((p / v).toFixed(3));
      const mode = get().processMode;

      let kerf = 0.15;
      if (machineId === 'UV_LASER') kerf = 0.02 + (p / 100) * 0.015;
      else if (machineId === 'FIBER_LASER') kerf = 0.04 + (p / 100) * 0.025;
      else kerf = 0.12 + (p / 100) * 0.06;

      let hazQuality = 'Tối ưu (Mép cắt sắc nét, không biến tính)';
      if (energyDensity > 0.45 && machineId === 'CO2_LASER') {
        hazQuality = 'Nhiệt ảnh hưởng lớn (Mép sém nhẹ do năng lượng đường thẳng cao)';
      } else if (machineId === 'UV_LASER') {
        hazQuality = 'Hoàn hảo (Gia công lạnh quang hóa Cold Ablation, HAZ = 0)';
      }

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
        energyDensityJPerMm: energyDensity,
        kerfWidthMm: Number(kerf.toFixed(3)),
        hazQuality,
        timestamp: Date.now(),
      };

      sound.stopLaserHum();
      sound.playCutCompleteSound();

      set({
        cutProgress: 100,
        isCuttingJob: false,
        lastProcessedJob: job,
        actionMessage: {
          id: ++toastIdCounter,
          text: `HOÀN THÀNH: Đã gia công xong "${job.designName}" trên ${mat.name}! Nhấn [G] hoặc nhấp nút để lấy mẫu ra kiểm tra.`,
          type: 'success',
        },
      });
      return;
    }
    set({ cutProgress: progress });
  },

  openSpecimenModal: () => {
    sound.stopLaserHum();
    sound.playClick();
    set({ isSpecimenModalOpen: true });
  },

  closeSpecimenModal: () => {
    sound.playClick();
    set({ isSpecimenModalOpen: false });
  },

  resetWorkpiece: () => {
    sound.playMaterialPlaceSound();
    set({
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      isSpecimenModalOpen: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Đã nạp phôi mới chưa cắt vào bàn làm việc.',
        type: 'info',
      },
    });
  },

  clearActionMessage: () => set({ actionMessage: null }),

  setActionMessage: (text, type = 'info') =>
    set({
      actionMessage: {
        id: ++toastIdCounter,
        text,
        type,
      },
    }),

  // =========================================================================
  // VECTOR CAD DESIGN ACTIONS
  // =========================================================================
  openDesignModal: () => {
    sound.stopLaserHum();
    sound.playClick();
    set({ isDesignModalOpen: true });
  },

  closeDesignModal: () => {
    sound.playClick();
    set({ isDesignModalOpen: false });
  },

  selectPresetDesign: (designId) => {
    const preset = PRESET_DESIGNS.find((d) => d.id === designId);
    if (!preset) return;
    sound.playClick();
    set({
      currentDesignId: preset.id,
      currentDesignName: preset.name,
      currentToolpaths: preset.paths,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đã nạp file thiết kế: "${preset.name}" vào bộ nhớ máy CNC laser.`,
        type: 'success',
      },
    });
  },

  setCustomToolpaths: (paths, name = 'Bản vẽ tay tự do (Custom CAD)') => {
    sound.playClick();
    set({
      currentDesignId: 'CUSTOM_DRAWING',
      currentDesignName: name,
      currentToolpaths: paths,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đã biên dịch ${paths.length} đường vector và nạp vào máy laser!`,
        type: 'success',
      },
    });
  },

  setCustomTextDesign: (text) => {
    const paths = generateTextPaths(text);
    if (!paths.length) return;
    sound.playClick();
    set({
      currentDesignId: 'CUSTOM_TEXT',
      currentDesignName: `Khắc chữ "${text}"`,
      currentToolpaths: paths,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đã biên dịch chữ vector "${text}" thành mã lệnh G-code!`,
        type: 'success',
      },
    });
  },

  // Origin, Alignment & Frame Preview Actions
  startFraming: () => {
    sound.playClick();
    const bbox = computeBoundingBox(get().currentToolpaths);
    const mmW = Math.round(bbox.width * 100);
    const mmH = Math.round(bbox.height * 100);

    set({
      isFraming: true,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đang quét khung bao viền (Frame): ${mmW}mm × ${mmH}mm. Đầu laser dẫn hướng không phát tia cắt.`,
        type: 'info',
      },
    });

    // Auto-stop framing after 4 seconds if not stopped manually
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
    const current = get().currentToolpaths;
    const fitted = autoFitToolpaths(current, 0.76);
    set({
      currentToolpaths: fitted,
      cutProgress: 0,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Đã căn chỉnh tự động: Thiết kế đã được thu phóng và đặt ngay ngắn trong lòng phôi.',
        type: 'success',
      },
    });
  },

  scaleCurrentDesign: (factor: number) => {
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

  nudgeCurrentDesign: (dx: number, dy: number) => {
    sound.playClick();
    const paths = get().currentToolpaths;
    const nudged: Point2D[][] = paths.map((stroke) =>
      stroke.map(([x, y]) => [x + dx, y + dy] as Point2D)
    );
    set({ currentToolpaths: nudged, cutProgress: 0 });
  },

  setProcessMode: (mode: 'CUT' | 'ENGRAVE') => {
    sound.playClick();
    set({
      processMode: mode,
      isPartDetached: false,
      actionMessage: {
        id: ++toastIdCounter,
        text:
          mode === 'CUT'
            ? 'Chế độ: CẮT XUYÊN PHÔI (Through Cut). Công suất cao cắt đứt rời chi tiết khỏi tấm.'
            : 'Chế độ: KHẮC BỀ MẶT (Surface Engrave). Công suất thấp chỉ khắc hoa văn nông trên mặt tấm.',
        type: 'info',
      },
    });
  },

  togglePartDetached: () => {
    const next = !get().isPartDetached;
    if (next) {
      sound.playRelayClick();
    } else {
      sound.playMaterialPlaceSound();
    }
    set({
      isPartDetached: next,
      actionMessage: {
        id: ++toastIdCounter,
        text: next
          ? 'Đã nhấc rời chi tiết cắt khỏi tấm phôi [Space]. Bạn có thể xoay 360° để kiểm tra rãnh cắt!'
          : 'Đã lắp chi tiết trở lại khít vào tấm phôi [Space].',
        type: 'info',
      },
    });
  },

  setPartDetached: (detached: boolean) => set({ isPartDetached: detached }),

  // =========================================================================
  // LASER PROCESS TECHNOLOGY TUNING PARAMETERS (P, v, f)
  // =========================================================================
  setLaserPowerWatts: (p: number) => set({ laserPowerWatts: Math.max(1, Math.min(100, p)) }),
  setScanSpeedMmS: (v: number) => set({ scanSpeedMmS: Math.max(10, Math.min(1000, v)) }),
  setPulseFrequencyKhz: (f: number) => set({ pulseFrequencyKhz: Math.max(1, Math.min(100, f)) }),

  // =========================================================================
  // SENSOR STATION TELEMETRY & FAULT INJECTION ACTIONS
  // =========================================================================
  setSampleTemperature: (temp: number) => {
    const isTripped = temp > 95;
    if (isTripped && !get().isAlarmBuzzerActive) {
      sound.startAlarmBuzzer();
    } else if (!isTripped && get().chillerFlowRate >= 2.0 && get().smokeDensity <= 60) {
      sound.stopAlarmBuzzer();
    }
    if (isTripped && get().isCuttingJob) {
      sound.playInterlockTripSound();
      sound.stopLaserHum();
      set({
        sampleTemperature: temp,
        isCuttingJob: false,
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `CẢNH BÁO NHIỆT ĐỘ: Cảm biến phát hiện phôi quá nhiệt (${temp.toFixed(1)}°C > 95°C)! Đã tự động ngắt phát tia laser.`,
          type: 'error',
        },
      });
      return;
    }
    set({
      sampleTemperature: temp,
      isAlarmBuzzerActive: isTripped || get().chillerFlowRate < 2.0 || get().smokeDensity > 60,
    });
  },

  setChillerFlowRate: (flow: number) => {
    const isTripped = flow < 2.0;
    if (isTripped && !get().isAlarmBuzzerActive) {
      sound.startAlarmBuzzer();
    } else if (!isTripped && get().sampleTemperature <= 95 && get().smokeDensity <= 60) {
      sound.stopAlarmBuzzer();
    }
    if (isTripped && get().isCuttingJob) {
      sound.playInterlockTripSound();
      sound.stopLaserHum();
      set({
        chillerFlowRate: flow,
        isCuttingJob: false,
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `CẢNH BÁO LƯU LƯỢNG NƯỚC: Nước giải nhiệt Chiller tụt dưới 2.0 L/min (${flow.toFixed(1)} L/min)! Khóa liên động đã ngắt nguồn laser.`,
          type: 'error',
        },
      });
      return;
    }
    set({
      chillerFlowRate: flow,
      isAlarmBuzzerActive: isTripped || get().sampleTemperature > 95 || get().smokeDensity > 60,
    });
  },

  setSmokeDensity: (smoke: number) => {
    const isTripped = smoke > 60;
    if (isTripped && !get().isAlarmBuzzerActive) {
      sound.startAlarmBuzzer();
    } else if (!isTripped && get().sampleTemperature <= 95 && get().chillerFlowRate >= 2.0) {
      sound.stopAlarmBuzzer();
    }
    if (isTripped && get().isCuttingJob) {
      sound.playInterlockTripSound();
      sound.stopLaserHum();
      set({
        smokeDensity: smoke,
        isCuttingJob: false,
        interlockTriggered: true,
        isAlarmBuzzerActive: true,
        actionMessage: {
          id: ++toastIdCounter,
          text: `CẢNH BÁO MẬT ĐỘ KHÓI: Cảm biến Tyndall phát hiện khói đậm đặc (${smoke.toFixed(0)} ppm > 60 ppm)! Đã ngắt tia laser khẩn cấp.`,
          type: 'error',
        },
      });
      return;
    }
    set({
      smokeDensity: smoke,
      isAlarmBuzzerActive: isTripped || get().sampleTemperature > 95 || get().chillerFlowRate < 2.0,
    });
  },

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
      actionMessage: {
        id: ++toastIdCounter,
        text: 'DỪNG KHẨN CẤP (E-STOP): Đã ngắt toàn bộ nguồn cao áp, hệ thống laser và chiller!',
        type: 'error',
      },
    });
  },

  resetSensors: () => {
    sound.stopAlarmBuzzer();
    sound.playClick();
    set({
      sampleTemperature: 26.5,
      chillerFlowRate: 4.8,
      smokeDensity: 5,
      isAlarmBuzzerActive: false,
      interlockTriggered: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Hệ thống cảm biến đã được reset về trạng thái định mức bình thường.',
        type: 'success',
      },
    });
  },

  // =========================================================================
  // SPRAY COATING & UV CURING FINISHING ACTIONS
  // =========================================================================
  setSelectedCoatingFinish: (finish) => {
    sound.playClick();
    const conf = COATING_FINISHES[finish];
    set({
      selectedCoatingFinish: finish,
      curingProgress: 0,
      actionMessage: {
        id: ++toastIdCounter,
        text: `Đã nạp sơn vào bình: ${conf.name} (${conf.glossUnit})`,
        type: 'info',
      },
    });
  },

  startSpraying: () => {
    sound.startSpraySound();
    set({ isSpraying: true });
  },

  stopSpraying: () => {
    sound.stopSpraySound();
    set({ isSpraying: false });
  },

  setCoatingCoverage: (cov) => {
    const prev = get().coatingCoverage;
    const clamped = Math.min(100, Math.max(0, cov));
    if (prev < 100 && clamped >= 100) {
      sound.playCutCompleteSound();
      set({
        coatingCoverage: 100,
        isSpraying: false,
        actionMessage: {
          id: ++toastIdCounter,
          text: 'HOÀN THÀNH PHỦ SƠN: Màng sơn đã phủ đều 100% bề mặt! Hãy bật sấy quang hóa UV/Hồng ngoại.',
          type: 'success',
        },
      });
      sound.stopSpraySound();
      return;
    }
    set({ coatingCoverage: clamped });
  },

  startCuring: () => {
    sound.playRelayClick();
    set({
      isCuring: true,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Đang kích hoạt dàn đèn sấy quang hóa UV (395nm) & Hồng ngoại sấy khô bề mặt...',
        type: 'info',
      },
    });
  },

  stopCuring: () => {
    set({ isCuring: false });
  },

  setCuringProgress: (prog) => {
    const prev = get().curingProgress;
    const clamped = Math.min(100, Math.max(0, prog));
    if (prev < 100 && clamped >= 100) {
      sound.playCutCompleteSound();
      set({
        curingProgress: 100,
        isCuring: false,
        actionMessage: {
          id: ++toastIdCounter,
          text: 'SẤY HOÀN TẤT: Màng sơn đã polyme hóa đóng rắn 100% đạt độ bóng và độ cứng tối đa!',
          type: 'success',
        },
      });
      return;
    }
    set({ curingProgress: clamped });
  },

  resetCoating: () => {
    sound.playClick();
    set({
      coatingCoverage: 0,
      curingProgress: 0,
      isSpraying: false,
      isCuring: false,
      actionMessage: {
        id: ++toastIdCounter,
        text: 'Đã tẩy sạch lớp sơn, đưa mẫu vật trở về trạng thái phôi nguyên bản.',
        type: 'info',
      },
    });
  },

  toggleTurntable: () => {
    sound.playClick();
    set({ isTurntableRotating: !get().isTurntableRotating });
  },
}));
