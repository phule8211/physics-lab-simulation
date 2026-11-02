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

/**
 * Generate 2D parametric spur gear with N teeth and center bore
 */
function generateSpurGear(teeth = 12, outerR = 0.85, innerR = 0.62, hubR = 0.22): Point2D[][] {
  const outerContour: Point2D[] = [];
  const stepsPerTooth = 6;
  const totalSteps = teeth * stepsPerTooth;

  for (let i = 0; i <= totalSteps; i++) {
    const angle = (i / totalSteps) * Math.PI * 2;
    const toothPhase = (i % stepsPerTooth) / stepsPerTooth;
    let r = innerR;
    if (toothPhase > 0.2 && toothPhase < 0.8) {
      r = outerR; // Top of tooth
    }
    outerContour.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }

  // Center axle hole
  const centerHole: Point2D[] = [];
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    centerHole.push([Math.cos(angle) * hubR, Math.sin(angle) * hubR]);
  }

  // 4 light-weighting spoke cutouts
  const spokeHoles: Point2D[][] = [];
  for (let s = 0; s < 4; s++) {
    const spokeAngle = (s / 4) * Math.PI * 2 + Math.PI / 4;
    const spokeCenter: Point2D = [Math.cos(spokeAngle) * 0.42, Math.sin(spokeAngle) * 0.42];
    const hole: Point2D[] = [];
    for (let j = 0; j <= 16; j++) {
      const a = (j / 16) * Math.PI * 2;
      hole.push([spokeCenter[0] + Math.cos(a) * 0.1, spokeCenter[1] + Math.sin(a) * 0.1]);
    }
    spokeHoles.push(hole);
  }

  return [outerContour, centerHole, ...spokeHoles];
}

/**
 * Generate 2D Atom Physics Logo (Nucleus + 3 Elliptical Orbit Rings)
 */
function generateAtomLogo(): Point2D[][] {
  const paths: Point2D[][] = [];

  // Central Nucleus
  const nucleus: Point2D[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    nucleus.push([Math.cos(a) * 0.14, Math.sin(a) * 0.14]);
  }
  paths.push(nucleus);

  // 3 Orbit Ellipses rotated at 0, 60, 120 degrees
  const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];
  angles.forEach((rot) => {
    const orbit: Point2D[] = [];
    const aRadius = 0.85; // semi-major axis
    const bRadius = 0.28; // semi-minor axis
    for (let i = 0; i <= 48; i++) {
      const t = (i / 48) * Math.PI * 2;
      const x0 = Math.cos(t) * aRadius;
      const y0 = Math.sin(t) * bRadius;
      // Rotate by rot
      const rx = x0 * Math.cos(rot) - y0 * Math.sin(rot);
      const ry = x0 * Math.sin(rot) + y0 * Math.cos(rot);
      orbit.push([rx, ry]);
    }
    paths.push(orbit);
  });

  return paths;
}

/**
 * Generate Star Badge (8-Point Star with Inner Ring)
 */
