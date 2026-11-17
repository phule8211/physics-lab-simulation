/**
 * Tier 2: Boundary & Corner Cases Tests
 * Tests numerical stability, extreme speeds/powers, acute corner miter clamping,
 * zero/negative depths, degenerate geometries, and edge thresholds.
 */

import { describe, it, expect } from './testHarness';
import {
  generatePolygonHatch,
  applyKerfCompensation,
  ditherImageFloydSteinberg,
  estimateMachiningTime,
  EngravingDepthMapManager,
} from '../../src/utils/engravingEngine';
import { ENGRAVING_PROFILES } from '../../src/data/engravingProfiles';

export function registerTier2Tests() {
  describe('Tier 2: Boundary & Corner Cases', () => {
    // -----------------------------------------------------------------------
    // B1: Acute Corner Miter Clamping & Degenerate Polygons
    // -----------------------------------------------------------------------
    it('B1-1: ultra-sharp acute needle corner (< 5 degrees) clamps miter vector cleanly', () => {
      // 2-degree acute needle polygon
      const needlePoly: [number, number][] = [
        [0, 0],
        [50, 0.5],
        [0, 1],
        [0, 0],
      ];
      const kerf = 0.5; // radius = 0.25
      const miterLimit = 2.5;
      const comp = applyKerfCompensation(needlePoly, kerf, false, miterLimit);

      // Verify no coordinate is NaN or Infinity
      for (const [x, y] of comp) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
        expect(Number.isNaN(x)).toBe(false);
        expect(Number.isNaN(y)).toBe(false);
      }

      // Tip vertex X must not exceed original + radius * miterLimit
      const tipX = comp[1][0];
      const maxAllowedX = 50 + (kerf / 2) * miterLimit + 0.05;
      expect(tipX).toBeLessThanOrEqual(maxAllowedX);
    });

    it('B1-2: 90-degree corner expands exactly by radius * sqrt(2)', () => {
      const rightAngleSquare: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ];
      const kerf = 0.2; // radius = 0.1
      const comp = applyKerfCompensation(rightAngleSquare, kerf, false);
      const corner = comp[0];
      // Expected displacement for bottom-left: [-0.1, -0.1] -> distance from (0,0) is 0.1 * sqrt(2)
      const dist = Math.hypot(corner[0], corner[1]);
      expect(dist).toBeCloseTo(0.1 * Math.SQRT2, 0.001);
    });

    it('B1-3: degenerate polygon (< 3 vertices) returns input cleanly without crashing', () => {
      const line: [number, number][] = [
        [0, 0],
        [10, 10],
      ];
      const empty: [number, number][] = [];

      expect(applyKerfCompensation(line, 0.2, false)).toHaveLength(2);
      expect(applyKerfCompensation(empty, 0.2, false)).toHaveLength(0);

      expect(generatePolygonHatch(line, 0, 1.0)).toHaveLength(0);
      expect(generatePolygonHatch(empty, 0, 1.0)).toHaveLength(0);
    });

    it('B1-4: lineIntervalMm <= 0 in hatching returns empty array without infinite loop', () => {
      const square: [number, number][] = [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ];
      expect(generatePolygonHatch(square, 0, 0.0)).toHaveLength(0);
      expect(generatePolygonHatch(square, 0, -1.5)).toHaveLength(0);
    });

    // -----------------------------------------------------------------------
    // B2: Depth Map Buffer Boundaries & Negative Ablation
    // -----------------------------------------------------------------------
    it('B2-1: negative or zero depthDelta in stampAblation is rejected with zero mutation', () => {
      const mgr = new EngravingDepthMapManager(32, 2.0);
      mgr.stampAblation(0.5, 0.5, 0.05, -0.5);
      expect(mgr.getDepthAt(0.5, 0.5)).toBe(0);

      mgr.stampAblation(0.5, 0.5, 0.05, 0.0);
      expect(mgr.getDepthAt(0.5, 0.5)).toBe(0);
    });

    it('B2-2: out-of-bounds UV coordinates (u < 0, u > 1, v < 0, v > 1) are safely ignored', () => {
      const mgr = new EngravingDepthMapManager(32, 2.0);
      mgr.stampAblation(-0.5, 0.5, 0.05, 0.5);
      mgr.stampAblation(1.5, 0.5, 0.05, 0.5);
      mgr.stampAblation(0.5, -0.2, 0.05, 0.5);
      mgr.stampAblation(0.5, 1.2, 0.05, 0.5);

      for (const val of mgr.buffer) {
        expect(val).toBe(0);
      }
    });

    it('B2-3: tiny spot radius (sub-pixel) clamps to minimum pixel footprint without division by zero', () => {
      const mgr = new EngravingDepthMapManager(32, 2.0);
      mgr.stampAblation(0.5, 0.5, 0.00001, 0.2);
      expect(mgr.getDepthAt(0.5, 0.5)).toBeGreaterThan(0);
    });

    it('B2-4: resolution initialization clamps to minimum 32 pixels', () => {
      const mgr = new EngravingDepthMapManager(5, 2.0);
      expect(mgr.resolution).toBeGreaterThanOrEqual(32);
    });

    // -----------------------------------------------------------------------
    // B3: Floyd-Steinberg Edge & Boundary Cases
    // -----------------------------------------------------------------------
    it('B3-1: 1x1 single pixel image dithers cleanly without out-of-bounds error', () => {
      const single = new Uint8Array([200]);
      const res = ditherImageFloydSteinberg(single, 1, 1);
      expect(res.length).toBe(1);
      expect(res[0]).toBe(255);

      const singleDark = new Uint8Array([50]);
      const resDark = ditherImageFloydSteinberg(singleDark, 1, 1);
      expect(resDark[0]).toBe(0);
    });

    it('B3-2: 1xN single column and Nx1 single row dither correctly', () => {
      const row = new Uint8Array([50, 150, 200, 20]);
      const resRow = ditherImageFloydSteinberg(row, 4, 1);
      expect(resRow.length).toBe(4);

      const col = new Uint8Array([50, 150, 200, 20]);
      const resCol = ditherImageFloydSteinberg(col, 1, 4);
      expect(resCol.length).toBe(4);
    });

    it('B3-3: custom binarization threshold (e.g. 64 or 200) alters pulse trigger sensitivity', () => {
      const img = new Uint8Array([100, 100, 100, 100]);
      const lowThreshold = ditherImageFloydSteinberg(img, 2, 2, 64);
      const highThreshold = ditherImageFloydSteinberg(img, 2, 2, 200);

      // Low threshold (64) triggers more white pulses than high threshold (200)
      const countLow = lowThreshold.filter((x) => x === 255).length;
      const countHigh = highThreshold.filter((x) => x === 255).length;
      expect(countLow).toBeGreaterThan(countHigh);
    });

    // -----------------------------------------------------------------------
    // B4: Kinematic Extremes in Machining Time Estimation
    // -----------------------------------------------------------------------
    it('B4-1: handles extreme velocities (12,000 mm/s) without zero time or NaN', () => {
      const path: [number, number][][] = [
        [
          [0, 0],
          [100, 0],
        ],
      ];
      const fastParams = {
        ...ENGRAVING_PROFILES.WOOD_CO2_VECTOR_SCORE.params,
        scanSpeedMmS: 12000,
      };
      const t = estimateMachiningTime(path, fastParams, 'GALVO');
      expect(t).toBeGreaterThan(0);
      expect(Number.isFinite(t)).toBe(true);
      expect(t).toBeLessThan(1.0);
    });

    it('B4-2: handles ultra-slow speeds (1 mm/s) gracefully', () => {
      const path: [number, number][][] = [
        [
          [0, 0],
          [10, 0],
        ],
      ];
      const slowParams = {
        ...ENGRAVING_PROFILES.WOOD_CO2_VECTOR_SCORE.params,
        scanSpeedMmS: 1.0,
      };
      const t = estimateMachiningTime(path, slowParams);
      // 10 mm / 1 mm/s = 10s + rapid/settle
      expect(t).toBeGreaterThanOrEqual(10.0);
    });

    it('B4-3: toolpaths containing single-point zero-length strokes compute without NaN', () => {
      const path: [number, number][][] = [
        [[5, 5]], // degenerate 1-point stroke
        [
          [0, 0],
          [10, 0],
        ],
      ];
      const t = estimateMachiningTime(path, ENGRAVING_PROFILES.WOOD_CO2_VECTOR_SCORE.params);
      expect(Number.isFinite(t)).toBe(true);
      expect(t).toBeGreaterThan(0);
    });
  });
}
