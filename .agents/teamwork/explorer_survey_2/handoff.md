# Comprehensive Survey & Architecture Report: Laser Engraving & Micro-Machining Engine (R1)

**Agent**: `explorer_survey_2`  
**Date**: 2026-11-05  
**Mission**: Survey the codebase and define detailed architectural blueprints, interface contracts, math algorithms, and shader designs for R1 (`agent_laser_engraving`).

---

## 1. Observation

### 1.1 Existing Laser Configuration & Data in `src/data/`
1. **`src/data/materialsConfig.ts`**:
   - Lines 3-4: Defines 6 materials:
     ```ts
     export type MaterialType = 'ACRYLIC' | 'WOOD' | 'STEEL' | 'ALUMINUM' | 'SILICON' | 'GLASS';
     ```
   - Lines 5-13: `MaterialInteraction` specifies qualitative badges:
     ```ts
     export interface MaterialInteraction {
       status: 'OPTIMAL' | 'COMPATIBLE' | 'BLOCKED_REFLECTIVE' | 'INEFFECTIVE';
       statusText: string;
       badgeColor: string;
       effectDescription: string;
       sparkColor: string;
       canCutOrEngrave: boolean;
     }
     ```
   - Lines 28-310: `MATERIALS_CATALOG` contains qualitative descriptions for 4 stations (`CO2_LASER`, `UV_LASER`, `FIBER_LASER`, `SENSOR_STATION`).
   - **Critical Observation**: There are **zero quantitative, physical engraving parameters** (no Power %, Scan Speed mm/s, Pulse Frequency kHz, Pulse Width ns, Line Interval mm / DPI, Layer passes, or gas pressure).

2. **`src/data/physicsData.ts`**:
   - Lines 59-521: Detailed technical texts for CO2 (10.6 µm, Far-IR, 40-180W), UV (355 nm, DPSS, Nd:YVO4 with SHG/THG LBO crystals, 20-200 kHz, 10-30 ns), and Fiber (1064 nm, Ytterbium, Galvo scanning up to 7,000-12,000 mm/s, MOPA 2-500 ns pulse width).
   - This provides the scientific ground truth for parameter ranges and physical phenomena (e.g., thin oxide film iridescence on stainless steel / titanium, photochemical zero-HAZ cold ablation on silicon, carbonization on wood, frosted thermal micro-cracking on glass).

3. **`src/data/vectorDesigns.ts`**:
   - Lines 1-11:
     ```ts
     export type Point2D = [number, number]; // Coordinates in range [-1, 1]
     export interface VectorDesign {
       id: string;
       name: string;
       category: 'Kỹ thuật cơ khí' | 'Biểu tượng khoa học' | 'Nghệ thuật & Decor' | 'Tùy biến người dùng';
       description: string;
       iconName: string;
       paths: Point2D[][]; // Array of continuous polylines
       estimatedTimeSec: number;
     }
     ```
   - Lines 392-421: `buildToolpathIndex` computes `segments: PathSegment[]` and `totalLength: number`.
   - Lines 426-446: `interpolateToolpathPoint(segments, totalLength, progress01)` linearly interpolates the laser tool position `[x, y]`.
   - Lines 254-280: `computeBoundingBox` returns `{ minX, maxX, minY, maxY, width, height, centerX, centerY, isOutOfBounds }`.

### 1.2 Existing Math & Cutting Algorithms in `src/utils/`
1. `src/utils/` currently contains **only `audioSystem.ts`**. No math, geometry, or path planning modules exist in `src/utils/`.
2. Existing toolpath manipulation resides in `src/data/vectorDesigns.ts` (`autoFitToolpaths`, `transformToolpaths`, `generateFramePath`) and in `src/components/ui/SpecimenInspectionModal.tsx` (`isStrokeClosed`, `computeStrokeArea`, `makeRoundedBadgePath`, `buildCutoutMeshes`).
3. **Missing Essential Algorithms**:
   - No closed-polygon scanline hatching or cross-hatching algorithm exists.
   - No kerf offset compensation (inward/outward polygon offsetting) exists.
   - No Floyd-Steinberg error diffusion dithering algorithm exists.
   - Machining time estimation is currently static (`estimatedTimeSec: 8.5` hardcoded) or linear dummy increment (`cutProgress + delta * 12.0`).
   - No dynamic depth or normal map buffer generation exists.

