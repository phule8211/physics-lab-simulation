import React, { useState, Suspense } from 'react';
import * as THREE from 'three';
import { useTexture, Text } from '@react-three/drei';
import { LAB_TABLES, LabTableConfig } from '../../data/staircaseConfig';
import { useLabStore } from '../../store/useLabStore';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

/**
 * Procedural Laboratory Glassware & Props
 */

// 1. Optics Bench with Laser Diode & Prism
function OpticsSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Aluminum Optical Rail */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Laser Diode Emitter Box */}
      <mesh position={[-0.45, 0.07, 0]}>
        <boxGeometry args={[0.16, 0.08, 0.08]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Laser aperture */}
      <mesh position={[-0.36, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
      </mesh>
      {/* Glass Triangular Prism on Mount */}
      <mesh position={[0, 0.09, 0]} rotation={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 3]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.65} roughness={0.05} metalness={0.1} />
      </mesh>
      {/* Beam Splitter Mount */}
      <mesh position={[0.3, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.1, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
      </mesh>
    </group>
  );
}

// 2. Chemical Titration Stand with Buret & Erlenmeyer Flask
function TitrationSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Retort Stand Base Plate */}
      <mesh position={[-0.2, 0.015, 0]}>
        <boxGeometry args={[0.22, 0.02, 0.3]} />
        <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Vertical Iron Rod */}
      <mesh position={[-0.26, 0.38, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.72, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.92} roughness={0.2} />
      </mesh>
      {/* Buret Clamp */}
      <mesh position={[-0.2, 0.45, 0]}>
        <boxGeometry args={[0.12, 0.025, 0.025]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Glass Graduated Buret Tube */}
      <mesh position={[-0.14, 0.42, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.55, 16]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.5} roughness={0.1} />
      </mesh>
      {/* Erlenmeyer Flask with Amber Chemical */}
      <group position={[-0.14, 0.07, 0]}>
        <mesh>
          <coneGeometry args={[0.065, 0.12, 16]} />
          <meshStandardMaterial color="#fef08a" transparent opacity={0.55} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.04, 16]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.4} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// 3. Precision Microscope Station
function MicroscopeSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Microscope Heavy Cast Base */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.28]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.3} />
      </mesh>
      {/* Curved Arm */}
      <mesh position={[0, 0.18, 0.08]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.06, 0.26, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Stage Table */}
      <mesh position={[0, 0.14, -0.03]}>
        <boxGeometry args={[0.16, 0.015, 0.14]} />
        <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Revolving Nosepiece with 3 Objectives */}
      <mesh position={[0, 0.21, -0.03]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.92} roughness={0.25} />
      </mesh>
      {/* Objective lenses */}
      {[-0.015, 0.015].map((ox, i) => (
        <mesh key={`obj_${i}`} position={[ox, 0.18, -0.03]}>
          <cylinderGeometry args={[0.008, 0.006, 0.04, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.92} roughness={0.2} />
        </mesh>
      ))}
      {/* Dual Eyepiece Tubes (Binocular Head) */}
      {[-0.028, 0.028].map((ex, i) => (
        <mesh key={`eye_${i}`} position={[ex, 0.32, 0.04]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
          <meshStandardMaterial color="#18181b" metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {/* Slide Glass Box */}
      <mesh position={[0.26, 0.02, 0]}>
        <boxGeometry args={[0.14, 0.035, 0.09]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.4} />
      </mesh>
    </group>
  );
}

// 4. Analytical Precision Scale in Glass Shield
function AnalyticalScaleSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Electronic Scale Chassis */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.3, 0.06, 0.35]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Digital LCD readout */}
      <mesh position={[0, 0.04, 0.14]} rotation={[-0.4, 0, 0]}>
        <planeGeometry args={[0.14, 0.04]} />
        <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>
      {/* Glass Draft Shield Enclosure */}
      <mesh position={[0, 0.18, -0.02]}>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.3} roughness={0.05} />
      </mesh>
      {/* Stainless Weighing Pan */}
      <mesh position={[0, 0.08, -0.02]}>
        <cylinderGeometry args={[0.05, 0.05, 0.008, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.96} roughness={0.15} />
      </mesh>
    </group>
  );
}

