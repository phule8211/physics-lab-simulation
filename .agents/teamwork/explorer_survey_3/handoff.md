# Handoff Report: 3D Characters, Industrial Props, and Interactive Specimens Survey (R2 & R3)

**Agent**: `explorer_survey_3`  
**Working Directory**: `d:/phanulab/.agents/teamwork/explorer_survey_3/`  
**Recipient**: `c9a4ec97-11e1-47a5-aac1-b3c644c5caa1` (Orchestrator) & `agent_entity_designer`  
**Date**: 2026-11-05  

---

## 1. Observation

### 1.1 Existing 3D Scene Architecture & Mount Points
- **Root Canvas Mount**:
  - In `src/App.tsx` (lines 10–35), `<CanvasContainer />` is mounted at line 14 beneath the 2D overlays (`<CrosshairHUD />`, `<KnowledgePanel />`, `<MachineControlOverlay />`, `<VectorDesignModal />`, `<SpecimenInspectionModal />`, `<LoadingScreen />`).
- **3D Canvas Layer Hierarchy**:
  - In `src/components/3d/CanvasContainer.tsx` (lines 13–50), the `<Canvas>` renders:
    - Line 29–30: `<color attach="background" args={['#080e1e']} />` and `<fogExp2 attach="fog" args={['#080e1e', 0.024]} />`.
    - Line 33: `<WorkshopEnvironment />` (architectural room, PBR epoxy floor, lighting, procedural HDRI via Lightformers, walls, airlock doors, frieze lightbox signboards, ceiling I-beams, ventilation ducts).
    - Lines 36–43: `{Object.values(STATIONS).map((st) => <ProceduralStation key={st.id} ... />)}` (the 4 laser/sensor workstations + spray coating booth).
    - Line 46: `<PlayerController />` (first-person controller, PointerLockControls, collision handling via `CollisionManager.ts`, proximity raycasting, inspection lerp).
    - Line 49: `<PostProcessingEffects />` (Bloom, SMAA, Vignette).
- **Existing Workpiece/Specimen Implementation in Stations**:
  - In `src/components/3d/fallbacks/ProceduralMachineBox.tsx`:
    - CO2 Machine bed (lines 181–192): Workpiece is a single simple primitive `<boxGeometry args={[1.6, 0.015, 1.0]} />` with 2D line overlays for kerf.
    - UV Machine stage (lines 541–565): Silicon wafer is a single `<cylinderGeometry args={[0.2, 0.2, 0.005, 32]} />` or substrate chip `<boxGeometry args={[0.3, 0.008, 0.3]} />`.
    - Fiber Machine stage (lines 768–778): Metal card is a single `<boxGeometry args={[0.25, 0.01, 0.18]} />`.
  - None of these machine beds currently support the two-part detachable mesh structure.
- **Specimen Inspection Studio Sub-Canvas**:
  - In `src/components/ui/SpecimenInspectionModal.tsx`:
    - Lines 92–226: Contains a prototype `buildCutoutMeshes()` function using `THREE.ExtrudeGeometry` with `THREE.Shape` and `THREE.Path` holes.
    - Lines 232–465: `Specimen3DObject` renders inside an isolated modal `<Canvas>` with `<OrbitControls>`, supporting a floating lift animation via `liftY.current = THREE.MathUtils.damp(liftY.current, targetY, 8, delta)` when `isCut && isPartDetached` (lines 265–271).
    - This is currently confined to the 2D modal dialog and not present in the main 3D world scene.
- **Missing Directories in Codebase**:
  - Verification via PowerShell `Test-Path`:
    - `src/components/3d/characters/`: `False` (does not exist).
    - `src/components/3d/props/`: `False` (does not exist).
    - `src/components/3d/specimens/`: `False` (does not exist).

### 1.2 Input Handling & Keybindings
- **Keyboard Listener in `PlayerController.tsx`** (lines 53–122):
  - Line 62: `KeyE` -> Enter inspection mode for hovered station.
  - Line 71: `Escape` -> Exit inspection mode.
  - Lines 75–89: `Digit1`–`Digit5` / `KeyP` -> Quick-jump to stations.
  - Line 90: `KeyO` -> `useLabStore.getState().toggleLid()`.
  - Line 92: `KeyC` -> Start / stop cutting job.
  - Line 99: `KeyM` -> Cycle materials.
  - Line 104: `KeyT` -> Open CAD design modal.
  - Line 107: `KeyG` -> `useLabStore.getState().openSpecimenModal()` (exits pointer lock).
  - Line 110: `KeyF` -> Toggle framing preview.