### 1.3 Existing Shaders & Visual Effects in `src/components/3d/visual-effects/`
1. The folder currently contains:
   - `CO2LaserBeam.tsx`: Uses `meshBasicMaterial` with `cylinderGeometry` and `AdditiveBlending`, triggering `CuttingSparks`.
   - `GalvoMirrorBeam.tsx`: Uses `THREE.Line` with `bufferGeometry` and oscillating servo mirrors.
   - `UVLaserBeam.tsx`: Pulsing violet cylinder beam with additive glow.
   - `CuttingSparks.tsx`: Particle simulation using `THREE.Points` and gravity update in `useFrame`.
2. **Critical Observation**: There are **zero custom WebGL shaders** (`ShaderMaterial` / GLSL code) currently in the project. All surfaces render standard Three.js materials (`MeshStandardMaterial`, `MeshBasicMaterial`).
3. There is no surface transformation shader showing wood charring + HAZ, glass frosted micro-cracking, fiber color annealing, or UV photoresist peeling.

### 1.4 State Synchronization & Build System
1. `src/store/useLabStore.ts`:
   - Line 65: `processMode: 'CUT' | 'ENGRAVE'`.
   - R3 requires extending this to:
     ```ts
     processMode: 'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d';
     engravingDepthMap: Float32Array;
     ```
2. Build verification:
   - Command: `npx tsc --noEmit` $\to$ Exit code 0 (zero errors).
   - Command: `npm run build` $\to$ Built in 6.70s with Vite 6.2.0, zero errors.

---

## 2. Logic Chain & Technical Architecture Design

### 2.1 Design of `src/data/engravingProfiles.ts`

Based on physical laser laws and the requirements for the 3 distinct modes, we specify the following data structures and parameter matrix:

#### A. Core Type Definitions
```ts
export type EngravingMode = 'vector-scoring' | 'raster-engraving' | 'relief-2.5d';

export type LaserSourceType = 'CO2' | 'FIBER_MOPA' | 'FIBER_Q_SWITCHED' | 'UV_DPSS';

export type AssistGasType = 'AIR' | 'N2' | 'O2' | 'ARGON' | 'NONE';

export interface EngravingPhysicalParameters {
  powerPercent: number;          // 1 - 100%
  scanSpeedMmS: number;          // mm/s (CO2: 50-800, Galvo Fiber/UV: 500-10,000)
  pulseFrequencyKhz: number;      // 20 - 200 kHz (up to 4000 kHz for MOPA Fiber)
  pulseWidthNs: number;          // 2 - 500 ns (MOPA Fiber), ~15-30 ns (UV), ~100 ns (Q-Switched)
  lineIntervalMm: number;        // 0.01 - 0.25 mm
  dpi: number;                   // 100 - 2540 DPI (dpi = 25.4 / lineIntervalMm)
  passes: number;                // 1 (vector), 1-3 (raster), 5-50 (2.5D relief)
  depthPerPassMm: number;        // mm per pass (0.01 - 0.1 mm)
  totalExpectedDepthMm: number;  // mm (0.05 - 2.0 mm)
  focalOffsetMm: number;         // mm (0 = surface focus, negative = sub-surface)
  assistGas: AssistGasType;
  gasPressureBar: number;        // 0 - 10 bar
  kerfWidthMm: number;           // Spot diameter: 0.015 (UV), 0.035 (Fiber), 0.15 (CO2)
  hazRadiusMm: number;           // Thermal HAZ radius: 0.0 (UV), 0.05-0.1 (Fiber), 0.2-0.8 (CO2)
}

export interface EngravingProfile {
  id: string;
  name: string;
  mode: EngravingMode;
  materialId: MaterialType;
  laserSource: LaserSourceType;
  description: string;
  params: EngravingPhysicalParameters;
  visualPhenomenon: {
    type: 'carbonization-haz' | 'frosted-cracking' | 'color-annealing' | 'zero-haz-cold-peel';
    baseColor: string;
    engravedColor: string;
    hazColor?: string;
    roughness: number;
    metalness: number;
    filmThicknessNm?: number;    // for color annealing
  };
}
```

