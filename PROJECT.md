# Project: Virtual Physics & Industrial Laser Lab 3D Extended Simulation

## Architecture
- **Framework & Libraries**: React 19, Three.js 0.174, @react-three/fiber 9.8, @react-three/drei 9.122, @react-three/postprocessing 3.2, Zustand 5.0, TailwindCSS.
- **Rendering Pipeline**: ACESFilmicToneMapping, PCFSoftShadowMap, Bloom + Vignette + SMAA post-processing, strict draw call optimization (< 100 Draw Calls) via `THREE.InstancedMesh`.
- **State Flow**: Centralized Zustand store `src/store/useLabStore.ts` orchestrating station simulation, laser job progress, operator PPE, water chiller state, specimen detachment, and real-time engraving depth map buffer (`Float32Array`).
- **Laser Engraving Engine**: Mathematical polygon scanline hatching, cross-hatching (0°, 45°, 90°, 135°), kerf offset compensation, Floyd-Steinberg error diffusion dithering, physics-based machining time estimation, and GLSL surface transformation shader (`EngravingSurfaceShader.tsx`).
- **Entity & Prop Design**: Procedural 3D first-person operator hands HUD (reactive to O, G, Space, ESD vs heat-resistant gloves), cleanroom lab engineer NPC with dynamic OD7+ safety goggles matching station wavelength, 8 `THREE.InstancedMesh` auxiliary prop groups, dynamic water chiller with LED readouts, fume extraction duct, and 2-part interactive specimens (`OuterStockPlate` + `InnerCutoutMesh`) across 6 base materials.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Physical Engraving Profiles | `src/data/engravingProfiles.ts` defining physical engraving parameters (Power %, Scan Speed mm/s, Pulse Frequency 20-200 kHz, Pulse Width 2-500 ns MOPA Fiber, Line Interval/DPI, Passes, Depth) across 3 modes (Vector Scoring 0.05-0.1mm, Raster Bi-directional with dithering, Deep 2.5D Relief 0.5-2.0mm) for 6 materials | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Closed-Polygon Hatching & Cross-Hatching | `src/utils/engravingEngine.ts` with scanline hatching at configurable angles (0°, 45°, 90°, 135°) and bi-directional serpentine optimization | M1 | ORIGINAL_REQUEST §R1 |
| F3 | Kerf Offset Compensation | Miter-clamped inward/outward offset calculation accounting for laser spot radius | M1 | ORIGINAL_REQUEST §R1 |
| F4 | Floyd-Steinberg Dithering | Error diffusion dithering converting continuous grayscale into binary halftone raster laser pulses | M1 | ORIGINAL_REQUEST §R1 |
| F5 | Machining Time Estimation | Physics-based calculation combining cutting path length, rapid travel, settle delays, and multi-pass count | M1 | ORIGINAL_REQUEST §R1 |
| F6 | Real-Time Depth & Normal Map Generator | Dynamic `Float32Array` depth accumulation and central difference normal map generation as laser scans [x, y] | M1 | ORIGINAL_REQUEST §R1 |
| F7 | Surface Transformation Shader | `src/components/3d/visual-effects/EngravingSurfaceShader.tsx` supporting CO2 wood carbonization + HAZ, CO2/UV frosted micro-cracking on glass/acrylic, Fiber 1064nm thin-film interference color annealing on steel/titanium, UV 355nm zero-HAZ cold micro-machining on silicon, and laser spot incandescence | M1 | ORIGINAL_REQUEST §R1 |
| F8 | Operator Hands HUD | `src/components/3d/characters/OperatorHandsHUD.tsx` first-person procedural hands with ESD (blue/carbon) vs heat-resistant (yellow Kevlar) gloves, animated controls for lid (O), inspect (G), detach (Space) | M2 | ORIGINAL_REQUEST §R2 |
| F9 | Lab Engineer NPC | `src/components/3d/characters/LabEngineerNPC.tsx` cleanroom lab engineer with hardhat and dynamic OD7+ safety goggles tinting to match station laser wavelength (green 1064nm, orange 355nm, clear/gold 10.6um) | M2 | ORIGINAL_REQUEST §R2 |
| F10 | Safety Gear Visualizer | `src/components/3d/characters/SafetyGearVisualizer.tsx` PPE station and status badge renderer | M2 | ORIGINAL_REQUEST §R2 |
| F11 | Industrial Auxiliary Props (8 Instanced Groups) | `src/components/3d/props/` repetitive props grouped into $\le 8$ `THREE.InstancedMesh` groups (gas cylinders N2/O2/Argon, E-Stops, ISO 7010 signs, workbenches, specimen trays, calipers, microscopes, duct flanges) to preserve draw call budget (< 100 Draw Calls) | M2 | ORIGINAL_REQUEST §R2 |
| F12 | Dynamic Chiller & Fume Extractor | Industrial CW-5200 water chiller with LED temp/flow readout and status synchronization, plus articulated fume extraction hood | M2 | ORIGINAL_REQUEST §R2 |
| F13 | Interactive 2-Part Specimens | `src/components/3d/specimens/` 6 base materials (Wood, Acrylic, Steel, Aluminum, 8-inch Silicon Wafer, Glass) with `OuterStockPlate` + `InnerCutoutMesh` detachable via `Space`, exposing kerf walls and coating finish | M2 | ORIGINAL_REQUEST §R2 |
| F14 | State Store Synchronization | Extend `src/store/useLabStore.ts` & `src/types/lab.ts` with `processMode: 'through-cut' \| 'surface-engrave' \| 'color-annealing' \| 'relief-2.5d'`, `engravingDepthMap: Float32Array`, `activeSpecimenMesh`, `isPartDetached`, `chillerStatus: 'normal' \| 'overheat'`, `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }` | M3 | ORIGINAL_REQUEST §R3 |
| F15 | Keybindings & Scene Graph Integration | Wire O (lid), G (inspection), Space (specimen detachment when inspecting or at station) in `PlayerController.tsx`, and mount new components in `CanvasContainer.tsx` | M3 | ORIGINAL_REQUEST §R2, §R3 |
| F16 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite verifying profiles, engine math, shaders, entity components, store synchronization, hotkey bindings, draw call budget, and build passes | M-E2E | ORIGINAL_REQUEST Acceptance Criteria |
| F17 | Adversarial Hardening (Tier 5) | White-box edge-case stress testing, numerical stability, NaN protection, zero-dimension polygons, boundary conditions | M-FINAL | Orchestration Protocol |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-E2E | E2E Testing Track | Requirement-driven test suite (`TEST_INFRA.md`, test runner, Tiers 1-4 test cases) | None | DONE (`TEST_READY.md`, 105/105 tests passing) |
| M1 | Laser Engraving & Micro-Machining Engine | F1, F2, F3, F4, F5, F6, F7 (`engravingProfiles.ts`, `engravingEngine.ts`, `EngravingSurfaceShader.tsx`) | None | DONE (All physical profiles, hatching, kerf, dithering, depth map, shaders) |
| M2 | 3D Characters, Props & Specimens | F8, F9, F10, F11, F12, F13 (`characters/`, `props/` with $\le 8$ InstancedMesh groups, `specimens/`) | None | DONE (Hands HUD, cleanroom NPC, PPE station, 8 instanced prop groups, two-part specimens) |
| M3 | State Synchronization & System Integration | F14, F15 (`useLabStore.ts`, `src/types/lab.ts`, `PlayerController.tsx`, `CanvasContainer.tsx`) | M1, M2 | DONE (Extended processMode, engravingDepthMap, activeSpecimenMesh, isPartDetached, chillerStatus, operatorPPE, hotkeys) |
| M-FINAL | Final Milestone: 100% E2E Pass + Adversarial Hardening | Phase 1: 100% E2E test pass across Tiers 1-4; Phase 2: Adversarial stress testing & forensic audit | M-E2E, M1, M2, M3 | DONE (All gate checks PASSED: Reviewers APPROVE, Challengers APPROVE, Auditor CLEAN) |

