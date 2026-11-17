## 2026-11-05T04:59:48Z
You are explorer_survey_3, a read-only exploration agent.
Your working directory is: d:/phanulab/.agents/teamwork/explorer_survey_3/
You MUST read the original request at: d:/phanulab/.agents/teamwork/ORIGINAL_REQUEST.md

Your mission:
Survey the codebase for 3D Characters, Industrial Props, and Interactive Specimens (R2 & R3).
Specifically investigate:
1. Existing 3D character, prop, and specimen components in `src/components/3d/` or related directories. How is the 3D scene composed? Where are components mounted?
2. Requirements for `src/components/3d/characters/`:
   - `OperatorHandsHUD.tsx` (first-person hands with ESD/heat-resistant gloves, animations for controls, opening lid with key O, inspecting specimen with key G).
   - `LabEngineerNPC.tsx` (cleanroom/PPE lab engineer with hardhat and OD7+ safety goggles dynamically matching station laser wavelength: green, orange, red).
   - `SafetyGearVisualizer.tsx` (PPE visual status).
3. Requirements for `src/components/3d/props/`:
   - Water chiller with LED temperature/flow display.
   - Fume extractor with flexible duct.
   - Compressed gas cylinders (N2, O2, Argon) with pressure gauges.
   - Workbench, digital caliper, optical microscope, specimen tray, ISO 7010 laser radiation warning signs, red emergency stop (E-Stop).
   - Draw call budget constraint (< 100 Draw Calls) and grouping repetitive static props into at most 8 `THREE.InstancedMesh` groups.
4. Requirements for `src/components/3d/specimens/`:
   - 6 base materials: Wood, Acrylic, Steel, Anodized Aluminum, 8-inch Silicon Wafer with circuit grid, Optical Glass.
   - Two-part mesh structure (Outer Stock Plate + Inner Cutout Mesh) allowing inner part to be detached and lifted when user presses Space, exposing kerf walls and coating finish.
5. Key bindings and user input management (O for lid, G for inspection, Space for detaching inner specimen).

Write your comprehensive findings and recommendations to:
`d:/phanulab/.agents/teamwork/explorer_survey_3/handoff.md`
Report back via send_message when complete.
