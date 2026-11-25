import { create } from 'zustand';
import type {
  ChillerStatus,
  GraphicsQuality,
  MachineId,
  OperatorPPE,
  ProcessMode,
  StationId,
  TargetFps,
} from '../types/lab';
import {
  type ActionToast,
  type HeldItemType,
  playerWorldState,
} from './initialState';
import { createMachineSlice, type MachineSlice } from './slices/machineSlice';
import { createPhysicsSlice, type PhysicsSlice } from './slices/physicsSlice';
import { createChemistrySlice, type ChemistrySlice } from './slices/chemistrySlice';
import { createSpecimenSlice, type SpecimenSlice } from './slices/specimenSlice';
import { createPlayerAndUiSlice, type PlayerAndUiSlice } from './slices/playerAndUiSlice';

export type {
  StationId,
  MachineId,
  GraphicsQuality,
  TargetFps,
  ProcessMode,
  OperatorPPE,
  ChillerStatus,
  ActionToast,
  HeldItemType,
  MachineSlice,
  PhysicsSlice,
  ChemistrySlice,
  SpecimenSlice,
  PlayerAndUiSlice,
};

export { playerWorldState };

/** Unified global Zustand state composed from domain slices. */
export type LabState = MachineSlice &
  PhysicsSlice &
  ChemistrySlice &
  SpecimenSlice &
  PlayerAndUiSlice;

/**
 * Primary simulation store combining machine hardware, physics/material models,
 * wet chemistry & spray coating, specimen inspection, and player/UI state.
 */
export const useLabStore = create<LabState>()((...a) => ({
  ...createMachineSlice(...a),
  ...createPhysicsSlice(...a),
  ...createChemistrySlice(...a),
  ...createSpecimenSlice(...a),
  ...createPlayerAndUiSlice(...a),
}));