## Interface Contracts

### M1 (`agent_laser_engraving`) ↔ M3 (`useLabStore.ts`)
- `engravingProfiles.ts`:
  ```ts
  export type EngravingMode = 'vector-scoring' | 'raster-engraving' | 'relief-2.5d';
  export interface EngravingPhysicalParameters { ... }
  export interface EngravingProfile { ... }
  export const ENGRAVING_PROFILES: Record<string, EngravingProfile>;
  export function getEngravingProfile(material: MaterialType, mode: EngravingMode): EngravingProfile;
  ```
- `engravingEngine.ts`:
  ```ts
  export function generatePolygonHatch(polygon: [number, number][], angleDeg: number, lineIntervalMm: number, crossHatch?: boolean): [number, number][][];
  export function applyKerfCompensation(polygon: [number, number][], kerfWidthMm: number, isInnerHole: boolean): [number, number][];
  export function ditherImageFloydSteinberg(grayscale: Uint8Array, width: number, height: number): Uint8Array;
  export function estimateMachiningTime(paths: [number, number][][], params: EngravingPhysicalParameters): number;
  export class EngravingDepthMapManager {
    readonly resolution: number;
    readonly buffer: Float32Array;
    stampAblation(u: number, v: number, radius: number, depthDelta: number): void;
    generateNormalTexture(): THREE.DataTexture;
    reset(): void;
  }
  ```
