import type { StateCreator } from 'zustand';
import type { CoatingFinishId } from '../../types/lab';
import type { LabState } from '../useLabStore';
import { COATING_FINISHES } from '../../data/coatingFinishes';
import { sound } from '../../utils/audioSystem';
import {
  ChemicalBeakerState,
  CollectedEquipmentState,
  INITIAL_CHEMICAL_BEAKER,
  INITIAL_COLLECTED_EQUIPMENT,
  createActionToast,
} from '../initialState';

/**
 * Store slice managing chemical reagents, glassware rack, laboratory sink/faucet,
 * and spray coating / UV curing surface finishing workflows.
 */
export interface ChemistrySlice {
  // Chemical Reagent Station (HCl, HNO3, H2O2 & Large Beakers)
  chemicalBeaker: ChemicalBeakerState;
  addChemicalToTestBeaker: (type: 'HCl' | 'HNO3' | 'H2O2' | 'WATER', amount: number) => void;
  resetChemicalBeaker: () => void;

  // Lab Glassware & Equipment Rack
  collectedEquipment: CollectedEquipmentState;
  takeEquipmentItem: (type: 'BEAKER' | 'TEST_TUBE' | 'PIPETTE') => void;

  // Laboratory Water Sink & Gooseneck Faucet
  sinkWaterFlowRate: number; // 0 - 100%
  isSinkTapRunning: boolean;
  setSinkWaterFlowRate: (rate: number) => void;
  toggleSinkTap: () => void;
  dispenseWaterIntoBeaker: (amount: number) => void;

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
}

export const createChemistrySlice: StateCreator<LabState, [], [], ChemistrySlice> = (set, get) => ({
  chemicalBeaker: { ...INITIAL_CHEMICAL_BEAKER },
  collectedEquipment: { ...INITIAL_COLLECTED_EQUIPMENT },

  sinkWaterFlowRate: 50,
  isSinkTapRunning: false,

  selectedCoatingFinish: 'CLEAR_GLOSS',
  coatingCoverage: 0,
  curingProgress: 0,
  isSpraying: false,
  isCuring: false,
  isTurntableRotating: true,

  addChemicalToTestBeaker: (type, amount) => {
    const beaker = get().chemicalBeaker;
    const currentTotal = beaker.hcl + beaker.hno3 + beaker.h2o2 + beaker.water;
    const allowed = Math.min(amount, beaker.capacity - currentTotal);
    if (allowed <= 0) return;

    sound.playLiquidPour();
    const updated = { ...beaker };
    if (type === 'HCl') updated.hcl += allowed;
    else if (type === 'HNO3') updated.hno3 += allowed;
    else if (type === 'H2O2') updated.h2o2 += allowed;
    else if (type === 'WATER') updated.water += allowed;

    set({ chemicalBeaker: updated });
  },

  resetChemicalBeaker: () => {
    sound.playClick();
    set({ chemicalBeaker: { ...INITIAL_CHEMICAL_BEAKER } });
  },

  takeEquipmentItem: (type) => {
    sound.playGlassClink();
    const current = get().collectedEquipment;
    if (type === 'BEAKER') {
      set({ collectedEquipment: { ...current, beakers: current.beakers + 1 }, heldItem: 'BEAKER' });
    } else if (type === 'TEST_TUBE') {
      set({
        collectedEquipment: { ...current, testTubes: current.testTubes + 1 },
        heldItem: 'TEST_TUBE',
      });
    } else if (type === 'PIPETTE') {
      set({
        collectedEquipment: { ...current, pipettes: current.pipettes + 1 },
        heldItem: 'PIPETTE',
      });
    }
  },

  setSinkWaterFlowRate: (rate) => {
    set({ sinkWaterFlowRate: Math.max(0, Math.min(100, rate)) });
    if (get().isSinkTapRunning) {
      sound.stopWaterFlow();
      sound.startWaterFlow(rate / 100);
    }
  },

  toggleSinkTap: () => {
    const willBeRunning = !get().isSinkTapRunning;
    if (willBeRunning) {
      sound.startWaterFlow(get().sinkWaterFlowRate / 100);
    } else {
      sound.stopWaterFlow();
    }
    set({ isSinkTapRunning: willBeRunning });
  },

  dispenseWaterIntoBeaker: (amount) => {
    sound.startWaterFlow(get().sinkWaterFlowRate / 100);
    setTimeout(() => {
      sound.stopWaterFlow();
      get().addChemicalToTestBeaker('WATER', amount);
    }, 600);
  },

  setSelectedCoatingFinish: (finish) => {
    sound.playClick();
    const conf = COATING_FINISHES[finish];
    set({
      selectedCoatingFinish: finish,
      curingProgress: 0,
      actionMessage: createActionToast(
        `Đã nạp sơn vào bình: ${conf.name} (${conf.glossUnit})`,
        'info'
      ),
    });
  },

  startSpraying: () => {
    sound.startSpraySound();
    set({ isSpraying: true, isKnowledgePanelCollapsed: true });
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
        actionMessage: createActionToast(
          'HOÀN THÀNH PHỦ SƠN: Màng sơn đã phủ đều 100% bề mặt! Hãy bật sấy quang hóa UV/Hồng ngoại.',
          'success'
        ),
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
      isKnowledgePanelCollapsed: true,
      actionMessage: createActionToast(
        'Đang kích hoạt dàn đèn sấy quang hóa UV (395nm) & Hồng ngoại sấy khô bề mặt...',
        'info'
      ),
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
        actionMessage: createActionToast(
          'SẤY HOÀN TẤT: Màng sơn đã polyme hóa đóng rắn 100% đạt độ bóng và độ cứng tối đa!',
          'success'
        ),
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
      actionMessage: createActionToast(
        'Đã tẩy sạch lớp sơn, đưa mẫu vật trở về trạng thái phôi nguyên bản.',
        'info'
      ),
    });
  },

  toggleTurntable: () => {
    sound.playClick();
    set({ isTurntableRotating: !get().isTurntableRotating });
  },
});
