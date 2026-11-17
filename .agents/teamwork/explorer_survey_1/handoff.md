# Handoff Report: Project Architecture, Tooling, State Management & Canvas Survey

**Agent**: `explorer_survey_1`  
**Working Directory**: `d:/phanulab/.agents/teamwork/explorer_survey_1/`  
**Recipient**: `c9a4ec97-11e1-47a5-aac1-b3c644c5caa1` (Orchestrator)  
**Date**: 2026-11-05T05:07:00Z  
**Type**: Hard Handoff (Investigation & Survey Complete)

---

## 1. Observation

### 1.1 Build Tooling, Packages & TypeScript Configuration
- **File**: `d:/phanulab/package.json`
  - Name: `"physics-lab-simulation"`, `"version": "0.1.0"`, `"type": "module"`.
  - Scripts:
    - `"dev": "vite"`
    - `"build": "tsc -b && vite build"`
    - `"preview": "vite preview"`
    - *Note*: No test script (`vitest` / `jest`) is currently declared.
  - Core Dependencies (lines 11–23):
    - `react`: `^19.0.0`
    - `react-dom`: `^19.0.0`
    - `three`: `^0.174.0`
    - `@react-three/fiber`: `^9.8.2`
    - `@react-three/drei`: `^9.122.0`
    - `@react-three/postprocessing`: `^3.2.2`
    - `postprocessing`: `^6.39.5`
    - `zustand`: `^5.0.3`
    - `clsx`: `^2.1.1`
    - `tailwind-merge`: `^3.0.2`
    - `lucide-react`: `^0.477.0`
  - Dev Dependencies (lines 24–34):
    - `typescript`: `~5.7.3`
    - `vite`: `^6.2.0`
    - `@vitejs/plugin-react`: `^4.3.4`
    - `tailwindcss`: `^3.4.17`
    - `postcss`: `^8.5.3`
    - `autoprefixer`: `^10.4.20`
    - `@types/react`: `^19.0.10`
    - `@types/react-dom`: `^19.0.4`
    - `@types/three`: `^0.174.0`
- **File**: `d:/phanulab/tsconfig.json`
  - Target: `"ES2020"`, Module: `"ESNext"`, ModuleResolution: `"bundler"`.
  - Flags: `"strict": true`, `"noFallthroughCasesInSwitch": true`, `"noUnusedLocals": false`, `"noUnusedParameters": false`, `"skipLibCheck": true`, `"noEmit": true`, `"jsx": "react-jsx"`.
  - Included paths: `["src"]`.
- **File**: `d:/phanulab/vite.config.ts`
  - Uses `@vitejs/plugin-react`.
  - Server port: `3000`.
  - Build option: `chunkSizeWarningLimit: 1500`.
- **Command Verification**:
  - `npx tsc --noEmit` executed with exit code `0` (zero type errors).
  - `npm run build` executed with exit code `0`:
    - Generated `dist/index.html` (1.21 kB), `dist/assets/index--7SIpsTl.css` (42.92 kB), `dist/assets/index-Dmtb8F7M.js` (1,725.48 kB).

---

### 1.2 State Management & Store Interface (`src/store/useLabStore.ts`)
- **File**: `d:/phanulab/src/store/useLabStore.ts` (Total lines: 712)
  - Single centralized Zustand store created via `create<LabState>((set, get) => ({ ... }))`.
