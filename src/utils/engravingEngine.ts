import * as THREE from 'three';
import { Point2D } from '../data/vectorDesigns';
import { EngravingPhysicalParameters } from '../data/engravingProfiles';

export type { Point2D };

/**
 * Generates closed-polygon scanline hatching or cross-hatching toolpaths
 * with configurable angle and bi-directional serpentine stroke optimization.
 *
 * @param polygon Closed or unclosed array of 2D polygon vertices [x, y]
 * @param angleDeg Scanline hatching angle in degrees (e.g. 0°, 45°, 90°, 135°)
 * @param lineIntervalMm Distance between consecutive scanlines in mm
 * @param crossHatch If true, generates an orthogonal cross-hatch pass
 * @returns Array of toolpath strokes [[p_start, p_end], ...]
 */
export function generatePolygonHatch(
  polygon: Point2D[],
  angleDeg: number,
  lineIntervalMm: number,
  crossHatch = false
): Point2D[][] {
  if (!polygon || polygon.length < 3 || lineIntervalMm <= 0.0001) {
    return [];
  }

  // Ensure polygon is closed for edge traversal
  const poly: Point2D[] = [...polygon];
  const first = poly[0];
  const last = poly[poly.length - 1];
  if (Math.hypot(first[0] - last[0], first[1] - last[1]) > 1e-5) {
    poly.push([first[0], first[1]]);
  }

  const primaryHatch = computeSingleDirectionHatch(poly, angleDeg, lineIntervalMm);

  if (!crossHatch) {
    return primaryHatch;
  }

  // Cross-hatch at 90 degrees offset
  const secondaryHatch = computeSingleDirectionHatch(poly, (angleDeg + 90) % 180, lineIntervalMm);
  return [...primaryHatch, ...secondaryHatch];
}

function computeSingleDirectionHatch(
  poly: Point2D[],
  angleDeg: number,
  intervalMm: number
): Point2D[][] {
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // Rotate polygon by -rad so scanlines align with horizontal axes
  const rotatedPoly: Point2D[] = poly.map(([x, y]) => [
    x * cosA + y * sinA,
    -x * sinA + y * cosA,
  ]);

  // Compute rotated bounding box
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of rotatedPoly) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (maxY - minY <= 1e-5) {
    return [];
  }

  const paths: Point2D[][] = [];
  const startY = minY + intervalMm / 2;
  let lineIdx = 0;

  for (let scanY = startY; scanY < maxY; scanY += intervalMm, lineIdx++) {
    const intersections: number[] = [];

    for (let i = 0; i < rotatedPoly.length - 1; i++) {
      const p1 = rotatedPoly[i];
      const p2 = rotatedPoly[i + 1];

      const y1 = p1[1];
      const y2 = p2[1];

      // Edge intersection check using half-open interval [minY, maxY)
      if ((y1 <= scanY && scanY < y2) || (y2 <= scanY && scanY < y1)) {
        const t = (scanY - y1) / (y2 - y1);
        const intersectX = p1[0] + t * (p2[0] - p1[0]);
        intersections.push(intersectX);
      }
    }

    if (intersections.length < 2) continue;

    // Sort intersection points along the scanline
    intersections.sort((a, b) => a - b);

    // Pair adjacent intersections into solid fill segments
    const isOdd = lineIdx % 2 === 1;

    for (let j = 0; j < intersections.length - 1; j += 2) {
      const xA = intersections[j];
      const xB = intersections[j + 1];

      // Bi-directional serpentine stroke direction
      const startX = isOdd ? xB : xA;
      const endX = isOdd ? xA : xB;

      // Rotate back to original coordinate space (+rad)
      const pStart: Point2D = [
        startX * cosA - scanY * sinA,
        startX * sinA + scanY * cosA,
      ];
      const pEnd: Point2D = [
        endX * cosA - scanY * sinA,
        endX * sinA + scanY * cosA,
      ];

      paths.push([pStart, pEnd]);
    }
  }

  return paths;
}