- **`Space` Key Handling**:
  - In `src/hooks/useKeyboardControls.ts` (lines 50–52 & 78–80): `Space` sets `keys.current.jump = true`.
  - In `src/components/3d/PlayerController.tsx` (lines 290–305): When `keys.current.jump` is true in `WALKING` mode, the player jumps (`verticalVelocity.current = 4.2`).
  - In `src/components/ui/SpecimenInspectionModal.tsx` (lines 531–536): `Space` or `X` triggers `togglePartDetached()` when `processMode === 'CUT'`.
  - **Observation on Key Conflict**: There is currently NO handler in `PlayerController.tsx` for `Space` when `mode === 'INSPECTING'`. In inspection mode, pressing `Space` does not trigger part detachment, creating a discrepancy with the requirement: *"allowing the inner part to be detached and lifted when user presses Space"*.

### 1.3 State Variables in `src/store/useLabStore.ts` & `src/types/lab.ts`
- **Current Store State** (`src/store/useLabStore.ts`):
  - `processMode: 'CUT' | 'ENGRAVE'` (lines 65, 146, 573).
  - `isPartDetached: boolean` (lines 67, 147, 589–608).
  - `isLidOpen: boolean` (lines 37, 132, 225–283).
  - `cutProgress: number` (lines 40, 135, 381–399).
- **Missing State Variables** required by R3:
  - `processMode` does not yet include extended union values: `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`.
  - `engravingDepthMap: Float32Array` (missing from store).
  - `activeSpecimenMesh` (missing from store).
  - `chillerStatus: 'normal' | 'overheat'` (missing from store).
  - `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }` (missing from store).

### 1.4 Materials Catalog (`src/data/materialsConfig.ts`)
- The 6 required materials are already established:
  1. `ACRYLIC` (lines 29–74): Polymer PMMA, transparent, CO2 optimal (flame-polished), UV frosted, Fiber blocked.
  2. `WOOD` (lines 76–121): Plywood 3mm, organic cellulose, CO2 optimal (charring edge), Fiber ineffective.
  3. `STEEL` (lines 123–168): Stainless steel 304, CO2 blocked/reflective (>95%), Fiber optimal (color annealing/oxide film).
  4. `ALUMINUM` (lines 170–215): 6061-T6 black anodized, CO2/UV/Fiber bakes/ablates anodized layer to bright white.
  5. `SILICON` (lines 217–262): Semiconductor wafer, mirror polished, CO2 thermal shock fracture, UV 355nm cold photochemical ablation (dicing/zero HAZ).
  6. `GLASS` (lines 264–309): Borosilicate optical flat, CO2 frosted micro-crack, UV zero-chip cutting, Fiber 100% transparent.

---

## 2. Logic Chain

### 2.1 Character Architecture (`src/components/3d/characters/`)
1. **`OperatorHandsHUD.tsx`**:
   - *Premise*: First-person simulation requires the operator's hands to be visible only during `mode === 'WALKING'`, dynamically tracking camera translation and orientation.
   - *Kinematics & Rendering*:
     - Mounting inside `CanvasContainer.tsx` or as a camera-anchored child in `PlayerController.tsx`.
     - In `useFrame`, retrieve `state.camera.position` and `state.camera.quaternion`.
     - Procedural mesh geometry (bypassing external .gltf dependencies for 100% offline uptime):
       - Left & Right Forearms (`cylinderGeometry`), Wrists, Palms (`boxGeometry` with beveled edges), 5 Articulated Fingers each with proximal, intermediate, and distal phalanx segments.
     - Glove Material Switching via `useLabStore.getState().operatorPPE.glovesESD`:
       - If `glovesESD === true`: Blue/Cyan anti-static dissipative polyurethane texture with carbon weave lines and a coiled grounding ESD wrist strap.
       - If `glovesESD === false`: Heavy Kevlar/Nomex thermal insulation yellow/charcoal material with heat-resistant reinforced palm padding.
     - Gestures & State Animations:
       - `idle`: Sine-wave vertical breathing displacement (`y = sin(t * 2) * 0.006`).
       - `walk`: Natural forward/back sway and bobbing amplitude proportional to player speed (`Math.hypot(vx, vz)`).
       - `keyO` (Lid Open/Close): Right hand performs a 0.6s forward reach and grasp arc towards the machine canopy handle.
       - `keyG` (Inspection): Both hands rise into center view holding/presenting the workpiece plate.
       - `keySpace` (Part Detach): When detaching a part, the right hand reaches down, pinches the inner cutout, and elevates it.

