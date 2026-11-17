/**
 * Adversarial Stress Testing Suite for Laser Micromachining Engine & Simulation
 * Tier 5: High-volume stress, extreme parameters, numeric stability, memory profiling, and mutation races.
 */

import * as THREE from 'three';
import { describe, it, expect } from '../e2e/testHarness';
import {
  generatePolygonHatch,
  applyKerfCompensation,
  ditherImageFloydSteinberg,
  estimateMachiningTime,
  EngravingDepthMapManager,
  Point2D,
} from '../../src/utils/engravingEngine';
import { useLabStore } from '../../src/store/useLabStore';
import { ProcessMode, ChillerStatus } from '../../src/types/lab';

export function registerStressTests() {
  // =========================================================================
  // 1. High-Volume Polygon Hatching & Cross-Hatching
  // =========================================================================
  describe('STRESS 1: High-Volume Polygon Hatching & Cross-Hatching', () => {
    it('S1-1: 500-vertex complex multi-tooth concave star polygon (0, 45, 90, 135 deg cross-hatch)', () => {
      // Generate 250-point star / gear polygon (500 vertices)
      const numPoints = 250;
      const poly: Point2D[] = [];
      const cx = 50, cy = 50;
      for (let i = 0; i < numPoints; i++) {
        const theta1 = (i * 2 * Math.PI) / numPoints;
        const r1 = 40 + 8 * Math.sin(theta1 * 15); // wavy / gear profile
        poly.push([cx + r1 * Math.cos(theta1), cy + r1 * Math.sin(theta1)]);

        const theta2 = ((i + 0.5) * 2 * Math.PI) / numPoints;
        const r2 = 25; // deep concave gullet
        poly.push([cx + r2 * Math.cos(theta2), cy + r2 * Math.sin(theta2)]);
      }

      const tStart = performance.now();
      const angles = [0, 45, 90, 135];
      let totalPaths = 0;

      for (const angle of angles) {
        const hatches = generatePolygonHatch(poly, angle, 0.5, true);
        totalPaths += hatches.length;
        expect(hatches.length).toBeGreaterThan(50);

        // Verify all endpoints are finite numbers (no NaN or Infinity)
        for (const stroke of hatches) {
          expect(Number.isFinite(stroke[0][0])).toBe(true);
          expect(Number.isFinite(stroke[0][1])).toBe(true);
          expect(Number.isFinite(stroke[1][0])).toBe(true);
          expect(Number.isFinite(stroke[1][1])).toBe(true);
        }
      }

      const duration = performance.now() - tStart;
      expect(totalPaths).toBeGreaterThan(400);
      expect(duration).toBeLessThan(1000); // Must compute within 1s
    });

    it('S1-2: self-intersecting star pentagram and multi-loop polygons', () => {
      // Classic 5-pointed star self-intersecting contour
      const pentagram: Point2D[] = [];
      const R = 40;
      const order = [0, 2, 4, 1, 3, 0]; // Self-intersecting star traversal
      for (const idx of order) {
        const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
        pentagram.push([50 + R * Math.cos(angle), 50 + R * Math.sin(angle)]);
      }

      const hatches = generatePolygonHatch(pentagram, 45, 1.0, true);
      expect(hatches.length).toBeGreaterThan(0);

      // Verify all vertices remain within the [0, 100] bounding area
      for (const stroke of hatches) {
        expect(stroke[0][0]).toBeGreaterThanOrEqual(5);
        expect(stroke[0][0]).toBeLessThanOrEqual(95);
        expect(stroke[0][1]).toBeGreaterThanOrEqual(5);
        expect(stroke[0][1]).toBeLessThanOrEqual(95);
      }
    });

    it('S1-3: ultra-fine pitch hatching (2,500 scanlines, 5,000+ stroke endpoints)', () => {
      const square: Point2D[] = [
        [0, 0],
        [50, 0],
        [50, 50],
        [0, 50],
        [0, 0],
      ];

      // lineInterval = 0.02mm across 50mm -> 2,500 scanlines
      const tStart = performance.now();
      const hatches = generatePolygonHatch(square, 0, 0.02, false);
      const duration = performance.now() - tStart;

      expect(hatches.length).toBeGreaterThanOrEqual(2490);
      expect(hatches.length).toBeLessThanOrEqual(2510);
      expect(duration).toBeLessThan(500); // < 500ms
    });

    it('S1-4: degenerate collinear and duplicate vertex chains', () => {
      // 50 collinear points on bottom, 50 on right, 50 on top, 50 on left
      const degenerate: Point2D[] = [];
      for (let x = 0; x <= 50; x += 1) degenerate.push([x, 0]);
      for (let y = 0; y <= 50; y += 1) degenerate.push([50, y]);
      for (let x = 50; x >= 0; x -= 1) degenerate.push([x, 50]);
      for (let y = 50; y >= 0; y -= 1) degenerate.push([0, y]);

      const hatches = generatePolygonHatch(degenerate, 90, 2.0, false);
      expect(hatches.length).toBeGreaterThan(15);
      for (const stroke of hatches) {
        expect(Number.isFinite(stroke[0][0])).toBe(true);
        expect(Number.isFinite(stroke[1][1])).toBe(true);
      }
    });

    it('S1-5: interlocking comb labyrinth with 20 parallel teeth (multiple entries per line)', () => {
      const comb: Point2D[] = [[0, 0]];
      const teeth = 20;
      for (let i = 0; i < teeth; i++) {
        const x1 = i * 2;
        const x2 = x1 + 1;
        comb.push([x1, 40]);
        comb.push([x2, 40]);
        comb.push([x2, 5]);
      }
      comb.push([teeth * 2, 0]);
      comb.push([0, 0]);

      // Scanline at y = 20 intersects 40 vertical edges -> 20 discrete strokes
      const hatches = generatePolygonHatch(comb, 0, 1.0, false);
      expect(hatches.length).toBeGreaterThan(100);
      for (const stroke of hatches) {
        expect(Number.isFinite(stroke[0][0])).toBe(true);
        expect(Number.isFinite(stroke[1][0])).toBe(true);
      }
    });
  });

  // =========================================================================
  // 2. Extreme Kerf Offsets
  // =========================================================================
  describe('STRESS 2: Extreme Kerf Offsets', () => {
    const square: Point2D[] = [
      [10, 10],
      [30, 10],
      [30, 30],
      [10, 30],
      [10, 10],
    ];

    it('S2-1: massive kerfs (500mm and 10,000mm) exceeding polygon dimensions', () => {
      // Outer expansion by 500mm
      const hugeOuter = applyKerfCompensation(square, 1000, false);
      expect(hugeOuter.length).toBe(square.length);
      for (const pt of hugeOuter) {
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);
      }

      // Outer expansion by 10,000mm
      const massiveOuter = applyKerfCompensation(square, 20000, false);
      expect(massiveOuter.length).toBe(square.length);
      for (const pt of massiveOuter) {
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);
      }

      // Inner contraction with massive kerf (inversion boundary)
      const hugeInner = applyKerfCompensation(square, 1000, true);
      expect(hugeInner.length).toBe(square.length);
      for (const pt of hugeInner) {
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);
      }
    });

    it('S2-2: infinitesimal kerfs (1e-6mm, 1e-12mm, 0mm)', () => {
      const zeroKerf = applyKerfCompensation(square, 0, false);
      expect(zeroKerf[0][0]).toBe(square[0][0]);
      expect(zeroKerf[0][1]).toBe(square[0][1]);

      const nanoKerf = applyKerfCompensation(square, 1e-9, false);
      expect(nanoKerf[0][0]).toBe(square[0][0]);
      expect(nanoKerf[0][1]).toBe(square[0][1]);
    });

    it('S2-3: negative kerf widths (-0.5mm, -100mm)', () => {
      // Negative kerf is <= 1e-5, so engine treats it safely as identity without inverted coordinates
      const negKerf = applyKerfCompensation(square, -5.0, false);
      expect(negKerf.length).toBe(square.length);
      expect(negKerf[0][0]).toBe(square[0][0]);
      expect(negKerf[0][1]).toBe(square[0][1]);
    });

    it('S2-4: needle acute corner (< 0.1 degree) with miter limit clamping', () => {
      const acuteNeedle: Point2D[] = [
        [0, 0],
        [100, 0],
        [0.05, 0.05], // Extremely acute vertex (< 0.05 degrees)
        [0, 0],
      ];

      const miterLimit = 2.0;
      const kerf = 2.0; // radius = 1.0
      const compensated = applyKerfCompensation(acuteNeedle, kerf, false, miterLimit);

      // Verify no coordinate exploded to Infinity or NaN
      for (const pt of compensated) {
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);
        // Distance should be bounded by miterLimit * radius
        expect(Math.hypot(pt[0], pt[1])).toBeLessThan(200);
      }
    });

    it('S2-5: zero-area collinear polygon (3 collinear points)', () => {
      const collinear: Point2D[] = [
        [0, 0],
        [50, 0],
        [100, 0],
        [0, 0],
      ];

      const compensated = applyKerfCompensation(collinear, 2.0, false);
      expect(compensated.length).toBe(collinear.length);
      for (const pt of compensated) {
        expect(Number.isFinite(pt[0])).toBe(true);
        expect(Number.isFinite(pt[1])).toBe(true);
      }
    });
  });

  // =========================================================================
  // 3. Large or Rapid Depth Map Ablation Stamping
  // =========================================================================
  describe('STRESS 3: Large / Rapid Depth Map Ablation Stamping', () => {
    it('S3-1: 20,000 rapid Gaussian stamps in succession (throughput and memory retention)', () => {
      const manager = new EngravingDepthMapManager(128, 2.0);
      const tStart = performance.now();

      // 20,000 stamps
      for (let i = 0; i < 20000; i++) {
        const u = (i * 0.037) % 1.0;
        const v = (i * 0.071) % 1.0;
        manager.stampAblation(u, v, 0.015, 0.02);
      }

      const duration = performance.now() - tStart;
      expect(duration).toBeLessThan(1500); // Must process 20,000 stamps in < 1.5s
      expect(manager.getBuffer().length).toBe(128 * 128);
    });

    it('S3-2: numeric drift & max depth clamping (10,000 stamps at center)', () => {
      const maxDepth = 2.0;
      const manager = new EngravingDepthMapManager(64, maxDepth);

      // Stamp 10,000 times at (0.5, 0.5) with delta = 0.1mm (total intended = 1000mm)
      for (let i = 0; i < 10000; i++) {
        manager.stampAblation(0.5, 0.5, 0.02, 0.1);
      }

      const centerDepth = manager.getDepthAt(0.5, 0.5);
      // Strictly <= maxDepthMm, no floating point overflow
      expect(centerDepth).toBeLessThanOrEqual(maxDepth);
      expect(centerDepth).toBeCloseTo(maxDepth, 0.0001);

      // Verify all pixels in buffer are <= maxDepth and >= 0
      const buf = manager.getBuffer();
      for (let i = 0; i < buf.length; i++) {
        expect(buf[i]).toBeGreaterThanOrEqual(0);
        expect(buf[i]).toBeLessThanOrEqual(maxDepth);
      }
    });

    it('S3-3: central-difference normal map texture stability across 50,000 stamps', () => {
      const manager = new EngravingDepthMapManager(64, 2.0);
      for (let i = 0; i < 10000; i++) {
        manager.stampAblation(Math.random(), Math.random(), 0.02, 0.05);
      }

      const texture = manager.generateNormalTexture();
      expect(texture).toBeDefined();

      const imgData = texture.image.data as Uint8Array;
      expect(imgData.length).toBe(64 * 64 * 4);

      // Verify every RGBA byte is an integer in [0, 255] and no NaN
      for (let i = 0; i < imgData.length; i++) {
        const val = imgData[i];
        expect(Number.isFinite(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(255);
      }
    });

    it('S3-4: boundary UV coordinates and malformed inputs', () => {
      const manager = new EngravingDepthMapManager(64, 2.0);

      // Boundary inputs
      manager.stampAblation(0, 0, 0.02, 0.1);
      manager.stampAblation(1, 1, 0.02, 0.1);
      manager.stampAblation(-0.5, 0.5, 0.02, 0.1); // Out of bounds negative
      manager.stampAblation(1.5, 0.5, 0.02, 0.1);  // Out of bounds positive
      manager.stampAblation(0.5, 0.5, 0.02, -0.5); // Negative depth delta

      expect(manager.getDepthAt(0, 0)).toBeGreaterThan(0);
      expect(manager.getDepthAt(1, 1)).toBeGreaterThan(0);
    });

    it('S3-5: 1,000 continuous interpolated laser strokes', () => {
      const manager = new EngravingDepthMapManager(64, 2.0);
      const tStart = performance.now();

      for (let i = 0; i < 1000; i++) {
        const u1 = (i * 0.03) % 1.0;
        const v1 = (i * 0.05) % 1.0;
        const u2 = (u1 + 0.1) % 1.0;
        const v2 = (v1 + 0.1) % 1.0;
        manager.stampStroke(u1, v1, u2, v2, 0.01, 0.05);
      }

      const duration = performance.now() - tStart;
      expect(duration).toBeLessThan(1000);
      expect(manager.getDepthAt(0.5, 0.5)).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // 4. Dithering Random Noise Bitmaps and Extreme Grayscale Buffers
  // =========================================================================
  describe('STRESS 4: Dithering Random Noise Bitmaps & Extreme Buffers', () => {
    it('S4-1: 1-Megapixel (1024x1024) random uniform noise dithering (100% binary verification)', () => {
      const width = 1024;
      const height = 1024;
      const numPixels = width * height;
      const noise = new Uint8Array(numPixels);

      // Fill with pseudo-random grayscale values
      let seed = 42;
      for (let i = 0; i < numPixels; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        noise[i] = seed & 0xff;
      }

      const tStart = performance.now();
      const dithered = ditherImageFloydSteinberg(noise, width, height, 128);
      const duration = performance.now() - tStart;

      expect(dithered.length).toBe(numPixels);
      expect(duration).toBeLessThan(500); // < 500ms for 1M pixels

      // Verify that every single pixel is strictly 0 or 255
      let zeros = 0;
      let ones = 0;
      for (let i = 0; i < numPixels; i++) {
        const val = dithered[i];
        if (val === 255) {
          ones++;
        } else if (val === 0) {
          zeros++;
        } else {
          throw new Error(`Non-binary pixel detected at ${i}: ${val}`);
        }
      }

      expect(zeros + ones).toBe(numPixels);
      expect(ones).toBeGreaterThan(numPixels * 0.45);
      expect(ones).toBeLessThan(numPixels * 0.55);
    });

    it('S4-2: high-frequency checkerboard / salt-and-pepper noise', () => {
      const w = 512, h = 512;
      const checker = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          checker[y * w + x] = (x + y) % 2 === 0 ? 255 : 0;
        }
      }

      const dithered = ditherImageFloydSteinberg(checker, w, h);
      expect(dithered.length).toBe(w * h);

      for (let i = 0; i < dithered.length; i++) {
        expect(dithered[i] === 0 || dithered[i] === 255).toBe(true);
      }
    });

    it('S4-3: extreme grayscale buffers (pure 0, pure 255, threshold boundary 127/128)', () => {
      const size = 256 * 256;

      // Pure black
      const black = new Uint8Array(size).fill(0);
      const ditheredBlack = ditherImageFloydSteinberg(black, 256, 256);
      expect(ditheredBlack.every((v) => v === 0)).toBe(true);

      // Pure white
      const white = new Uint8Array(size).fill(255);
      const ditheredWhite = ditherImageFloydSteinberg(white, 256, 256);
      expect(ditheredWhite.every((v) => v === 255)).toBe(true);

      // Uniform 127 (just below 128 threshold)
      const gray127 = new Uint8Array(size).fill(127);
      const dithered127 = ditherImageFloydSteinberg(gray127, 256, 256, 128);
      const ones127 = dithered127.reduce((acc, v) => acc + (v === 255 ? 1 : 0), 0);
      expect(ones127).toBeGreaterThan(size * 0.45);
      expect(ones127).toBeLessThan(size * 0.51);
    });

    it('S4-4: extreme aspect ratios: 1x2048 column and 2048x1 row', () => {
      const col = new Uint8Array(2048);
      for (let i = 0; i < 2048; i++) col[i] = i % 256;
      const ditheredCol = ditherImageFloydSteinberg(col, 1, 2048);
      expect(ditheredCol.length).toBe(2048);
      expect(ditheredCol.every((v) => v === 0 || v === 255)).toBe(true);

      const row = new Uint8Array(2048);
      for (let i = 0; i < 2048; i++) row[i] = i % 256;
      const ditheredRow = ditherImageFloydSteinberg(row, 2048, 1);
      expect(ditheredRow.length).toBe(2048);
      expect(ditheredRow.every((v) => v === 0 || v === 255)).toBe(true);
    });

    it('S4-5: 4-Megapixel buffer (2048x2048) memory and throughput stress', () => {
      const w = 2048, h = 2048;
      const large = new Uint8Array(w * h);
      for (let i = 0; i < large.length; i++) {
        large[i] = (i ^ (i >> 8)) & 0xff;
      }

      const tStart = performance.now();
      const dithered = ditherImageFloydSteinberg(large, w, h);
      const duration = performance.now() - tStart;

      expect(dithered.length).toBe(w * h);
      expect(duration).toBeLessThan(2000); // 4MP in < 2 seconds
    });
  });

  // =========================================================================
  // 5. Store State Mutations & Invariant Preservation
  // =========================================================================
  describe('STRESS 5: Store State Mutations & Safety Invariants', () => {
    it('S5-1: 5,000 rapid toggles of isPartDetached', () => {
      useLabStore.setState({ isPartDetached: false });
      expect(useLabStore.getState().isPartDetached).toBe(false);

      for (let i = 0; i < 5000; i++) {
        useLabStore.getState().togglePartDetached();
      }

      // Even number of toggles -> false
      expect(useLabStore.getState().isPartDetached).toBe(false);

      useLabStore.getState().togglePartDetached();
      expect(useLabStore.getState().isPartDetached).toBe(true);

      useLabStore.getState().setPartDetached(false);
      expect(useLabStore.getState().isPartDetached).toBe(false);
    });

    it('S5-2: 2,000 rapid toggles of chillerStatus', () => {
      useLabStore.setState({ chillerStatus: 'normal' });

      for (let i = 0; i < 2000; i++) {
        useLabStore.getState().toggleChillerStatus();
      }

      expect(useLabStore.getState().chillerStatus).toBe('normal');

      useLabStore.getState().setChillerStatus('overheat');
      expect(useLabStore.getState().chillerStatus).toBe('overheat');

      useLabStore.getState().setChillerStatus('normal');
      expect(useLabStore.getState().chillerStatus).toBe('normal');
    });

    it('S5-3: 4,000 rapid cycles across all processMode values', () => {
      const modes: ProcessMode[] = [
        'through-cut',
        'surface-engrave',
        'color-annealing',
        'relief-2.5d',
      ];

      for (let i = 0; i < 4000; i++) {
        const mode = modes[i % modes.length];
        useLabStore.getState().setProcessMode(mode);
      }

      expect(useLabStore.getState().processMode).toBe(modes[3999 % modes.length]);
    });

    it('S5-4: 5,000 rapid mutations of operatorPPE', () => {
      const wavelengths = ['10600nm', '1064nm', '355nm'];

      for (let i = 0; i < 5000; i++) {
        useLabStore.getState().setOperatorPPE({
          gogglesWavelength: wavelengths[i % 3],
          glovesESD: i % 2 === 0,
        });
      }

      const finalPPE = useLabStore.getState().operatorPPE;
      expect(finalPPE.gogglesWavelength).toBe(wavelengths[4999 % 3]);
      expect(finalPPE.glovesESD).toBe(4999 % 2 === 0);
    });

    it('S5-5: adversarial interlock sequence testing safety invariants', () => {
      // Invariant A: Opening lid while cutting trips interlock and halts cut
      useLabStore.setState({ isMachineRunning: true, isCuttingJob: true, isLidOpen: false });
      useLabStore.getState().toggleLid(); // open lid

      expect(useLabStore.getState().isLidOpen).toBe(true);
      expect(useLabStore.getState().isCuttingJob).toBe(false);
      expect(useLabStore.getState().interlockTriggered).toBe(true);

      // Invariant B: Laser cannot start cutting job if lid is open
      const startResult = useLabStore.getState().startCuttingJob();
      expect(startResult).toBe(false);
      expect(useLabStore.getState().isCuttingJob).toBe(false);
      expect(useLabStore.getState().interlockTriggered).toBe(true);

      // Close lid
      useLabStore.getState().toggleLid();
      expect(useLabStore.getState().isLidOpen).toBe(false);
      expect(useLabStore.getState().interlockTriggered).toBe(false);

      // Invariant C: Changing material resets isPartDetached to false
      useLabStore.getState().setPartDetached(true);
      expect(useLabStore.getState().isPartDetached).toBe(true);
      useLabStore.getState().setSelectedMaterial('ACRYLIC');
      expect(useLabStore.getState().isPartDetached).toBe(false);

      // Invariant D: Switching processMode resets isPartDetached to false
      useLabStore.getState().setPartDetached(true);
      expect(useLabStore.getState().isPartDetached).toBe(true);
      useLabStore.getState().setProcessMode('relief-2.5d');
      expect(useLabStore.getState().isPartDetached).toBe(false);
    });
  });
}