function generateStarBadge(): Point2D[][] {
  const star: Point2D[] = [];
  const points = 8;
  for (let i = 0; i <= points * 2; i++) {
    const angle = (i / (points * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.85 : 0.42;
    star.push([Math.cos(angle) * r, Math.sin(angle) * r]);
  }

  const ring: Point2D[] = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI * 2;
    ring.push([Math.cos(a) * 0.25, Math.sin(a) * 0.25]);
  }

  return [star, ring];
}

/**
 * Generate PCB Circuit Chip with Bus Tracks
 */
function generatePCBCircuit(): Point2D[][] {
  const paths: Point2D[][] = [];

  // Central IC Chip Package
  paths.push([
    [-0.3, -0.3],
    [0.3, -0.3],
    [0.3, 0.3],
    [-0.3, 0.3],
    [-0.3, -0.3],
  ]);

  // Bus lines radiating outwards
  const leads: Point2D[][] = [
    // Top traces
    [[-0.2, 0.3], [-0.2, 0.55], [-0.4, 0.75], [-0.7, 0.75]],
    [[0, 0.3], [0, 0.78]],
    [[0.2, 0.3], [0.2, 0.55], [0.4, 0.75], [0.7, 0.75]],
    // Bottom traces
    [[-0.2, -0.3], [-0.2, -0.55], [-0.4, -0.75], [-0.7, -0.75]],
    [[0, -0.3], [0, -0.78]],
    [[0.2, -0.3], [0.2, -0.55], [0.4, -0.75], [0.7, -0.75]],
    // Left & right traces
    [[-0.3, 0], [-0.55, 0], [-0.75, 0.25]],
    [[-0.3, -0.15], [-0.55, -0.15], [-0.75, -0.35]],
    [[0.3, 0], [0.55, 0], [0.75, 0.25]],
    [[0.3, -0.15], [0.55, -0.15], [0.75, -0.35]],
  ];

  return [...paths, ...leads];
}

/**
 * Generate Parametric Heart Art Silhouette
 */
function generateHeart(): Point2D[][] {
  const heart: Point2D[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    const x = (16 * Math.pow(Math.sin(t), 3)) / 20;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 20;
    // Invert y so top of heart points upwards
    heart.push([x, y * 0.9 + 0.1]);
  }
  return [heart];
}

/**
 * Simple Vector Stroke Font for Custom Text (Letters A-Z, 0-9, space)
 */
const VECTOR_GLYPHS: Record<string, Point2D[][]> = {
  A: [[[-0.3, -0.5], [0, 0.5], [0.3, -0.5]], [[-0.18, -0.1], [0.18, -0.1]]],
  B: [[[-0.25, -0.5], [-0.25, 0.5], [0.15, 0.5], [0.25, 0.25], [0.15, 0], [-0.25, 0]], [[0.15, 0], [0.25, -0.25], [0.15, -0.5], [-0.25, -0.5]]],
  C: [[[0.25, 0.4], [0.1, 0.5], [-0.2, 0.5], [-0.3, 0.3], [-0.3, -0.3], [-0.2, -0.5], [0.1, -0.5], [0.25, -0.4]]],
  D: [[[-0.25, -0.5], [-0.25, 0.5], [0.1, 0.5], [0.25, 0.25], [0.25, -0.25], [0.1, -0.5], [-0.25, -0.5]]],
  E: [[[0.25, 0.5], [-0.25, 0.5], [-0.25, -0.5], [0.25, -0.5]], [[-0.25, 0], [0.15, 0]]],
  F: [[[0.25, 0.5], [-0.25, 0.5], [-0.25, -0.5]], [[-0.25, 0], [0.15, 0]]],
  G: [[[0.25, 0.4], [0.1, 0.5], [-0.2, 0.5], [-0.3, 0.3], [-0.3, -0.3], [-0.2, -0.5], [0.15, -0.5], [0.25, -0.35], [0.25, 0], [0, 0]]],
  H: [[[-0.25, 0.5], [-0.25, -0.5]], [[0.25, 0.5], [0.25, -0.5]], [[-0.25, 0], [0.25, 0]]],
  I: [[[-0.15, 0.5], [0.15, 0.5]], [[0, 0.5], [0, -0.5]], [[-0.15, -0.5], [0.15, -0.5]]],
  J: [[[0.2, 0.5], [0.2, -0.35], [0.1, -0.5], [-0.15, -0.5], [-0.25, -0.35]]],
  K: [[[-0.25, 0.5], [-0.25, -0.5]], [[0.25, 0.5], [-0.25, 0], [0.25, -0.5]]],
  L: [[[-0.25, 0.5], [-0.25, -0.5], [0.25, -0.5]]],
  M: [[[-0.3, -0.5], [-0.3, 0.5], [0, 0.1], [0.3, 0.5], [0.3, -0.5]]],
  N: [[[-0.25, -0.5], [-0.25, 0.5], [0.25, -0.5], [0.25, 0.5]]],
  O: [[[-0.2, 0.5], [0.2, 0.5], [0.3, 0.3], [0.3, -0.3], [0.2, -0.5], [-0.2, -0.5], [-0.3, -0.3], [-0.3, 0.3], [-0.2, 0.5]]],
  P: [[[-0.25, -0.5], [-0.25, 0.5], [0.15, 0.5], [0.25, 0.35], [0.25, 0.15], [0.15, 0], [-0.25, 0]]],
  Q: [[[-0.2, 0.5], [0.2, 0.5], [0.3, 0.3], [0.3, -0.3], [0.2, -0.5], [-0.2, -0.5], [-0.3, -0.3], [-0.3, 0.3], [-0.2, 0.5]], [[0.05, -0.2], [0.3, -0.5]]],
  R: [[[-0.25, -0.5], [-0.25, 0.5], [0.15, 0.5], [0.25, 0.35], [0.25, 0.15], [0.15, 0], [-0.25, 0]], [[0.05, 0], [0.25, -0.5]]],
  S: [[[0.25, 0.4], [0.1, 0.5], [-0.2, 0.5], [-0.25, 0.35], [0.2, 0.15], [0.25, -0.2], [0.1, -0.5], [-0.2, -0.5], [-0.25, -0.4]]],
  T: [[[-0.3, 0.5], [0.3, 0.5]], [[0, 0.5], [0, -0.5]]],
  U: [[[-0.25, 0.5], [-0.25, -0.35], [-0.15, -0.5], [0.15, -0.5], [0.25, -0.35], [0.25, 0.5]]],
  V: [[[-0.3, 0.5], [0, -0.5], [0.3, 0.5]]],
  W: [[[-0.3, 0.5], [-0.18, -0.5], [0, 0.1], [0.18, -0.5], [0.3, 0.5]]],
  X: [[[-0.25, 0.5], [0.25, -0.5]], [[0.25, 0.5], [-0.25, -0.5]]],
  Y: [[[-0.25, 0.5], [0, 0], [0.25, 0.5]], [[0, 0], [0, -0.5]]],
  Z: [[[-0.25, 0.5], [0.25, 0.5], [-0.25, -0.5], [0.25, -0.5]]],
  '0': [[[-0.2, 0.5], [0.2, 0.5], [0.25, 0.3], [0.25, -0.3], [0.2, -0.5], [-0.2, -0.5], [-0.25, -0.3], [-0.25, 0.3], [-0.2, 0.5]], [[-0.2, -0.4], [0.2, 0.4]]],
  '1': [[[-0.1, 0.35], [0, 0.5], [0, -0.5]], [[-0.15, -0.5], [0.15, -0.5]]],
  '2': [[[-0.25, 0.35], [-0.1, 0.5], [0.15, 0.5], [0.25, 0.35], [-0.25, -0.5], [0.25, -0.5]]],
  '3': [[[-0.25, 0.5], [0.2, 0.5], [0, 0.1], [0.2, 0.1], [0.25, -0.2], [0.1, -0.5], [-0.2, -0.5]]],
  '4': [[[0.15, -0.5], [0.15, 0.5], [-0.25, -0.1], [0.25, -0.1]]],
  '5': [[[0.25, 0.5], [-0.25, 0.5], [-0.25, 0.1], [0.15, 0.1], [0.25, -0.1], [0.15, -0.5], [-0.2, -0.5]]],
  '6': [[[0.15, 0.5], [-0.2, 0.3], [-0.25, -0.2], [-0.1, -0.5], [0.15, -0.5], [0.25, -0.3], [0.2, 0], [-0.25, 0]]],
  '7': [[[-0.25, 0.5], [0.25, 0.5], [-0.05, -0.5]]],
  '8': [[[-0.15, 0.5], [0.15, 0.5], [0.2, 0.25], [-0.2, -0.25], [-0.15, -0.5], [0.15, -0.5], [0.2, -0.25], [-0.2, 0.25], [-0.15, 0.5]]],
  '9': [[[0.25, 0], [-0.2, 0], [-0.25, 0.3], [-0.15, 0.5], [0.1, 0.5], [0.25, 0.2], [0.2, -0.3], [-0.15, -0.5]]],
  '-': [[[-0.15, 0], [0.15, 0]]],
  '.': [[[0, -0.45], [0.03, -0.45]]],
  ' ': [],
};

/**
 * Generate vector paths for custom user text with guaranteed safe bounds
 */
export function generateTextPaths(text: string): Point2D[][] {
  const upper = text.toUpperCase().trim();
  if (!upper) return [];

  const charWidth = 0.55;
  const totalRawWidth = upper.length * charWidth;
  const startX = -totalRawWidth / 2 + charWidth / 2;

  // Target safe width on workpiece bed: max 1.45 (so X stays within [-0.73, 0.73])
  const maxAllowedWidth = 1.45;
  const scale = Math.min(0.22, maxAllowedWidth / totalRawWidth);

  const result: Point2D[][] = [];

  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    const glyph = VECTOR_GLYPHS[char] || VECTOR_GLYPHS[' '];
    const charCenterX = (startX + i * charWidth) * scale;

    glyph.forEach((stroke) => {
      const scaledStroke: Point2D[] = stroke.map(([x, y]) => [
        charCenterX + x * scale,
        y * scale,
      ]);
      result.push(scaledStroke);
    });
  }

  return result;
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  isOutOfBounds: boolean;
}

