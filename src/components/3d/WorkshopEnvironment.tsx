import React, { Suspense } from 'react';
import * as THREE from 'three';
import { Text, Environment, Lightformer, Sparkles, useTexture } from '@react-three/drei';
import { StaircaseAndMezzanine } from './StaircaseAndMezzanine';
import { LabWorkbenches } from './LabWorkbenches';
import { GiantCeramicBottleShelf } from './GiantCeramicBottleShelf';
import { ComputerDeskWithPCAndLaptop } from './ComputerDeskWithPCAndLaptop';
import { NpcInstructorDung } from './NpcInstructorDung';
import { ChemicalReagentRack } from './ChemicalReagentRack';
import { LabEquipmentRack } from './LabEquipmentRack';
import { LabSinkAndFaucet } from './LabSinkAndFaucet';
import { FourLongLedTubeLights } from './environment/FourLongLedTubeLights';
import { AptomatCircuitBreaker } from './environment/AptomatCircuitBreaker';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

export function WorkshopEnvironment() {
  const floorTexture = useTexture('/textures/floor_tiles.png');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(14, 25);
  floorTexture.colorSpace = THREE.SRGBColorSpace;

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

      {/* D. Overhead Workstation Spotlights with Quadratic Decay & Color Character (Optimized: No heavy shadow passes) */}
      {/* Station 1 (CO2 Laser - 10.6um): Cool Cyan White */}
      <pointLight
        position={[-6, 4.0, -4]}
        intensity={1.8}
        distance={9}
        decay={2}
        color="#38bdf8"
      />
      {/* Station 2 (UV Laser - 355nm): Violet/Cold Cleanroom White */}
      <pointLight
        position={[6, 4.0, -4]}
        intensity={1.8}
        distance={9}
        decay={2}
        color="#c084fc"
      />
      {/* Station 3 (Fiber Laser - 1064nm): Warm Amber White */}
      <pointLight
        position={[-6, 4.0, 4]}
        intensity={1.8}
        distance={9}
        decay={2}
        color="#fbbf24"
      />
      {/* Station 4 (Safety Sensor Station): Emerald Cleanroom Light */}
      <pointLight
        position={[6, 4.0, 4]}
        intensity={1.8}
        distance={9}
        decay={2}
        color="#34d399"
      />
      {/* Station 5 (Spray Coating & UV Finishing Room): Clean White / Cool Cyan */}
      <pointLight
        position={[0, 4.0, -12.5]}
        intensity={2.2}
        distance={12}
        decay={2}
        color="#f8fafc"
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
          3. FLOOR (Large-Format Grey Marble Cleanroom Floor Tiles with PBR Reflections)
         ========================================================================= */}
      {/* Ambient Airborne Dust Motes (Simulates Unreal Engine Niagara Particle Field) */}
      <Sparkles
        count={85}
        scale={[18, 6.5, 18]}
        position={[0, 3.2, 0]}
        size={2.0}
        speed={0.25}
        opacity={0.4}
        color="#bae6fd"
      />

      {/* Main Floor: Large Grey Marble & Granite Cleanroom Tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshPhysicalMaterial
          map={floorTexture}
          roughness={0.22}
          metalness={0.12}
          clearcoat={0.85}
          clearcoatRoughness={0.10}
          reflectivity={0.78}
          envMapIntensity={1.3}
        />
      </mesh>

      {/* Yellow Safety Boundary Strips around Stations */}
      <SafetyZoneBorder position={[-6, 0.005, -4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[6, 0.005, -4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[-6, 0.005, 4]} width={4.2} depth={3.4} />
      <SafetyZoneBorder position={[6, 0.005, 4]} width={4.2} depth={3.4} />

      {/* =========================================================================
          4. WALLS & MODULAR CLEANROOM PANELS (PBR with Aluminum Trims)
         ========================================================================= */}
      {/* North Wall: Left section (x: -10 to -1.8) */}
      <mesh position={[-5.9, 3.5, -8]} receiveShadow>
        <boxGeometry args={[8.2, 7.0, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* North Wall: Right section (x: 1.8 to 10) */}
      <mesh position={[5.9, 3.5, -8]} receiveShadow>
        <boxGeometry args={[8.2, 7.0, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* North Wall: Door Header Lintel (y: 3.2 to 7.0) */}
      <mesh position={[0, 5.1, -8]} receiveShadow>
        <boxGeometry args={[3.6, 3.8, 0.2]} />
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

      {/* Industrial Wall-Mounted Aptomat (MCB 63A) Circuit Breaker Switch for Workshop Lighting Grid */}
      <AptomatCircuitBreaker position={[-2.4, 1.55, -7.88]} rotation={[0, 0, 0]} />

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

      {/* South Wall (Front - expanded to Z = 12.0) */}
      <mesh position={[0, 3.5, 12]} receiveShadow>
        <boxGeometry args={[20, 7.0, 0.2]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* West Wall (Left) */}
      <mesh position={[-10, 3.5, 2]} receiveShadow>
        <boxGeometry args={[0.2, 7.0, 20]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* East Wall (Right) */}
      <mesh position={[10, 3.5, 2]} receiveShadow>
        <boxGeometry args={[0.2, 7.0, 20]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.6}
          metalness={0.25}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Vertical Aluminum Panel Divider Trims along North Wall (skipping open doorway x in [-1.8, 1.8]) */}
      {[-7.5, -5, -2.5, 2.5, 5, 7.5].map((x) => (
        <mesh key={`trim-north-${x}`} position={[x, 3.5, -7.89]}>
          <boxGeometry args={[0.04, 7.0, 0.02]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Vertical Aluminum Panel Divider Trims along West Wall */}
      {[-6, -3, 0, 3, 6].map((z) => (
        <mesh key={`trim-west-${z}`} position={[-9.89, 3.5, z]}>
          <boxGeometry args={[0.02, 7.0, 0.04]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}

      {/* Wall Baseboards (Anodized Aluminum Skirting) */}
      <mesh position={[0, 0.1, -7.88]}>
        <boxGeometry args={[20, 0.2, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[0, 0.1, 11.88]}>
        <boxGeometry args={[20, 0.2, 0.05]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[-9.88, 0.1, 2]}>
        <boxGeometry args={[0.05, 0.2, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[9.88, 0.1, 2]}>
        <boxGeometry args={[0.05, 0.2, 20]} />
        <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* =========================================================================
          5. CEILING & INDUSTRIAL ARCHITECTURE (I-Beams, Ducting, Cable Trays)
         ========================================================================= */}
      {/* Ceiling Surface */}
      <mesh position={[0, 7.0, 2]}>
        <boxGeometry args={[20, 0.1, 20]} />
        <meshStandardMaterial color="#0b1329" roughness={0.85} />
      </mesh>

      {/* Heavy Steel I-Beams along X axis */}
      {[-4, 0, 4, 8].map((z) => (
        <group key={`truss-${z}`} position={[0, 6.75, z]}>
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
      <group position={[0, 6.4, -2]}>
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
      <mesh position={[0, 6.55, 2]}>
        <boxGeometry args={[19.6, 0.08, 0.45]} />
        <meshStandardMaterial
          color="#64748b"
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>


      {/* 
==================================================================
          5.1. HỆ THỐNG 8 BÓNG ĐÈN TRẦN PHÒNG THÍ NGHIỆM (CLEANROOM TROFFER LUMINAIRES)
          Bố trí cân đối 8 cụm quanh xưởng và khu vực mở rộng:
          - 4 bóng khu vực máy gia công tầng 1 (Tây Bắc, Đông Bắc, Tây Giữa, Đông Giữa)
          - 4 bóng khu vực tầng 2 và phòng nghiên cứu mở rộng (Tây Nam, Đông Nam, Bàn PC, Trạm Hóa Chất)
         ========================================================================= */}
      {[
        { id: 'lamp_1_nw', pos: [-5.5, 6.85, -4.5] as [number, number, number], name: 'Đèn trần Laser CO2 (Tây Bắc)' },
        { id: 'lamp_2_ne', pos: [5.5, 6.85, -4.5] as [number, number, number], name: 'Đèn trần Laser UV (Đông Bắc)' },
        { id: 'lamp_3_mw', pos: [-5.5, 6.85, 0.5] as [number, number, number], name: 'Đèn trần Laser Fiber (Tây Giữa)' },
        { id: 'lamp_4_me', pos: [5.5, 6.85, 0.5] as [number, number, number], name: 'Đèn trần Cảm Biến & Cầu Thang (Đông Giữa)' },
        { id: 'lamp_5_sw', pos: [-5.5, 6.85, 5.5] as [number, number, number], name: 'Đèn trần Tầng 2 Bàn Thí Nghiệm (Tây Nam)' },
        { id: 'lamp_6_se', pos: [5.5, 6.85, 5.5] as [number, number, number], name: 'Đèn trần Tầng 2 Bàn Quang Phổ (Đông Nam)' },
        { id: 'lamp_7_ext_w', pos: [-4.0, 6.85, 10.0] as [number, number, number], name: 'Đèn trần Khu Mở Rộng Bàn PC (Nam Tây)' },
        { id: 'lamp_8_ext_e', pos: [4.0, 6.85, 10.0] as [number, number, number], name: 'Đèn trần Khu Mở Rộng Giá Hóa Chất & Bồn Nước (Nam Đông)' },
      ].map((lamp) => (
        <group key={lamp.id} position={lamp.pos}>
          {/* Steel suspension wire cables from structural I-beams */}
          {[-0.85, 0.85].map((wx) => (
            <mesh key={`wire_${wx}`} position={[wx, 0.12, 0]}>
              <cylinderGeometry args={[0.005, 0.005, 0.24, 8]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}

          {/* Troffer housing casing (Anodized Aluminum) */}
          <mesh castShadow>
            <boxGeometry args={[2.0, 0.1, 0.55]} />
            <meshStandardMaterial color="#1e293b" metalness={0.88} roughness={0.25} />
          </mesh>

          {/* Beveled edge border trim */}
          <mesh position={[0, -0.045, 0]}>
            <boxGeometry args={[2.04, 0.02, 0.59]} />
            <meshStandardMaterial color="#0f172a" metalness={0.92} roughness={0.2} />
          </mesh>

          {/* Frosted Acrylic LED Diffuser Panel (High Lumen Cleanroom 5000K) */}
          <mesh position={[0, -0.055, 0]}>
            <boxGeometry args={[1.88, 0.02, 0.44]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#f8fafc"
              emissiveIntensity={2.8}
              toneMapped={false}
            />
          </mesh>

          {/* Emergency Backup Power Status LED (Green indicator dot) */}
          <mesh position={[0.92, -0.052, 0.22]}>
            <sphereGeometry args={[0.012, 10, 10]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.0} toneMapped={false} />
          </mesh>

          {/* Real downlight illumination */}
          <pointLight
            position={[0, -0.2, 0]}
            intensity={1.6}
            distance={11.0}
            decay={2.0}
            color="#f8fafc"
          />
        </group>
      ))}

      {/* 4 Long Industrial LED Tube Lights Distributing Even Light Across the Workshop */}
      <FourLongLedTubeLights />


      {/* =========================================================================
          6. LAB SIGNAGE & POSTERS (Typography with Emissive Glow)
         ========================================================================= */}
      {/* Main Lab Title Header Sign Mounted on 2nd Floor Mezzanine South Wall (Overlooking 2nd Floor & Lab) */}
      <group position={[0, 5.35, 11.86]} rotation={[0, Math.PI, 0]}>
        {/* Stainless Steel / Anodized Aluminum Wall Mount Standoff Brackets */}
        {[-5.4, -2.7, 0, 2.7, 5.4].map((bx) => (
          <mesh key={`standoff_${bx}`} position={[bx, 0, -0.025]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.05, 16]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.2} />
          </mesh>
        ))}

        {/* Industrial Dark Metallic Backing Plate */}
        <mesh position={[0, 0, -0.012]} castShadow receiveShadow>
          <boxGeometry args={[11.4, 0.82, 0.024]} />
          <meshStandardMaterial color="#0b1329" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Glossy Dark Acrylic Front Display Panel */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[11.2, 0.74]} />
          <meshStandardMaterial color="#050b14" roughness={0.12} metalness={0.7} />
        </mesh>

        {/* Top & Bottom Glowing Cyan Neon Edge Beams */}
        <mesh position={[0, 0.36, 0.01]}>
          <boxGeometry args={[11.2, 0.02, 0.015]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0, -0.36, 0.01]}>
          <boxGeometry args={[11.2, 0.02, 0.015]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} />
        </mesh>

        {/* Left & Right Glowing Endcaps */}
        <mesh position={[-5.6, 0, 0.01]}>
          <boxGeometry args={[0.02, 0.74, 0.015]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[5.6, 0, 0.01]}>
          <boxGeometry args={[0.02, 0.74, 0.015]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} />
        </mesh>

        {/* Primary English Header */}
        <SafeText
          position={[0, 0.12, 0.02]}
          fontSize={0.27}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          ADVANCED PHOTONICS & LASER LAB
        </SafeText>

        {/* Vietnamese Secondary Title */}
        <SafeText
          position={[0, -0.14, 0.02]}
          fontSize={0.14}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.03}
        >
          PHÒNG THÍ NGHIỆM VẬT LÝ QUANG HỌC & GIA CÔNG LASER 3D
        </SafeText>

        {/* Dedicated Soft Sign Illumination Light */}
        <pointLight
          position={[0, 0, 0.5]}
          intensity={1.6}
          distance={6}
          decay={2}
          color="#38bdf8"
        />
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

      {/* =========================================================================
          7. STAIRCASE, 2ND FLOOR MEZZANINE, 10 LAB TABLES & GIANT CERAMIC SHELF
         ========================================================================= */}
      {/* Ornate Wrought Iron & Solid Wood Switchback Staircase & 2nd Floor Mezzanine */}
      <StaircaseAndMezzanine />

      {/* 10 Solid Wood Physics & Chemistry Laboratory Workbenches */}
      <LabWorkbenches />

      {/* Giant Multi-Tiered Storage Shelf with 20 Round-Bottom 2.5L Stoneware Bottles */}
      <GiantCeramicBottleShelf />

      {/* 2nd Floor Research Wing: Computer Desk, KS Nguyễn Văn Dũng, Chemical Rack, Equipment Rack, Water Sink */}
      <ComputerDeskWithPCAndLaptop />
      <NpcInstructorDung />
      <ChemicalReagentRack />
      <LabEquipmentRack />
      <LabSinkAndFaucet />

      {/* =========================================================================
          8. AUXILIARY INDUSTRIAL EQUIPMENT & PIPING INFRASTRUCTURE
         ========================================================================= */}
      {/* A. Industrial Water Chiller CW-5200 for CO2 Machine (Station 1: [-6, 0, -4]) */}
      <group position={[-7.8, 0, -5.4]}>
        {/* Chiller Main Cabinet Body */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.9, 0.7]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Front Air Intake Grille / Louvers */}
        <mesh position={[0, 0.35, 0.355]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* 4 Swivel Caster Wheels */}
        {[-0.22, 0.22].map((x) =>
          [-0.28, 0.28].map((z) => (
            <mesh key={`caster-cw-${x}-${z}`} position={[x, 0.04, z]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>
          ))
        )}
        {/* Digital Temperature Controller Panel */}
        <group position={[0, 0.75, 0.355]}>
          <mesh>
            <planeGeometry args={[0.32, 0.14]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          <SafeText position={[0, 0.03, 0.005]} fontSize={0.032} color="#94a3b8" anchorX="center" anchorY="middle">
            CHILLER CW-5200
          </SafeText>
          <SafeText position={[0, -0.025, 0.005]} fontSize={0.042} color="#38bdf8" anchorX="center" anchorY="middle">
            21.8 °C [STABLE]
          </SafeText>
        </group>
        {/* Dual Water Connection Manifolds on top */}
        <mesh position={[-0.12, 0.94, -0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} />
        </mesh>
        <mesh position={[0.12, 0.94, -0.15]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshStandardMaterial color="#dc2626" metalness={0.9} />
        </mesh>
      </group>

      {/* Dual Chiller Hoses connecting CW-5200 Chiller to CO2 Laser Rear */}
      {/* 1. Cold Water Supply Line (Cyan-Blue) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -7.8 - 0.12, 0.94, -5.4 - 0.15,
                -7.8 - 0.12, 0.12, -5.4 - 0.15,
                -6.95, 0.12, -4.7,
                -6.95, 1.13, -4.7,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#0284c7" linewidth={4} />
      </line>
      {/* 2. Warm Water Return Line (Ruby-Red) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -7.8 + 0.12, 0.94, -5.4 - 0.15,
                -7.8 + 0.12, 0.10, -5.4 - 0.15,
                -5.05, 0.10, -4.7,
                -5.05, 1.13, -4.7,
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#dc2626" linewidth={4} />
      </line>

      {/* Flexible Spiral Fume Extraction Hose from CO2 Machine Rear to Overhead Trunk */}
      <group position={[-5.2, 0.4, -4.9]}>
        {/* Hose riser to ceiling */}
        <mesh position={[0, 1.8, 0.9]}>
          <cylinderGeometry args={[0.1, 0.1, 3.6, 24]} />
          <meshStandardMaterial
            color="#94a3b8"
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
        {/* Spiral ribs rings along the flexible duct */}
        {[0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2].map((y, idx) => (
          <mesh key={`duct-rib-${idx}`} position={[0, y, 0.9]}>
            <torusGeometry args={[0.108, 0.012, 8, 24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* B. High Precision Cleanroom Chiller for UV Machine (Station 2: [6, 0, -4]) */}
      <group position={[7.8, 0, -5.4]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.55, 0.9, 0.7]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.35, 0.355]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        {/* Digital Telemetry Panel */}
        <group position={[0, 0.75, 0.355]}>
          <mesh>
            <planeGeometry args={[0.32, 0.14]} />
            <meshBasicMaterial color="#030712" />
          </mesh>
          <SafeText position={[0, 0.03, 0.005]} fontSize={0.032} color="#94a3b8" anchorX="center" anchorY="middle">
            DUAL TEC CHILLER
          </SafeText>
          <SafeText position={[0, -0.025, 0.005]} fontSize={0.042} color="#a855f7" anchorX="center" anchorY="middle">
            25.0 °C [±0.05°C]
          </SafeText>
        </group>
        {/* Braided Coolant Line to UV Machine Base */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  0, 0.4, 0,
                  -1.8, 0.4, 1.4,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#a855f7" linewidth={4} />
        </line>
      </group>

      {/* C. Industrial Compressed Air Receiver Tank & Air Dryer behind Fiber Machine (Station 3: [-6, 0, 4]) */}
      <group position={[-7.8, 0, 5.2]}>
        {/* Vertical Blue Air Pressure Vessel Tank */}
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 1.0, 24]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Tank Top Hemisphere Dome */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* 3 Tank Stand Legs */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <mesh
            key={`leg-${idx}`}
            position={[Math.sin(angle) * 0.18, 0.1, Math.cos(angle) * 0.18]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.2, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        ))}
        {/* Bourdon Tube Pressure Gauge */}
        <group position={[0, 1.15, 0.23]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <planeGeometry args={[0.09, 0.09]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <SafeText position={[0, 0, 0.014]} fontSize={0.024} color="#000000" anchorX="center" anchorY="middle">
            0.6 MPa
          </SafeText>
        </group>
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
