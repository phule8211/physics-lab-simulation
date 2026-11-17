## 2026-11-05T05:08:45Z
You are worker_m2 (operating as `agent_entity_designer`), a versatile worker agent.
Your working directory is: d:/phanulab/.agents/teamwork/worker_m2/
You MUST read the original request at: d:/phanulab/.agents/teamwork/ORIGINAL_REQUEST.md
You MUST read the project architecture at: d:/phanulab/PROJECT.md
You MUST read the comprehensive survey and blueprints at: d:/phanulab/.agents/teamwork/explorer_survey_3/handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
You exclusively own:
- `src/components/3d/characters/OperatorHandsHUD.tsx`
- `src/components/3d/characters/LabEngineerNPC.tsx`
- `src/components/3d/characters/SafetyGearVisualizer.tsx`
- `src/components/3d/props/IndustrialAuxiliaryProps.tsx`
- `src/components/3d/specimens/InteractiveSpecimen.tsx`
DO NOT modify any other files in the project.

Your mission:
Implement R2 (3D Characters, Industrial Props, and Interactive Specimens) with high aesthetic quality and performance:
1. `src/components/3d/characters/`:
   - `OperatorHandsHUD.tsx`: First-person procedural hands visible in walking mode, tracking camera position and rotation. Supports glove switching (ESD anti-static blue with carbon weave lines vs Nomex/Kevlar heat-resistant yellow/charcoal). Animated controls for opening lid with key O, inspecting specimen with key G, and detaching with Space.
   - `LabEngineerNPC.tsx`: Cleanroom PPE lab technician (bunny suit, booties, hardhat) with head tracking when player approaches (< 4.5m) and dynamic OD7+ optical safety goggles matching station laser wavelength (gold/clear for CO2 10.6um, amber/orange for UV 355nm, emerald green for Fiber 1064nm).
   - `SafetyGearVisualizer.tsx`: PPE visual status station and live indicator.
2. `src/components/3d/props/IndustrialAuxiliaryProps.tsx`:
   - Repetitive static props MUST be grouped into at most 8 `THREE.InstancedMesh` groups to guarantee the draw call budget remains strictly under 100 Draw Calls:
     1. High-pressure gas cylinders (N2, O2, Argon with color codes: Slate/Black, Blue, Green)
     2. Red emergency stop (E-Stop) mushroom buttons
     3. ISO 7010 laser radiation hazard placards
     4. Industrial equipment workbenches
     5. Conductive ESD specimen organizing trays
     6. Digital vernier calipers
     7. Optical stereo inspection microscopes
     8. Ventilation duct flanges/collars
   - Dynamic unique props:
     * Recirculating water chiller unit (CW-5200) with LED digital readout for temperature (22.4 °C), flow (4.8 L/min), and status (normal / flashing overheat warning).
     * Fume extraction unit with flexible articulated gooseneck duct and intake hood.
3. `src/components/3d/specimens/InteractiveSpecimen.tsx`:
   - 6 base materials (Wood, Acrylic, Steel, Anodized Aluminum, 8-inch Silicon Wafer with circuit grid, Optical Glass) with authentic PBR material properties.
   - Two-part mesh structure: Outer Stock Plate (with negative hole) + Inner Cutout Mesh.
   - Smooth vertical detachment animation (+0.25m lift) when `isPartDetached` is true (triggered by Space key), exposing vertical kerf side walls with material-specific finishes (charred wood, flame-polished acrylic, silvery aluminum, annealed steel) and surface coating layer.

Verification:
- Run `npx tsc --noEmit` and `npm run build` using `run_command`. Ensure zero errors.
- Document commands and results in `d:/phanulab/.agents/teamwork/worker_m2/handoff.md`.
- Send message back to parent when complete.