/**
 * Computes bounding rectangle and safety limits of a vector toolpath
 */
export function computeBoundingBox(paths: Point2D[][]): BoundingBox {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const stroke of paths) {
    for (const [x, y] of stroke) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (minX === Infinity || !isFinite(minX)) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0, isOutOfBounds: false };
  }

  const width = Math.max(0.01, maxX - minX);
  const height = Math.max(0.01, maxY - minY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  // If design exceeds safety zone [-0.85, 0.85], it is out of bounds
  const isOutOfBounds = minX < -0.86 || maxX > 0.86 || minY < -0.86 || maxY > 0.86;

  return { minX, maxX, minY, maxY, width, height, centerX, centerY, isOutOfBounds };
}

/**
 * Transforms paths with scale factor and X/Y offsets
 */
export function transformToolpaths(
  paths: Point2D[][],
  scale: number,
  offsetX: number,
  offsetY: number
): Point2D[][] {
  return paths.map((stroke) =>
    stroke.map(([x, y]) => [
      x * scale + offsetX,
      y * scale + offsetY,
    ])
  );
}

/**
 * Automatically centers and scales toolpaths so they fit safely within the workpiece bed
 */
export function autoFitToolpaths(paths: Point2D[][], maxBound = 0.78): Point2D[][] {
  const bbox = computeBoundingBox(paths);
  if (bbox.width < 0.001 || bbox.height < 0.001) return paths;

  const maxDimension = Math.max(bbox.width, bbox.height);
  const targetDimension = maxBound * 2;
  const scale = targetDimension / maxDimension;

  return paths.map((stroke) =>
    stroke.map(([x, y]) => [
      (x - bbox.centerX) * scale,
      (y - bbox.centerY) * scale,
    ])
  );
}

