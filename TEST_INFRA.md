# Test Infrastructure Specification: Virtual Physics & Industrial Laser Lab 3D Extended Simulation

## 1. Overview & Architecture
The test suite for the Virtual Physics & Industrial Laser Lab simulation provides comprehensive, automated end-to-end (E2E) verification covering physical laser engraving parameters, geometric and toolpath algorithms, custom WebGL/GLSL shader materials, 3D character and prop components, state synchronization, and industrial micro-machining workflows.

The test infrastructure is architected in a 4-Tier Hierarchy:
- **Tier 1: Feature Coverage (F1 - F15)**: At least 5 granular, authoritative test cases per feature covering all functional and data contracts.
- **Tier 2: Boundary & Corner Cases**: Edge cases including extreme laser velocities, minimum/maximum pulse widths, acute corner miter clamping limits, zero/negative depth maps, Floyd-Steinberg error clipping, and invalid inputs.
- **Tier 3: Cross-Feature Interactions**: Pairwise and multi-module pipelines combining profile selection $\to$ closed-polygon hatching $\to$ kerf compensation $\to$ depth map accumulation $\to$ shader uniform binding; 3D specimen detachment $\to$ keybindings $\to$ Zustand store reactivity; water chiller overheating $\to$ laser safety interlock tripping.
- **Tier 4: Real-World Industrial Application Scenarios**: Full realistic operational workflows including semiconductor silicon wafer dicing (355nm UV cold ablation), medical implant titanium color annealing (1064nm Fiber oxide interference), architectural cast acrylic laser cutting (10.6µm CO2 flame polish), bas-relief tactile wood engraving (multi-pass 2.5D with cross-hatching), and cleanroom PPE / E-Stop emergency safety interlocks.

---

## 2. Framework & Test Execution Environment
- **Runtime**: Node.js v20+ / TypeScript 5.7+ executed via `npx tsx` for native ES module and TypeScript execution without transpile lag.
- **Test Harness (`tests/e2e/testHarness.ts`)**: Self-contained, deterministic test execution engine providing `describe`, `it`, `expect` assertion primitives (equality, deep equality, range checking, floating point epsilon comparison, throws verification, array and buffer inspection), execution timers, and aggregated ANSI summary reporting.
- **Exit Codes**: Returns exit code 0 when all tests pass; returns exit code 1 if any failure occurs.
- **Execution Command**:
  ```powershell
  npx tsx tests/e2e/runAllTests.ts
  ```

---

## 3. Directory Layout
```
d:/phanulab/
├── TEST_INFRA.md              # Test architecture, strategy, and test matrix specification
├── TEST_READY.md              # Test execution readiness publication
└── tests/
    └── e2e/
        ├── testHarness.ts     # Core assertion framework, test runner, and reporter
        ├── tier1_features.test.ts   # Tier 1: F1 - F15 comprehensive feature coverage
        ├── tier2_boundaries.test.ts # Tier 2: Boundary, numerical stability, and corner cases
        ├── tier3_interactions.test.ts # Tier 3: Cross-module integration and state pipelines
        ├── tier4_scenarios.test.ts  # Tier 4: Real-world industrial micro-machining scenarios
        └── runAllTests.ts     # Aggregated test runner executing Tiers 1-4
```

---

## 4. Test Matrix & Feature Mapping

