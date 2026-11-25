import type { StateCreator } from 'zustand';
import type { ProcessMode } from '../../types/lab';
import type { LabState } from '../useLabStore';
import { MATERIALS_CATALOG, MaterialType } from '../../data/materialsConfig';
import { sound } from '../../utils/audioSystem';
import { getRecommendedParameters } from '../../utils/laserPhysicsEngine';
import { createActionToast, createInitialEngravingDepthMap } from '../initialState';

/**
 * Store slice covering active material, laser processing mode,
 * real-time ablation/engraving heightmap buffer, and recommended physics parameter lookup.
 */
export interface PhysicsSlice {
  selectedMaterial: MaterialType;
  setSelectedMaterial: (material: MaterialType) => void;

  // Laser Processing Mode: Through Cut, Surface Engrave, Color Annealing, Relief 2.5D
  processMode: ProcessMode & any;
  setProcessMode: (mode: ProcessMode) => void;

  // Real-time engraving depth map buffer (256x256 float values)
  engravingDepthMap: Float32Array;
  setEngravingDepthMap: (depthMap: Float32Array) => void;
  resetEngravingDepthMap: () => void;

  // Apply physically optimal (P, v, f) preset for active machine + material + processMode
  applyRecommendedParameters: () => void;
}

export const createPhysicsSlice: StateCreator<LabState, [], [], PhysicsSlice> = (set, get) => ({
  selectedMaterial: 'WOOD',
  processMode: 'through-cut',
  engravingDepthMap: createInitialEngravingDepthMap(),

  setSelectedMaterial: (material) => {
    sound.playMaterialPlaceSound();
    const item = MATERIALS_CATALOG[material];
    const machineId = get().activeStationId || 'CO2_LASER';
    const mode = get().processMode;
    const rec = getRecommendedParameters(machineId, material, mode);

    set({
      selectedMaterial: material,
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      actionMessage: createActionToast(
        `Đã nạp phôi: ${item.name}! 💡 Khuyến nghị ${rec.standardScenarioCode}: P = ${rec.powerWatts}W, v = ${rec.speedMmS}mm/s, f = ${rec.frequencyKhz}kHz. Bấm "Áp Dụng Chuẩn" trên thanh thông số.`,
        'success'
      ),
    });
  },

  setProcessMode: (mode) => {
    sound.playClick();
    const text =
      mode === 'through-cut' || mode === 'CUT'
        ? 'Chế độ: CẮT XUYÊN PHÔI (Through Cut). Công suất cao cắt đứt rời chi tiết khỏi tấm.'
        : mode === 'color-annealing'
        ? 'Chế độ: LÊN MÀU NHIỆT (Color Annealing). Màng oxit giao thoa ánh sáng không biến dạng phôi.'
        : mode === 'relief-2.5d'
        ? 'Chế độ: KHẮC NỔI 2.5D (Relief Engrave). Ăn mòn bóc tách đa lớp theo bản đồ độ sâu.'
        : 'Chế độ: KHẮC BỀ MẶT (Surface Engrave). Công suất thấp chỉ khắc hoa văn nông trên mặt tấm.';

    set({
      processMode: mode,
      isPartDetached: false,
      actionMessage: createActionToast(text, 'info'),
    });
  },

  setEngravingDepthMap: (depthMap) => set({ engravingDepthMap: depthMap }),

  resetEngravingDepthMap: () => set({ engravingDepthMap: createInitialEngravingDepthMap() }),

  applyRecommendedParameters: () => {
    const machineId = get().activeStationId || 'CO2_LASER';
    const material = get().selectedMaterial;
    const mode = get().processMode;
    const rec = getRecommendedParameters(machineId, material, mode);
    sound.playClick();
    set({
      laserPowerWatts: rec.powerWatts,
      scanSpeedMmS: rec.speedMmS,
      pulseFrequencyKhz: rec.frequencyKhz,
      actionMessage: createActionToast(
        `ĐÃ ÁP DỤNG THÔNG SỐ CHUẨN: P = ${rec.powerWatts}W, v = ${rec.speedMmS}mm/s, f = ${rec.frequencyKhz}kHz (${rec.standardScenarioCode}).`,
        'success'
      ),
    });
  },
});