- `EngravingSurfaceShader.tsx`:
  - Uniforms: `uTime`, `uBaseColor`, `uBaseRoughness`, `uBaseMetalness`, `uDepthMap`, `uProcessMode`, `uMaterialType`, `uLaserPosition`, `uLaserActive`, `uLaserSpotRadius`, `uFilmThicknessNm`, `uHazWidth`, `uHazColor`.

### M2 (`agent_entity_designer`) ↔ M3 (`useLabStore.ts`)
- `useLabStore.ts` provides:
  - `isPartDetached: boolean`, `togglePartDetached: () => void`, `setPartDetached: (detached: boolean) => void`
  - `chillerStatus: 'normal' | 'overheat'`, `setChillerStatus: (status: 'normal' | 'overheat') => void`
  - `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }`, `setOperatorPPE: (ppe: Partial<OperatorPPE>) => void`
  - `activeSpecimenMesh: THREE.Object3D | null`, `setActiveSpecimenMesh: (mesh: THREE.Object3D | null) => void`
  - `isLidOpen: boolean`, `toggleLid: () => void`
  - `isSpecimenModalOpen: boolean`, `openSpecimenModal: () => void`, `closeSpecimenModal: () => void`

### M2 Props & Specimens ↔ 3D Scene Graph
- `IndustrialAuxiliaryProps.tsx`:
  - Renders 8 `THREE.InstancedMesh` nodes: gas cylinders, E-Stops, ISO 7010 warning signs, workbenches, specimen trays, calipers, microscopes, duct flanges.
  - Renders dynamic water chiller with LED digital display (temperature, flow, alarm) and articulated fume extraction hood.
- `InteractiveSpecimen.tsx`:
  - Renders `OuterStockPlate` (with negative hole) and `InnerCutoutMesh` (with upward translation when `isPartDetached === true`).
  - Supports 6 materials with authentic physical properties.

## Code Layout
```
src/
├── components/
│   ├── 3d/
│   │   ├── characters/
│   │   │   ├── LabEngineerNPC.tsx
│   │   │   ├── OperatorHandsHUD.tsx
│   │   │   └── SafetyGearVisualizer.tsx
│   │   ├── props/
│   │   │   ├── IndustrialAuxiliaryProps.tsx
│   │   │   └── WaterChillerUnit.tsx
│   │   ├── specimens/
│   │   │   └── InteractiveSpecimen.tsx
│   │   ├── visual-effects/
│   │   │   ├── CO2LaserBeam.tsx
│   │   │   ├── CuttingSparks.tsx
│   │   │   ├── EngravingSurfaceShader.tsx
│   │   │   ├── GalvoMirrorBeam.tsx
│   │   │   └── UVLaserBeam.tsx
│   │   ├── CanvasContainer.tsx
│   │   ├── CollisionManager.ts
│   │   ├── PlayerController.tsx
│   │   ├── PostProcessingEffects.tsx
│   │   └── WorkshopEnvironment.tsx
│   └── ui/
│       ├── CrosshairHUD.tsx
│       ├── KnowledgePanel.tsx
│       ├── MachineControlOverlay.tsx
│       ├── SpecimenInspectionModal.tsx
│       └── VectorDesignModal.tsx
├── data/
│   ├── coatingFinishes.ts
│   ├── engravingProfiles.ts
│   ├── labConfig.ts
│   ├── materialsConfig.ts
│   ├── physicsData.ts
│   └── vectorDesigns.ts
├── store/
│   └── useLabStore.ts
├── types/
│   └── lab.ts
└── utils/
    ├── audioSystem.ts
    └── engravingEngine.ts
```
