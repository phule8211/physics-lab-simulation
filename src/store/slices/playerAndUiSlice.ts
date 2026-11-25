import type { StateCreator } from 'zustand';
import type {
  AppMode,
  GraphicsQuality,
  InfoTab,
  MachineId,
  OperatorPPE,
  StationId,
  TargetFps,
} from '../../types/lab';
import type { LabState } from '../useLabStore';
import { sound } from '../../utils/audioSystem';
import {
  ActionToast,
  DEFAULT_NPC_DUNG_POSITION,
  DEFAULT_PLAYER_POSITION,
  HeldItemType,
  INITIAL_OPERATOR_PPE,
  createActionToast,
  getInitialGraphicsQuality,
  getInitialTargetFps,
} from '../initialState';

/**
 * Store slice covering camera & player navigation, NPC dialogs, operator PPE & held items,
 * UI tabs, open modal states, HUD/dock toggles, graphics quality, and toast notifications.
 */
export interface PlayerAndUiSlice {
  // Navigation & Core State
  mode: AppMode;
  hoveredStationId: StationId | null;
  hoveredDistance: number | null;
  activeStationId: MachineId | null;
  isPointerLocked: boolean;
  savedPlayerPosition: [number, number, number];
  setHoveredStation: (id: StationId | null, distance?: number | null) => void;
  setPointerLocked: (locked: boolean) => void;
  enterInspection: (id: MachineId) => void;
  exitInspection: () => void;
  setSavedPlayerPosition: (pos: [number, number, number]) => void;
  setMode: (mode: AppMode) => void;

  // 3D Compass & Floor Position HUD State
  cameraHeading: number; // 0 - 360 degrees
  playerElevation: number; // ground height in meters (0 on floor 1, 3.06 on floor 2)
  currentFloor: 1 | 2;
  setCameraHeading: (heading: number) => void;
  setPlayerElevation: (elevation: number) => void;

  // Teleport & Camera View
  teleportTarget: [number, number, number] | null;
  teleportTo: (pos: [number, number, number]) => void;
  clearTeleportTarget: () => void;
  isThirdPersonView: boolean;
  toggleThirdPersonView: () => void;

  // Multi-target interaction switching
  nearbyStations: StationId[];
  activeTargetIndex: number;
  setNearbyStations: (stations: StationId[]) => void;
  cycleInteractiveTarget: () => void;

  // Hands & Held Item Manipulation State
  heldItem: HeldItemType;
  setHeldItem: (item: HeldItemType) => void;

  // Personal protective equipment (PPE) state
  operatorPPE: OperatorPPE;
  setOperatorPPE: (ppe: Partial<OperatorPPE>) => void;
  toggleGlovesESD: () => void;
  setGogglesWavelength: (wavelength: string) => void;

  // UI state, Audio & Toast Feedback
  activeTab: InfoTab;
  soundEnabled: boolean;
  actionMessage: ActionToast | null;
  setActiveTab: (tab: InfoTab) => void;
  toggleSound: () => void;
  clearActionMessage: () => void;
  setActionMessage: (text: string, type?: 'info' | 'warning' | 'error' | 'success') => void;

  // Modals State
  isDesignModalOpen: boolean;
  openDesignModal: () => void;
  closeDesignModal: () => void;

  isSpecimenModalOpen: boolean;
  openSpecimenModal: () => void;
  closeSpecimenModal: () => void;

  isRationaleModalOpen: boolean;
  setRationaleModalOpen: (open: boolean) => void;

  isStatsVisible: boolean;
  toggleStats: () => void;
  setStatsVisible: (visible: boolean) => void;

  isHelpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
  toggleHelpModal: () => void;

  graphicsQuality: GraphicsQuality;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  cycleGraphicsQuality: () => void;
  targetFps: TargetFps;
  setTargetFps: (fps: TargetFps) => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  toggleSettingsModal: () => void;