2. **`LabEngineerNPC.tsx`**:
   - *Premise*: R2 requires a cleanroom/PPE lab engineer with hardhat and OD7+ safety goggles dynamically matching station laser wavelength (green, orange, red).
   - *Spatial Placement*:
     - Located in the cleanroom walkway near Station 1 & 2 (`[-2.5, 0, -3.5]`) or near the central aisle (`[0, 0, 1.5]`), clear of player spawn (`[0, 1.7, 4]`) and station AABB colliders.
   - *Procedural Mesh*:
     - Cleanroom jumpsuit (Tyvek bunny suit, white/light slate `#f1f5f9`), cleanroom booties, nitrile blue gloves, industrial hardhat (yellow or white with harness).
     - Head tracking: In `useFrame`, if distance to player camera is < 4.5m, head yaw smoothly rotates towards player camera (`THREE.MathUtils.lerp`).
   - *Dynamic OD7+ Optical Safety Goggles*:
     - Frame: Matte black wraparound safety frame with opaque side shields (protecting against diffuse reflections).
     - Dielectric Filter Lenses (`meshStandardMaterial` with `roughness: 0.05`, `metalness: 0.3`, `transparent: true`, `opacity: 0.65`):
       - When station is `CO2_LASER` (10.6 µm): Clear / gold-reflective OD7+ dielectric lens coating.
       - When station is `UV_LASER` (355 nm): Amber/Orange tint (`#f97316`) absorbing UV/violet photons.
       - When station is `FIBER_LASER` (1064 nm): Emerald Green tint (`#10b981`) absorbing 1064nm near-IR photons.
       - When station is `COATING_STATION` (395 nm): Yellow/Amber tint (`#eab308`).
       - Default / Standby: Cleanroom safety green (`#10b981`).

3. **`SafetyGearVisualizer.tsx`**:
   - *Premise*: Provides visual confirmation of PPE safety status to prevent operator hazard and comply with ISO/ANSI laser safety standards.
   - *Dual Architecture*:
     - 3D Gear Stand: Physical PPE station located beside the airlock entrance (`[-2.2, 0, 6.5]`) with interactive storage hooks for goggles and ESD wrist strap test pad.
     - HUD Status Indicator: Integrates with `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }` from `useLabStore`, displaying live status badges and triggering warning toasts if player approaches an active Class 4 laser without matching goggles.

---

### 2.2 Industrial Props & Draw Call Budget Optimization (< 100 Draw Calls)
1. **The Draw Call Constraint Analysis**:
   - A standard WebGL scene rendering 20+ distinct prop meshes individually produces 100–250+ draw calls, severely impacting mobile and integrated GPUs.
   - Requirement: Total draw calls must remain strictly `< 100 Draw Calls`, achieved by grouping repetitive static props into at most 8 `THREE.InstancedMesh` groups.