#### B. The 3 Engraving Modes Specification
1. **Mode 1: Vector Scoring / Engraving (`vector-scoring`)**:
   - Intended for high-speed outline marking and surface scoring (0.05 - 0.1 mm depth).
   - Parameters:
     - Power: 12% - 28%
     - Speed: 350 - 650 mm/s (CO2), 2,500 - 5,000 mm/s (Galvo)
     - Frequency: 30 - 50 kHz
     - Line Interval: single vector stroke (0 mm hatch)
     - Passes: 1 pass
     - Depth: 0.05 - 0.1 mm
     - Assist Gas: AIR (0.5 bar)
2. **Mode 2: Raster Bi-directional Engraving (`raster-engraving`)**:
   - Intended for high-resolution graphics, photos, and halftones using Floyd-Steinberg dithering.
   - Parameters:
     - Power: 18% - 45%
     - Speed: 500 - 1,200 mm/s (CO2), 4,000 - 8,000 mm/s (Galvo)
     - Frequency: 50 - 120 kHz
     - Line Interval: 0.05 - 0.10 mm (254 - 508 DPI)
     - Passes: 1 - 2 passes
     - Depth: 0.08 - 0.25 mm
     - Assist Gas: AIR (0.8 bar)
3. **Mode 3: Deep 2.5D Relief Engraving (`relief-2.5d`)**:
   - Intended for multi-pass tactile depth sculptures and bas-relief engravings (0.5 - 2.0 mm depth).
   - Parameters:
     - Power: 65% - 95%
     - Speed: 150 - 350 mm/s (CO2), 1,200 - 2,500 mm/s (Galvo)
     - Frequency: 20 - 45 kHz (high pulse energy)
     - Line Interval: 0.03 - 0.05 mm (508 - 846 DPI)
     - Passes: 10 - 40 passes (multi-layer grayscale slice ablation)
     - Depth per pass: 0.03 - 0.05 mm (Total depth: 0.5 - 2.0 mm)
     - Cross-hatch angle rotation between passes (e.g. 0° $\to$ 90° $\to$ 45° $\to$ 135°) to prevent surface ridge lines.
     - Assist Gas: AIR / N2 (2.0 - 4.0 bar) for debris clearing.

#### C. Material-Specific Profiles Catalog
The catalog must provide concrete presets for all 6 materials:
- `WOOD_CO2_VECTOR_SCORE`, `WOOD_CO2_RASTER_ENGRAVE`, `WOOD_CO2_DEEP_RELIEF`
- `ACRYLIC_CO2_VECTOR_SCORE`, `ACRYLIC_CO2_RASTER_ENGRAVE`, `ACRYLIC_UV_MICRO_FROST`
- `STEEL_FIBER_COLOR_ANNEAL_GOLD` (50 nm $TiO_2$), `STEEL_FIBER_COLOR_ANNEAL_BLUE` (210 nm $TiO_2$), `STEEL_FIBER_DEEP_ENGRAVE`
- `ALUMINUM_FIBER_ANODIZE_STRIP` (ultra-fast 6000 mm/s, zero depth loss, bright silver white), `ALUMINUM_UV_QR_MICRO`
- `SILICON_UV_COLD_DICING`, `SILICON_UV_PHOTORESIST_PEEL` (zero HAZ, 355 nm, 3.49 eV bond breaking)
- `GLASS_CO2_FROSTED_ENGRAVE`, `GLASS_UV_SUBSURFACE_MARK`

---

### 2.2 Design of `src/utils/engravingEngine.ts`

`engravingEngine.ts` is the computational backbone for toolpath generation, physical kerf offsetting, dithering, time estimation, and depth mapping.