  // 2nd Floor NPC & Station Modals State
  isNpcDialogOpen: boolean;
  npcCurrentTopic: string | null;
  npcDungPosition: [number, number, number];
  setNpcDungPosition: (pos: [number, number, number]) => void;
  openNpcDialog: () => void;
  closeNpcDialog: () => void;
  setNpcTopic: (topic: string | null) => void;

  isChemicalModalOpen: boolean;
  openChemicalModal: () => void;
  closeChemicalModal: () => void;

  isEquipmentModalOpen: boolean;
  openEquipmentModal: () => void;
  closeEquipmentModal: () => void;

  isSinkModalOpen: boolean;
  openSinkModal: () => void;
  closeSinkModal: () => void;

  isWorkbenchModalOpen: boolean;
  selectedWorkbenchId: string | null;
  openWorkbenchModal: (tableId?: string) => void;
  closeWorkbenchModal: () => void;

  // Phanulab Landing Page & Unified UI Close
  isLandingPageOpen: boolean;
  openLandingPage: () => void;
  closeLandingPage: () => void;
  closeActiveLabUI: () => boolean;

  // Knowledge Sidebar & Dock Visibility
  isKnowledgePanelCollapsed: boolean;
  toggleKnowledgePanelCollapsed: () => void;
  setKnowledgePanelCollapsed: (collapsed: boolean) => void;
  isMachineDockDismissed: boolean;
  dismissMachineDock: () => void;
  showMachineDock: () => void;
}

const HELD_ITEM_TOAST_MAP: Record<HeldItemType, string> = {
  NONE: '🐾 Đã cất dụng cụ — Đôi tay mèo cam ở trạng thái tự do',
  WORKPIECE: '⚙️ Đang cầm trên tay mèo: Mẫu phôi bánh răng cơ khí gia công laser',
  BEAKER: '🧪 Đang cầm trên tay mèo: Cốc đong chia vạch Borosilicate 250ml',
  TEST_TUBE: '🧬 Đang cầm trên tay mèo: Ống nghiệm thủy tinh quang phổ',
  PIPETTE: '💉 Đang cầm trên tay mèo: Ống hút định lượng Micropipette',
  CALIPER: '📏 Đang cầm trên tay mèo: Thước kẹp điện tử laser Caliper',
};

const exitPointerLockSafe = () => {
  try {
    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
  } catch {
    // Ignore pointer lock errors in headless/test environments
  }
};

const requestCanvasPointerLockSafe = () => {
  try {
    if (typeof document === 'undefined') return;
    const canvas = document.querySelector('canvas');
    if (canvas && typeof canvas.requestPointerLock === 'function') {
      const maybePromise = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    }
  } catch {
    // Ignore pointer lock errors in headless/test environments
  }
};