### Tier 1: Feature Coverage (F1 - F15)
| Feature ID | Feature Name | Target Source File | Min Tests | Key Verifications |
|---|---|---|---|---|
| **F1** | Physical Engraving Profiles | `src/data/engravingProfiles.ts` | 6 | Preset validation for 6 materials (WOOD, ACRYLIC, STEEL, ALUMINUM, SILICON, GLASS) across 3 modes (Vector Scoring, Raster Engraving, 2.5D Relief); physical constraints (Power 1-100%, Frequency 20-200 kHz, Pulse Width 2-500 ns, DPI calculation). |
| **F2** | Closed-Polygon Hatching & Cross-Hatching | `src/utils/engravingEngine.ts` | 6 | Scanline generation at 0°, 45°, 90°, 135°; serpentine stroke alternating path direction; cross-hatch multi-angle interleaving; bounding box containment. |
| **F3** | Kerf Offset Compensation | `src/utils/engravingEngine.ts` | 5 | Inward/outward normal displacement; beam spot radius compensation ($r = w/2$); acute corner miter clamping to prevent spike artifacts; winding order detection (CCW outer, CW inner). |
| **F4** | Floyd-Steinberg Dithering | `src/utils/engravingEngine.ts` | 5 | Grayscale to binary halftone conversion; 4-neighbor error diffusion weights (7/16, 3/16, 5/16, 1/16); bounds clamping [0, 255]; pure white/pure black invariant preservation. |
| **F5** | Machining Time Estimation | `src/utils/engravingEngine.ts` | 5 | Physics-based kinematics: cutting distance $L_{\text{cut}} / v_{\text{scan}}$, rapid transit $L_{\text{rapid}} / v_{\text{rapid}}$, turnaround settle delays, pierce delay accumulation, multi-pass scaling. |
| **F6** | Real-Time Depth & Normal Map Generator | `src/utils/engravingEngine.ts` | 6 | `EngravingDepthMapManager`: $256 \times 256$ `Float32Array` buffer allocation, Gaussian ablation stamping kernel, depth accumulation clamping, central difference normal calculation, reset zeroing. |
| **F7** | Surface Transformation Shader | `src/components/3d/visual-effects/EngravingSurfaceShader.tsx` | 5 | Shader uniforms configuration (`uDepthMap`, `uProcessMode`, `uFilmThicknessNm`, `uLaserPosition`); GLSL branch validity; thin-film Airy interference formulas; HAZ exponential decay. |
| **F8** | Operator Hands HUD | `src/components/3d/characters/OperatorHandsHUD.tsx` | 5 | Camera tracking kinematics, ESD blue vs Kevlar yellow glove material toggle, animated reach on O (lid), inspect gesture on G, detachment reach on Space. |
| **F9** | Lab Engineer NPC | `src/components/3d/characters/LabEngineerNPC.tsx` | 5 | Cleanroom technician model structure, head look-at tracking when player within 4.5m, dynamic OD7+ safety goggles lens color (clear for CO2, orange for UV, green for Fiber). |
| **F10** | Safety Gear Visualizer | `src/components/3d/characters/SafetyGearVisualizer.tsx` | 5 | PPE station 3D layout, status badge synchronization (`operatorPPE: { gogglesWavelength, glovesESD }`), warning alerts when entering Class 4 laser zone without protective gear. |
| **F11** | Industrial Auxiliary Props (8 Instanced Groups) | `src/components/3d/props/IndustrialAuxiliaryProps.tsx` | 6 | Exactly $\le 8$ `THREE.InstancedMesh` nodes (gas cylinders, E-Stops, ISO 7010 signs, workbenches, trays, calipers, microscopes, flanges); instance transform matrix allocation; draw call budget enforcement. |
| **F12** | Dynamic Chiller & Fume Extractor | `src/components/3d/props/IndustrialAuxiliaryProps.tsx` | 5 | CW-5200 water chiller LED temperature/flow readouts, overheat alarm status change, fume extraction articulated gooseneck hood and suction activation. |
| **F13** | Interactive 2-Part Specimens | `src/components/3d/specimens/InteractiveSpecimen.tsx` | 6 | 6 base materials PBR fidelity; two-part mesh (`OuterStockPlate` with negative hole + `InnerCutoutMesh`); vertical +0.25m lift on `isPartDetached`; kerf wall exposure with material-specific finishes. |
| **F14** | State Store Synchronization | `src/store/useLabStore.ts` & `src/types/lab.ts` | 6 | `processMode` extended types (`through-cut`, `surface-engrave`, `color-annealing`, `relief-2.5d`), `engravingDepthMap`, `activeSpecimenMesh`, `isPartDetached`, `chillerStatus`, `operatorPPE` reactive mutations. |
| **F15** | Keybindings & Scene Graph Integration | `src/components/3d/PlayerController.tsx` | 5 | Hotkey mapping: `KeyO` toggles lid and canopy interlock, `KeyG` opens specimen inspection modal, `Space` contextually lifts inner cutout when inspecting or at station without triggering jumping in walking mode. |

### Tier 2: Boundary & Corner Cases
- Zero and negative depth ablation prevention.
- Ultra-acute corner miter clamping (angles $< 20^\circ$) preventing coordinate explosion.
- Extreme laser scanning speeds ($10,000\text{ mm/s}$) and minimum speeds ($1\text{ mm/s}$).
- Zero-dimension or degenerate polygon handling (lines, duplicate vertices, colinear points).
- Floyd-Steinberg boundary clipping on image perimeter pixels.
- Float32 buffer coordinate clamping outside $[0, 1]$ normalized UV space.