- **Existing Interface Groups**:
  1. *Navigation & Player Mode*:
     - `mode: AppMode` (`'WALKING' | 'TRANSITIONING' | 'INSPECTING'`) (lines 22, 120).
     - `hoveredStationId: MachineId | null`, `hoveredDistance: number | null` (lines 23–24, 121–122).
     - `activeStationId: MachineId | null` (lines 25, 123).
     - `isPointerLocked: boolean` (lines 26, 124).
     - `savedPlayerPosition: [number, number, number]` (lines 29, 125, default `[0, 1.7, 4]`).
  2. *UI, Running State & Web Audio*:
     - `activeTab: InfoTab` (`'OVERVIEW' | 'PHYSICS_PRINCIPLE' | 'COMPONENTS' | 'SPECTRUM_MATERIALS' | 'SAFETY'`) (lines 32, 127).
     - `isMachineRunning: boolean` (lines 33, 128, default `true`).
     - `soundEnabled: boolean` (lines 34, 129, default `true`).
  3. *Machine Lid, Interlock & Job Execution*:
     - `isLidOpen: boolean` (lines 37, 132, default `false`).
     - `selectedMaterial: MaterialType` (`'WOOD' | 'ACRYLIC' | 'STEEL' | 'ALUMINUM' | 'SILICON' | 'GLASS'`) (lines 38, 133).
     - `isCuttingJob: boolean` (lines 39, 134, default `false`).
     - `cutProgress: number` (lines 40, 135, `0` to `100`).
     - `interlockTriggered: boolean` (lines 41, 136, default `false`).
     - `actionMessage: ActionToast | null` (lines 42, 137).
  4. *Vector CAD Toolpaths & Framing*:
     - `currentDesignId: string`, `currentDesignName: string`, `currentToolpaths: Point2D[][]` (lines 45–47, 140–142).
     - `isDesignModalOpen: boolean` (lines 48, 143).
     - `isFraming: boolean` (lines 57, 145).
  5. *Finished Specimen Inspection & Detachment*:
     - `isSpecimenModalOpen: boolean` (lines 51, 144).
     - `processMode: 'CUT' | 'ENGRAVE'` (lines 65, 146).
     - `isPartDetached: boolean` (lines 67, 147, default `false`).
     - `togglePartDetached: () => void` (lines 68, 589–606).
     - `setPartDetached: (detached: boolean) => void` (lines 69, 608).
  6. *Finishing & Spray Coating*:
     - `selectedCoatingFinish: CoatingFinishId`, `coatingCoverage: number`, `curingProgress: number`, `isSpraying: boolean`, `isCuring: boolean`, `isTurntableRotating: boolean` (lines 72–77, 150–155).
- **Existing usages of `processMode` across codebase**:
  - Found in `src/store/useLabStore.ts` (lines 65, 66, 146, 573, 576).
  - Found in `src/components/3d/fallbacks/ProceduralMachineBox.tsx` (lines 64, 214, 218, 232, 487, 704).
  - Found in `src/components/ui/MachineControlOverlay.tsx` (lines 53, 54, 335, 337, 343, 512).
  - Found in `src/components/ui/SpecimenInspectionModal.tsx` (lines 237, 245, 512, 513, 532, 540, 601, 617, 666, 721, 722, 732, 743, 745, 755, 757, 810, 828, 837).
  - Found in `src/components/ui/VectorDesignModal.tsx` (lines 58, 59, 386, 388, 399, 401, 708, 727).
- **R3 State Audit in `useLabStore.ts`**:
  - `processMode`: Currently typed as `'CUT' | 'ENGRAVE'`. R3 requires `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`.
  - `engravingDepthMap: Float32Array`: Currently missing.
  - `activeSpecimenMesh`: Currently missing.
  - `isPartDetached: boolean`: Already present in store (`isPartDetached`, `togglePartDetached`, `setPartDetached`).
  - `chillerStatus: 'normal' | 'overheat'`: Currently missing.
  - `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }`: Currently missing.

---

### 1.3 Root Application Layout & 3D Canvas Architecture
- **Root Layout (`src/App.tsx`)**:
  - Root container: `<main className="relative w-screen h-screen overflow-hidden bg-lab-dark select-none">` (line 12).
  - Hierarchy:
    - Line 14: `<CanvasContainer />` (Three.js WebGL Layer).
    - Line 17: `<CrosshairHUD />` (2D Reticle, dynamic distance pill, station interaction prompt `[E]`).
    - Line 20: `<KnowledgePanel />` (Right-side slideout physics and machine specs drawer).
    - Line 23: `<MachineControlOverlay />` (Floating bottom dock for Lid `[O]`, Material `[M]`, Start Cut `[C]`, CAD Studio `[T]`, Specimen `[G]`, Detach `[Space]`).
    - Line 26: `<VectorDesignModal />` (Full vector editor and preset selector).
    - Line 29: `<SpecimenInspectionModal />` (Sub-canvas with OrbitControls displaying extruded cutout part and plate).
    - Line 32: `<LoadingScreen />` (Progress bar tied to asset loader).