2. **The 8 `THREE.InstancedMesh` Groups Specification**:
   | Group # | Instanced Mesh Name | Target Prop Type | Shared Geometry & Material | Instance Count & Locations |
   |---|---|---|---|---|
   | **1** | `InstancedGasCylinders` | High-Pressure Gas Cylinders (N2, O2, Argon) | Cylinder body + hemispherical top dome (single merged geometry). Standard PBR material with instance colors: Blue (O2), Slate/Black (N2), Green (Argon). | 8–12 instances across CO2 station, Fiber station, and West wall storage rack. |
   | **2** | `InstancedEStops` | Red Emergency Stop Mushroom Buttons | Mushroom cap + circular yellow backing bezel. Glossy red material (`#dc2626`). | 6–8 instances mounted on every machine console and airlock exits. |
   | **3** | `InstancedISO7010Signs` | ISO 7010 Laser Radiation Hazard Placards | Equilateral triangular prism + yellow safety faceplate. Yellow high-vis enamel (`#facc15`). | 8–10 instances placed at machine perimeters and room entry doors. |
   | **4** | `InstancedWorkbenches` | Industrial Equipment Tables & Tool Benches | Powder-coated steel square tube leg frames. Dark matte steel (`#1e293b`, metalness 0.8). | 4–6 instances supporting metrology tools and specimen trays. |
   | **5** | `InstancedSpecimenTrays` | Conductive ESD Specimen Organizing Trays | Shallow beveled rectangular tray. Anti-static blue/grey plastic (`#0284c7`). | 6–8 instances on workbenches holding cut specimens and coupons. |
   | **6** | `InstancedCalipers` | Digital Vernier Calipers | Caliper main beam, fixed jaw, and digital LCD slider body. Satin chrome (`#cbd5e1`, metalness 0.95). | 4–6 instances on inspection benches. |
   | **7** | `InstancedMicroscopes` | Optical Stereo Inspection Microscopes | Heavy circular base, vertical column, and binocular viewing head. Off-white cleanroom enamel (`#e2e8f0`). | 3–4 instances on metrology tables. |
   | **8** | `InstancedDuctFlanges` | Ventilation Duct Clamps & Wall Collars | Ring flange with peripheral fastener bosses. Galvanized zinc steel (`#94a3b8`, metalness 0.85). | 16–24 instances clamping ceiling ventilation and fume ducts. |

3. **Dynamic Interactive Props (Unique Meshes)**:
   - **Recirculating Water Chiller Unit (CW-5200)**:
     - Chassis positioned next to CO2 laser (`[-7.6, 0, -3.2]`).
     - Real-time LED digital matrix display rendering water temperature (`22.4 °C`), flow rate (`4.8 L/min`), and status.
     - Synchronized with `chillerStatus: 'normal' | 'overheat'`. When overheated, display turns flashing red, chiller alarm sound triggers, and cutting is interlocked.
     - Dual translucent polyurethane water supply/return hoses connecting into machine laser tube.
   - **Fume Extraction Unit with Flexible Articulated Duct**:
     - Industrial centrifugal turbine cabinet located behind machine.
     - Segmented articulated gooseneck duct ending in a wide intake hood suspended 15cm above cutting bed.
     - Subtle suction particle effect activated when machine cutting job is in progress.
   - **Gas Cylinder Manifold Regulators**:
     - Dual-stage brass pressure regulator bodies with high-pressure inlet gauge (0–250 bar) and low-pressure delivery gauge (0–10 bar) mounted on active cylinders.

---

### 2.3 Interactive Specimens Architecture (`src/components/3d/specimens/`)
1. **The 6 Base Materials PBR Specification**:
   - `WOOD`: Baltic birch plywood. Diffuse maple/birch wood grain, zero metalness, roughness 0.75, dark carbonized brown HAZ kerf edge (`#3b1c06`).
   - `ACRYLIC`: Cast PMMA. Transparent cyan/clear, roughness 0.05, metalness 0.1, transmission 0.92, flame-polished smooth crystal kerf edge (`#38bdf8`).
   - `STEEL`: 304 Stainless Steel. Cold-rolled metallic sheen, metalness 0.95, roughness 0.18, heat-tinted rainbow/golden annealed oxide track (`#f59e0b`).
   - `ALUMINUM`: 6061-T6 Black Anodized. Deep matte dark charcoal body (`#1e293b`), roughness 0.4, with laser-ablated bright silvery-white aluminum kerf (`#f8fafc`).
   - `SILICON`: 8-inch (200mm) Single-Crystal Silicon Wafer. Mirror-polished disk with crystal orientation flat edge, iridescent thin-film interference sheen (`#1e1b4b`, metalness 0.98, roughness 0.03), and photolithographic microchip die grid.
   - `GLASS`: Borosilicate Optical Glass. Clear transparent, refractive index 1.52, roughness 0.05, with frosted micro-cracked light-diffusing kerf edge (`#e2e8f0`).