#### Algorithm 1: Closed-Polygon Scanline Hatching & Cross-Hatching
- **Objective**: Generate dense raster fill vectors within an arbitrary 2D polygon with optional holes, oriented at scan angle $\theta \in [0^\circ, 180^\circ)$ (specifically 0°, 45°, 90°, 135°).
- **Mathematical Steps**:
  1. Let the polygon vertices be $V = \{(x_i, y_i)\}_{i=0}^{N-1}$.
  2. Rotate vertices by $-\theta$:
     $$x'_i = x_i \cos(-\theta) - y_i \sin(-\theta), \quad y'_i = x_i \sin(-\theta) + y_i \cos(-\theta)$$
  3. Find the rotated bounds: $y'_{\min} = \min(y'_i)$, $y'_{\max} = \max(y'_i)$.
  4. Generate scan lines spaced by $d$ (`lineIntervalMm`):
     $$y'_k = y'_{\min} + \frac{d}{2} + k \cdot d \quad \text{for } k = 0, 1, 2, \dots \text{ while } y'_k < y'_{\max}$$
  5. For each scanline $y'_k$:
     - Find all intersection points with polygon edges $(P'_i, P'_{i+1})$.
     - If $(y'_{i} \le y'_k < y'_{i+1})$ or $(y'_{i+1} \le y'_k < y'_{i})$:
       $$x'_{\text{int}} = x'_i + \frac{y'_k - y'_i}{y'_{i+1} - y'_i} (x'_{i+1} - x'_i)$$
     - Sort all $x'_{\text{int}}$ in ascending order: $x'_0 \le x'_1 \le x'_2 \le x'_3 \dots$
     - Pair consecutive intersections $[x'_0, x'_1], [x'_2, x'_3], \dots$ into valid internal segments.
  6. Bi-directional Optimization (Serpentine linking):
     - For even lines $k$: stroke from $x'_0 \to x'_1$.
     - For odd lines $k$: stroke from $x'_1 \to x'_0$.
  7. Rotate segments back by $+\theta$:
     $$x = x' \cos\theta - y' \sin\theta, \quad y = x' \sin\theta + y' \cos\theta$$
  8. For **Cross-Hatching**:
     - Compute hatch toolpaths at angle $\theta_1$ (e.g. 45°).
     - Compute hatch toolpaths at angle $\theta_2 = \theta_1 + 90^\circ$ (e.g. 135°).
     - Concatenate or interleave the strokes.

#### Algorithm 2: Kerf Offset Compensation
- **Objective**: Compensate for beam spot radius $r_{\text{kerf}} = w_{\text{kerf}} / 2$.
  - Outer contours expand outward by $+r_{\text{kerf}}$.
  - Inner holes contract inward by $-r_{\text{kerf}}$.
- **Mathematical Steps**:
  1. Determine polygon vertex winding order (shoelace formula signed area $A$). If $A > 0$, CCW; if $A < 0$, CW.
  2. For each edge vector $\vec{e}_i = P_{i+1} - P_i$, compute outward unit normal $\hat{n}_i = (e_{i,y}, -e_{i,x}) / \|\vec{e}_i\|$.
  3. At vertex $P_i$, the angle bisector (miter vector) is:
     $$\hat{m}_i = \frac{\hat{n}_{i-1} + \hat{n}_i}{\|\hat{n}_{i-1} + \hat{n}_i\|}$$
  4. The miter scale factor is:
     $$L_{m,i} = \frac{r_{\text{kerf}}}{\hat{m}_i \cdot \hat{n}_i}$$
  5. Miter clamping: If $\hat{m}_i \cdot \hat{n}_i < 0.2$ (sharp acute corner $\alpha < 25^\circ$), clamp $L_{m,i} = 2.5 \cdot r_{\text{kerf}}$ to prevent unbounded spike artifacts.
  6. Displace vertex: $P'_i = P_i + \text{direction} \cdot L_{m,i} \cdot \hat{m}_i$.

#### Algorithm 3: Floyd-Steinberg Error Diffusion Dithering
- **Objective**: Convert continuous 8-bit grayscale bitmap into binary laser pulse grid $[0, 1]$.
- **Matrix Formulation**:
  $$P(x, y) = \begin{cases} 1 & \text{if } g(x, y) \ge 128 \\ 0 & \text{if } g(x, y) < 128 \end{cases}$$
  $$\text{error } e = g(x, y) - (P(x, y) \times 255)$$
  $$g(x+1, y) \mathrel{+}= e \times \frac{7}{16}$$
  $$g(x-1, y+1) \mathrel{+}= e \times \frac{3}{16}$$
  $$g(x, y+1) \mathrel{+}= e \times \frac{5}{16}$$
  $$g(x+1, y+1) \mathrel{+}= e \times \frac{1}{16}$$