/**
 * Generates a closed rectangular framing toolpath around the bounding box
 */
export function generateFramePath(bbox: BoundingBox): Point2D[][] {
  return [[
    [bbox.minX, bbox.minY],
    [bbox.maxX, bbox.minY],
    [bbox.maxX, bbox.maxY],
    [bbox.minX, bbox.maxY],
    [bbox.minX, bbox.minY],
  ]];
}

/**
 * Pre-defined Vector Design Catalog
 */
export const PRESET_DESIGNS: VectorDesign[] = [
  {
    id: 'SPUR_GEAR',
    name: 'Bánh Răng Cơ Khí 12 Răng (Spur Gear)',
    category: 'Kỹ thuật cơ khí',
    description: 'Bánh răng ăn khớp thân khai tiêu chuẩn kỹ thuật với 12 răng, lỗ trục trung tâm và 4 hốc giảm trọng lượng.',
    iconName: 'Cog',
    paths: generateSpurGear(),
    estimatedTimeSec: 8.5,
  },
  {
    id: 'ATOM_LOGO',
    name: 'Logo Nguyên Tử Vật Lý (Atom Science)',
    category: 'Biểu tượng khoa học',
    description: 'Mô hình nguyên tử Rutherford-Bohr với hạt nhân trung tâm và 3 quỹ đạo electron elip lệch pha 60 độ.',
    iconName: 'Atom',
    paths: generateAtomLogo(),
    estimatedTimeSec: 9.2,
  },
  {
    id: 'PCB_CIRCUIT',
    name: 'Mạch Vi Xử Lý & Đường Bus (Microchip PCB)',
    category: 'Kỹ thuật cơ khí',
    description: 'Chân chip vi điều khiển IC SMD với các đường tín hiệu uốn góc 45 độ hướng tới các điểm hàn vi mô.',
    iconName: 'Cpu',
    paths: generatePCBCircuit(),
    estimatedTimeSec: 7.8,
  },
  {
    id: 'STAR_BADGE',
    name: 'Huy Hiệu Ngôi Sao 8 Cánh (Octagram Badge)',
    category: 'Nghệ thuật & Decor',
    description: 'Ngôi sao bát giác đối xứng hình học kết hợp vòng tròn đồng tâm, ứng dụng khắc kỷ niệm chương.',
    iconName: 'Star',
    paths: generateStarBadge(),
    estimatedTimeSec: 6.5,
  },
  {
    id: 'HEART_ART',
    name: 'Đường Cong Trái Tim Tham Số (Cardioid Art)',
    category: 'Nghệ thuật & Decor',
    description: 'Đường cong trái tim mượt mà tạo từ hàm lượng giác bậc 4, thích hợp cắt móc khóa quà tặng gỗ/mica.',
    iconName: 'Heart',
    paths: generateHeart(),
    estimatedTimeSec: 6.0,
  },
];