2. **Two-Part Mesh Structure (Outer Stock Plate + Inner Cutout Mesh)**:
   - *Outer Stock Plate*:
     - Dimensions: Standard sheet 1.6m × 1.0m (or 200mm diameter for circular wafer).
     - Geometry: Extruded shape containing a hollow negative hole matching the closed toolpath contour (`plateShape.holes.push(partHole)`).
   - *Inner Cutout Mesh*:
     - Geometry: Extruded shape from the closed toolpath contour with identical thickness (e.g. 3.0mm).
     - In `useFrame`, when `isPartDetached` is true, the inner part translates upward along Y (+0.25m) via smooth damping:
       ```ts
       const targetY = isPartDetached ? 0.25 : 0;
       liftY.current = THREE.MathUtils.damp(liftY.current, targetY, 8, delta);
       innerMeshRef.current.position.y = liftY.current;
       ```
   - *Exposed Kerf Walls*:
     - When lifted, the vertical side walls of both the hole and the detached inner part become fully visible, displaying:
       1. The exact kerf gap width (0.015mm to 0.18mm depending on material/laser).
       2. Realistic kerf wall surface finish (charred wood, flame-polished acrylic, silvery aluminum, or oxide-annealed steel).
       3. Coating layer on top face if processed through `COATING_STATION`.
   - *Dashed Guide Lines*:
     - 4 vertical dashed corner projection lines linking the empty hole to the elevated inner part.

3. **Placement of `InteractiveSpecimen` in Codebase**:
   - Create `src/components/3d/specimens/InteractiveSpecimen.tsx`: Can be mounted:
     a) Directly onto machine cutting beds in `ProceduralMachineBox.tsx`.
     b) On the rotary turntable in `SprayCoatingBooth.tsx`.
     c) Inside `SpecimenInspectionModal.tsx`.

---

### 2.4 Keybindings & Input Management
1. **Handling Key O (Lid)**:
   - Already triggers `useLabStore.getState().toggleLid()`.
   - Action needed: Hook `OperatorHandsHUD` to trigger reaching/grasping animation on `KeyO`.
2. **Handling Key G (Inspect Specimen)**:
   - Already opens `SpecimenInspectionModal`.
   - Action needed: Hook `OperatorHandsHUD` to raise hands in inspection presentation pose.
3. **Handling Key Space (Detaching Inner Specimen)**:
   - *Root cause of conflict*: Currently `useKeyboardControls.ts` maps `Space` exclusively to `keys.current.jump = true`.
   - *Resolution Logic*:
     - In `PlayerController.tsx` `handleKeyDown`:
       ```ts
       if (e.code === 'Space') {
         const store = useLabStore.getState();
         // If inspecting a station or if looking directly at a finished machine workpiece:
         if (store.mode === 'INSPECTING' || store.isSpecimenModalOpen) {
           e.preventDefault();
           store.togglePartDetached();
           return;
         }
         // Otherwise in WALKING mode, allow normal jump
       }
       ```
     - In `useKeyboardControls.ts`: ensure `jump` is only flagged if not consumed by specimen detachment.

---

### 2.5 Store Synchronization Plan (`useLabStore.ts` & `lab.ts`)
1. **Extensions to `src/types/lab.ts`**:
   ```ts
   export type ProcessMode =
     | 'through-cut'
     | 'surface-engrave'
     | 'color-annealing'
     | 'relief-2.5d'
     | 'CUT'
     | 'ENGRAVE'; // preserve backward compatibility

   export interface OperatorPPE {
     gogglesWavelength: string; // e.g. '10.6um' | '355nm' | '1064nm' | 'all-wavelength' | 'none'
     glovesESD: boolean;        // true = ESD Dissipative, false = Heat-Resistant Nomex
     hardhat: boolean;
     coatCleanroom: boolean;
   }

   export type ChillerStatus = 'normal' | 'overheat';
   ```