/**
 * Calculates kerf offset compensation with miter clamping on sharp corners.
 *
 * @param polygon Vertices of the 2D polygon
 * @param kerfWidthMm Total kerf (spot diameter) in mm
 * @param isInnerHole If true, compensates inward (-radius); if false, offsets outward (+radius)
 * @param miterLimit Maximum allowed miter length multiplier before clamping (default 2.5)
 * @returns Compensated polygon vertices
 */
export function applyKerfCompensation(
  polygon: Point2D[],
  kerfWidthMm: number,
  isInnerHole: boolean,
  miterLimit = 2.5
): Point2D[] {
  if (!polygon || polygon.length < 3 || kerfWidthMm <= 1e-5) {
    return polygon.map(([x, y]) => [x, y]);
  }

  // Remove duplicate closing point if present for cleaner indexing
  const pts: Point2D[] = [...polygon];
  const first = pts[0];
  const last = pts[pts.length - 1];
  const isOriginallyClosed = Math.hypot(first[0] - last[0], first[1] - last[1]) < 1e-5;
  if (isOriginallyClosed && pts.length > 3) {
    pts.pop();
  }

  const n = pts.length;
  if (n < 3) return polygon.map(([x, y]) => [x, y]);

  // Compute signed area (Shoelace formula) to determine winding order
  let signedArea = 0;
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    signedArea += pts[i][0] * pts[next][1] - pts[next][0] * pts[i][1];
  }
  const isCCW = signedArea > 0;

  const radius = kerfWidthMm / 2;
  // Outer contour offsets outward (+radius), inner hole offsets inward (-radius)
  const dirMultiplier = isInnerHole ? -1 : 1;

  // Compute edge outward unit normals
  const edgeNormals: Point2D[] = [];
  for (let i = 0; i < n; i++) {
    const next = (i + 1) % n;
    const dx = pts[next][0] - pts[i][0];
    const dy = pts[next][1] - pts[i][1];
    const len = Math.hypot(dx, dy);

    if (len < 1e-6) {
      edgeNormals.push([0, 0]);
      continue;
    }

    // Outward normal:
    // If CCW: (dy/len, -dx/len)
    // If CW:  (-dy/len, dx/len)
    const nx = isCCW ? dy / len : -dy / len;
    const ny = isCCW ? -dx / len : dx / len;
    edgeNormals.push([nx, ny]);
  }

  const compensated: Point2D[] = [];

  for (let i = 0; i < n; i++) {
    const prev = (i - 1 + n) % n;
    const nPrev = edgeNormals[prev];
    const nCurr = edgeNormals[i];

    // Bisector miter vector
    const mx = nPrev[0] + nCurr[0];
    const my = nPrev[1] + nCurr[1];
    const mLen = Math.hypot(mx, my);

    if (mLen < 1e-6) {
      // Degenerate/antiparallel: use current edge normal directly
      compensated.push([
        pts[i][0] + dirMultiplier * radius * nCurr[0],
        pts[i][1] + dirMultiplier * radius * nCurr[1],
      ]);
      continue;
    }

    const unitMx = mx / mLen;
    const unitMy = my / mLen;

    // cos(theta/2) = miter . nCurr
    const cosHalfTheta = unitMx * nCurr[0] + unitMy * nCurr[1];

    let miterScale = radius;
    if (cosHalfTheta > 0.05) {
      miterScale = radius / cosHalfTheta;
      // Clamp miter to avoid needle-like spikes on sharp acute angles
      if (miterScale > radius * miterLimit) {
        miterScale = radius * miterLimit;
      }
    } else {
      // Acute corner clamp
      miterScale = radius * miterLimit;
    }

    compensated.push([
      pts[i][0] + dirMultiplier * miterScale * unitMx,
      pts[i][1] + dirMultiplier * miterScale * unitMy,
    ]);
  }

  if (isOriginallyClosed) {
    compensated.push([compensated[0][0], compensated[0][1]]);
  }

  return compensated;
}