export const createPlayerAndUiSlice: StateCreator<LabState, [], [], PlayerAndUiSlice> = (
  set,
  get
) => ({
  // Navigation & Core State
  mode: 'WALKING',
  hoveredStationId: null,
  hoveredDistance: null,
  activeStationId: null,
  isPointerLocked: false,
  savedPlayerPosition: [...DEFAULT_PLAYER_POSITION],

  // 3D Compass & Floor State
  cameraHeading: 0,
  playerElevation: 0,
  currentFloor: 1,

  // UI, Audio & Toast
  activeTab: 'PHYSICS_PRINCIPLE',
  soundEnabled: true,
  actionMessage: null,

  // Teleport & Camera View
  teleportTarget: null,
  isThirdPersonView: false,

  // Multi-target interaction
  nearbyStations: [],
  activeTargetIndex: 0,

  // Hands, Held Item & PPE
  heldItem: 'NONE',
  operatorPPE: { ...INITIAL_OPERATOR_PPE },

  // Modals & Settings
  isDesignModalOpen: false,
  isSpecimenModalOpen: false,
  isRationaleModalOpen: false,
  isStatsVisible: false,
  isHelpModalOpen: false,
  graphicsQuality: getInitialGraphicsQuality(),
  targetFps: getInitialTargetFps(),
  isSettingsModalOpen: false,
  isNpcDialogOpen: false,
  npcCurrentTopic: null,
  npcDungPosition: [...DEFAULT_NPC_DUNG_POSITION],
  isChemicalModalOpen: false,
  isEquipmentModalOpen: false,
  isSinkModalOpen: false,
  isWorkbenchModalOpen: false,
  selectedWorkbenchId: null,
  isLandingPageOpen: true,
  isKnowledgePanelCollapsed: true,
  isMachineDockDismissed: false,

  setCameraHeading: (heading) => {
    const current = get().cameraHeading;
    if (Math.abs(current - heading) >= 1) {
      set({ cameraHeading: heading });
    }
  },

  setPlayerElevation: (elevation) => {
    const floor = elevation >= 1.8 ? 2 : 1;
    if (Math.abs(get().playerElevation - elevation) > 0.05 || get().currentFloor !== floor) {
      set({ playerElevation: elevation, currentFloor: floor });
    }
  },

  teleportTo: (pos) => {
    sound.playWhoosh();
    set({ teleportTarget: pos });
  },

  clearTeleportTarget: () => set({ teleportTarget: null }),

  toggleThirdPersonView: () => {
    sound.playClick();
    const next = !get().isThirdPersonView;
    set({
      isThirdPersonView: next,
      actionMessage: createActionToast(
        next
          ? 'Đã bật góc nhìn toàn thân Doraemon 3D [Phím 9]'
          : 'Đã quay lại góc nhìn thứ nhất (Tay Doraemon) [Phím 9]',
        'info'
      ),
    });
  },

  dismissMachineDock: () => {
    set({ isMachineDockDismissed: true });
    requestCanvasPointerLockSafe();
  },

  showMachineDock: () => set({ isMachineDockDismissed: false }),

  setNearbyStations: (stations) => {
    const prev = get().nearbyStations;
    const isSame = prev.length === stations.length && prev.every((v, i) => v === stations[i]);
    if (!isSame) {
      const currentHovered = get().hoveredStationId;
      let newIndex = 0;
      if (currentHovered && stations.includes(currentHovered)) {
        newIndex = stations.indexOf(currentHovered);
      } else {
        newIndex = stations.length > 0 ? Math.min(get().activeTargetIndex, stations.length - 1) : 0;
      }
      set({
        nearbyStations: stations,
        activeTargetIndex: newIndex,
        hoveredStationId: stations[newIndex] || null,
      });
    }
  },

  cycleInteractiveTarget: () => {
    const list = get().nearbyStations;
    if (list.length <= 1) return;
    sound.playClick();
    const nextIdx = (get().activeTargetIndex + 1) % list.length;
    set({
      activeTargetIndex: nextIdx,
      hoveredStationId: list[nextIdx],
    });
  },

  setHeldItem: (item) => {
    sound.playClick();
    set({
      heldItem: item,
      actionMessage: createActionToast(HELD_ITEM_TOAST_MAP[item], 'info'),
    });
  },

  setOperatorPPE: (ppe) =>
    set((state) => ({
      operatorPPE: { ...state.operatorPPE, ...ppe },
    })),

  toggleGlovesESD: () =>
    set((state) => ({
      operatorPPE: {
        ...state.operatorPPE,
        glovesESD: !state.operatorPPE.glovesESD,
      },
      actionMessage: createActionToast(
        !state.operatorPPE.glovesESD
          ? 'Đã chuyển sang Găng tay chống tĩnh điện ESD (Phòng sạch).'
          : 'Đã chuyển sang Găng tay chịu nhiệt Kevlar/Nomex.',
        'info'
      ),
    })),

  setGogglesWavelength: (wavelength) =>
    set((state) => ({
      operatorPPE: { ...state.operatorPPE, gogglesWavelength: wavelength },
    })),

  toggleStats: () => {
    sound.playClick();
    set({ isStatsVisible: !get().isStatsVisible });
  },

  setStatsVisible: (visible) => set({ isStatsVisible: visible }),

  openHelpModal: () => {
    sound.playClick();
    set({ isHelpModalOpen: true });
  },

  closeHelpModal: () => {
    sound.playClick();
    set({ isHelpModalOpen: false });
  },

  toggleHelpModal: () => {
    sound.playClick();
    set({ isHelpModalOpen: !get().isHelpModalOpen });
  },

  setGraphicsQuality: (quality) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('phanulab_graphics_quality', quality);
      }
    } catch {
      // ignore
    }
    const label =
      quality === 'LOW'
        ? '⚡ Mượt (Tối ưu cấu hình yếu)'
        : quality === 'MEDIUM'
        ? '⚖️ Cân bằng (Mặc định 60 FPS)'
        : '✨ Đồ họa cao (Đầy đủ hiệu ứng)';
    set({
      graphicsQuality: quality,
      actionMessage: createActionToast(`Đồ họa: ${label}`, 'info'),
    });
  },

  cycleGraphicsQuality: () => {
    sound.playClick();
    const current = get().graphicsQuality;
    const next: GraphicsQuality =
      current === 'LOW' ? 'MEDIUM' : current === 'MEDIUM' ? 'HIGH' : 'LOW';
    get().setGraphicsQuality(next);
  },

  setTargetFps: (fps) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('phanulab_target_fps', String(fps));
      }
    } catch {
      // ignore
    }
    set({
      targetFps: fps,
      actionMessage: createActionToast(
        `Khóa tốc độ: ${fps} FPS ${fps === 30 ? '(Tiết kiệm tải GPU)' : '(Mượt mà tiêu chuẩn)'}`,
        'info'
      ),
    });
  },

  openSettingsModal: () => {
    sound.playClick();
    exitPointerLockSafe();
    set({ isSettingsModalOpen: true });
  },

  closeSettingsModal: () => {
    sound.playClick();
    set({ isSettingsModalOpen: false });
  },

  toggleSettingsModal: () => {
    sound.playClick();
    const willOpen = !get().isSettingsModalOpen;
    if (willOpen) {
      exitPointerLockSafe();
    }
    set({ isSettingsModalOpen: willOpen });
  },

  setNpcDungPosition: (pos) => set({ npcDungPosition: pos }),

  openNpcDialog: () => {
    sound.playClick();
    exitPointerLockSafe();
    set({ isNpcDialogOpen: true, npcCurrentTopic: null });
  },

  closeNpcDialog: () => {
    sound.playClick();
    set({
      isNpcDialogOpen: false,
      npcCurrentTopic: null,
      hoveredStationId: null,
      hoveredDistance: null,
      activeStationId: null,
    });
  },

  setNpcTopic: (topic) => {
    sound.playClick();
    set({ npcCurrentTopic: topic });
  },

  openChemicalModal: () => {
    sound.playGlassClink();
    exitPointerLockSafe();
    set({ isChemicalModalOpen: true });
  },

  closeChemicalModal: () => {
    sound.playClick();
    set({ isChemicalModalOpen: false });
  },

  openEquipmentModal: () => {
    sound.playGlassClink();
    exitPointerLockSafe();
    set({ isEquipmentModalOpen: true });
  },

  closeEquipmentModal: () => {
    sound.playClick();
    set({ isEquipmentModalOpen: false });
  },

  openSinkModal: () => {
    sound.playClick();
    exitPointerLockSafe();
    set({ isSinkModalOpen: true });
  },

  closeSinkModal: () => {
    sound.playClick();
    if (get().isSinkTapRunning) {
      sound.stopWaterFlow();
    }
    set({ isSinkModalOpen: false, isSinkTapRunning: false });
  },

  openWorkbenchModal: (tableId) => {
    sound.playClick();
    exitPointerLockSafe();
    set({
      isWorkbenchModalOpen: true,
      selectedWorkbenchId: tableId || 'table_1',
    });
  },

  closeWorkbenchModal: () => {
    sound.playClick();
    set({
      isWorkbenchModalOpen: false,
      selectedWorkbenchId: null,
    });
    requestCanvasPointerLockSafe();
  },

  openLandingPage: () => {
    sound.playClick();
    exitPointerLockSafe();
    set({ isLandingPageOpen: true });
  },

  closeLandingPage: () => {
    sound.playRelayClick();
    set({ isLandingPageOpen: false });
    requestCanvasPointerLockSafe();
  },

  closeActiveLabUI: () => {
    const s = get();
    let hasClosed = false;

    const isAnyModalOpen =
      s.isRationaleModalOpen ||
      s.isNpcDialogOpen ||
      s.isChemicalModalOpen ||
      s.isEquipmentModalOpen ||
      s.isSinkModalOpen ||
      s.isWorkbenchModalOpen ||
      s.isDesignModalOpen ||
      s.isSpecimenModalOpen ||
      s.isHelpModalOpen ||
      s.isLandingPageOpen ||
      s.isSettingsModalOpen;

    if (isAnyModalOpen) {
      sound.playClick();
      set({
        isRationaleModalOpen: false,
        isNpcDialogOpen: false,
        npcCurrentTopic: null,
        isChemicalModalOpen: false,
        isEquipmentModalOpen: false,
        isSinkModalOpen: false,
        isWorkbenchModalOpen: false,
        selectedWorkbenchId: null,
        isDesignModalOpen: false,
        isSpecimenModalOpen: false,
        isHelpModalOpen: false,
        isLandingPageOpen: false,
        isSettingsModalOpen: false,
        hoveredStationId: null,
        hoveredDistance: null,
        activeStationId: null,
      });
      hasClosed = true;
    }

    if (s.mode === 'INSPECTING' || s.activeStationId !== null) {
      sound.playWhoosh();
      sound.stopLaserHum();
      set({
        mode: 'TRANSITIONING',
        activeStationId: null,
        isCuttingJob: false,
        isXRayMode: false,
        hoveredComponentId: null,
        hoveredStationId: null,
        hoveredDistance: null,
      });
      hasClosed = true;
    }

    s.dismissMachineDock();

    if (hasClosed) {
      requestCanvasPointerLockSafe();
    }

    return hasClosed;
  },

  toggleKnowledgePanelCollapsed: () => {
    sound.playClick();
    set((state) => ({ isKnowledgePanelCollapsed: !state.isKnowledgePanelCollapsed }));
  },

  setKnowledgePanelCollapsed: (collapsed) => {
    set({ isKnowledgePanelCollapsed: collapsed });
  },

  setHoveredStation: (id, distance = null) =>
    set({ hoveredStationId: id, hoveredDistance: distance }),

  setPointerLocked: (locked) => set({ isPointerLocked: locked }),

  enterInspection: (id) => {
    exitPointerLockSafe();
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
      isKnowledgePanelCollapsed: true,
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
      isKnowledgePanelCollapsed: true,
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

  toggleSound: () => {
    const willBeEnabled = !get().soundEnabled;
    if (!willBeEnabled) {
      sound.stopLaserHum();
    }
    set({ soundEnabled: willBeEnabled });
  },

  setSavedPlayerPosition: (pos) => set({ savedPlayerPosition: pos }),

  clearActionMessage: () => set({ actionMessage: null }),

  setActionMessage: (text, type = 'info') =>
    set({ actionMessage: createActionToast(text, type) }),

  openDesignModal: () => {
    sound.stopLaserHum();
    sound.playClick();
    set({ isDesignModalOpen: true });
  },

  closeDesignModal: () => {
    sound.playClick();
    set({ isDesignModalOpen: false });
  },

  openSpecimenModal: () => {
    sound.stopLaserHum();
    sound.playClick();
    set({ isSpecimenModalOpen: true, heldItem: 'WORKPIECE' });
  },

  closeSpecimenModal: () => {
    sound.playClick();
    set({ isSpecimenModalOpen: false });
  },

  setRationaleModalOpen: (open) => set({ isRationaleModalOpen: open }),
});