2. **Extensions to `src/store/useLabStore.ts`**:
   - Add state properties:
     - `processMode: ProcessMode` (initialized to `'through-cut'`).
     - `engravingDepthMap: Float32Array | null` (initialized to `null` or a 128x128 buffer).
     - `activeSpecimenMesh: string | null` (id of active 3D specimen mesh).
     - `chillerStatus: ChillerStatus` (initialized to `'normal'`).
     - `operatorPPE: OperatorPPE` (initialized to `{ gogglesWavelength: '1064nm', glovesESD: true, hardhat: true, coatCleanroom: true }`).
   - Add action setters:
     - `setProcessMode: (mode: ProcessMode) => void`
     - `setEngravingDepthMap: (map: Float32Array | null) => void`
     - `setActiveSpecimenMesh: (meshId: string | null) => void`
     - `setChillerStatus: (status: ChillerStatus) => void`
     - `setOperatorPPE: (ppe: Partial<OperatorPPE>) => void`
     - `togglePartDetached: () => void` (already implemented, verify sync with 3D specimen).

---

## 3. Caveats
1. **Asset File Boundaries**:
   - No external `.gltf` / `.obj` 3D model files exist in the repository. All characters (NPC, hands), props (chiller, fume duct, gas bottles), and specimens must be authored using procedural Three.js primitives (`boxGeometry`, `cylinderGeometry`, `sphereGeometry`, `ExtrudeGeometry`) and PBR materials. This guarantees 100% offline loading and prevents 404 network errors.
2. **Font Loading for 3D Text**:
   - `@react-three/drei`'s `<Text>` component requires network fetching for custom fonts unless wrapped in `<Suspense fallback={null}>` (as done by `SafeText` in `WorkshopEnvironment.tsx`). Any 3D signage or digital displays must wrap `<Text>` in `Suspense`.
3. **Post-Processing Bloom Impact on Emissives**:
   - In `PostProcessingEffects.tsx`, Bloom has a luminance threshold of ~0.85. Any glowing status LED (interlock, E-Stop indicator, chiller warning) must set `emissiveIntensity > 1.5` and `toneMapped={false}` to bloom correctly.
4. **Pointer Lock Exits**:
   - When triggering inspection modals (`KeyG`, `KeyT`), `document.exitPointerLock()` must be explicitly called to avoid trapped mouse cursor states.

---

## 4. Conclusion

### Summary Assessment
1. The 3D scene architecture is clean and robust, with clear extension points in `CanvasContainer.tsx`, `WorkshopEnvironment.tsx`, and `ProceduralMachineBox.tsx`.
2. Creating the missing directories `src/components/3d/characters/`, `src/components/3d/props/`, and `src/components/3d/specimens/` will cleanly compartmentalize R2 features without bloating existing files.
3. The Draw Call Budget (< 100 Draw Calls) can be strictly adhered to by implementing the 8 specified `THREE.InstancedMesh` groups for repetitive static props (cylinders, E-stops, ISO signs, benches, trays, calipers, microscopes, flanges).
4. The two-part specimen structure (`OuterStockPlate` + `InnerCutoutMesh`) prototype in `SpecimenInspectionModal.tsx` can be abstracted into a modular, reusable component (`InteractiveSpecimen.tsx`) for in-machine rendering and 3D detachment via `Space`.
5. Keybinding handling for `Space` requires contextual disambiguation in `PlayerController.tsx` so that detaching works seamlessly when inspecting or at a station without triggering an unwanted jump.
6. The state extensions in `useLabStore.ts` and `lab.ts` are straightforward and will integrate cleanly with zero breaking changes.

---

## 5. Verification Method

### 5.1 Independent Verification Commands
1. **TypeScript Compilation**:
   ```powershell
   npx tsc --noEmit
   ```
   *Expected Result*: Exits with code 0 and zero type errors.

2. **Production Bundle Build**:
   ```powershell
   npm run build
   ```
   *Expected Result*: Builds successfully with Vite in < 10 seconds.

3. **Draw Call Audit in Browser DevTools**:
   - In WebGL debug console:
     ```js
     // Access renderer info
     console.log(window.__THREE_DEVTOOLS__ || gl.info.render.calls);
     ```
   - Invalidation condition: Total render calls ≥ 100 in default walking view.

4. **Keybinding Interaction Verification**:
   - Press `O`: Machine lid toggles; hands HUD reaches for canopy handle; interlock state updates.
   - Press `G`: Specimen inspection modal opens; pointer lock is cleanly released.
   - Press `Space` during machine inspection or modal: `isPartDetached` toggles; inner part elevates by 0.25m, exposing kerf walls; player does NOT jump.
   - Press `Space` in open walking mode: Player jumps normally.