/**
 * Floyd-Steinberg error diffusion dithering algorithm.
 * Converts an 8-bit continuous grayscale image buffer into a binary halftone matrix
 * for raster laser pulsing.
 *
 * @param grayscale Uint8Array buffer of size width * height (0 = black, 255 = white)
 * @param width Bitmap width in pixels
 * @param height Bitmap height in pixels
 * @param threshold Binarization threshold (default 128)
 * @returns Uint8Array buffer of dithered binary values (0 or 255)
 */
export function ditherImageFloydSteinberg(
  grayscale: Uint8Array,
  width: number,
  height: number,
  threshold = 128
): Uint8Array {
  const result = new Uint8Array(width * height);
  const buffer = new Float32Array(grayscale);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const oldVal = buffer[idx];
      const newVal = oldVal >= threshold ? 255 : 0;
      result[idx] = newVal;

      const err = oldVal - newVal;

      // Diffuse quantization error:
      // [   *   7/16 ]
      // [ 3/16 5/16 1/16 ]
      if (x + 1 < width) {
        buffer[idx + 1] += err * (7 / 16);
      }
      if (y + 1 < height) {
        if (x > 0) {
          buffer[(y + 1) * width + (x - 1)] += err * (3 / 16);
        }
        buffer[(y + 1) * width + x] += err * (5 / 16);
        if (x + 1 < width) {
          buffer[(y + 1) * width + (x + 1)] += err * (1 / 16);
        }
      }
    }
  }

  return result;
}

/**
 * Physics-based machining time estimation taking cutting length, rapid travel,
 * settle delays, and multi-pass count into account.
 *
 * @param paths Array of polylines
 * @param params Physical engraving parameters
 * @param machineType Gantry CO2 laser vs Galvo Fiber/UV scanner
 * @returns Estimated total machining time in seconds
 */
export function estimateMachiningTime(
  paths: Point2D[][],
  params: EngravingPhysicalParameters,
  machineType: 'GANTRY' | 'GALVO' = 'GANTRY'
): number {
  if (!paths || paths.length === 0) return 0;

  let totalCutDistMm = 0;
  let totalRapidDistMm = 0;
  let strokeCount = 0;

  let currentPos: Point2D = [0, 0];

  for (const stroke of paths) {
    if (stroke.length < 2) continue;
    strokeCount++;

    // Rapid traverse to start of stroke
    const startPoint = stroke[0];
    totalRapidDistMm += Math.hypot(startPoint[0] - currentPos[0], startPoint[1] - currentPos[1]);

    // Active cutting path length
    for (let i = 0; i < stroke.length - 1; i++) {
      const p1 = stroke[i];
      const p2 = stroke[i + 1];
      totalCutDistMm += Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    }

    currentPos = stroke[stroke.length - 1];
  }

  // Rapid return to origin
  totalRapidDistMm += Math.hypot(currentPos[0], currentPos[1]);

  const scanSpeed = Math.max(1.0, params.scanSpeedMmS);

  // Machine physical speed and latency limits
  const rapidSpeed =
    machineType === 'GALVO'
      ? 8000.0 // Galvo mirrors rapid jump speed (mm/s)
      : Math.min(1200.0, Math.max(400.0, scanSpeed * 2.5)); // Gantry rapid travel

  const settleDelaySec =
    machineType === 'GALVO'
      ? 0.002 // 2ms galvo settle delay
      : 0.04; // 40ms stepper motor turnaround deceleration

  const cutTime = totalCutDistMm / scanSpeed;
  const rapidTime = totalRapidDistMm / rapidSpeed;
  const settleTime = strokeCount * settleDelaySec;

  const timePerPassSec = cutTime + rapidTime + settleTime;
  const passes = Math.max(1, params.passes);
  const layerSwitchOverhead = (passes - 1) * 0.12; // Z-axis lift or debris clearing delay

  const totalTimeSec = timePerPassSec * passes + layerSwitchOverhead;
  return Number(totalTimeSec.toFixed(2));
}