// 5. Heating & Distillation Setup with Bunsen Burner
function DistillationSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Bunsen Burner Base */}
      <mesh position={[-0.2, 0.015, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.025, 20]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Burner Brass Chimney */}
      <mesh position={[-0.2, 0.08, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.11, 16]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Glowing Flame Tip */}
      <mesh position={[-0.2, 0.15, 0]}>
        <coneGeometry args={[0.014, 0.04, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
      {/* Tripod Stand */}
      <mesh position={[-0.2, 0.14, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.35} />
      </mesh>
      {/* Spherical Boiling Flask with Liquid */}
      <mesh position={[-0.2, 0.22, 0]}>
        <sphereGeometry args={[0.065, 20, 20]} />
        <meshStandardMaterial color="#a7f3d0" transparent opacity={0.65} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 6. Test Tube Rack & Reagent Bottles
function TestTubeRackSetup() {
  const liquids = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  return (
    <group position={[0, 0.45, 0]}>
      {/* Wooden Test Tube Rack */}
      <mesh position={[-0.1, 0.07, 0]}>
        <boxGeometry args={[0.36, 0.13, 0.1]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>
      {/* 6 Glass Test Tubes with Colorful Solutions */}
      {liquids.map((color, i) => (
        <group key={`tube_${i}`} position={[-0.24 + i * 0.055, 0.08, 0]}>
          <mesh>
            <cylinderGeometry args={[0.012, 0.012, 0.14, 16]} />
            <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.075, 0]}>
            <cylinderGeometry args={[0.013, 0.011, 0.015, 16]} />
            <meshStandardMaterial color="#d97706" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Amber Reagent Bottles */}
      {[0.16, 0.28].map((bx, i) => (
        <group key={`reagent_${i}`} position={[bx, 0.07, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
            <meshStandardMaterial color="#78350f" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.03, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 7. Digital Storage Oscilloscope
function OscilloscopeSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Oscilloscope Chassis */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.42, 0.24, 0.22]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Screen with Glowing Sine Waveform */}
      <mesh position={[-0.06, 0.14, 0.112]}>
        <planeGeometry args={[0.22, 0.15]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {/* Control Knobs & BNC Jacks */}
      {[0.1, 0.15].map((kx, i) => (
        <group key={`knob_col_${i}`}>
          <mesh position={[kx, 0.18, 0.115]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.015, 12]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[kx, 0.1, 0.115]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 12]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 8. Desktop Centrifuge & Pipette Stand
function CentrifugeSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Centrifuge Rounded Body */}
      <mesh position={[-0.18, 0.11, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.18, 24]} />
        <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.25} />
      </mesh>
      {/* Transparent Domed Lid */}
      <mesh position={[-0.18, 0.21, 0]}>
        <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Carousel Pipette Stand */}
      <mesh position={[0.2, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.05, 0.28, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 3 Micropipettes */}
      {[-0.04, 0, 0.04].map((px, i) => (
        <mesh key={`pip_${i}`} position={[0.2 + px, 0.2, 0.03]} rotation={[-0.1, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.004, 0.18, 12]} />
          <meshStandardMaterial color={i === 0 ? '#ef4444' : i === 1 ? '#eab308' : '#3b82f6'} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// 9. Magnetic Stirrer with Spinning Vortex
function MagneticStirrerSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Stirrer Chassis */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.24, 0.07, 0.28]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.2} roughness={0.3} />
      </mesh>
      {/* Ceramic White Top Plate */}
      <mesh position={[0, 0.078, -0.02]}>
        <cylinderGeometry args={[0.09, 0.09, 0.008, 24]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>
      {/* Glass Beaker with Cyan Water */}
      <mesh position={[0, 0.16, -0.02]}>
        <cylinderGeometry args={[0.06, 0.06, 0.15, 20]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} roughness={0.08} />
      </mesh>
    </group>
  );
}

// 10. Spectrophotometer Unit with Cuvettes
function SpectrophotometerSetup() {
  return (
    <group position={[0, 0.45, 0]}>
      {/* Spectrophotometer Casing */}
      <mesh position={[-0.05, 0.1, 0]}>
        <boxGeometry args={[0.38, 0.18, 0.32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Sample Chamber Hinged Lid */}
      <mesh position={[-0.12, 0.195, -0.04]}>
        <boxGeometry args={[0.12, 0.02, 0.12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Illuminated Digital Graph Display */}
      <mesh position={[0.08, 0.15, 0.162]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      {/* Cuvette Rack */}
      <mesh position={[0.22, 0.025, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.14]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
    </group>
  );
}

/**
 * Single Wooden Lab Workbench (Bàn gỗ thí nghiệm)
 */
function WoodenLabTable({ config }: { config: LabTableConfig }) {
  const woodTexture = useTexture('/textures/wood.jpg');
  const [hovered, setHovered] = useState(false);
  const isTargeted = useLabStore((state) => state.hoveredStationId === config.id);
  const isSelected = useLabStore((state) => state.selectedWorkbenchId === config.id && state.isWorkbenchModalOpen);
  const openWorkbenchModal = useLabStore((state) => state.openWorkbenchModal);

  const activeHighlight = hovered || isTargeted || isSelected;

  // Render appropriate scientific setup
  const renderProps = () => {
    switch (config.specialty) {
      case 'OPTICS_PRISM':
        return <OpticsSetup />;
      case 'TITRATION_BURET':
        return <TitrationSetup />;
      case 'MICROSCOPE':
        return <MicroscopeSetup />;
      case 'ANALYTICAL_SCALE':
        return <AnalyticalScaleSetup />;
      case 'DISTILLATION_BUNSEN':
        return <DistillationSetup />;
      case 'TEST_TUBES':
        return <TestTubeRackSetup />;
      case 'OSCILLOSCOPE':
        return <OscilloscopeSetup />;
      case 'CENTRIFUGE_PIPETTE':
        return <CentrifugeSetup />;
      case 'MAGNETIC_STIRRER':
        return <MagneticStirrerSetup />;
      case 'SPECTROPHOTOMETER':
        return <SpectrophotometerSetup />;
      default:
        return <TestTubeRackSetup />;
    }
  };

  return (
    <group
      position={config.position}
      rotation={config.rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        openWorkbenchModal(config.id);
      }}
    >
      {/* Floating 3D Interaction Prompt HUD */}
      {activeHighlight && (
        <group position={[0, 1.15, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.35, 0.24, 0.02]} />
            <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.38, 0.26, 0.015]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <SafeText position={[0, 0.045, 0.015]} fontSize={0.055} color="#ffffff" anchorX="center" anchorY="middle">
            {config.name}
          </SafeText>
          <SafeText position={[0, -0.045, 0.015]} fontSize={0.038} color="#38bdf8" anchorX="center" anchorY="middle">
            [Click hoặc phím E để làm thí nghiệm]
          </SafeText>
        </group>
      )}

      {/* Interactive Glowing Boundary Outline around Table Base when active */}
      {activeHighlight && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.0, 1.05]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} />
        </mesh>
      )}

      {/* =======================================================================
          1. SOLID WOOD TABLETOP (Mặt bàn gỗ tự nhiên dày 6cm)
         ======================================================================= */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 0.06, 0.88]} />
        <meshStandardMaterial
          map={woodTexture}
          color="#5d4037"
          roughness={0.32}
          metalness={0.06}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Tabletop Chamfered Edge Profile Rim */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.87, 0.05, 0.9]} />
        <meshStandardMaterial color="#3e2723" roughness={0.4} metalness={0.05} />
      </mesh>

      {/* =======================================================================
          2. SOLID WOOD LEGS (4 Chân bàn gỗ vuông 8cm x 8cm)
         ======================================================================= */}
      {[-0.82, 0.82].map((lx) =>
        [-0.36, 0.36].map((lz) => (
          <group key={`leg_${lx}_${lz}`} position={[lx, 0.2, lz]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.08, 0.4, 0.08]} />
              <meshStandardMaterial map={woodTexture} color="#4e342e" roughness={0.4} />
            </mesh>
            {/* Black Steel Corner Bracket */}
            <mesh position={[0, 0.17, 0]}>
              <boxGeometry args={[0.09, 0.04, 0.09]} />
              <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Rubber Leveling Foot */}
            <mesh position={[0, -0.19, 0]}>
              <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* =======================================================================
          3. LOWER STORAGE SHELF & CROSSBAR REINFORCEMENTS
         ======================================================================= */}
      {/* Lower Wood Shelf */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.65, 0.03, 0.72]} />
        <meshStandardMaterial map={woodTexture} color="#4e342e" roughness={0.4} />
      </mesh>

      {/* Side Wooden Aprons / Stretchers */}
      <mesh position={[0, 0.36, -0.36]}>
        <boxGeometry args={[1.68, 0.07, 0.03]} />
        <meshStandardMaterial color="#3e2723" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.36, 0.36]}>
        <boxGeometry args={[1.68, 0.07, 0.03]} />
        <meshStandardMaterial color="#3e2723" roughness={0.4} />
      </mesh>

      {/* Dual Front Utility Drawers */}
      {[-0.42, 0.42].map((dx) => (
        <group key={`drawer_${dx}`} position={[dx, 0.36, 0.38]}>
          <mesh>
            <boxGeometry args={[0.65, 0.08, 0.02]} />
            <meshStandardMaterial color="#4e342e" roughness={0.35} />
          </mesh>
          {/* Brushed Brass Handle */}
          <mesh position={[0, 0, 0.015]}>
            <boxGeometry args={[0.12, 0.015, 0.015]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.88} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Brass Table Number Badge */}
      <group position={[0, 0.41, 0.442]}>
        <mesh>
          <planeGeometry args={[0.22, 0.04]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>

      {/* Scientific Instrument Setup on Tabletop */}
      {renderProps()}
    </group>
  );
}

/**
 * 10 Wooden Lab Workbenches Collection
 */
export function LabWorkbenches() {
  return (
    <group>
      {LAB_TABLES.map((table) => (
        <WoodenLabTable key={table.id} config={table} />
      ))}
    </group>
  );
}
