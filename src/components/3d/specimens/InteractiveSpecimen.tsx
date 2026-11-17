import React, { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';
import { MaterialType, MATERIALS_CATALOG } from '../../../data/materialsConfig';
import { Point2D, PRESET_DESIGNS } from '../../../data/vectorDesigns';
import { COATING_FINISHES } from '../../../data/coatingFinishes';

interface InteractiveSpecimenProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  overrideMaterial?: MaterialType;
  standalone?: boolean;
}

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

/**
 * Checks if a 2D polyline stroke forms a closed contour
 */
function isStrokeClosed(stroke: Point2D[], tolerance = 0.08): boolean {
  if (stroke.length < 3) return false;
  const start = stroke[0];
  const end = stroke[stroke.length - 1];
  const dx = start[0] - end[0];
  const dy = start[1] - end[1];
  return Math.hypot(dx, dy) < tolerance;
}

/**
 * Computes polygon area using the Shoelace formula
 */
function computeStrokeArea(stroke: Point2D[]): number {
  let area = 0;
  const n = stroke.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += stroke[i][0] * stroke[j][1];
    area -= stroke[j][0] * stroke[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Fallback rounded badge perimeter for open sketches or text
 */
function makeRoundedBadgePath(
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number
): Point2D[] {
  const points: Point2D[] = [];
  const segments = 8;
  const hw = w / 2 - r;
  const hh = h / 2 - r;

  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * (Math.PI / 2);
    points.push([cx + hw + Math.cos(a) * r, cy + hh + Math.sin(a) * r]);
  }
  for (let i = 0; i <= segments; i++) {
    const a = Math.PI / 2 + (i / segments) * (Math.PI / 2);
    points.push([cx - hw + Math.cos(a) * r, cy + hh + Math.sin(a) * r]);
  }
  for (let i = 0; i <= segments; i++) {
    const a = Math.PI + (i / segments) * (Math.PI / 2);
    points.push([cx - hw + Math.cos(a) * r, cy - hh + Math.sin(a) * r]);
  }
  for (let i = 0; i <= segments; i++) {
    const a = (Math.PI * 3) / 2 + (i / segments) * (Math.PI / 2);
    points.push([cx + hw + Math.cos(a) * r, cy - hh + Math.sin(a) * r]);
  }
  points.push(points[0]);
  return points;
}

export function InteractiveSpecimen({
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
  scale = 1.0,
  overrideMaterial,
  standalone = false,
}: InteractiveSpecimenProps) {
  const rootRef = useRef<THREE.Group>(null);
  const innerPartGroupRef = useRef<THREE.Group>(null);
  const liftY = useRef(0);

  // Store bindings
  const selectedMaterial = useLabStore((s) => s.selectedMaterial);
  const currentToolpaths = useLabStore((s) => s.currentToolpaths);
  const cutProgress = useLabStore((s) => s.cutProgress);
  const isPartDetached = useLabStore((s) => s.isPartDetached);
  const processMode = useLabStore((s) => s.processMode);
  const selectedCoatingFinish = useLabStore((s) => s.selectedCoatingFinish);
  const coatingCoverage = useLabStore((s) => s.coatingCoverage);
  const curingProgress = useLabStore((s) => s.curingProgress);

  const matType: MaterialType = overrideMaterial || selectedMaterial || 'WOOD';
  const isWafer = matType === 'SILICON';
  const isThroughCut = processMode === 'CUT' || (processMode as any) === 'through-cut';

  // ===========================================================================
  // 1. SILICON WAFER DIE GRID TEXTURE
  // ===========================================================================
  const waferGridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark iridescent mirror silicon base
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 512);

      // Microchip Die Grid (Dicing streets)
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      const dieSize = 32;
      for (let x = 0; x < 512; x += dieSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y < 512; y += dieSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Microcircuit pattern inside each die
      ctx.fillStyle = '#6366f1';
      for (let x = 4; x < 512; x += dieSize) {
        for (let y = 4; y < 512; y += dieSize) {
          // Central core processor area
          ctx.fillRect(x + 4, y + 4, dieSize - 8, dieSize - 8);
          // Gold contact pads
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + 2, y + 2, 3, 3);
          ctx.fillRect(x + dieSize - 5, y + 2, 3, 3);
          ctx.fillRect(x + 2, y + dieSize - 5, 3, 3);
          ctx.fillRect(x + dieSize - 5, y + dieSize - 5, 3, 3);
          ctx.fillStyle = '#6366f1';
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }, []);

  // Wood grain canvas texture
  const woodGrainTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#d4a373';
      ctx.fillRect(0, 0, 256, 256);

      // Wood grain lines
      ctx.strokeStyle = '#b88655';
      ctx.lineWidth = 1.5;
      for (let y = 0; y < 256; y += 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 256; x += 16) {
          ctx.lineTo(x, y + Math.sin(x * 0.05) * 3);
        }
        ctx.stroke();
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // ===========================================================================
  // 2. AUTHENTIC PBR MATERIALS (Caps & Kerf Side Walls)
  // ===========================================================================
  const { plateCapMaterial, innerCapMaterial, kerfSideWallMaterial } = useMemo(() => {
    let plateCap: THREE.Material;
    let innerCap: THREE.Material;
    let kerfWall: THREE.Material;

    switch (matType) {
      case 'ACRYLIC':
        plateCap = new THREE.MeshPhysicalMaterial({
          color: '#38bdf8',
          roughness: 0.04,
          metalness: 0.05,
          transmission: 0.92,
          ior: 1.49,
          transparent: true,
          opacity: 0.45,
        });
        innerCap = plateCap;
        // Flame-polished crystal smooth kerf edge
        kerfWall = new THREE.MeshPhysicalMaterial({
          color: '#0284c7',
          roughness: 0.08,
          metalness: 0.05,
          transmission: 0.88,
          ior: 1.49,
          transparent: true,
          opacity: 0.65,
        });
        break;

      case 'STEEL':
        plateCap = new THREE.MeshStandardMaterial({
          color: '#cbd5e1', // 304 Stainless steel brushed
          metalness: 0.94,
          roughness: 0.22,
        });
        innerCap = plateCap;
        // Annealed thermal oxide colored kerf edge (straw/gold & blue temper color)
        kerfWall = new THREE.MeshStandardMaterial({
          color: '#d97706',
          metalness: 0.88,
          roughness: 0.35,
          emissive: '#b45309',
          emissiveIntensity: 0.1,
        });
        break;

      case 'ALUMINUM':
        plateCap = new THREE.MeshStandardMaterial({
          color: '#1e293b', // Black anodized matte coating
          metalness: 0.45,
          roughness: 0.42,
        });
        innerCap = plateCap;
        // Bright laser-cleaved silvery raw aluminum 6061 alloy kerf edge
        kerfWall = new THREE.MeshStandardMaterial({
          color: '#f8fafc',
          metalness: 0.95,
          roughness: 0.15,
        });
        break;

      case 'SILICON':
        plateCap = new THREE.MeshStandardMaterial({
          map: waferGridTexture,
          color: '#312e81',
          metalness: 0.98,
          roughness: 0.03,
        });
        innerCap = plateCap;
        // Cold photochemical diced micro-machined cleavage kerf edge
        kerfWall = new THREE.MeshStandardMaterial({
          color: '#475569',
          metalness: 0.85,
          roughness: 0.28,
        });
        break;

      case 'GLASS':
        plateCap = new THREE.MeshPhysicalMaterial({
          color: '#f8fafc',
          roughness: 0.02,
          transmission: 0.96,
          ior: 1.52,
          transparent: true,
          opacity: 0.35,
        });
        innerCap = plateCap;
        // Frosted micro-cracked light-diffusing white frosted kerf edge
        kerfWall = new THREE.MeshStandardMaterial({
          color: '#e2e8f0',
          roughness: 0.75,
          metalness: 0.05,
          transparent: true,
          opacity: 0.85,
        });
        break;

      case 'WOOD':
      default:
        plateCap = new THREE.MeshStandardMaterial({
          map: woodGrainTexture,
          color: '#e2c29d', // Baltic birch plywood
          roughness: 0.72,
          metalness: 0.0,
        });
        innerCap = plateCap;
        // Charred dark brown/black carbonized wood HAZ kerf edge
        kerfWall = new THREE.MeshStandardMaterial({
          color: '#26150b',
          roughness: 0.95,
          metalness: 0.0,
        });
        break;
    }

    return {
      plateCapMaterial: plateCap,
      innerCapMaterial: innerCap,
      kerfSideWallMaterial: kerfWall,
    };
  }, [matType, waferGridTexture, woodGrainTexture]);

  // Coating Finish Material Overlay
  const coatingMaterial = useMemo(() => {
    if (coatingCoverage <= 0) return null;
    const finishConfig = COATING_FINISHES[selectedCoatingFinish];
    return new THREE.MeshStandardMaterial({
      color: finishConfig.color,
      roughness: finishConfig.roughness,
      metalness: finishConfig.metalness,
      emissive: finishConfig.emissive || '#000000',
      emissiveIntensity: (finishConfig.emissiveIntensity || 0) * (curingProgress / 100),
      transparent: true,
      opacity: (coatingCoverage / 100) * 0.85,
    });
  }, [selectedCoatingFinish, coatingCoverage, curingProgress]);

  // ===========================================================================
  // 3. TWO-PART GEOMETRY GENERATION (Outer Plate with Hole + Inner Cutout Part)
  // ===========================================================================
  const { partGeometry, plateGeometry, cornerPoints } = useMemo(() => {
    const paths =
      currentToolpaths && currentToolpaths.length > 0
        ? currentToolpaths
        : PRESET_DESIGNS[0].paths;

    // Separate outer contour and inner holes
    const closedStrokes: Point2D[][] = [];
    paths.forEach((st) => {
      if (isStrokeClosed(st)) closedStrokes.push(st);
    });

    let outerContour: Point2D[] | null = null;
    const innerHoles: Point2D[][] = [];

    if (closedStrokes.length > 0) {
      closedStrokes.sort((a, b) => computeStrokeArea(b) - computeStrokeArea(a));
      outerContour = closedStrokes[0];
      for (let i = 1; i < closedStrokes.length; i++) {
        innerHoles.push(closedStrokes[i]);
      }
    }

    // Fallback: rounded badge perimeter if no closed contour
    if (!outerContour || outerContour.length < 3) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      paths.forEach((st) => {
        st.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        });
      });
      if (minX === Infinity) {
        minX = -0.4;
        maxX = 0.4;
        minY = -0.3;
        maxY = 0.3;
      }
      outerContour = makeRoundedBadgePath(
        (minX + maxX) / 2,
        (minY + maxY) / 2,
        (maxX - minX) * 1.15 + 0.1,
        (maxY - minY) * 1.25 + 0.1,
        0.06
      );
    }

    // Specimen scale factors
    const toolpathScale = isWafer ? 0.35 : 0.45;
    const thickness = isWafer ? 0.008 : 0.02;

    // Part Shape
    const partShape = new THREE.Shape();
    outerContour.forEach(([x, y], idx) => {
      const sx = x * toolpathScale;
      const sy = y * toolpathScale;
      if (idx === 0) partShape.moveTo(sx, sy);
      else partShape.lineTo(sx, sy);
    });
    partShape.closePath();

    innerHoles.forEach((holeStroke) => {
      const holePath = new THREE.Path();
      holeStroke.forEach(([x, y], idx) => {
        const hx = x * toolpathScale;
        const hy = y * toolpathScale;
        if (idx === 0) holePath.moveTo(hx, hy);
        else holePath.lineTo(hx, hy);
      });
      holePath.closePath();
      partShape.holes.push(holePath);
    });

    // Extrude inner part with bevel
    const pGeom = new THREE.ExtrudeGeometry(partShape, {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.0015,
      bevelSize: 0.0015,
      bevelSegments: 2,
    });
    pGeom.translate(0, 0, -thickness / 2);

    // Outer Plate Shape
    const plateShape = new THREE.Shape();
    if (isWafer) {
      // 8-inch (200mm) circular wafer disc with SEMI flat
      const r = 0.55;
      plateShape.absarc(0, 0, r, 0, Math.PI * 1.85, false);
      plateShape.closePath();
    } else {
      // Standard rectangular stock plate (1.2m x 0.8m)
      plateShape.moveTo(-0.65, -0.45);
      plateShape.lineTo(0.65, -0.45);
      plateShape.lineTo(0.65, 0.45);
      plateShape.lineTo(-0.65, 0.45);
      plateShape.closePath();
    }

    // Punch hollow negative hole if cut is finished or part is detached
    if (isThroughCut && (cutProgress >= 100 || isPartDetached)) {
      const plateHole = new THREE.Path();
      outerContour.forEach(([x, y], idx) => {
        const sx = x * toolpathScale;
        const sy = y * toolpathScale;
        if (idx === 0) plateHole.moveTo(sx, sy);
        else plateHole.lineTo(sx, sy);
      });
      plateHole.closePath();
      plateShape.holes.push(plateHole);
    }

    const plGeom = new THREE.ExtrudeGeometry(plateShape, {
      depth: thickness * 1.05,
      bevelEnabled: !isWafer,
      bevelThickness: 0.0015,
      bevelSize: 0.0015,
      bevelSegments: 2,
    });
    plGeom.translate(0, 0, -thickness / 2);

    // 4 representative projection corner points for dashed guide lines
    const corners: [number, number][] = [
      [outerContour[0][0] * toolpathScale, outerContour[0][1] * toolpathScale],
      [
        outerContour[Math.floor(outerContour.length / 4)][0] * toolpathScale,
        outerContour[Math.floor(outerContour.length / 4)][1] * toolpathScale,
      ],
      [
        outerContour[Math.floor(outerContour.length / 2)][0] * toolpathScale,
        outerContour[Math.floor(outerContour.length / 2)][1] * toolpathScale,
      ],
      [
        outerContour[Math.floor((outerContour.length * 3) / 4)][0] * toolpathScale,
        outerContour[Math.floor((outerContour.length * 3) / 4)][1] * toolpathScale,
      ],
    ];

    return {
      partGeometry: pGeom,
      plateGeometry: plGeom,
      cornerPoints: corners,
    };
  }, [currentToolpaths, isWafer, isThroughCut, cutProgress, isPartDetached]);

  // Frame loop for smooth vertical detachment animation (+0.25m lift)
  useFrame((_, delta) => {
    if (!innerPartGroupRef.current) return;

    // Lift by +0.25m when detached via Space key
    const targetY = isPartDetached ? 0.25 : 0;
    liftY.current = THREE.MathUtils.damp(liftY.current, targetY, 8.0, delta);

    // Apply vertical translation along Z in local shape coordinates
    // (since rotation is [-Math.PI/2, 0, 0], Z in local space points up along world Y)
    innerPartGroupRef.current.position.z = liftY.current;
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation} scale={scale} name="InteractiveSpecimen">
      {/* =======================================================================
          1. OUTER STOCK PLATE (With Negative Hole)
         ======================================================================= */}
      <mesh
        geometry={plateGeometry}
        material={[plateCapMaterial, kerfSideWallMaterial]}
        castShadow
        receiveShadow
      />

      {/* Surface Coating Layer on Outer Plate */}
      {coatingMaterial && (
        <mesh
          geometry={plateGeometry}
          material={coatingMaterial}
          position={[0, 0, 0.002]}
        />
      )}

      {/* =======================================================================
          2. INNER CUTOUT MESH (With Smooth +0.25m Vertical Detachment Animation)
         ======================================================================= */}
      <group ref={innerPartGroupRef}>
        <mesh
          geometry={partGeometry}
          material={[innerCapMaterial, kerfSideWallMaterial]}
          castShadow
        />

        {/* Surface Coating Layer on Inner Cutout */}
        {coatingMaterial && (
          <mesh
            geometry={partGeometry}
            material={coatingMaterial}
            position={[0, 0, 0.002]}
          />
        )}
      </group>

      {/* =======================================================================
          3. VERTICAL PROJECTION GUIDE LINES (Linking hole to elevated part)
         ======================================================================= */}
      {isPartDetached &&
        cornerPoints.map(([cx, cy], idx) => (
          <line key={idx}>
            <bufferGeometry>
              <float32BufferAttribute
                attach="attributes-position"
                args={[new Float32Array([cx, cy, 0, cx, cy, 0.25]), 3]}
              />
            </bufferGeometry>
            <lineDashedMaterial
              color="#38bdf8"
              dashSize={0.02}
              gapSize={0.015}
              transparent
              opacity={0.65}
            />
          </line>
        ))}

      {/* Specimen Material & Kerf Annotation Badge (when standalone) */}
      {standalone && (
        <group position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <SafeText
            position={[0, 0.04, 0]}
            fontSize={0.035}
            color="#38bdf8"
            anchorX="center"
          >
            {MATERIALS_CATALOG[matType]?.name || matType}
          </SafeText>
          <SafeText
            position={[0, -0.02, 0]}
            fontSize={0.02}
            color={isPartDetached ? '#22c55e' : '#94a3b8'}
            anchorX="center"
          >
            {isPartDetached
              ? 'DETACHED [+0.25m LIFT] — KERF INSPECTION ACTIVE'
              : 'STOCK POSITION — PRESS [SPACE] TO DETACH'}
          </SafeText>
        </group>
      )}
    </group>
  );
}

export default InteractiveSpecimen;
