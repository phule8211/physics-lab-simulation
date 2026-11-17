# BRIEFING — 2026-11-05T05:03:45Z

## Mission
Survey the codebase for 3D Characters, Industrial Props, and Interactive Specimens (R2 & R3).

## 🔒 My Identity
- Archetype: explorer
- Roles: Teamwork explorer
- Working directory: d:/phanulab/.agents/teamwork/explorer_survey_3/
- Original parent: c9a4ec97-11e1-47a5-aac1-b3c644c5caa1
- Milestone: Survey & Architecture Discovery (R2 & R3)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Draw call budget constraint (< 100 Draw Calls) and grouping repetitive static props into at most 8 THREE.InstancedMesh groups
- Accurate investigation of existing 3D components and state management
- Write final handoff to handoff.md and send message to parent

## Current Parent
- Conversation ID: c9a4ec97-11e1-47a5-aac1-b3c644c5caa1
- Updated: 2026-11-05T05:00:00Z

## Investigation State
- **Explored paths**:
  - `src/App.tsx` & `src/main.tsx`
  - `src/components/3d/CanvasContainer.tsx`
  - `src/components/3d/WorkshopEnvironment.tsx`
  - `src/components/3d/fallbacks/ProceduralMachineBox.tsx`
  - `src/components/3d/fallbacks/SprayCoatingBooth.tsx`
  - `src/components/3d/PlayerController.tsx`
  - `src/components/3d/CollisionManager.ts`
  - `src/hooks/useKeyboardControls.ts`
  - `src/components/ui/SpecimenInspectionModal.tsx`
  - `src/components/ui/CrosshairHUD.tsx`
  - `src/components/ui/MachineControlOverlay.tsx`
  - `src/store/useLabStore.ts`
  - `src/types/lab.ts`
  - `src/data/materialsConfig.ts`, `src/data/labConfig.ts`, `src/data/coatingFinishes.ts`, `src/data/vectorDesigns.ts`
- **Key findings**:
  - No existing character, prop, or specimen components exist yet in `src/components/3d/characters/`, `src/components/3d/props/`, or `src/components/3d/specimens/`.
  - The 3D scene in `CanvasContainer.tsx` mounts `<WorkshopEnvironment />`, `<ProceduralStation />`, `<PlayerController />`, and `<PostProcessingEffects />`.
  - Machine workstations currently render simplified placeholder geometries for workpieces rather than modular two-part meshes.
  - `SpecimenInspectionModal.tsx` has a prototype `buildCutoutMeshes` using `THREE.ExtrudeGeometry` for part/plate, but it's only in 2D modal sub-canvas.
  - Draw call constraint (<100 draw calls) requires grouping repetitive static props into at most 8 `THREE.InstancedMesh` groups (cylinders, warning signs, E-stops, workbenches, specimen trays, duct flanges, calipers, microscopes).
  - Keybinding conflict identified: `Space` is currently bound to jump in `WALKING` mode; needs contextual handling for detaching specimens when inspecting or near machines.
- **Unexplored areas**: None. Codebase survey complete.

## Key Decisions Made
- Architected exact instanced mesh groupings to guarantee < 100 draw calls.
- Designed procedural, asset-free 3D models for characters, props, and specimens ensuring 100% offline reliability.
- Formulated clean extension plan for `useLabStore.ts` and `lab.ts` matching R3 requirements.

## Artifact Index
- handoff.md — Final comprehensive 5-component handoff report
- progress.md — Heartbeat and step tracking
- DISPATCH.md — Received dispatches
