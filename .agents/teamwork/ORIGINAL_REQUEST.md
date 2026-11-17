# Original User Request

## Initial Request — 2026-11-05T04:58:20Z

Implement production features for the Virtual Physics & Industrial Laser Lab 3D Extended simulation by adding `agent_laser_engraving` and `agent_entity_designer` to the 10-agent swarm architecture.

Working directory: d:/phanulab
Integrity mode: development

## Requirements

### R1. Laser Engraving and Micro-Machining Engine (`agent_laser_engraving`)
- Create `src/data/engravingProfiles.ts` defining physical engraving parameters (Power %, Scan Speed mm/s, Pulse Frequency 20-200 kHz, Pulse Width 2-500 ns for MOPA Fiber, Line Interval / DPI) across three engraving modes: Vector Scoring/Engraving (high-speed outline, 0.05 - 0.1 mm depth), Raster Bi-directional Engraving (with Floyd-Steinberg dithering / halftone), and Deep 2.5D Relief Engraving (multi-pass 0.5 - 2.0 mm depth based on grayscale depth maps).
- Implement `src/utils/engravingEngine.ts` with closed-polygon hatching and cross-hatching algorithms supporting configurable scan angles (0°, 45°, 90°, 135°), kerf offset compensation, machining time estimation based on total path length, and real-time depth/normal map generation as the laser scans coordinates [x, y].
- Implement `src/components/3d/visual-effects/EngravingSurfaceShader.tsx` supporting surface transformation effects: CO2 wood/leather carbonization with heat-affected zone (HAZ), CO2/UV frosted micro-cracking / bubbling on glass/acrylic, Fiber 1064nm laser color annealing on stainless steel and titanium (thin oxide film interference without stock depression), and UV 355nm zero-HAZ cold micro-machining peeling photoresist/oxide on silicon wafers.

### R2. 3D Characters, Industrial Props, and Interactive Specimens (`agent_entity_designer`)
- Implement character and operator components in `src/components/3d/characters/`: `OperatorHandsHUD.tsx` (first-person hands with ESD/heat-resistant gloves, animations for controls, opening lid with key O, inspecting specimen with key G), `LabEngineerNPC.tsx` (cleanroom/PPE lab engineer with hardhat and OD7+ safety goggles dynamically matching station laser wavelength: green, orange, red), and `SafetyGearVisualizer.tsx` (PPE visual status).
- Implement industrial auxiliary props in `src/components/3d/props/`: water chiller with LED temperature/flow display, fume extractor with flexible duct, compressed gas cylinders (N2, O2, Argon) with pressure gauges, workbench, digital caliper, optical microscope, specimen tray, ISO 7010 laser radiation warning signs, and red emergency stop (E-Stop). Group repetitive static props into at most 8 `THREE.InstancedMesh` groups to preserve draw call budget (< 100 Draw Calls).
- Implement 3D stock and finished specimens in `src/components/3d/specimens/`: 6 base materials (Wood, Acrylic, Steel, Anodized Aluminum, 8-inch Silicon Wafer with circuit grid, Optical Glass) with a two-part mesh structure (Outer Stock Plate + Inner Cutout Mesh) allowing the inner part to be detached and lifted when the user presses `Space`, exposing kerf walls and coating finish.

### R3. State Synchronization and System Integration (`useLabStore.ts`)
- Extend `src/store/useLabStore.ts` with the synchronization interface for the two new modules:
  - Process modes: `processMode: 'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'` and `engravingDepthMap: Float32Array`.
  - Specimen & prop state: `activeSpecimenMesh`, `isPartDetached: boolean` (toggled via `Space`), and `chillerStatus: 'normal' | 'overheat'`.
  - PPE state: `operatorPPE: { gogglesWavelength: string, glovesESD: boolean }`.
- Ensure clean multi-agent architectural boundaries where each agent only creates and edits files within its assigned scope.

## Acceptance Criteria

### Build & Verification
- [ ] TypeScript compilation (`npx tsc --noEmit`) succeeds with zero errors across all new and modified files.
- [ ] Application builds successfully (`npm run build`) without bundling errors.
- [ ] Performance target: Maintains 60 FPS and total Draw Calls remain strictly under 100 via InstancedMesh for props and shader optimizations.
- [ ] All specified state variables (`processMode`, `engravingDepthMap`, `activeSpecimenMesh`, `isPartDetached`, `chillerStatus`, `operatorPPE`) exist and are correctly typed in `useLabStore.ts`.
- [ ] Keyboard interactions (O for lid, G for inspection, Space for detaching inner specimen) function correctly with corresponding state changes.