#### Algorithm 4: Physics-Based Machining Time Estimation
- Calculates total working distance $L_{\text{cut}}$, rapid transit distance $L_{\text{rapid}}$, turnaround deceleration/acceleration time, and multi-pass multiplication:
  $$T_{\text{pass}} = \frac{L_{\text{cut}}}{v_{\text{scan}}} + \frac{L_{\text{rapid}}}{v_{\text{rapid}}} + N_{\text{strokes}} \cdot t_{\text{settle}} + N_{\text{pierce}} \cdot t_{\text{pierce}}$$
  $$T_{\text{total}} = T_{\text{pass}} \times \text{passes}$$
  Where:
  - $v_{\text{rapid}} = 2.5 \times v_{\text{scan}}$ (for gantry) or $10,000 \text{ mm/s}$ (for Galvo).
  - $t_{\text{settle}} \approx 2 \text{ ms}$ (Galvo jump delay) or $40 \text{ ms}$ (gantry turnaround).

#### Algorithm 5: Dynamic Real-Time Depth & Normal Map Generator
- Manages an internal `Float32Array` of dimension $256 \times 256$ (or $512 \times 512$):
  - Function `stampLaserAblation(normX, normY, spotRadius, depthDelta)`:
    - Applies a 2D Gaussian beam kernel:
      $$K(u, v) = \exp\left(-2 \frac{(u - u_0)^2 + (v - v_0)^2}{r_{\text{spot}}^2}\right)$$
    - Accumulates depth: $D(u, v) = \min(D_{\max}, D(u, v) + \Delta d \cdot K(u, v))$.
  - Function `computeNormalMapTexture()`:
    - Computes central difference gradients:
      $$\frac{\partial D}{\partial x} \approx \frac{D(u+1, v) - D(u-1, v)}{2 \Delta u}, \quad \frac{\partial D}{\partial y} \approx \frac{D(u, v+1) - D(u, v-1)}{2 \Delta v}$$
    - Encodes normal vector $\hat{N} = \text{normalize}(-\partial D/\partial x, -\partial D/\partial y, 1.0)$ into an RGBA `DataTexture` (`R = (Nx+1)/2`, `G = (Ny+1)/2`, `B = (Nz+1)/2`, `A = Depth`).

---

### 2.3 Design of `src/components/3d/visual-effects/EngravingSurfaceShader.tsx`

`EngravingSurfaceShader.tsx` replaces standard plastic materials on specimens with physical surface transformation effects.

#### A. Uniforms Specification
```ts
export interface EngravingShaderUniforms {
  uTime: { value: number };
  uBaseColor: { value: THREE.Color };
  uBaseRoughness: { value: number };
  uBaseMetalness: { value: number };
  uDepthMap: { value: THREE.Texture };
  uProcessMode: { value: number };       // 0: through-cut, 1: surface-engrave, 2: color-annealing, 3: relief-2.5d
  uMaterialType: { value: number };      // 0: WOOD, 1: ACRYLIC, 2: STEEL, 3: ALUMINUM, 4: SILICON, 5: GLASS
  uLaserPosition: { value: THREE.Vector2 }; // [u, v] in [0, 1]
  uLaserActive: { value: number };       // 0.0 or 1.0
  uLaserSpotRadius: { value: number };   // e.g. 0.015
  uFilmThicknessNm: { value: number };   // 20 - 350 nm (for steel/titanium color annealing)
  uHazWidth: { value: number };          // HAZ falloff radius
  uHazColor: { value: THREE.Color };     // e.g. #2b1404 for wood
}
```

#### B. Physics Formulation for the 4 Surface Phenomena in GLSL

##### 1. CO2 Wood Carbonization with HAZ
- Core Kerf: As depth $d > 0.05$, color blends to charcoal black (`vec3(0.02, 0.02, 0.02)`), roughness increases to 0.95.
- Heat-Affected Zone (HAZ): Radial exponential falloff around edges:
  ```glsl
  float hazFactor = exp(-pow(distToKerf / uHazWidth, 2.0));
  vec3 woodHazColor = mix(uBaseColor, vec3(0.18, 0.08, 0.02), hazFactor * 0.85);
  finalColor = mix(woodHazColor, vec3(0.02), smoothstep(0.02, 0.1, depth));
  ```