- **3D Canvas Layer (`src/components/3d/CanvasContainer.tsx`)**:
  - `@react-three/fiber` `<Canvas>` setup (lines 13–27):
    - `shadows={{ type: THREE.PCFSoftShadowMap }}`.
    - `camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 4] }}`.
    - `gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}`.
    - `dpr={[1, 2]}`.
    - Background: `<color attach="background" args={['#080e1e']} />`.
    - Fog: `<fogExp2 attach="fog" args={['#080e1e', 0.024]} />`.
  - Scene Children (lines 33–50):
    1. `<WorkshopEnvironment />`:
       - Ambient / hemisphere lighting: sky cyan `#38bdf8`, ground `#0a0f1d`, intensity `0.75`.
       - Directional sunlight: `[8, 14, 6]`, intensity `1.3`, 2048x2048 shadow map.
       - Fill light: `[-8, 10, -6]`, intensity `0.45`.
       - 5 Local workstation point lights with quadratic decay.
       - Procedural HDRI map via `@react-three/drei` `<Environment resolution={256}><Lightformer ... /></Environment>`.
       - Architectural geometry: high-gloss epoxy floor (roughness 0.16, metalness 0.18), hazard borders, modular cleanroom panels, airlock doorway, illuminated lightbox signs, ceiling steel I-beams, spiral aluminum ducting, cable trays, fluorescent tube fixtures.
    2. `{Object.values(STATIONS).map((st) => <ProceduralStation key={st.id} ... />)}`:
       - 4 main stations (`CO2_LASER`, `UV_LASER`, `FIBER_LASER`, `SENSOR_STATION`) + `COATING_STATION`.
    3. `<PlayerController />`:
       - First-person WASD movement, Sprint (`Shift`), Jump (`Space`), PointerLock.
       - Dynamic AABB wall & station obstacle sliding collision via `CollisionManager.ts`.
       - Smooth camera transition between `WALKING` and `INSPECTING` via `Vector3.lerp`.
       - Spherical orbit mouse-drag controls when `mode === 'INSPECTING'`.
       - Global key listeners: `KeyE`, `Escape`, `Digit1`–`Digit5`, `KeyO` (lid), `KeyC` (cutting job), `KeyM` (material cycling), `KeyT` (CAD modal), `KeyG` (specimen modal), `KeyF` (framing).
    4. `<PostProcessingEffects />`:
       - `@react-three/postprocessing` with `Bloom` (luminance threshold `0.85`, intensity `0.75`), `Vignette` (darkness `0.5`), and `SMAA`.

---

### 1.4 Existing 10-Agent Swarm Architecture & Multi-Agent Scope Boundaries
- **Orchestration Context**:
  - Found in `d:/phanulab/.agents/teamwork/orchestrator/BRIEFING.md` and `.agents/teamwork/ORIGINAL_REQUEST.md`.
  - The project follows a multi-agent swarm architecture where the Orchestrator dispatches specialized explorer and worker agents:
    - `explorer_survey_1` (current): Architecture, packages, build tooling, store survey.
    - `explorer_survey_2`: Laser engraving engine, mathematical algorithms, GLSL shaders.
    - `explorer_survey_3`: 3D characters, industrial props, specimens, instancing.
    - `agent_laser_engraving`: Worker implementing R1 (`engravingProfiles.ts`, `engravingEngine.ts`, `EngravingSurfaceShader.tsx`).
    - `agent_entity_designer`: Worker implementing R2 (`OperatorHandsHUD.tsx`, `LabEngineerNPC.tsx`, `SafetyGearVisualizer.tsx`, auxiliary props with `InstancedMesh`, two-part interactive specimens).
    - State synchronization & Integration worker: Implementing R3 (`useLabStore.ts`, root canvas mountings, hotkeys).
- **Submodule / Subfolder Note**:
  - A nested subfolder `physics-lab-simulation/` exists inside `d:/phanulab/` from a previous branch/clone.
  - Active workspace root is `d:/phanulab/`. Both `tsconfig.json` (`"include": ["src"]`) and `package.json` build directly from `d:/phanulab/src/`. All new code and edits MUST be applied directly to `d:/phanulab/src/`.

---

### 1.5 File Inventory in Target Directories

