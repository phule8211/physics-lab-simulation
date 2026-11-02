import React, { useEffect, useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../../store/useLabStore';
import { MATERIALS_CATALOG, MaterialType } from '../../data/materialsConfig';
import { STATIONS } from '../../data/labConfig';
import {
  X,
  PackageCheck,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  Cpu,
  Move3d,
  CheckCircle2,
  Scissors,
  Flame,
  ArrowUpRight,
  Maximize2,
  Box,
} from 'lucide-react';
import { Point2D, computeBoundingBox } from '../../data/vectorDesigns';

/**
 * Detects whether a 2D stroke forms a closed polygon loop
 */
function isStrokeClosed(stroke: Point2D[], tolerance = 0.12): boolean {
  if (!stroke || stroke.length < 3) return false;
  const p0 = stroke[0];
  const p1 = stroke[stroke.length - 1];
  return Math.hypot(p0[0] - p1[0], p0[1] - p1[1]) < tolerance;
}

/**
 * Computes polygon signed area for sorting outer vs inner loops
 */
function computeStrokeArea(stroke: Point2D[]): number {
  let area = 0;
  for (let i = 0; i < stroke.length - 1; i++) {
    area += stroke[i][0] * stroke[i + 1][1] - stroke[i + 1][0] * stroke[i][1];
  }
  return Math.abs(area) / 2;
}

/**
 * Builds a rounded rectangular badge contour around open strokes or text
 */
function makeRoundedBadgePath(
  cx: number,
  cy: number,
  width: number,
  height: number,
  radius: number
): Point2D[] {
  const path: Point2D[] = [];
  const rx = Math.min(radius, width / 2, height / 2);
  const steps = 6;
  const x0 = cx - width / 2;
  const y0 = cy - height / 2;
  // bottom-right arc
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    path.push([x0 + width - rx + Math.cos(a) * rx, y0 + rx + Math.sin(a) * rx]);
  }
  // top-right arc
  for (let i = 0; i <= steps; i++) {
    const a = 0 + (i / steps) * (Math.PI / 2);
    path.push([x0 + width - rx + Math.cos(a) * rx, y0 + height - rx + Math.sin(a) * rx]);
  }
  // top-left arc
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (i / steps) * (Math.PI / 2);
    path.push([x0 + rx + Math.cos(a) * rx, y0 + height - rx + Math.sin(a) * rx]);
  }
  // bottom-left arc
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI + (i / steps) * (Math.PI / 2);
    path.push([x0 + rx + Math.cos(a) * rx, y0 + rx + Math.sin(a) * rx]);
  }
  return path;
}

/**
 * Builds realistic 3D Extruded Geometries for:
 * 1. The exact cut-out part (outer loop + inner holes)
 * 2. The base workpiece plate with a true hollow hole punched through it
 */