### Tier 3: Cross-Feature Interactions
- **Pipeline 1**: Physical Profile $\to$ Polygon Hatching $\to$ Kerf Compensation $\to$ Depth Map Manager $\to$ Surface Shader Uniform Binding.
- **Pipeline 2**: Specimen Inspection $\to$ Keybinding `Space` $\to$ Zustand Store `isPartDetached` $\to$ 3D Specimen Mesh Lift Animation.
- **Pipeline 3**: Water Chiller Overheating $\to$ Alarm Status Display $\to$ Machine Safety Interlock $\to$ Laser Job Invalidation.
- **Pipeline 4**: Station Laser Wavelength Switch (CO2 10.6µm $\leftrightarrow$ UV 355nm $\leftrightarrow$ Fiber 1064nm) $\to$ Engineer NPC Safety Goggles Dielectric Lens Tint Update $\to$ Operator PPE Verification.

### Tier 4: Real-World Industrial Application Scenarios
1. **Scenario 1: Semiconductor Silicon Wafer Dicing**:
   - Material: 8-inch monocrystalline Silicon wafer.
   - Laser: 355nm UV DPSS, 25 ns pulse, 100 kHz, zero HAZ cold ablation peeling pass.
   - Verifies zero thermal degradation, knife-edge kerf, sub-micron precision toolpath.
2. **Scenario 2: Medical Implant Titanium Color Annealing**:
   - Material: Grade 5 Titanium / 304 Stainless Steel.
   - Laser: 1064nm MOPA Fiber, 200 ns pulse, 2800 mm/s high-speed galvo scanning.
   - Verifies zero stock depth loss ($d \approx 0$), thin-film oxide layer thickness calculation (50-250nm $TiO_2$), Airy interference iridescence.
3. **Scenario 3: Architectural Cast Acrylic Laser Cutting**:
   - Material: 5mm Clear Cast PMMA (Acrylic).
   - Laser: 10.6µm CO2, 120W, through-cutting with N2 assist gas.
   - Verifies flame-polished kerf sidewall, kerf compensation offset calculation, clean inner part release.
4. **Scenario 4: Bas-Relief Wood Engraving**:
   - Material: Baltic Birch Plywood.
   - Laser: 10.6µm CO2, 2.5D multi-pass relief mode (15 passes).
   - Verifies rotating cross-hatch angles (0° $\to$ 90° $\to$ 45° $\to$ 135°), carbonized kerf with exponential HAZ gradient, depth accumulation to 1.8mm.
5. **Scenario 5: Cleanroom Emergency Stop & PPE Interlocks**:
   - Triggers red E-Stop mushroom button and water chiller overheat during active cutting job.
   - Verifies immediate laser cutoff, audio alarm dispatch, operator warning toast, and PPE compliance enforcement.

---

## 5. How to Run the Tests
```powershell
# Run the complete automated E2E test suite
npx tsx tests/e2e/runAllTests.ts

# Run specific tier test suites individually
npx tsx tests/e2e/tier1_features.test.ts
npx tsx tests/e2e/tier2_boundaries.test.ts
npx tsx tests/e2e/tier3_interactions.test.ts
npx tsx tests/e2e/tier4_scenarios.test.ts

# Verify TypeScript compilation across the project
npx tsc --noEmit
```

---

## 6. Failure Triage & Diagnostics
- **Profile / Physical parameter mismatch**: Review `src/data/engravingProfiles.ts` against physical standards in `src/data/physicsData.ts`.
- **Hatch / Kerf geometric anomalies**: Check normal vector calculations and miter angle bisector clamping in `src/utils/engravingEngine.ts`.
- **Depth Map out-of-bounds**: Verify normalized UV coordinate bounds clamping `Math.floor(u * (resolution - 1))` in `EngravingDepthMapManager`.
- **Store reactivity failure**: Verify state actions in `src/store/useLabStore.ts` trigger Zustand subscribers.
- **Draw call budget violation**: Verify that repetitive props are added to `THREE.InstancedMesh` matrices rather than instantiated as separate meshes in `src/components/3d/props/IndustrialAuxiliaryProps.tsx`.