export interface PathSegment {
  p1: Point2D;
  p2: Point2D;
  length: number;
  cumStart: number;
  cumEnd: number;
}

/**
 * Pre-computes toolpath segments and total length for fast real-time G-code interpolation
 */
export function buildToolpathIndex(paths: Point2D[][]): {
  segments: PathSegment[];
  totalLength: number;
} {
  const segments: PathSegment[] = [];
  let cumDistance = 0;

  for (const poly of paths) {
    if (poly.length < 2) continue;
    for (let i = 0; i < poly.length - 1; i++) {
      const p1 = poly[i];
      const p2 = poly[i + 1];
      const dist = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      if (dist < 0.0001) continue;
      segments.push({
        p1,
        p2,
        length: dist,
        cumStart: cumDistance,
        cumEnd: cumDistance + dist,
      });
      cumDistance += dist;
    }
  }

  return {
    segments,
    totalLength: Math.max(0.001, cumDistance),
  };
}

/**
 * Given progress [0, 1], returns current [x, y] tool position
 */
export function interpolateToolpathPoint(
  segments: PathSegment[],
  totalLength: number,
  progress01: number
): Point2D {
  if (!segments.length) return [0, 0];
  const targetDist = Math.max(0, Math.min(1, progress01)) * totalLength;

  for (const seg of segments) {
    if (targetDist >= seg.cumStart && targetDist <= seg.cumEnd) {
      const t = (targetDist - seg.cumStart) / seg.length;
      return [
        seg.p1[0] + (seg.p2[0] - seg.p1[0]) * t,
        seg.p1[1] + (seg.p2[1] - seg.p1[1]) * t,
      ];
    }
  }

  const last = segments[segments.length - 1];
  return last ? last.p2 : [0, 0];
}

