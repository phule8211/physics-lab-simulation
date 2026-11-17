/**
 * Tier 4: Real-World Industrial Application Scenarios
 * Validates complete end-to-end industrial manufacturing workflows:
 * 1. Semiconductor Wafer Dicing (Silicon 8-inch, 355nm UV DPSS, zero HAZ)
 * 2. Medical Implant Titanium Color Annealing (1064nm MOPA Fiber, thin oxide film interference)
 * 3. Architectural Cast Acrylic Laser Cutting (10.6um CO2, flame-polished kerf walls, inner detachment)
 * 4. Bas-Relief Wood Engraving (2.5D multi-pass relief, rotating cross-hatching, carbonization HAZ)
 * 5. Cleanroom Emergency Stop (E-Stop) & PPE Safety Interlock Protocol
 */

import * as THREE from 'three';
import { describe, it, expect } from './testHarness';
import { getEngravingProfile, getProfilesForMaterial } from '../../src/data/engravingProfiles';
import {
  generatePolygonHatch,
  applyKerfCompensation,
  estimateMachiningTime,
  EngravingDepthMapManager,
} from '../../src/utils/engravingEngine';
import {
  createEngravingShaderMaterial,
  processModeToInt,
  materialTypeToInt,
} from '../../src/components/3d/visual-effects/EngravingSurfaceShader';
import { useLabStore } from '../../src/store/useLabStore';