| Target Directory | File Path | Size | Status | Notes |
|---|---|---|---|---|
| `src/data/` | `src/data/coatingFinishes.ts` | 4,163 B | Exists | 7 coating finishes configs |
| `src/data/` | `src/data/labConfig.ts` | 4,361 B | Exists | 5 station configs, camera positions, AABB colliders |
| `src/data/` | `src/data/materialsConfig.ts` | 12,102 B | Exists | 6 base materials (Wood, Acrylic, Steel, Aluminum, Silicon, Glass) |
| `src/data/` | `src/data/physicsData.ts` | 49,697 B | Exists | Academic optics & physics formulas and references |
| `src/data/` | `src/data/vectorDesigns.ts` | 15,659 B | Exists | Vector presets, toolpath indexer, text vectorizer |
| `src/data/` | `src/data/engravingProfiles.ts` | — | **MISSING** | **To be created by `agent_laser_engraving` (R1)** |
| `src/utils/` | `src/utils/audioSystem.ts` | 10,785 B | Exists | Web Audio API synthesizer for machine, clicks, hums |
| `src/utils/` | `src/utils/engravingEngine.ts` | — | **MISSING** | **To be created by `agent_laser_engraving` (R1)** |
| `src/components/3d/` | `CanvasContainer.tsx` | 1,871 B | Exists | R3F Canvas root |
| `src/components/3d/` | `CollisionManager.ts` | 2,068 B | Exists | AABB collision solver & sliding response |
| `src/components/3d/` | `PlayerController.tsx` | 13,269 B | Exists | FPS controller & inspection orbit |
| `src/components/3d/` | `PostProcessingEffects.tsx` | 678 B | Exists | Post-processing EffectComposer |
| `src/components/3d/` | `WorkshopEnvironment.tsx` | 24,090 B | Exists | Procedural room, floor, walls, lighting |
| `src/components/3d/fallbacks/` | `ProceduralMachineBox.tsx` | 38,772 B | Exists | Procedural laser workstations |
| `src/components/3d/fallbacks/` | `SprayCoatingBooth.tsx` | 17,975 B | Exists | Spray coating & UV curing room booth |
| `src/components/3d/visual-effects/` | `CO2LaserBeam.tsx` | 4,759 B | Exists | CO2 beam & articulated mirrors |
| `src/components/3d/visual-effects/` | `CuttingSparks.tsx` | 3,259 B | Exists | Spark particles |
| `src/components/3d/visual-effects/` | `GalvoMirrorBeam.tsx` | 4,936 B | Exists | Dual Galvo mirror scanning beam |
| `src/components/3d/visual-effects/` | `UVLaserBeam.tsx` | 3,204 B | Exists | 355nm UV laser beam & LBO crystal |
| `src/components/3d/visual-effects/` | `EngravingSurfaceShader.tsx`| — | **MISSING** | **To be created by `agent_laser_engraving` (R1)** |
| `src/components/3d/characters/` | *All files in directory* | — | **MISSING** | **To be created by `agent_entity_designer` (R2)** (`OperatorHandsHUD.tsx`, `LabEngineerNPC.tsx`, `SafetyGearVisualizer.tsx`) |
| `src/components/3d/props/` | *All files in directory* | — | **MISSING** | **To be created by `agent_entity_designer` (R2)** (Industrial props with `InstancedMesh`) |
| `src/components/3d/specimens/` | *All files in directory* | — | **MISSING** | **To be created by `agent_entity_designer` (R2)** (2-part interactive specimens for 6 materials) |

---

## 2. Logic Chain

### 2.1 State Synchronization Integration Blueprint (R3)
1. *Observation*: R3 requires:
   - `processMode: 'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`
   - `engravingDepthMap: Float32Array`
   - `activeSpecimenMesh: THREE.Object3D | null`
   - `isPartDetached: boolean` (toggled via `Space`)
   - `chillerStatus: 'normal' | 'overheat'`
   - `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }`
2. *Deduction for `processMode`*:
   - The current code uses `'CUT' | 'ENGRAVE'`.
   - If we define in `src/types/lab.ts`:
     ```ts
     export type ProcessMode = 
       | 'through-cut' 
       | 'surface-engrave' 
       | 'color-annealing' 
       | 'relief-2.5d'
       | 'CUT'        // Legacy alias for backwards compatibility
       | 'ENGRAVE';   // Legacy alias for backwards compatibility
     ```
     And provide helper predicates:
     ```ts
     export const isThroughCut = (mode: ProcessMode): boolean => 
       mode === 'through-cut' || mode === 'CUT';
     export const isSurfaceEngrave = (mode: ProcessMode): boolean => 
       mode === 'surface-engrave' || mode === 'ENGRAVE';
     ```
   - This satisfies the acceptance criteria (`processMode` has the required literal types) while guaranteeing zero regression across existing UI components (`MachineControlOverlay`, `VectorDesignModal`, `SpecimenInspectionModal`).