function buildCutoutMeshes(
  toolpaths: Point2D[][],
  scale: number,
  scaleY: number,
  isWafer: boolean,
  isCutMode: boolean
) {
  try {
    // 1. Identify closed strokes
    const closedStrokes: Point2D[][] = [];
    toolpaths.forEach((st) => {
      if (isStrokeClosed(st)) {
        closedStrokes.push(st);
      }
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

    // Fallback: If no closed stroke exists (e.g. text letters or open sketch),
    // create a sleek rounded badge perimeter around the toolpaths
    if (!outerContour || outerContour.length < 3) {
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      toolpaths.forEach((st) => {
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
      const w = (maxX - minX) * 1.15 + 0.12;
      const h = (maxY - minY) * 1.25 + 0.12;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      outerContour = makeRoundedBadgePath(cx, cy, w, h, 0.08);
    }

    // Build the 3D Cutout Part Shape
    const partShape = new THREE.Shape();
    outerContour.forEach(([x, y], idx) => {
      const sx = x * scale;
      const sy = y * scaleY;
      if (idx === 0) partShape.moveTo(sx, sy);
      else partShape.lineTo(sx, sy);
    });
    partShape.closePath();

    innerHoles.forEach((holeStroke) => {
      const holePath = new THREE.Path();
      holeStroke.forEach(([x, y], idx) => {
        const hx = x * scale;
        const hy = y * scaleY;
        if (idx === 0) holePath.moveTo(hx, hy);
        else holePath.lineTo(hx, hy);
      });
      holePath.closePath();
      partShape.holes.push(holePath);
    });

    const partGeometry = new THREE.ExtrudeGeometry(partShape, {
      depth: 0.076,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    partGeometry.translate(0, 0, -0.038); // Center along Z axis

    // Build Base Plate Shape
    const plateShape = new THREE.Shape();
    if (isWafer) {
      plateShape.absarc(0, 0, 1.2, 0, Math.PI * 2, false);
    } else {
      plateShape.moveTo(-1.2, -0.8);
      plateShape.lineTo(1.2, -0.8);
      plateShape.lineTo(1.2, 0.8);
      plateShape.lineTo(-1.2, 0.8);
      plateShape.closePath();
    }

    if (isCutMode) {
      const plateHole = new THREE.Path();
      outerContour.forEach(([x, y], idx) => {
        const sx = x * scale;
        const sy = y * scaleY;
        if (idx === 0) plateHole.moveTo(sx, sy);
        else plateHole.lineTo(sx, sy);
      });
      plateHole.closePath();
      plateShape.holes.push(plateHole);
    }

    const plateGeometry = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.08,
      bevelEnabled: !isWafer,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
    plateGeometry.translate(0, 0, -0.04);

    return { partGeometry, plateGeometry, outerContour };
  } catch (err) {
    console.error('buildCutoutMeshes error, falling back to box geometries:', err);
    return {
      partGeometry: new THREE.BoxGeometry(0.8, 0.076, 0.5),
      plateGeometry: new THREE.BoxGeometry(2.4, 0.08, 1.6),
      outerContour: [
        [-0.4, -0.25],
        [0.4, -0.25],
        [0.4, 0.25],
        [-0.4, 0.25],
        [-0.4, -0.25],
      ] as Point2D[],
    };
  }
}

/**
 * 3D Specimen in Inspection Studio:
 * Supports true 3D shape cutout, hollow hole in base sheet, and smooth floating lift animation
 */
function Specimen3DObject() {
  const lastProcessedJob = useLabStore((state) => state.lastProcessedJob);
  const selectedMaterial = useLabStore((state) => state.selectedMaterial);
  const currentToolpaths = useLabStore((state) => state.currentToolpaths);
  const currentDesignName = useLabStore((state) => state.currentDesignName);
  const cutProgress = useLabStore((state) => state.cutProgress);
  const processMode = useLabStore((state) => state.processMode);
  const isPartDetached = useLabStore((state) => state.isPartDetached);

  const effectiveMaterial = (lastProcessedJob ? lastProcessedJob.material : selectedMaterial) as MaterialType;
  const effectiveProcessMode = lastProcessedJob ? lastProcessedJob.processMode : processMode;
  const effectiveDesignName = lastProcessedJob ? lastProcessedJob.designName : currentDesignName;

  const matConfig = MATERIALS_CATALOG[effectiveMaterial] || MATERIALS_CATALOG.WOOD;
  const isWafer = effectiveMaterial === 'SILICON';

  const scale = isWafer ? 0.9 : 1.0;
  const scaleY = isWafer ? 1 : 0.65;
  const isCut = effectiveProcessMode === 'CUT';

  const bbox = useMemo(() => computeBoundingBox(currentToolpaths), [currentToolpaths]);

  // Generate exact 3D extruded meshes with real cutout hole
  const { partGeometry, plateGeometry, outerContour } = useMemo(() => {
    return buildCutoutMeshes(currentToolpaths, scale, scaleY, isWafer, isCut);
  }, [currentToolpaths, scale, scaleY, isWafer, isCut]);

  useEffect(() => {
    return () => {
      partGeometry?.dispose();
      plateGeometry?.dispose();
    };
  }, [partGeometry, plateGeometry]);

  // Smooth floating lift animation
  const liftGroupRef = useRef<THREE.Group>(null);
  const liftY = useRef(0);

  useFrame((_, delta) => {
    const targetY = isCut && isPartDetached ? 0.38 : 0;
    liftY.current = THREE.MathUtils.damp(liftY.current, targetY, 8, delta);
    if (liftGroupRef.current) {
      liftGroupRef.current.position.y = liftY.current;
    }
  });

  // Distinct Kerf color based on material interaction physics
  const kerfColor =
    selectedMaterial === 'WOOD'
      ? '#3b1c06' // Dark carbonized burnt kerf
      : selectedMaterial === 'ACRYLIC'
      ? '#38bdf8' // Flame-polished translucent kerf
      : selectedMaterial === 'STEEL'
      ? '#f59e0b' // Gold annealed oxide track
      : selectedMaterial === 'ALUMINUM'
      ? '#f8fafc' // Bright white anodized ablation
      : selectedMaterial === 'GLASS'
      ? '#e2e8f0' // Frosted micro-fracture
      : '#c084fc'; // UV violet ionization

  return (
    <group rotation={[0.4, -0.6, 0]}>
      {/* =========================================================================
          A. BASE WORKPIECE STOCK (Punched with True Hollow Cutout Hole)
         ========================================================================= */}
      <mesh
        castShadow
        receiveShadow
        geometry={plateGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={matConfig.color}
          metalness={matConfig.metalness}
          roughness={matConfig.roughness}
          transparent={matConfig.transparent}
          opacity={matConfig.opacity}
        />
      </mesh>

      {/* Honeycomb cutting bed visible through cutout cavity */}
      {isCut && (
        <group position={[0, -0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh receiveShadow>
            <planeGeometry args={[2.38, 1.58]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.4} />
          </mesh>
          <gridHelper args={[2.2, 22, '#475569', '#334155']} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      )}

      {/* Laser Engraved Title Bar on Bottom Rim (Firmly on Base Plate, Never Floats) */}
      <group position={[0, isWafer ? -1.02 : -0.72, 0.042]} rotation={[-Math.PI / 2, 0, 0]}>
        <Suspense fallback={null}>
          <Text
            fontSize={0.05}
            color={kerfColor}
            anchorX="center"
            anchorY="bottom"
          >
            {`G-CODE: ${currentDesignName.toUpperCase()} • ${
              isCut ? 'CẮT XUYÊN (THRU-CUT 3.0mm)' : 'KHẮC MẶT (ENGRAVE 0.1mm)'
            } • ${cutProgress >= 100 ? '100% PASS' : `${cutProgress.toFixed(0)}%`}`}
          </Text>
        </Suspense>
      </group>

      {/* =========================================================================
          B. THE 3D CUTOUT PART / ENGRAVING
             - In CUT mode: Exactly shaped 3D solid that lifts out of the hole
             - In ENGRAVE mode: Etched lines on the intact plate surface
         ========================================================================= */}
      {isCut ? (
        <group ref={liftGroupRef}>
          {/* 3D Solid Cutout Part Body */}
          <mesh
            castShadow
            receiveShadow
            geometry={partGeometry}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial
              color={matConfig.color}
              metalness={matConfig.metalness}
              roughness={matConfig.roughness}
              transparent={matConfig.transparent}
              opacity={matConfig.opacity}
            />
          </mesh>

          {/* Laser Cut Edge Perimeter Kerf Line */}
          <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.039]}>
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[
                    new Float32Array(
                      outerContour.flatMap(([px, py]) => [px * scale, py * scaleY, 0.001])
                    ),
                    3,
                  ]}
                />
              </bufferGeometry>
              <lineBasicMaterial color={kerfColor} linewidth={3} />
            </line>
          </group>

          {/* Exact Surface Vector Toolpaths on Part Face */}
          <group position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {currentToolpaths.map((stroke, sIdx) => {
              if (stroke.length < 2) return null;
              const pointsFlat: number[] = [];
              stroke.forEach(([px, py]) => {
                pointsFlat.push(px * scale, py * scaleY, 0.001);
              });
              return (
                <line key={`inspect-stroke-${sIdx}`}>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array(pointsFlat), 3]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color={kerfColor} linewidth={3.0} />
                </line>
              );
            })}
          </group>

          {/* Floating Annotation Pill when Part is Detached */}
          {isPartDetached && (
            <group position={[bbox.centerX * scale, 0.16, -bbox.centerY * scaleY]}>
              <Suspense fallback={null}>
                <Text
                  fontSize={0.055}
                  color="#38bdf8"
                  anchorX="center"
                  anchorY="middle"
                >
                  CHI TIẾT CẮT RỜI [3.0mm]
                </Text>
              </Suspense>
            </group>
          )}
        </group>
      ) : (
        /* Flat Engraved Toolpaths on Surface in ENGRAVE Mode */
        <group position={[0, isWafer ? 0.022 : 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {currentToolpaths.map((stroke, sIdx) => {
            if (stroke.length < 2) return null;
            const pointsFlat: number[] = [];
            stroke.forEach(([px, py]) => {
              pointsFlat.push(px * scale, py * scaleY, 0.001);
            });
            return (
              <line key={`inspect-engrave-stroke-${sIdx}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array(pointsFlat), 3]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color={kerfColor} linewidth={2.0} />
              </line>
            );
          })}
        </group>
      )}

      {/* Vertical projection guide lines connecting base plate hole to floating part */}
      {isCut && isPartDetached && (
        <group>
          {[
            [bbox.minX * scale, -bbox.minY * scaleY],
            [bbox.maxX * scale, -bbox.minY * scaleY],
            [bbox.maxX * scale, -bbox.maxY * scaleY],
            [bbox.minX * scale, -bbox.maxY * scaleY],
          ].map(([gx, gz], gIdx) => (
            <line key={`guide-${gIdx}`}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([gx, 0.04, gz, gx, 0.38, gz]), 3]}
                />
              </bufferGeometry>
              <lineDashedMaterial
                color="#06b6d4"
                dashSize={0.03}
                gapSize={0.02}
                linewidth={1.5}
              />
            </line>
          ))}
        </group>
      )}
    </group>
  );
}

/**
 * Utility to export vector paths to SVG
 */
function downloadSVG(paths: Point2D[][], designName: string, mode: 'CUT' | 'ENGRAVE') {
  let pathData = '';
  paths.forEach((stroke) => {
    if (stroke.length < 2) return;
    stroke.forEach(([x, y], idx) => {
      const px = (x * 360).toFixed(2);
      const py = (-y * 360).toFixed(2);
      pathData += idx === 0 ? `M ${px} ${py} ` : `L ${px} ${py} `;
    });
  });

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -400 800 800" width="800" height="800">
  <title>${designName} - ${mode}</title>
  <!-- Generated by Virtual Physics & Laser Workshop CAD Studio -->
  <rect x="-400" y="-400" width="800" height="800" fill="#0b1329" rx="20" />
  <rect x="-350" y="-280" width="700" height="560" fill="none" stroke="#1e293b" stroke-dasharray="6 6" rx="8" />
  <path d="${pathData}" fill="none" stroke="${mode === 'CUT' ? '#f59e0b' : '#06b6d4'}" stroke-width="${mode === 'CUT' ? '4' : '2'}" stroke-linecap="round" stroke-linejoin="round" />
  <text x="0" y="360" font-family="monospace" font-size="16" fill="#94a3b8" text-anchor="middle">MODE: ${mode} | ${designName}</text>
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${designName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${mode.toLowerCase()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function SpecimenInspectionModal() {
  const {
    isSpecimenModalOpen,
    closeSpecimenModal,
    resetWorkpiece,
    selectedMaterial,
    activeStationId,
    currentDesignName,
    currentToolpaths,
    cutProgress,
    processMode,
    setProcessMode,
    isPartDetached,
    togglePartDetached,
    lastProcessedJob,
    laserPowerWatts,
    scanSpeedMmS,
    pulseFrequencyKhz,
  } = useLabStore();

  // Release pointer lock whenever modal opens
  useEffect(() => {
    if (isSpecimenModalOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [isSpecimenModalOpen]);

  // Handle hotkeys (ESC to close, Space or X to toggle detachment)
  useEffect(() => {
    if (!isSpecimenModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSpecimenModal();
      } else if (e.code === 'Space' || e.key === 'x' || e.key === 'X') {
        if (effectiveProcessMode === 'CUT') {
          e.preventDefault();
          togglePartDetached();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpecimenModalOpen, closeSpecimenModal, processMode, togglePartDetached]);

  if (!isSpecimenModalOpen) return null;

  // Snapshot-accurate job retrieval (Never falls back incorrectly to CO2 or wrong material)
  const job = lastProcessedJob;
  const currentStation = job
    ? (STATIONS[job.machineId] || STATIONS.CO2_LASER)
    : (activeStationId ? STATIONS[activeStationId] : STATIONS.CO2_LASER);
  const effectiveMaterial = (job ? job.material : selectedMaterial) as MaterialType;
  const matConfig = MATERIALS_CATALOG[effectiveMaterial] || MATERIALS_CATALOG.WOOD;
  const effectiveProcessMode = job ? job.processMode : processMode;
  const effectiveDesignName = job ? job.designName : currentDesignName;

  const power = job ? job.powerWatts : laserPowerWatts;
  const speed = job ? job.speedMmS : scanSpeedMmS;
  const frequency = job ? job.frequencyKhz : pulseFrequencyKhz;
  const energyDensity = job ? job.energyDensityJPerMm : Number((power / Math.max(1, speed)).toFixed(3));

  // Laser Quality Metrics & HAZ Descriptions
  const hazEvaluation =
    effectiveMaterial === 'WOOD'
      ? {
          title: 'Mép cacbon hóa tự bảo vệ (Charring Edge)',
          desc: 'Rãnh cắt bốc hơi nhiệt tạo lớp viền màu nâu cánh gián mịn, giúp ngăn ngừa ẩm mốc và tạo độ tương phản thẩm mỹ cao.',
          kerfWidth: '0.18 mm',
          quality: 'Đạt chuẩn Decor & Cắt mô hình',
        }
      : effectiveMaterial === 'ACRYLIC'
      ? {
          title: 'Mép cắt tự đánh bóng quang học (Flame-Polished)',
          desc: 'Laser CO2 làm chảy dẻo và hóa hơi acrylic tức thì, giúp cạnh cắt trong suốt như pha lê mà không cần đánh bóng cơ học.',
          kerfWidth: '0.14 mm',
          quality: 'Chuẩn quang học (Optics Grade)',
        }
      : effectiveMaterial === 'STEEL'
      ? {
          title: 'Ủ nhiệt oxit bề mặt (Annealing Track)',
          desc: 'Laser Fiber tạo nhiệt độ ủ cao sinh lớp màng oxit kim loại chống trầy xước và chống ăn mòn mà không làm hao mòn phôi.',
          kerfWidth: '0.04 mm',
          quality: 'Chuẩn mã vạch công nghiệp (ISO 29158)',
        }
      : effectiveMaterial === 'SILICON'
      ? {
          title: 'Bóc tách quang hóa lạnh (Zero-HAZ)',
          desc: 'Photon tử ngoại 355nm bẻ gãy trực tiếp liên kết hóa học mà không sinh nhiệt, bề mặt wafer không bị nứt vỡ hay cong vênh.',
          kerfWidth: '0.015 mm',
          quality: 'Chuẩn bán dẫn phòng sạch (Class 10)',
        }
      : effectiveMaterial === 'ALUMINUM'
      ? {
          title: 'Bóc lớp Anot hóa bề mặt (Anodized Layer Ablation)',
          desc: 'Laser UV/Fiber bóc tách lớp oxit nhôm tạo hoa văn trắng bạc sắc nét với độ tương phản vượt trội trên nền nhôm đen.',
          kerfWidth: '0.03 mm',
          quality: 'Chuẩn linh kiện hàng không & điện tử',
        }
      : {
          title: 'Rãnh cắt vi nhiệt độ cao',
          desc: 'Vết cắt sắc nét, bề mặt giữ nguyên cấu trúc vật lý xung quanh điểm gia công.',
          kerfWidth: '0.10 mm',
          quality: 'Đạt chuẩn kiểm định xuất xưởng',
        };

  const effectiveKerf = job ? `${job.kerfWidthMm} mm` : hazEvaluation.kerfWidth;
  const effectiveHazTitle = job ? job.hazQuality : hazEvaluation.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-5xl h-[88vh] max-h-[850px] flex flex-col rounded-2xl border border-slate-700/80 shadow-2xl bg-slate-900/95 overflow-hidden text-slate-100">
        {/* =====================================================================
            1. MODAL HEADER
           ===================================================================== */}
        <header className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  KIỂM TRA THÀNH PHẨM GIA CÔNG LASER 3D
                </h3>
                {processMode === 'CUT' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center space-x-1">
                    <Scissors className="w-3 h-3" />
                    <span>CẮT XUYÊN (THRU-CUT 3.0mm)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center space-x-1">
                    <Flame className="w-3 h-3" />
                    <span>KHẮC BỀ MẶT (ENGRAVE 0.1mm)</span>
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  QC PASSED (100%)
                </span>
              </div>
              <p className="text-xs text-lab-muted">
                {processMode === 'CUT'
                  ? 'Mẫu đã cắt xuyên đứt rời khỏi phôi. Bạn có thể nhấc rời chi tiết ra để xem từng phần độc lập!'
                  : 'Mẫu đã được khắc laser bề mặt sắc nét, tấm phôi nguyên vẹn không đứt rời.'}
              </p>
            </div>
          </div>

          <button
            onClick={closeSpecimenModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-slate-500"
            aria-label="Đóng bảng xem mẫu"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* =====================================================================
            2. MAIN BODY: 3D VIEWPORT (LEFT) + QUALITY METRICS (RIGHT)
           ===================================================================== */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* A. 3D INTERACTIVE SPECIMEN VIEWER (Col 7) */}
          <div className="lg:col-span-7 h-[360px] lg:h-full min-h-[320px] bg-gradient-to-b from-slate-950 to-slate-900 relative border-b lg:border-b-0 lg:border-r border-slate-800">
            <Canvas
              camera={{ position: [0, 1.8, 2.8], fov: 45 }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[3, 5, 2]} intensity={2.0} castShadow />
              <directionalLight position={[-3, -2, -2]} intensity={0.6} color="#06b6d4" />
              <pointLight position={[0, 2, 0]} intensity={1.0} color="#a855f7" />

              <Specimen3DObject />

              <OrbitControls
                enablePan={false}
                minDistance={1.2}
                maxDistance={4.2}
                autoRotate={!isPartDetached}
                autoRotateSpeed={0.8}
              />
            </Canvas>

            {/* Floating Orbit Tip Overlay */}
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[11px] text-slate-300 pointer-events-none">
              <Move3d className="w-3.5 h-3.5 text-lab-cyan animate-pulse" />
              <span>Rê chuột xoay 360° • Cuộn chuột phóng to</span>
            </div>

            {/* Interactive Part Detach Button on 3D Viewport for CUT Mode */}
            {processMode === 'CUT' && (
              <div className="absolute top-3 left-3 z-10">
                <button
                  onClick={togglePartDetached}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xl active:scale-95 border ${
                    isPartDetached
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-950/60'
                      : 'bg-lab-cyan hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-950/60 animate-bounce'
                  }`}
                  title="Nhấn phím Space hoặc phím X để nhấc rời hoặc lắp lại chi tiết"
                >
                  {isPartDetached ? (
                    <>
                      <Box className="w-4 h-4" />
                      <span>Lắp Lại Vào Phôi [Space]</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Nhấc Rời Chi Tiết Khỏi Phôi [Space]</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Đã lấy ra khỏi khoang</span>
            </div>
          </div>

          {/* B. TECHNICAL INSPECTION REPORT (Col 5) */}
          <div className="lg:col-span-5 p-5 md:p-6 flex flex-col justify-between space-y-4 bg-slate-900/70 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-lab-cyan" />
                  <span>Báo Cáo Kỹ Thuật Gia Công Thực Nghiệm</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Tên chi tiết:</span>
                    <span className="font-bold text-white font-mono">{effectiveDesignName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Vật liệu phôi:</span>
                    <span className="font-bold text-lab-cyan">{matConfig.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Thiết bị laser:</span>
                    <span className="font-mono text-amber-400 font-bold">{currentStation.name} ({currentStation.wavelength})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Chế độ gia công:</span>
                    <span className={`font-bold font-mono ${effectiveProcessMode === 'CUT' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {effectiveProcessMode === 'CUT' ? 'CẮT XUYÊN PHÔI (3.0mm)' : 'KHẮC BỀ MẶT (0.1mm)'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Công suất (P)</span>
                      <span className="font-bold text-amber-300 text-xs">{power} W</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Tốc độ (v)</span>
                      <span className="font-bold text-cyan-300 text-xs">{speed} mm/s</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Tần số (f)</span>
                      <span className="font-bold text-emerald-300 text-xs">{frequency} kHz</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 font-mono">
                    <span className="text-slate-400">Mật độ năng lượng đường (E_line):</span>
                    <span className="font-bold text-amber-400">{energyDensity} J/mm</span>
                  </div>
                </div>
              </div>

              {/* Mode switch & Detachment Status Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Trạng thái tách rời:</span>
                  {effectiveProcessMode === 'CUT' ? (
                    <span className={`font-bold text-xs ${isPartDetached ? 'text-emerald-400' : 'text-amber-300'}`}>
                      {isPartDetached ? '✓ ĐÃ NHẤC RỜI KHỎI TẤM' : 'ĐANG LẮP KHÍT TRONG PHÔI'}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Khắc bề mặt (Không tách rời)</span>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => setProcessMode('CUT')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 border transition-all ${
                      effectiveProcessMode === 'CUT'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Xem Cắt Xuyên</span>
                  </button>

                  <button
                    onClick={() => setProcessMode('ENGRAVE')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 border transition-all ${
                      effectiveProcessMode === 'ENGRAVE'
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Xem Khắc Mặt</span>
                  </button>
                </div>
              </div>

              {/* Kerf & HAZ Micro-Structure Box */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vùng Ảnh Hưởng Nhiệt (HAZ & Kerf)</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Độ rộng rãnh cắt (Kerf Width):</span>
                    <span className="font-mono font-bold text-emerald-400">{effectiveKerf}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-white block mb-0.5">{effectiveHazTitle}</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{hazEvaluation.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Đánh giá mép biên:</span>
                    <span className="text-emerald-400 font-bold">{hazEvaluation.quality}</span>
                  </div>
                </div>
              </div>

              {/* Vector Geometry Stats */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Số đường vector:</span>
                  <span className="font-bold text-white text-sm">{currentToolpaths.length} đường nét</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tiến độ cắt:</span>
                  <span className="font-bold text-emerald-400 text-sm">100% Hoàn tất</span>
                </div>
              </div>
            </div>

            {/* Download Vector File CTA */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Xuất file vector SVG thực tế</span>
                <span className="text-[10px] text-cyan-300">File vector chuẩn để nạp vào máy laser thật</span>
              </div>
              <button
                onClick={() => downloadSVG(currentToolpaths, currentDesignName, processMode)}
                className="px-3.5 py-2 rounded-lg bg-lab-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải SVG</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. FOOTER ACTIONS
           ===================================================================== */}
        <footer className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-mono text-xs">
            <span>Trạng thái: <b className="text-emerald-400">Mẫu vật hoàn chỉnh</b></span>
            <span>•</span>
            <span>Nhấn <b className="text-white">[ESC]</b> để đóng</span>
            {processMode === 'CUT' && (
              <>
                <span>•</span>
                <span>Nhấn <b className="text-white">[Space]</b> để nhấc rời</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {processMode === 'CUT' && (
              <button
                onClick={togglePartDetached}
                className="px-4 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{isPartDetached ? 'Lắp Vào Tấm' : 'Nhấc Rời Chi Tiết [Space]'}</span>
              </button>
            )}

            <button
              onClick={resetWorkpiece}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1.5 border border-slate-700 transition-all active:scale-95"
              title="Đặt phôi mới tinh vào bàn làm việc để thực hiện lượt cắt tiếp theo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt Phôi Mới</span>
            </button>

            <button
              onClick={closeSpecimenModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-950/50 border border-emerald-400 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Đóng & Giữ Mẫu</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
