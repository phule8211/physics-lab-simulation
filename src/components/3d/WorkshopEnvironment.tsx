import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Text, Environment, Lightformer } from '@react-three/drei';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

export function WorkshopEnvironment() {
  return (
    <group>
      {/* =========================================================================
          1. LIGHTING SETUP (Hemisphere Light + Soft Shadows + Overhead Spotlights)
         ========================================================================= */}
      {/* A. Hemisphere Ambient Light: Sky cyan-blue, ground dark slate (Eliminates black crush) */}
      <hemisphereLight
        color="#38bdf8"
        groundColor="#0a0f1d"
        intensity={0.75}
      />

      {/* B. Primary Directional Sunlight/Skylight with PCF Soft Shadows */}
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={32}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.00015}
        color="#f8fafc"
      />

      {/* C. Secondary Cool Fill Light from opposite upper corner */}
      <directionalLight
        position={[-8, 10, -6]}
        intensity={0.45}
        color="#94a3b8"
      />

      {/* D. 4 Overhead Workstation Spotlights with Quadratic Decay & Color Character */}
      {/* Station 1 (CO2 Laser - 10.6um): Cool Cyan White */}
      <pointLight
        position={[-6, 4.0, -4]}
        intensity={2.8}
        distance={10}
        decay={2}
        color="#38bdf8"
        castShadow
        shadow-bias={-0.0002}
      />
      {/* Station 2 (UV Laser - 355nm): Violet/Cold Cleanroom White */}
      <pointLight
        position={[6, 4.0, -4]}
        intensity={2.8}
        distance={10}
        decay={2}
        color="#c084fc"
        castShadow
        shadow-bias={-0.0002}
      />
      {/* Station 3 (Fiber Laser - 1064nm): Warm Amber White */}
      <pointLight
        position={[-6, 4.0, 4]}
        intensity={2.8}
        distance={10}
        decay={2}
        color="#fbbf24"
        castShadow
        shadow-bias={-0.0002}
      />
      {/* Station 4 (Safety Sensor Station): Emerald Cleanroom Light */}
      <pointLight
        position={[6, 4.0, 4]}
        intensity={2.8}
        distance={10}
        decay={2}
        color="#34d399"
        castShadow
        shadow-bias={-0.0002}
      />
      {/* Station 5 (Spray Coating & UV Finishing Room): Clean White / Cool Cyan */}
      <pointLight
        position={[0, 4.0, -12.5]}
        intensity={2.8}
        distance={12}
        decay={2}
        color="#f8fafc"
        castShadow
        shadow-bias={-0.0002}
      />

      {/* =========================================================================
          2. PROCEDURAL HDRI ENVIRONMENT MAP (100% Offline with Lightformers)
         ========================================================================= */}
      <Suspense fallback={null}>
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            {/* Overhead soft white strip lighting */}
            <Lightformer
              form="rect"
              color="#f8fafc"
              intensity={2.0}
              scale={[16, 2.5]}
              position={[0, 6, 0]}
            />
            <Lightformer
              form="rect"
              color="#f8fafc"
              intensity={1.4}
              scale={[16, 2]}
              position={[0, 6, -4]}
            />
            <Lightformer
              form="rect"
              color="#f8fafc"
              intensity={1.4}
              scale={[16, 2]}
              position={[0, 6, 4]}
            />
            {/* Soft cyan cleanroom wall bounce */}
            <Lightformer
              form="rect"
              color="#38bdf8"
              intensity={1.2}
              scale={[12, 4]}
              position={[-9, 2.5, 0]}
              rotation={[0, Math.PI / 2, 0]}
            />
            {/* Soft violet bounce */}
            <Lightformer
              form="rect"
              color="#a855f7"
              intensity={1.0}
              scale={[12, 4]}
              position={[9, 2.5, 0]}
              rotation={[0, -Math.PI / 2, 0]}
            />
            {/* Underfloor reflective fill */}
            <Lightformer
              form="ring"
              color="#0ea5e9"
              intensity={0.6}
              scale={14}
              position={[0, -2, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </group>
        </Environment>
      </Suspense>

      {/* =========================================================================
          3. FLOOR (High-Gloss Industrial Epoxy PBR with Expansion Tile Joints)
         ========================================================================= */}
      {/* Main Epoxy Floor: Low roughness gives high specular sheen of ceiling lights */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 16]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.16}
          metalness={0.18}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Center Pathway Runner (Dark Matte Grip Strip) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[3.2, 16]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[20, 3.2]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.5}
          metalness={0.08}
        />
      </mesh>

      {/* Floor Expansion Joint Grid Lines */}
      {[-7.5, -5, -2.5, 2.5, 5, 7.5].map((x) => (
        <mesh key={`joint-x-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.003, 0]}>
          <planeGeometry args={[0.02, 16]} />
          <meshBasicMaterial color="#1e293b" opacity={0.6} transparent />
        </mesh>
      ))}
      {[-6, -3, 3, 6].map((z) => (
        <mesh key={`joint-z-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, z]}>
          <planeGeometry args={[20, 0.02]} />
          <meshBasicMaterial color="#1e293b" opacity={0.6} transparent />
        </mesh>
      ))}

      {/* Yellow Safety Boundary Strips around Stations */}
      <SafetyZoneBorder position={[-6, 0.005, -4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[6, 0.005, -4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[-6, 0.005, 4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[6, 0.005, 4]} width={4.2} depth={3.4} />

      {/* =========================================================================
          4. WALLS & MODULAR CLEANROOM PANELS (PBR with Aluminum Trims)
         ========================================================================= */}
      {/* North Wall: Left section (x: -10 to -1.8) */}
      <mesh position={[-5.9, 2.25, -8]} receiveShadow>
        <boxGeometry args={[8.2, 4.5, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* North Wall: Right section (x: 1.8 to 10) */}
      <mesh position={[5.9, 2.25, -8]} receiveShadow>
        <boxGeometry args={[8.2, 4.5, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* North Wall: Door Header Lintel (y: 3.2 to 4.5) */}
      <mesh position={[0, 3.85, -8]} receiveShadow>
        <boxGeometry args={[3.6, 1.3, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Doorway Frame & Sliding Glass Airlock Door Trims */}
      <group position={[0, 0, -8]}>
        {/* Left & Right Door Frame Jambs */}
        {[-1.8, 1.8].map((x) => (
          <mesh key={`door-jamb-${x}`} position={[x, 1.6, 0]} castShadow>
            <boxGeometry args={[0.08, 3.2, 0.25]} />
            <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
          </mesh>
        ))}
        {/* Door Top Transom Header */}
        <mesh position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[3.68, 0.08, 0.25]} />
          <meshStandardMaterial color="#64748b" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Sliding Tempered Glass Door Leaves (partially open so user walks through) */}
        <mesh position={[-1.2, 1.6, -0.05]}>
          <boxGeometry args={[1.1, 3.1, 0.04]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>
        <mesh position={[1.2, 1.6, 0.05]}>
          <boxGeometry args={[1.1, 3.1, 0.04]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        {/* Overhead Cleanroom Illuminated Lightbox Signboard */}
        <group position={[0, 3.46, 0.12]}>
          {/* Beveled dark industrial aluminum chassis */}
          <mesh castShadow>
            <boxGeometry args={[3.6, 0.44, 0.08]} />
            <meshStandardMaterial color="#0b1120" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Glowing neon amber status accent indicator */}
          <mesh position={[0, 0.21, 0.042]}>
            <boxGeometry args={[3.5, 0.02, 0.01]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.0} />
          </mesh>
          {/* Cyan neon border trim */}
          <mesh position={[0, 0, 0.041]}>
            <planeGeometry args={[3.54, 0.38]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.6} />
          </mesh>
          {/* Inner dark matte faceplate */}
          <mesh position={[0, 0, 0.042]}>
            <planeGeometry args={[3.48, 0.32]} />
            <meshStandardMaterial color="#030712" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Vietnamese Room Title */}
          <SafeText
            position={[0, 0.055, 0.045]}
            fontSize={0.12}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.03}
          >
            PHÒNG PHỦ SƠN BỀ MẶT & SẤY UV
          </SafeText>
          {/* Technical Subtitle */}
          <SafeText
            position={[0, -0.075, 0.045]}
            fontSize={0.075}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
          >
            COATING & FINISHING CLEANROOM
          </SafeText>
        </group>
      </group>

      {/* =========================================================================
          COATING & FINISHING CLEANROOM ARCHITECTURE (x: [-5, 5], z: [-8, -16])
         ========================================================================= */}
      {/* Cleanroom Floor (Grey-blue Anti-Static Epoxy) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -12]} receiveShadow>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.18}
          metalness={0.2}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Cleanroom Ceiling */}
      <mesh position={[0, 4.5, -12]}>
        <boxGeometry args={[10, 0.1, 8]} />
        <meshStandardMaterial color="#090d16" roughness={0.8} />
      </mesh>

      {/* West Wall of Coating Room with Glass Observation Panel */}
      <mesh position={[-5, 2.25, -12]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.25} />
      </mesh>
      {/* Observation Window Glass Pane */}
      <mesh position={[-4.89, 2.0, -12]}>
        <planeGeometry args={[4.0, 1.8]} />
        <meshStandardMaterial
          color="#e0f2fe"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>

      {/* East Wall of Coating Room */}
      <mesh position={[5, 2.25, -12]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.25} />
      </mesh>

      {/* North Back Wall of Coating Room */}
      <mesh position={[0, 2.25, -16]} receiveShadow>
        <boxGeometry args={[10, 4.5, 0.2]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.25} />
      </mesh>

      {/* South Wall (Front) */}
      <mesh position={[0, 2.25, 8]} receiveShadow>
        <boxGeometry args={[20, 4.5, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* West Wall (Left) */}
      <mesh position={[-10, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* East Wall (Right) */}
      <mesh position={[10, 2.25, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.5, 16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Vertical Aluminum Panel Divider Trims along North Wall (skipping open doorway x in [-1.8, 1.8]) */}
      {[-7.5, -5, -2.5, 2.5, 5, 7.5].map((x) => (
        <mesh key={`trim-north-${x}`} position={[x, 2.25, -7.89]}>
          <boxGeometry args={[0.04, 4.5, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Vertical Aluminum Panel Divider Trims along West Wall */}
      {[-6, -3, 0, 3, 6].map((z) => (
        <mesh key={`trim-west-${z}`} position={[-9.89, 2.25, z]}>
          <boxGeometry args={[0.02, 4.5, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Wall Baseboards (Anodized Aluminum Skirting) */}
      <mesh position={[0, 0.1, -7.88]}>
        <boxGeometry args={[20, 0.2, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.1, 7.88]}>
        <boxGeometry args={[20, 0.2, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[-9.88, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[9.88, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* =========================================================================
          5. CEILING & INDUSTRIAL ARCHITECTURE (I-Beams, Ducting, Cable Trays)
         ========================================================================= */}
      {/* Ceiling Surface */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[20, 0.1, 16]} />
        <meshStandardMaterial color="#0b1329" roughness={0.85} />
      </mesh>

      {/* Heavy Steel I-Beams along X axis */}
      {[-4, 0, 4].map((z) => (
        <group key={`truss-${z}`} position={[0, 4.25, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[19.8, 0.25, 0.25]} />
            <meshStandardMaterial
              color="#475569"
              metalness={0.88}
              roughness={0.28}
              envMapIntensity={0.8}
            />
          </mesh>
        </group>
      ))}

      {/* Industrial Spiral Aluminum Ventilation Ducting */}
      <group position={[0, 4.0, -2]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 19.6, 32]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.94}
            roughness={0.18}
            envMapIntensity={1.2}
          />
        </mesh>
        {/* Duct Flanged Reinforcement Rings every 2.5m */}
        {[-7.5, -5, -2.5, 0, 2.5, 5, 7.5].map((x) => (
          <mesh key={`flange-${x}`} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.33, 0.33, 0.06, 32]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Galvanized Cable Trays with Perforated Look */}
      <mesh position={[0, 4.15, 2]}>
        <boxGeometry args={[19.6, 0.08, 0.45]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>

      {/* Overhead Fluorescent Fixtures with Glowing Emissive Tubes */}
      {[-6, 6].map((x) =>
        [-4, 4].map((z) => (
          <group key={`fixture-${x}-${z}`} position={[x, 4.35, z]}>
            {/* Fixture casing */}
            <mesh>
              <boxGeometry args={[1.6, 0.1, 0.5]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.25} />
            </mesh>
            {/* Emissive light tubes (Bloom glows through post-processing) */}
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[1.5, 0.04, 0.35]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#f8fafc"
                emissiveIntensity={2.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))
      )}

      {/* =========================================================================
          6. LAB SIGNAGE & POSTERS (Typography with Emissive Glow)
         ========================================================================= */}
      {/* Main Lab Title Header Sign along South Entrance Wall (Facing inward toward the lab) */}
      <group position={[0, 3.45, 7.88]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[11.2, 0.68]} />
          <meshStandardMaterial color="#070d18" roughness={0.25} metalness={0.6} />
        </mesh>
        {/* Top & Bottom glowing cyan border lines */}
        <mesh position={[0, 0.33, 0.005]}>
          <planeGeometry args={[11.2, 0.018]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0, -0.33, 0.005]}>
          <planeGeometry args={[11.2, 0.018]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.9} />
        </mesh>
        <SafeText
          position={[0, 0.1, 0.01]}
          fontSize={0.24}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          ADVANCED PHOTONICS & LASER LAB
        </SafeText>
        <SafeText
          position={[0, -0.12, 0.01]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
        >
          PHÒNG THÍ NGHIỆM VẬT LÝ QUANG HỌC & GIA CÔNG LASER 3D
        </SafeText>
      </group>

      {/* Caution Class 4 Laser Sign on East Wall */}
      <group position={[9.88, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.6, 1.2]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
        </mesh>
        <SafeText position={[0, 0.3, 0.02]} fontSize={0.16} color="#000000" anchorX="center" anchorY="middle">
          WARNING: CLASS 4 LASER
        </SafeText>
        <SafeText position={[0, 0.05, 0.02]} fontSize={0.12} color="#000000" anchorX="center" anchorY="middle">
          BỨC XẠ LASER VÔ HÌNH & KHẢ KIẾN
        </SafeText>
        <SafeText position={[0, -0.25, 0.02]} fontSize={0.09} color="#000000" anchorX="center" anchorY="middle">
          BẮT BUỘC ĐEO KÍNH BẢO HỘ QUANG HỌC
        </SafeText>
      </group>

      {/* Emergency First Aid & Power Kill Sign on West Wall */}
      <group position={[-9.88, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.6, 1.2]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.1} />
        </mesh>
        <SafeText position={[0, 0.25, 0.02]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle">
          EMERGENCY STOP
        </SafeText>
        <SafeText position={[0, -0.1, 0.02]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle">
          NÚT NGẮT KHẨN CẤP CAO ÁP & CHILLER
        </SafeText>
      </group>

      {/* Fire Extinguisher Box against West Wall */}
      <group position={[-9.7, 0.8, -3]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.8, 0.4]} />
          <meshStandardMaterial color="#dc2626" roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 24]} />
          <meshStandardMaterial color="#991b1b" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Procedural yellow hazard boundary rectangle painted on floor around a machine
 */
function SafetyZoneBorder({
  position,
  width,
  depth,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
}) {
  const thickness = 0.08;
  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group position={position}>
      {/* North line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -halfD]}>
        <planeGeometry args={[width, thickness]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* South line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, halfD]}>
        <planeGeometry args={[width, thickness]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* West line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-halfW, 0, 0]}>
        <planeGeometry args={[thickness, depth]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* East line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[halfW, 0, 0]}>
        <planeGeometry args={[thickness, depth]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}