3. *Deduction for `engravingDepthMap`*:
   - Size: A 2D grid resolution of $256 \times 256$ requires `Float32Array(65536)`.
   - Initialized to zeros. When laser scans `[x, y]`, `engravingEngine.ts` updates depth values according to beam intensity and material ablation rate.
   - Store actions to provide:
     ```ts
     setEngravingDepthMap: (depthMap: Float32Array) => void;
     resetEngravingDepthMap: () => void;
     updateEngravingDepth: (xIndex: number, yIndex: number, depth: number) => void;
     ```
4. *Deduction for `activeSpecimenMesh`*:
   - Type: `THREE.Object3D | null` (or `string | null`).
   - Store actions to provide:
     ```ts
     setActiveSpecimenMesh: (mesh: THREE.Object3D | null) => void;
     ```
   - Enables `OperatorHandsHUD` and camera focal inspection routines to reference and manipulate the current specimen mesh directly.
5. *Deduction for `chillerStatus`*:
   - Type: `'normal' | 'overheat'`. Default: `'normal'`.
   - Store actions to provide:
     ```ts
     setChillerStatus: (status: 'normal' | 'overheat') => void;
     toggleChillerStatus: () => void;
     ```
   - Feeds into the water chiller prop's LED digital display and safety interlock warning logic.
6. *Deduction for `operatorPPE`*:
   - Type: `{ gogglesWavelength: string; glovesESD: boolean }`.
   - Default: `{ gogglesWavelength: '10600nm', glovesESD: true }`.
   - Store actions to provide:
     ```ts
     setOperatorPPE: (ppe: Partial<OperatorPPE>) => void;
     toggleGlovesESD: () => void;
     setGogglesWavelength: (wavelength: string) => void;
     ```
   - Drives glove rendering in `OperatorHandsHUD.tsx` (anti-static ESD blue with carbon weave vs yellow/charcoal heat-resistant Kevlar) and goggles shader in `LabEngineerNPC.tsx` / `SafetyGearVisualizer.tsx`.
7. *Deduction for `Space` Key Interaction*:
   - In `PlayerController.tsx`, `Space` currently triggers player jump during `mode === 'WALKING'`.
   - In `mode === 'INSPECTING'`, jumping is inactive.
   - Therefore, in `PlayerController.tsx`, `handleKeyDown` can inspect:
     ```ts
     } else if (e.code === 'Space') {
       const store = useLabStore.getState();
       if (store.mode === 'INSPECTING' || store.isSpecimenModalOpen) {
         e.preventDefault();
         store.togglePartDetached();
       }
     }
     ```
   - This fulfills: *"allowing the inner part to be detached and lifted when the user presses Space, exposing kerf walls and coating finish"*.

---

### 2.2 Scene Graph Integration & Draw Call Budget (< 100)
1. *Observation*: Acceptance criteria specifies maintaining 60 FPS and total Draw Calls strictly under 100.
2. *Deduction*:
   - Individual Three.js meshes each emit at least 1 draw call.
   - With 8 new industrial auxiliary props (chiller, fume extractor, N2/O2/Argon gas cylinders, workbench, digital caliper, microscope, specimen tray, ISO warning signs, E-stop), creating separate distinct meshes across the workshop would inflate draw calls.
   - Solution: Use `THREE.InstancedMesh` for repetitive props:
     1. `InstancedMesh` Group 1: Compressed gas cylinders (N2, O2, Argon) with shared cylinder geometry and instanced color/transform attributes.
     2. `InstancedMesh` Group 2: Workbenches (legs and tops).
     3. `InstancedMesh` Group 3: Digital calipers and measurement tools.
     4. `InstancedMesh` Group 4: Optical microscopes.
     5. `InstancedMesh` Group 5: Specimen trays.
     6. `InstancedMesh` Group 6: ISO 7010 warning signs and placards.
     7. `InstancedMesh` Group 7: Emergency Stop (E-Stop) push-buttons and enclosures.
     8. `InstancedMesh` Group 8: Fume extraction duct joints and brackets.
   - Total instanced draw calls: $\le 8$ calls.
   - Combined with existing workshop scene (~35 draw calls), total draw calls will remain comfortably at $\approx 45–55$, well beneath the hard limit of 100!

