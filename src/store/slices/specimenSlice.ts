import type { StateCreator } from 'zustand';
import type { ProcessedJobInfo } from '../../types/lab';
import type { LabState } from '../useLabStore';
import { sound } from '../../utils/audioSystem';
import { createActionToast, createInitialEngravingDepthMap } from '../initialState';

/**
 * Store slice managing specimen meshes, processed job inspection snapshots,
 * machined part detachment inspection state, and workpiece resets.
 */
export interface SpecimenSlice {
  // Active 3D specimen mesh reference for inspection and manipulation
  activeSpecimenMesh: any;
  setActiveSpecimenMesh: (mesh: any) => void;

  // Finished Specimen detachment state
  isPartDetached: boolean;
  togglePartDetached: () => void;
  setPartDetached: (detached: boolean) => void;

  // Reset workpiece to un-machined blank stock
  resetWorkpiece: () => void;

  // Last Processed Job Snapshot (Guarantees 100% state accuracy in Inspection Modal)
  lastProcessedJob: ProcessedJobInfo | null;
}

export const createSpecimenSlice: StateCreator<LabState, [], [], SpecimenSlice> = (set, get) => ({
  activeSpecimenMesh: null,
  isPartDetached: false,
  lastProcessedJob: null,

  setActiveSpecimenMesh: (mesh) => set({ activeSpecimenMesh: mesh }),

  togglePartDetached: () => {
    const next = !get().isPartDetached;
    if (next) {
      const job = get().lastProcessedJob;
      if (job && job.processMode === 'CUT' && !job.isCutThrough) {
        sound.playInterlockTripSound();
        set({
          actionMessage: createActionToast(
            `KHÔNG THỂ NHẤC RỜI: Vết cắt chưa đứt phôi (độ sâu ${job.actualDepthMm}mm / ${job.targetThicknessMm}mm - ${job.cutThroughPercentage}%)! Chi tiết bị dính kẹt trong phôi. Tăng P hoặc giảm v để cắt xuyên.`,
            'warning'
          ),
        });
        return;
      }
      sound.playRelayClick();
    } else {
      sound.playMaterialPlaceSound();
    }
    set({
      isPartDetached: next,
      actionMessage: createActionToast(
        next
          ? 'Đã nhấc rời chi tiết cắt khỏi tấm phôi [Space]. Bạn có thể xoay 360° để kiểm tra rãnh cắt!'
          : 'Đã lắp chi tiết trở lại khít vào tấm phôi [Space].',
        'info'
      ),
    });
  },

  setPartDetached: (detached) => set({ isPartDetached: detached }),

  resetWorkpiece: () => {
    sound.playMaterialPlaceSound();
    set({
      cutProgress: 0,
      isCuttingJob: false,
      isPartDetached: false,
      isSpecimenModalOpen: false,
      engravingDepthMap: createInitialEngravingDepthMap(),
      actionMessage: createActionToast('Đã nạp phôi mới chưa cắt vào bàn làm việc.', 'info'),
    });
  },
});