##### 2. CO2 & UV Frosted Micro-Cracking / Bubbling (Glass & Acrylic)
- Thermal micro-fracturing on glass and photochemical foaming on acrylic scatters ambient light diffusely.
- Depth creates intense white micro-roughness with internal scattering:
  ```glsl
  // High-frequency procedural micro-crack noise
  float microCrack = fract(sin(dot(vUv * 400.0, vec2(12.9898, 78.233))) * 43758.5453);
  vec3 frostedColor = vec3(0.95, 0.97, 1.0);
  float frostIntensity = smoothstep(0.01, 0.08, depth);
  finalColor = mix(uBaseColor, frostedColor, frostIntensity * (0.8 + 0.2 * microCrack));
  finalRoughness = mix(uBaseRoughness, 0.88, frostIntensity);
  finalOpacity = mix(0.45, 0.95, frostIntensity); // frosted areas become opaque white
  ```

##### 3. Fiber 1064nm Laser Color Annealing (Steel & Titanium)
- **Principle**: Zero stock depression ($d \approx 0$). Heating causes a transparent $TiO_2 / Fe_2O_3$ oxide film of nanometer thickness $d_{\text{film}}$.
- **Thin-Film Interference (Airy Formulation)**:
  - Phase shift $\delta = \frac{4\pi}{\lambda} n_{\text{oxide}} d_{\text{film}} \cos\theta_t + \pi$.
  - Reflectance for red (650nm), green (532nm), blue (450nm):
    $$R(\lambda) = \frac{r_1^2 + r_2^2 + 2 r_1 r_2 \cos\delta}{1 + r_1^2 r_2^2 + 2 r_1 r_2 \cos\delta}$$
  - GLSL implementation:
    ```glsl
    // Cosine of viewing angle
    float cosTheta = max(0.0, dot(normalize(vNormal), normalize(vViewPosition)));
    float n_film = 2.45; // Refractive index of TiO2 / Cr2O3 oxide
    float cosThetaT = sqrt(1.0 - (1.0 / (n_film * n_film)) * (1.0 - cosTheta * cosTheta));
    
    // Optical path difference (OPD) in nanometers
    float opd = 2.0 * n_film * uFilmThicknessNm * cosThetaT;
    
    // Spectral wavelengths for RGB: R=650nm, G=532nm, B=450nm
    vec3 lambda = vec3(650.0, 532.0, 450.0);
    vec3 phase = (2.0 * 3.14159265 * opd) / lambda;
    vec3 interferenceRgb = 0.5 + 0.5 * cos(phase); // Iridescent interference spectrum
    
    // Color annealing preserves metallic sheen with ZERO stock removal
    finalColor = mix(uBaseColor, interferenceRgb, smoothstep(0.01, 0.05, depth));
    finalMetalness = uBaseMetalness * 0.92;
    finalRoughness = 0.22;
    ```

##### 4. UV 355nm Zero-HAZ Cold Micro-Machining (Silicon Wafer)
- Photochemical covalent bond cleavage at 3.49 eV. Zero thermal propagation ($HAZ = 0$).
- Clean step-function edge exposing metallic sub-layer or conductive track:
  ```glsl
  // Knife-edge transition (no thermal halo)
  float edgeCut = step(0.02, depth);
  vec3 siliconSubstrate = vec3(0.08, 0.08, 0.12);
  vec3 exposedMetalChannel = vec3(0.85, 0.75, 0.45); // Copper / Gold circuit metallization under photoresist
  finalColor = mix(uBaseColor, exposedMetalChannel, edgeCut);
  finalRoughness = mix(uBaseRoughness, 0.12, edgeCut);
  finalMetalness = mix(uBaseMetalness, 0.95, edgeCut);
  ```