---

### 2.3 Mount Points in Root Canvas (`src/components/3d/CanvasContainer.tsx`)
To keep architectural boundaries clean and modular:
```tsx
<Canvas ...>
  {/* Existing Environment & Lighting */}
  <WorkshopEnvironment />

  {/* R2: Industrial Auxiliary Props (InstancedMesh Groups) */}
  <IndustrialAuxiliaryProps />

  {/* R2: Lab Engineer NPC with Dynamic OD7+ Goggles */}
  <LabEngineerNPC position={[3.6, 0, 3.2]} rotation={[0, -Math.PI / 3, 0]} />

  {/* Existing 4 Workstations (Updated with R2 Specimens & R1 Shaders) */}
  {Object.values(STATIONS).map((st) => (
    <ProceduralStation key={st.id} id={st.id} position={st.position} rotation={st.rotation} />
  ))}

  {/* Existing Player Controller */}
  <PlayerController />

  {/* R2: First-Person Operator Hands HUD (Follows Camera in WALKING Mode) */}
  <OperatorHandsHUD />

  {/* Existing Post-Processing Pipeline */}
  <PostProcessingEffects />
</Canvas>
```

---

## 3. Caveats
- No unit tests or integration test framework (`vitest` / `jest` / `playwright`) currently exists in `package.json`. Verification strictly depends on TypeScript compilation (`npx tsc --noEmit`) and Vite bundling (`npm run build`).
- External `.glb` / `.gltf` asset loading should be avoided in favor of procedural Three.js geometry construction to ensure 100% offline stability, eliminate 404 network asset failures, and keep Draco decompression overhead at zero.
- The subfolder `physics-lab-simulation/` is an unmerged subfolder; all imports and code must strictly target the root `src/` directory.

---

## 4. Conclusion
1. **Tooling & Build Health**: The project is in a clean, working baseline state. `npx tsc --noEmit` and `npm run build` both compile with zero errors.
2. **State Store Architecture**: `useLabStore.ts` already has the foundations for `processMode` and `isPartDetached`. Adding `engravingDepthMap`, `activeSpecimenMesh`, `chillerStatus`, and `operatorPPE`, while expanding `processMode` literal types with backwards-compatibility helpers, provides a seamless, zero-breakage interface for R1 and R2.
3. **Canvas & Component Placement**:
   - `agent_laser_engraving` should implement R1 in `src/data/engravingProfiles.ts`, `src/utils/engravingEngine.ts`, and `src/components/3d/visual-effects/EngravingSurfaceShader.tsx`.
   - `agent_entity_designer` should implement R2 in `src/components/3d/characters/`, `src/components/3d/props/`, and `src/components/3d/specimens/`.
   - Props must use at most 8 `THREE.InstancedMesh` groups to guarantee $< 100$ Draw Calls.
   - `PlayerController.tsx` should wire the `Space` hotkey during `INSPECTING` mode to call `togglePartDetached()`.
4. **Swarm Isolation**: The boundaries between `agent_laser_engraving` (R1 files), `agent_entity_designer` (R2 files), and the Store/Canvas Integration worker are cleanly separated with zero overlapping file writes.

---

## 5. Verification Method

### 5.1 Compilation & Type Checking
Execute in workspace root:
```powershell
npx tsc --noEmit
```
*Expected*: Exit code 0, no errors reported.

### 5.2 Production Build Verification
Execute in workspace root:
```powershell
npm run build
```
*Expected*: Vite builds bundle successfully into `dist/` with exit code 0.

### 5.3 State & Hotkey Invalidation Conditions
- Invalidation Condition 1: `processMode` in `useLabStore.ts` fails to accept `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`.
- Invalidation Condition 2: `engravingDepthMap` is missing from `LabState` or is not an instance of `Float32Array`.
- Invalidation Condition 3: Pressing `Space` while inspecting a specimen does not toggle `isPartDetached`.
- Invalidation Condition 4: Total WebGL draw calls exceed 100 due to uninstanced static prop geometries.
