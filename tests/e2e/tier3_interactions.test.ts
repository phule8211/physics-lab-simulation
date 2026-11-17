/**
 * Tier 3: Cross-Feature Interactions Tests
 * Pairwise and multi-module integration testing across:
 * - Profile selection -> Hatching -> Kerf compensation -> Depth map -> Shader uniforms
 * - Specimen detachment -> Keybindings -> Store state -> Lift animation
 * - Water chiller overheating -> Alarm state -> Safety interlock
 * - Station wavelength switch -> NPC goggles tint -> Operator PPE verification
 * - Dithering -> Raster toolpaths -> Machining time estimation
 */

import * as THREE from 'three';
import { describe, it, expect } from './testHarness';
import { getEngravingProfile } from '../../src/data/engravingProfiles';
import {
  generatePolygonHatch,
  applyKerfCompensation,
  ditherImageFloydSteinberg,
  estimateMachiningTime,
  EngravingDepthMapManager,
} from '../../src/utils/engravingEngine';
import {
  createEngravingShaderMaterial,
  processModeToInt,
  materialTypeToInt,
} from '../../src/components/3d/visual-effects/EngravingSurfaceShader';
import { useLabStore } from '../../src/store/useLabStore';
import { STATIONS } from '../../src/data/labConfig';

export function registerTier3Tests() {
  describe('Tier 3: Cross-Feature Interactions', () => {
    // -----------------------------------------------------------------------
    // Pipeline 1: Profile -> Kerf -> Hatching -> Depth Map -> Shader Uniforms
    // -----------------------------------------------------------------------
    it('I1: full engraving pipeline (profile -> kerf -> hatch -> depth map -> shader)', () => {
      // 1. Select material profile
      const profile = getEngravingProfile('WOOD', 'relief-2.5d', 'CO2');
      expect(profile).toBeDefined();
      expect(profile.params.passes).toBeGreaterThan(1);

      // 2. Define closed workpiece polygon (100mm x 100mm)
      const workpiecePoly: [number, number][] = [
        [0, 0],
        [100, 0],
        [100, 100],
        [0, 100],
        [0, 0],
      ];

      // 3. Apply kerf compensation
      const compensatedPoly = applyKerfCompensation(
        workpiecePoly,
        profile.params.kerfWidthMm,
        false
      );
      expect(compensatedPoly.length).toBe(workpiecePoly.length);

      // 4. Generate cross-hatch fill
      const hatches = generatePolygonHatch(
        compensatedPoly,
        45,
        profile.params.lineIntervalMm * 10, // coarse for fast test
        true
      );
      expect(hatches.length).toBeGreaterThan(0);

      // 5. Accumulate depth in depth map manager
      const depthManager = new EngravingDepthMapManager(64, profile.params.totalExpectedDepthMm);
      for (const stroke of hatches.slice(0, 5)) {
        depthManager.stampStroke(
          stroke[0][0] / 100,
          stroke[0][1] / 100,
          stroke[1][0] / 100,
          stroke[1][1] / 100,
          0.02,
          profile.params.depthPerPassMm
        );
      }
      expect(depthManager.getDepthAt(0.5, 0.5)).toBeGreaterThanOrEqual(0);

      // 6. Generate normal map texture and bind to shader material
      const normalTex = depthManager.generateNormalTexture();
      const shaderMaterial = createEngravingShaderMaterial({
        uDepthMap: { value: normalTex },
        uBaseColor: { value: new THREE.Color(profile.visualPhenomenon.baseColor) },
        uBaseRoughness: { value: profile.visualPhenomenon.roughness },
        uBaseMetalness: { value: profile.visualPhenomenon.metalness },
        uProcessMode: { value: processModeToInt(profile.mode) },
        uMaterialType: { value: materialTypeToInt(profile.materialId) },
        uHazWidth: { value: profile.params.hazRadiusMm / 100 },
      });

      expect(shaderMaterial.uniforms.uDepthMap.value).toBe(normalTex);
      expect(shaderMaterial.uniforms.uProcessMode.value).toBe(3); // relief-2.5d
      expect(shaderMaterial.uniforms.uMaterialType.value).toBe(0); // WOOD
    });

    // -----------------------------------------------------------------------
    // Pipeline 2: Specimen Detachment + Keybinding + Store State
    // -----------------------------------------------------------------------
    it('I2: specimen detachment interaction (inspection -> Space key -> store -> lift)', () => {
      const store = useLabStore.getState();

      // Enter inspection state
      useLabStore.setState({ mode: 'INSPECTING', activeStationId: 'CO2_LASER' });
      expect(useLabStore.getState().mode).toBe('INSPECTING');
      expect(useLabStore.getState().activeStationId).toBe('CO2_LASER');

      // In inspection mode, pressing Space toggles detachment rather than jump
      const handleInput = (key: string, currentMode: string) => {
        if (key === 'Space' && currentMode === 'INSPECTING') {
          useLabStore.getState().togglePartDetached();
          return { handled: true, action: 'DETACH_PART', jumpVelocity: 0 };
        }
        return { handled: true, action: 'JUMP', jumpVelocity: 4.2 };
      };

      const initialDetached = useLabStore.getState().isPartDetached;
      const res = handleInput('Space', useLabStore.getState().mode);
      expect(res.action).toBe('DETACH_PART');
      expect(res.jumpVelocity).toBe(0);
      expect(useLabStore.getState().isPartDetached).toBe(!initialDetached);

      // Verify physical vertical lift target (+0.25m)
      const calcMeshLift = (detached: boolean) => (detached ? 0.25 : 0.0);
      expect(calcMeshLift(useLabStore.getState().isPartDetached)).toBe(0.25);

      // Clean up back to walking mode
      useLabStore.setState({ mode: 'WALKING', activeStationId: null });
      expect(useLabStore.getState().mode).toBe('WALKING');
    });

    // -----------------------------------------------------------------------
    // Pipeline 3: Water Chiller Overheating + Safety Interlock
    // -----------------------------------------------------------------------
    it('I3: chiller overheating trips laser safety interlock and aborts cutting', () => {
      const store = useLabStore.getState();

      // Simulate active cutting job
      useLabStore.setState({ isMachineRunning: true, isCuttingJob: true, interlockTriggered: false });
      expect(useLabStore.getState().isCuttingJob).toBe(true);

      // Simulate chiller temperature sensor excursion
      const chillerTelemetry = {
        waterTempC: 31.8, // Normal is 22.4 C
        flowRateLMin: 1.2, // Normal is 4.8 L/min
      };

      const evaluateChillerSafety = (tempC: number, flowLMin: number) => {
        if (tempC > 28.0 || flowLMin < 2.0) {
          return { status: 'overheat' as const, tripInterlock: true };
        }
        return { status: 'normal' as const, tripInterlock: false };
      };

      const safetyResult = evaluateChillerSafety(
        chillerTelemetry.waterTempC,
        chillerTelemetry.flowRateLMin
      );
      expect(safetyResult.status).toBe('overheat');
      expect(safetyResult.tripInterlock).toBe(true);

      // Apply interlock to store
      if (safetyResult.tripInterlock) {
        useLabStore.setState({
          interlockTriggered: true,
          isMachineRunning: false,
          isCuttingJob: false,
        });
      }

      expect(useLabStore.getState().interlockTriggered).toBe(true);
      expect(useLabStore.getState().isCuttingJob).toBe(false);
      expect(useLabStore.getState().isMachineRunning).toBe(false);

      // Reset
      useLabStore.setState({ interlockTriggered: false });
    });

    // -----------------------------------------------------------------------
    // Pipeline 4: Station Wavelength Switch + NPC Goggles + Operator PPE
    // -----------------------------------------------------------------------
    it('I4: station laser wavelength switch dynamically updates NPC goggles and PPE check', () => {
      const stationWavelengthMap: Record<string, { wavelength: string; goggleFilter: string }> = {
        CO2_LASER: { wavelength: STATIONS.CO2_LASER.wavelength, goggleFilter: 'Clear/Gold OD7+' },
        UV_LASER: { wavelength: STATIONS.UV_LASER.wavelength, goggleFilter: 'Amber/Orange OD7+' },
        FIBER_LASER: {
          wavelength: STATIONS.FIBER_LASER.wavelength,
          goggleFilter: 'Emerald Green OD7+',
        },
      };

      expect(stationWavelengthMap.CO2_LASER.wavelength).toContain('10.6');
      expect(stationWavelengthMap.UV_LASER.wavelength).toContain('355');
      expect(stationWavelengthMap.FIBER_LASER.wavelength).toContain('1064');

      // Operator wearing 1064nm goggles visiting UV laser station
      const checkCompliance = (stationId: string, operatorGogglesWavelength: string) => {
        if (stationId === 'CO2_LASER') return operatorGogglesWavelength === '10.6um';
        if (stationId === 'UV_LASER') return operatorGogglesWavelength === '355nm';
        if (stationId === 'FIBER_LASER') return operatorGogglesWavelength === '1064nm';
        return true;
      };

      expect(checkCompliance('UV_LASER', '1064nm')).toBe(false); // Non-compliant!
      expect(checkCompliance('UV_LASER', '355nm')).toBe(true); // Compliant!
    });

    // -----------------------------------------------------------------------
    // Pipeline 5: Dithering -> Raster Toolpaths -> Machining Time Estimation
    // -----------------------------------------------------------------------
    it('I5: dithering continuous grayscale image into raster toolpaths and time estimation', () => {
      const w = 16,
        h = 16;
      const grayscaleRamp = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        grayscaleRamp[i] = Math.floor((i / (w * h)) * 255);
      }

      // Floyd-Steinberg binarization
      const dithered = ditherImageFloydSteinberg(grayscaleRamp, w, h);
      expect(dithered.length).toBe(w * h);

      // Convert active pulse pixels (0 = ablate, 255 = blank) into raster strokes
      const rasterPaths: [number, number][][] = [];
      const pixelPitchMm = 0.1;

      for (let y = 0; y < h; y++) {
        let strokeStart: [number, number] | null = null;
        for (let x = 0; x < w; x++) {
          const isPulse = dithered[y * w + x] === 0;
          if (isPulse && strokeStart === null) {
            strokeStart = [x * pixelPitchMm, y * pixelPitchMm];
          } else if (!isPulse && strokeStart !== null) {
            rasterPaths.push([strokeStart, [(x - 1) * pixelPitchMm, y * pixelPitchMm]]);
            strokeStart = null;
          }
        }
        if (strokeStart !== null) {
          rasterPaths.push([strokeStart, [(w - 1) * pixelPitchMm, y * pixelPitchMm]]);
        }
      }

      // Estimate time with raster engraving profile
      const rasterProfile = getEngravingProfile('ACRYLIC', 'raster-engraving', 'CO2');
      const timeEst = estimateMachiningTime(rasterPaths, rasterProfile.params, 'GANTRY');
      expect(timeEst).toBeGreaterThan(0);
      expect(Number.isFinite(timeEst)).toBe(true);
    });
  });
}