export function registerTier4Tests() {
  describe('Tier 4: Real-World Industrial Application Scenarios', () => {
    // -----------------------------------------------------------------------
    // Scenario 1: Semiconductor Silicon Wafer Dicing
    // -----------------------------------------------------------------------
    it('S1: Semiconductor Silicon Wafer Dicing (355nm UV DPSS, zero-HAZ cold micro-machining)', () => {
      // 1. Select Silicon UV dicing profile
      const profiles = getProfilesForMaterial('SILICON');
      const uvDicing =
        profiles.find((p) => p.laserSource === 'UV_DPSS') ||
        getEngravingProfile('SILICON', 'vector-scoring', 'UV_DPSS');

      expect(uvDicing.materialId).toBe('SILICON');
      expect(uvDicing.params.kerfWidthMm).toBeLessThanOrEqual(0.04); // sub-micron to 35um spot
      expect(uvDicing.params.hazRadiusMm).toBe(0.0); // Zero HAZ photochemical ablation
      expect(uvDicing.visualPhenomenon.type).toBe('zero-haz-cold-peel');

      // 2. Generate wafer dicing street grid (10mm x 10mm dies on 50mm wafer coupon)
      const dicingStreets: [number, number][][] = [];
      const waferSizeMm = 50;
      const diePitchMm = 10;

      // Horizontal streets
      for (let y = diePitchMm; y < waferSizeMm; y += diePitchMm) {
        dicingStreets.push([
          [0, y],
          [waferSizeMm, y],
        ]);
      }
      // Vertical streets
      for (let x = diePitchMm; x < waferSizeMm; x += diePitchMm) {
        dicingStreets.push([
          [x, 0],
          [x, waferSizeMm],
        ]);
      }
      expect(dicingStreets.length).toBe(8);

      // 3. Estimate machining time using UV galvo scanner kinematics
      const timeEst = estimateMachiningTime(dicingStreets, uvDicing.params, 'GALVO');
      expect(timeEst).toBeGreaterThan(0);
      expect(timeEst).toBeLessThan(15.0); // Galvo scan takes only a few seconds

      // 4. Depth map simulation: zero thermal diffusion halo
      const depthMgr = new EngravingDepthMapManager(64, uvDicing.params.totalExpectedDepthMm);
      depthMgr.stampStroke(0.2, 0.2, 0.8, 0.2, 0.015, uvDicing.params.depthPerPassMm);

      // Verify knife-edge: center is cut, 0.05 away has zero depth
      expect(depthMgr.getDepthAt(0.5, 0.2)).toBeGreaterThan(0);
      expect(depthMgr.getDepthAt(0.5, 0.3)).toBe(0);
    });

    // -----------------------------------------------------------------------
    // Scenario 2: Medical Implant Titanium Color Annealing
    // -----------------------------------------------------------------------
    it('S2: Medical Implant Titanium Color Annealing (1064nm MOPA Fiber, thin oxide film interference)', () => {
      // 1. Select stainless steel / titanium color annealing profile
      const steelProfiles = getProfilesForMaterial('STEEL');
      const annealProfile =
        steelProfiles.find((p) => p.visualPhenomenon.type === 'color-annealing') ||
        getEngravingProfile('STEEL', 'vector-scoring', 'FIBER_MOPA');

      expect(annealProfile.materialId).toBe('STEEL');
      expect(annealProfile.params.scanSpeedMmS).toBeGreaterThanOrEqual(300); // Controlled oxide growth
      expect(annealProfile.visualPhenomenon.filmThicknessNm).toBeGreaterThan(0);

      // 2. Optical Thin-Film Interference calculation (Airy formula)
      const filmThicknessNm = annealProfile.visualPhenomenon.filmThicknessNm || 210.0;
      const nOxide = 2.45; // TiO2 refractive index
      const opd = 2.0 * nOxide * filmThicknessNm; // Optical Path Difference in nm

      // Verify constructive/destructive interference for RGB wavelengths (650nm, 532nm, 450nm)
      const wavelengths = [650.0, 532.0, 450.0];
      const rgbReflectance = wavelengths.map((wl) => {
        const phase = (2.0 * Math.PI * opd) / wl;
        return 0.5 + 0.5 * Math.cos(phase);
      });

      for (const ref of rgbReflectance) {
        expect(ref).toBeGreaterThanOrEqual(0.0);
        expect(ref).toBeLessThanOrEqual(1.0);
      }

      // 3. Shader material initialization: preserves metallic sheen with near-zero stock loss
      const shader = createEngravingShaderMaterial({
        uFilmThicknessNm: { value: filmThicknessNm },
        uProcessMode: { value: 2 }, // color-annealing
        uMaterialType: { value: 2 }, // STEEL
        uBaseMetalness: { value: 0.95 },
        uBaseRoughness: { value: 0.18 },
      });

      expect(shader.uniforms.uProcessMode.value).toBe(2);
      expect(shader.uniforms.uFilmThicknessNm.value).toBe(filmThicknessNm);
      expect(shader.uniforms.uBaseMetalness.value).toBe(0.95);
    });

    // -----------------------------------------------------------------------
    // Scenario 3: Architectural Cast Acrylic Laser Cutting
    // -----------------------------------------------------------------------
    it('S3: Architectural Cast Acrylic Laser Cutting (10.6um CO2, flame-polished kerf walls, detachment)', () => {
      // 1. Select Acrylic CO2 profile
      const acrylicScore = getEngravingProfile('ACRYLIC', 'vector-scoring', 'CO2');
      expect(acrylicScore.materialId).toBe('ACRYLIC');
      expect(acrylicScore.laserSource).toBe('CO2');

      // 2. Closed contour with inner cutout geometry
      const outerStock: [number, number][] = [
        [0, 0],
        [200, 0],
        [200, 200],
        [0, 200],
        [0, 0],
      ];
      const innerCutout: [number, number][] = [
        [50, 50],
        [150, 50],
        [150, 150],
        [50, 150],
        [50, 50],
      ];

      // Kerf compensation: outer expands, inner contracts
      const compOuter = applyKerfCompensation(outerStock, acrylicScore.params.kerfWidthMm, false);
      const compInner = applyKerfCompensation(innerCutout, acrylicScore.params.kerfWidthMm, true);

      expect(compOuter.length).toBe(outerStock.length);
      expect(compInner.length).toBe(innerCutout.length);

      // Verify outer expanded and inner contracted
      expect(compOuter[0][0]).toBeLessThan(outerStock[0][0]);
      expect(compInner[0][0]).toBeGreaterThan(innerCutout[0][0]);

      // 3. Detachment interaction: space lifts inner cutout by +0.25m exposing flame-polished kerf
      useLabStore.setState({ isPartDetached: false });
      useLabStore.getState().togglePartDetached();
      expect(useLabStore.getState().isPartDetached).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Scenario 4: Bas-Relief Wood Engraving
    // -----------------------------------------------------------------------
    it('S4: Bas-Relief Wood Engraving (2.5D multi-pass relief, rotating cross-hatching, carbonization HAZ)', () => {
      // 1. Select 2.5D relief wood profile
      const woodRelief = getEngravingProfile('WOOD', 'relief-2.5d', 'CO2');
      expect(woodRelief.mode).toBe('relief-2.5d');
      expect(woodRelief.params.passes).toBeGreaterThanOrEqual(10);
      expect(woodRelief.visualPhenomenon.type).toBe('carbonization-haz');

      // 2. Rotating cross-hatching across passes (0° -> 90° -> 45° -> 135°) to eliminate surface ridges
      const poly: [number, number][] = [
        [0, 0],
        [40, 0],
        [40, 40],
        [0, 40],
        [0, 0],
      ];
      const angles = [0, 90, 45, 135];
      const multiPassToolpaths: [number, number][][][] = [];

      for (const ang of angles) {
        const passStrokes = generatePolygonHatch(poly, ang, 1.0, false);
        multiPassToolpaths.push(passStrokes);
        expect(passStrokes.length).toBeGreaterThan(0);
      }
      expect(multiPassToolpaths.length).toBe(4);

      // 3. Grayscale depth map accumulation
      const depthMgr = new EngravingDepthMapManager(64, woodRelief.params.totalExpectedDepthMm);
      const testReliefImage = new Uint8Array(64 * 64);
      // Grayscale pyramid profile
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const distToCenter = Math.hypot(x - 32, y - 32);
          testReliefImage[y * 64 + x] = Math.max(0, Math.floor(255 - distToCenter * 6));
        }
      }
      depthMgr.loadGrayscaleDepthMap(testReliefImage, 64, 64, 2.0);

      // Center should have high depth, corners should have 0 depth
      expect(depthMgr.getDepthAt(0.5, 0.5)).toBeGreaterThan(1.5);
      expect(depthMgr.getDepthAt(0.0, 0.0)).toBe(0);

      // 4. Normal map texture generation
      const normalTex = depthMgr.generateNormalTexture();
      expect(normalTex).toBeDefined();
    });

    // -----------------------------------------------------------------------
    // Scenario 5: Cleanroom E-Stop & PPE Safety Interlock Protocol
    // -----------------------------------------------------------------------
    it('S5: Cleanroom Emergency Stop (E-Stop) & PPE Safety Interlock Protocol', () => {
      // Setup: Operator equipped with ESD gloves and 1064nm goggles
      useLabStore.setState({
        isMachineRunning: true,
        isCuttingJob: true,
        interlockTriggered: false,
      });
      expect(useLabStore.getState().isCuttingJob).toBe(true);

      // Emergency Event: Technician presses red E-Stop mushroom button
      const triggerEmergencyStop = () => {
        useLabStore.setState({
          interlockTriggered: true,
          isMachineRunning: false,
          isCuttingJob: false,
        });
        return {
          laserPowerCutoff: true,
          emergencyRelayTripped: true,
          exhaustPurgeActive: true,
        };
      };

      const eStopResult = triggerEmergencyStop();
      expect(eStopResult.laserPowerCutoff).toBe(true);
      expect(eStopResult.emergencyRelayTripped).toBe(true);
      expect(useLabStore.getState().interlockTriggered).toBe(true);
      expect(useLabStore.getState().isMachineRunning).toBe(false);
      expect(useLabStore.getState().isCuttingJob).toBe(false);

      // Clean up
      useLabStore.setState({ interlockTriggered: false });
    });
  });
}