/**
 * Real-time depth and normal map manager operating on a Float32Array buffer
 * with Gaussian laser spot ablation stamping and central-difference normal map texture generation.
 */
export class EngravingDepthMapManager {
  readonly resolution: number;
  readonly buffer: Float32Array;
  readonly maxDepthMm: number;

  private normalData: Uint8Array;
  private normalTexture: THREE.DataTexture | null = null;
  private isDirty = true;

  constructor(resolution = 256, maxDepthMm = 2.0) {
    this.resolution = Math.max(32, resolution);
    this.maxDepthMm = maxDepthMm;
    this.buffer = new Float32Array(this.resolution * this.resolution);
    this.normalData = new Uint8Array(this.resolution * this.resolution * 4);
    this.reset();
  }

  /**
   * Resets the depth map to pristine un-engraved state
   */
  reset(): void {
    this.buffer.fill(0);
    // Initialize normal map to flat upward normal (0, 0, 1) -> RGB (128, 128, 255, 0)
    for (let i = 0; i < this.resolution * this.resolution; i++) {
      const idx = i * 4;
      this.normalData[idx] = 128;     // Nx = 0
      this.normalData[idx + 1] = 128; // Ny = 0
      this.normalData[idx + 2] = 255; // Nz = 1
      this.normalData[idx + 3] = 0;   // Depth = 0
    }
    if (this.normalTexture) {
      this.normalTexture.needsUpdate = true;
    }
    this.isDirty = true;
  }

  /**
   * Stamps a single Gaussian laser ablation spot at normalized coordinates [u, v] in range [0, 1].
   *
   * @param u Normalized X coordinate [0, 1]
   * @param v Normalized Y coordinate [0, 1]
   * @param radiusNorm Gaussian spot radius in normalized UV units (e.g. 0.015)
   * @param depthDeltaMm Depth ablated per stamp in mm
   */
  stampAblation(
    u: number,
    v: number,
    radiusNorm: number,
    depthDeltaMm: number
  ): void {
    if (u < 0 || u > 1 || v < 0 || v > 1 || depthDeltaMm <= 0) return;

    const res = this.resolution;
    const cx = u * (res - 1);
    const cy = v * (res - 1);
    const rPix = Math.max(0.75, radiusNorm * res);
    const rPixSq = rPix * rPix;

    // Fast bounding box iteration (3 sigma)
    const minX = Math.max(0, Math.floor(cx - 3 * rPix));
    const maxX = Math.min(res - 1, Math.ceil(cx + 3 * rPix));
    const minY = Math.max(0, Math.floor(cy - 3 * rPix));
    const maxY = Math.min(res - 1, Math.ceil(cy + 3 * rPix));

    for (let py = minY; py <= maxY; py++) {
      const dy = py - cy;
      const dySq = dy * dy;
      const rowOffset = py * res;

      for (let px = minX; px <= maxX; px++) {
        const dx = px - cx;
        const distSq = dx * dx + dySq;

        if (distSq <= 9 * rPixSq) {
          // Gaussian power density falloff: exp(-2 * r^2 / r0^2)
          const weight = Math.exp((-2.0 * distSq) / rPixSq);
          const idx = rowOffset + px;
          this.buffer[idx] = Math.min(this.maxDepthMm, this.buffer[idx] + depthDeltaMm * weight);
        }
      }
    }

    this.isDirty = true;
  }

