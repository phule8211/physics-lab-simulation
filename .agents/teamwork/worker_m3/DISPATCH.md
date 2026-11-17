## 2026-11-05T05:19:45Z
You are worker_m3, a versatile worker agent responsible for Milestone 3 (State Synchronization and System Integration).
Your working directory is: d:/phanulab/.agents/teamwork/worker_m3/
You MUST read the original request at: d:/phanulab/.agents/teamwork/ORIGINAL_REQUEST.md
You MUST read the project architecture at: d:/phanulab/PROJECT.md
You MUST read the surveyor reports at:
- `d:/phanulab/.agents/teamwork/explorer_survey_1/handoff.md`
- `d:/phanulab/.agents/teamwork/worker_m1/handoff.md`
- `d:/phanulab/.agents/teamwork/worker_m2/handoff.md`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
You exclusively own:
- `src/types/lab.ts`
- `src/store/useLabStore.ts`
- `src/components/3d/CanvasContainer.tsx`
- `src/components/3d/PlayerController.tsx`
DO NOT modify any other files in the project.

Your mission:
Implement Milestone 3 (State Synchronization and System Integration) per R3:
1. `src/types/lab.ts`:
   - Extend `ProcessMode` to include `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'` alongside backwards-compatible aliases `'CUT' | 'ENGRAVE'`.
   - Add `OperatorPPE`: `{ gogglesWavelength: string; glovesESD: boolean; hardhat?: boolean; coatCleanroom?: boolean }`.
   - Add `ChillerStatus`: `'normal' | 'overheat'`.
2. `src/store/useLabStore.ts`:
   - Add all state variables specified in R3:
     * `processMode: ProcessMode` (initialized to `'through-cut'`)
     * `engravingDepthMap: Float32Array` (initialized to `new Float32Array(256 * 256)`)
     * `activeSpecimenMesh: any` (initialized to `null`)
     * `isPartDetached: boolean` (toggled via Space key, default `false`)
     * `chillerStatus: ChillerStatus` (initialized to `'normal'`)
     * `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }` (initialized to `{ gogglesWavelength: '10600nm', glovesESD: true }`)
   - Add and export actions:
     * `setProcessMode: (mode: ProcessMode) => void`
     * `setEngravingDepthMap: (depthMap: Float32Array) => void`
     * `setActiveSpecimenMesh: (mesh: any) => void`
     * `setChillerStatus: (status: ChillerStatus) => void`
     * `toggleChillerStatus: () => void`
     * `setOperatorPPE: (ppe: Partial<OperatorPPE>) => void`
     * `toggleGlovesESD: () => void`
     * Ensure `togglePartDetached` and `setPartDetached` are present, correctly typed, and toggle `isPartDetached`.
3. `src/components/3d/CanvasContainer.tsx`:
   - Mount the newly created R2 components in the 3D Canvas scene graph:
     * `<IndustrialAuxiliaryProps />` from `src/components/3d/props/IndustrialAuxiliaryProps`
     * `<LabEngineerNPC position={[3.6, 0, 3.2]} rotation={[0, -Math.PI / 3, 0]} />` from `src/components/3d/characters/LabEngineerNPC`
     * `<SafetyGearVisualizer />` from `src/components/3d/characters/SafetyGearVisualizer`
     * `<OperatorHandsHUD />` from `src/components/3d/characters/OperatorHandsHUD`
4. `src/components/3d/PlayerController.tsx`:
   - Wire keyboard interactions:
     * Key `O`: calls `toggleLid()`.
     * Key `G`: calls `openSpecimenModal()`.
     * Key `Space`: Contextual handling! When inspecting (`mode === 'INSPECTING'` or `isSpecimenModalOpen`), pressing `Space` must call `togglePartDetached()` and prevent player jump (`e.preventDefault()`). When in standard `WALKING` mode, `Space` allows normal jumping.

Verification:
- Run `npx tsc --noEmit` and `npm run build` using `run_command`. Ensure zero errors.
- Document commands and results in `d:/phanulab/.agents/teamwork/worker_m3/handoff.md`.
- Send message back to parent when complete.