##### 5. Real-Time Laser Scanning Contact Glow
- Dynamic thermal spot at `uLaserPosition`:
  ```glsl
  float distToLaser = length(vUv - uLaserPosition);
  float spotGlow = exp(-pow(distToLaser / uLaserSpotRadius, 2.0)) * uLaserActive;
  vec3 incandescence = vec3(1.0, 0.85, 0.5) * 4.0; // Over-exposed HDR bloom for PostProcessingEffects
  finalColor += incandescence * spotGlow;
  ```

---

## 3. Caveats

1. **Draw Call Budget (< 100 Draw Calls)**:
   - `EngravingSurfaceShader` must be shared across specimens or attached to the specimen material rather than instantiated multiple times as separate meshes.
   - Textures for depth maps ($256 \times 256$ `Float32Array` or `RGBAFormat`) must be pooled and updated using `texture.needsUpdate = true` rather than re-creating `new THREE.DataTexture()` every frame.
2. **`processMode` backward compatibility**:
   - `useLabStore.ts` currently defines `processMode: 'CUT' | 'ENGRAVE'`.
   - R3 requires: `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`.
   - `agent_laser_engraving` and `agent_entity_designer` should support both the new lowercase kebab-case keys and legacy fallbacks (`'CUT'` $\to$ `'through-cut'`, `'ENGRAVE'` $\to$ `'surface-engrave'`) to avoid breaking existing UI components before R3 is integrated.
3. **CPU vs GPU rasterization for depth maps**:
   - Software rasterization onto a $256 \times 256$ Float32Array in JavaScript is fast ($\approx 0.1\text{ ms}$ per stamp) and avoids WebGL FBO ping-pong complexities, making it highly robust across all devices.

---

## 4. Conclusion & Concrete Recommendations for `agent_laser_engraving`

### 4.1 Deliverable Files Breakdown
`agent_laser_engraving` will implement exactly 3 files:
1. `src/data/engravingProfiles.ts`:
   - Exports `EngravingMode`, `LaserSourceType`, `EngravingPhysicalParameters`, `EngravingProfile`.
   - Exports `ENGRAVING_PROFILES: Record<string, EngravingProfile>` covering all 6 materials across the 3 modes.
   - Exports helper lookup functions `getProfileForMaterial(material, mode, stationId)`.
2. `src/utils/engravingEngine.ts`:
   - Exports `generatePolygonHatch(polygon, angleDeg, lineIntervalMm, crossHatch)`.
   - Exports `applyKerfCompensation(polygon, kerfWidthMm, isInnerHole)`.
   - Exports `ditherImageFloydSteinberg(grayscaleBuffer, width, height)`.
   - Exports `estimateMachiningTime(toolpaths, params)`.
   - Exports `createDepthMapManager(resolution)`.
3. `src/components/3d/visual-effects/EngravingSurfaceShader.tsx`:
   - Exports `EngravingSurfaceMaterial` (a custom `THREE.ShaderMaterial` or Three.js component) and `EngravingSurfaceMesh`.
   - Implements vertex & fragment GLSL shaders supporting the 4 distinct surface transformations + real-time laser incandescence bloom.

### 4.2 Integration Touchpoints
- In `src/store/useLabStore.ts`:
  - `processMode`: `'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d'`
  - `engravingDepthMap`: `Float32Array` ($256 \times 256 = 65,536$ elements).
- In `src/components/3d/fallbacks/ProceduralMachineBox.tsx` & `src/components/3d/specimens/`:
  - Bind `EngravingSurfaceMaterial` to the specimen mesh.
  - Pass current carriage/galvo $[x, y]$ to `uLaserPosition` and `isLaserActive` to `uLaserActive`.

---

## 5. Verification Method

### 5.1 Verification Commands
1. TypeScript static analysis:
   ```powershell
   npx tsc --noEmit
   ```
   Must exit with code 0 and zero TypeScript errors.
2. Production build:
   ```powershell
   npm run build
   ```
   Must successfully generate production bundle in `dist/`.
3. Shader compilation check:
   - Ensure GLSL code has valid syntax: no missing precision qualifiers, correct variable names and vector types (`vec3`, `vec4`, `mat4`).

### 5.2 Invalidation Conditions
- Any TypeScript type mismatch between `EngravingProfile` and `useLabStore`.
- Any WebGL shader compilation warning or error in the browser console.
- Frame rate drop below 60 FPS caused by excessive depth map texture reallocation.