  /**
   * Stamps a continuous laser stroke between two normalized points
   */
  stampStroke(
    u1: number,
    v1: number,
    u2: number,
    v2: number,
    radiusNorm: number,
    depthDeltaMm: number,
    stepRatio = 0.5
  ): void {
    const dist = Math.hypot(u2 - u1, v2 - v1);
    const stepSize = Math.max(0.0005, radiusNorm * stepRatio);
    const steps = Math.max(1, Math.ceil(dist / stepSize));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = u1 + (u2 - u1) * t;
      const v = v1 + (v2 - v1) * t;
      this.stampAblation(u, v, radiusNorm, depthDeltaMm / Math.sqrt(steps));
    }
  }

  /**
   * Loads an external 8-bit grayscale depth map image (e.g. for 2.5D relief)
   */
  loadGrayscaleDepthMap(
    grayscale: Uint8Array,
    width: number,
    height: number,
    targetMaxDepthMm = this.maxDepthMm
  ): void {
    const res = this.resolution;

    for (let y = 0; y < res; y++) {
      const srcY = Math.min(height - 1, Math.floor((y / res) * height));
      const rowOffset = y * res;

      for (let x = 0; x < res; x++) {
        const srcX = Math.min(width - 1, Math.floor((x / res) * width));
        const grayVal = grayscale[srcY * width + srcX]; // 0 - 255
        // 0 = no ablation, 255 = maximum depth
        this.buffer[rowOffset + x] = (grayVal / 255.0) * targetMaxDepthMm;
      }
    }

    this.isDirty = true;
  }

  /**
   * Generates or updates a Three.js DataTexture containing the encoded surface normal map
   * and depth in the alpha channel using central differences.
   */
  generateNormalTexture(): THREE.DataTexture {
    if (!this.normalTexture) {
      this.normalTexture = new THREE.DataTexture(
        this.normalData,
        this.resolution,
        this.resolution,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );
      this.normalTexture.wrapS = THREE.ClampToEdgeWrapping;
      this.normalTexture.wrapT = THREE.ClampToEdgeWrapping;
      this.normalTexture.minFilter = THREE.LinearFilter;
      this.normalTexture.magFilter = THREE.LinearFilter;
      this.normalTexture.generateMipmaps = false;
    }

    if (!this.isDirty) {
      return this.normalTexture;
    }

    const res = this.resolution;
    const normalScale = 3.5; // Normal enhancement multiplier

    for (let y = 0; y < res; y++) {
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(res - 1, y + 1);
      const rowOffset = y * res;

      for (let x = 0; x < res; x++) {
        const x0 = Math.max(0, x - 1);
        const x1 = Math.min(res - 1, x + 1);

        // Central difference gradient
        const dzdx = (this.buffer[rowOffset + x1] - this.buffer[rowOffset + x0]) / ((x1 - x0) / res);
        const dzdy = (this.buffer[y1 * res + x] - this.buffer[y0 * res + x]) / ((y1 - y0) / res);

        // Surface normal: N = normalize(-dz/dx, -dz/dy, 1)
        const nx = -dzdx * normalScale;
        const ny = -dzdy * normalScale;
        const nz = 1.0;
        const len = Math.hypot(nx, ny, nz);

        const unitNx = nx / len;
        const unitNy = ny / len;
        const unitNz = nz / len;

        const currentDepth = this.buffer[rowOffset + x];
        const depth01 = Math.min(1.0, currentDepth / Math.max(0.01, this.maxDepthMm));

        const pixelIdx = (rowOffset + x) * 4;
        // Pack into RGBA unsigned bytes [0, 255]
        this.normalData[pixelIdx] = Math.round((unitNx * 0.5 + 0.5) * 255);
        this.normalData[pixelIdx + 1] = Math.round((unitNy * 0.5 + 0.5) * 255);
        this.normalData[pixelIdx + 2] = Math.round((unitNz * 0.5 + 0.5) * 255);
        this.normalData[pixelIdx + 3] = Math.round(depth01 * 255);
      }
    }

    this.normalTexture.needsUpdate = true;
    this.isDirty = false;
    return this.normalTexture;
  }

  /**
   * Retrieves current ablation depth at normalized UV coordinate
   */
  getDepthAt(u: number, v: number): number {
    const clampedU = Math.max(0, Math.min(1, u));
    const clampedV = Math.max(0, Math.min(1, v));
    const px = Math.floor(clampedU * (this.resolution - 1));
    const py = Math.floor(clampedV * (this.resolution - 1));
    return this.buffer[py * this.resolution + px];
  }

  getBuffer(): Float32Array {
    return this.buffer;
  }
}
