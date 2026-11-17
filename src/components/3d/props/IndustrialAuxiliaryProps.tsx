import React, { useRef, useLayoutEffect, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useLabStore } from '../../../store/useLabStore';

function SafeText(props: any) {
  return (
    <Suspense fallback={null}>
      <Text {...props} />
    </Suspense>
  );
}

export function IndustrialAuxiliaryProps() {
  // Store bindings for dynamic chiller and fume extractor
  const isCuttingJob = useLabStore((s) => s.isCuttingJob);
  const activeStationId = useLabStore((s) => s.activeStationId);
  const chillerStatus = useLabStore((s: any) => s.chillerStatus) ?? 'normal';
  const isOverheat = chillerStatus === 'overheat';

  // ===========================================================================
  // 1. REFS FOR THE 8 INSTANCED MESH GROUPS (Draw Call Budget Optimization)
  // ===========================================================================
  const cylindersRef = useRef<THREE.InstancedMesh>(null);
  const eStopsRef = useRef<THREE.InstancedMesh>(null);
  const isoSignsRef = useRef<THREE.InstancedMesh>(null);
  const workbenchesRef = useRef<THREE.InstancedMesh>(null);
  const traysRef = useRef<THREE.InstancedMesh>(null);
  const calipersRef = useRef<THREE.InstancedMesh>(null);
  const microscopesRef = useRef<THREE.InstancedMesh>(null);
  const ductFlangesRef = useRef<THREE.InstancedMesh>(null);

  // Dynamic Chiller Temp Readout Ref
  const chillerTempTextRef = useRef<any>(null);
  const chillerLedRef = useRef<THREE.Mesh>(null);

  // ===========================================================================
  // 2. GEOMETRIES & MATERIALS FOR INSTANCED PROP GROUPS
  // ===========================================================================

  // 1. Gas Cylinder: Body + Top Dome combined
  const cylinderGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.12, 0.12, 1.35, 18);
    geom.translate(0, 0.675, 0); // Base at ground y=0
    return geom;
  }, []);

  const cylinderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.35,
        metalness: 0.75,
      }),
    []
  );

  // 2. E-Stop Button: Large domed mushroom cap
  const eStopGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.045, 0.038, 0.035, 16);
    return geom;
  }, []);

  const eStopMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#dc2626', // High-vis glossy red
        roughness: 0.2,
        metalness: 0.1,
      }),
    []
  );

  // 3. ISO 7010 Laser Hazard Placard: Equilateral triangular prism
  const isoSignGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.14, 0.14, 0.015, 3);
    geom.rotateX(Math.PI / 2);
    return geom;
  }, []);

  const isoSignMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#facc15', // Warning Safety Yellow
        roughness: 0.3,
        metalness: 0.1,
      }),
    []
  );

  // 4. Industrial Equipment Workbench: Leg frame + composite top
  const workbenchGeometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(1.6, 0.85, 0.8);
    geom.translate(0, 0.425, 0);
    return geom;
  }, []);

  const workbenchMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e293b', // Powder-coated matte steel
        roughness: 0.4,
        metalness: 0.6,
      }),
    []
  );

  // 5. Conductive ESD Specimen Tray: Shallow beveled rectangular tray
  const trayGeometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(0.36, 0.04, 0.26);
    geom.translate(0, 0.02, 0);
    return geom;
  }, []);

  const trayMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0284c7', // Anti-static dissipative blue
        roughness: 0.3,
        metalness: 0.15,
      }),
    []
  );

  // 6. Digital Vernier Caliper: Main beam + jaws
  const caliperGeometry = useMemo(() => {
    const geom = new THREE.BoxGeometry(0.24, 0.012, 0.04);
    return geom;
  }, []);

  const caliperMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#cbd5e1', // Satin chrome
        roughness: 0.2,
        metalness: 0.95,
      }),
    []
  );

  // 7. Optical Stereo Inspection Microscope: Base + column + dual oculars
  const microscopeGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.08, 0.1, 0.38, 16);
    geom.translate(0, 0.19, 0);
    return geom;
  }, []);

  const microscopeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f1f5f9', // Cleanroom off-white enamel
        roughness: 0.25,
        metalness: 0.2,
      }),
    []
  );

  // 8. Ventilation Duct Flange / Clamp: Ring clamp
  const ductFlangeGeometry = useMemo(() => {
    const geom = new THREE.TorusGeometry(0.28, 0.025, 12, 24);
    return geom;
  }, []);

  const ductFlangeMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#94a3b8', // Galvanized zinc steel
        roughness: 0.3,
        metalness: 0.85,
      }),
    []
  );

  // ===========================================================================
  // 3. LAYOUT & INSTANCE INITIALIZATION
  // ===========================================================================
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // 1. Gas Cylinders (10 instances)
    if (cylindersRef.current) {
      const cylinderConfigs = [
        // Storage rack along West wall (N2 Slate, O2 Blue, Argon Green)
        { pos: [-8.8, 0, -1.0], rot: [0, 0, 0], col: '#1e293b' }, // N2 (Nitrogen)
        { pos: [-8.8, 0, -0.6], rot: [0, 0, 0], col: '#1e293b' }, // N2 (Nitrogen)
        { pos: [-8.8, 0, -0.2], rot: [0, 0, 0], col: '#2563eb' }, // O2 (Oxygen)
        { pos: [-8.8, 0, 0.2], rot: [0, 0, 0], col: '#16a34a' }, // Argon
        { pos: [-8.8, 0, 0.6], rot: [0, 0, 0], col: '#16a34a' }, // Argon
        // Station 1 (CO2 Assist Gas): N2 & O2
        { pos: [-7.8, 0, -4.8], rot: [0, 0.3, 0], col: '#1e293b' },
        { pos: [-7.4, 0, -4.8], rot: [0, -0.2, 0], col: '#2563eb' },
        // Station 3 (Fiber Assist Gas): High pressure Argon & N2
        { pos: [-7.8, 0, 4.8], rot: [0, 0.15, 0], col: '#16a34a' },
        { pos: [-7.4, 0, 4.8], rot: [0, -0.15, 0], col: '#1e293b' },
        // Station 2 (UV Cleanroom Assist): High purity N2
        { pos: [7.6, 0, -4.8], rot: [0, -0.4, 0], col: '#1e293b' },
      ];

      cylinderConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        cylindersRef.current!.setMatrixAt(idx, dummy.matrix);
        color.set(cfg.col);
        cylindersRef.current!.setColorAt(idx, color);
      });
      cylindersRef.current.instanceMatrix.needsUpdate = true;
      if (cylindersRef.current.instanceColor) cylindersRef.current.instanceColor.needsUpdate = true;
    }

    // 2. Red Emergency Stop (E-Stop) Mushroom Buttons (8 instances)
    if (eStopsRef.current) {
      const eStopConfigs = [
        { pos: [-5.15, 1.15, -3.2], rot: [0, 0, Math.PI / 2] }, // CO2 front console
        { pos: [5.15, 1.15, -3.2], rot: [0, 0, -Math.PI / 2] }, // UV front console
        { pos: [-5.15, 1.15, 3.2], rot: [0, 0, Math.PI / 2] }, // Fiber front console
        { pos: [5.15, 1.15, 3.2], rot: [0, 0, -Math.PI / 2] }, // Sensor front console
        { pos: [-1.2, 1.25, -11.2], rot: [0, 0, Math.PI / 2] }, // Coating booth console
        { pos: [-2.1, 1.3, 6.2], rot: [0, 0, Math.PI / 2] }, // Airlock exit 1
        { pos: [2.1, 1.3, 6.2], rot: [0, 0, -Math.PI / 2] }, // Airlock exit 2
        { pos: [0, 1.3, -13.8], rot: [0, 0, 0] }, // Coating booth emergency wall
      ];

      eStopConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        eStopsRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      eStopsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. ISO 7010 Laser Radiation Hazard Placards (8 instances)
    if (isoSignsRef.current) {
      const isoConfigs = [
        { pos: [-6.0, 1.95, -2.6], rot: [0, 0, 0] }, // CO2 station perimeter
        { pos: [6.0, 1.95, -2.6], rot: [0, 0, 0] }, // UV station perimeter
        { pos: [-6.0, 1.95, 2.6], rot: [0, Math.PI, 0] }, // Fiber station perimeter
        { pos: [6.0, 1.95, 2.6], rot: [0, Math.PI, 0] }, // Sensor station perimeter
        { pos: [0, 2.1, -11.4], rot: [0, 0, 0] }, // Coating booth entrance
        { pos: [-1.8, 1.85, 6.4], rot: [0, Math.PI, 0] }, // Cleanroom entry airlock
        { pos: [1.8, 1.85, 6.4], rot: [0, Math.PI, 0] }, // Cleanroom entry airlock
        { pos: [-8.8, 2.0, 0], rot: [0, Math.PI / 2, 0] }, // Gas storage manifold
      ];

      isoConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        isoSignsRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      isoSignsRef.current.instanceMatrix.needsUpdate = true;
    }

    // 4. Industrial Equipment Workbenches (4 instances)
    if (workbenchesRef.current) {
      const benchConfigs = [
        { pos: [-2.2, 0, -3.2], rot: [0, 0, 0] }, // Metrology Bench 1 (North-West)
        { pos: [2.2, 0, -3.2], rot: [0, 0, 0] }, // Tooling Bench 2 (North-East)
        { pos: [-2.2, 0, 3.2], rot: [0, Math.PI, 0] }, // Specimen Prep Bench 3 (South-West)
        { pos: [2.2, 0, 3.2], rot: [0, Math.PI, 0] }, // QC Inspection Bench 4 (South-East)
      ];

      benchConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        workbenchesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      workbenchesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 5. Conductive ESD Specimen Organizing Trays (6 instances)
    if (traysRef.current) {
      const trayConfigs = [
        { pos: [-2.5, 0.85, -3.2], rot: [0, 0.1, 0] },
        { pos: [-1.9, 0.85, -3.2], rot: [0, -0.05, 0] },
        { pos: [1.9, 0.85, -3.2], rot: [0, 0.15, 0] },
        { pos: [2.5, 0.85, -3.2], rot: [0, -0.1, 0] },
        { pos: [-2.2, 0.85, 3.2], rot: [0, 0.05, 0] },
        { pos: [2.2, 0.85, 3.2], rot: [0, -0.2, 0] },
      ];

      trayConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        traysRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      traysRef.current.instanceMatrix.needsUpdate = true;
    }

    // 6. Digital Vernier Calipers (4 instances)
    if (calipersRef.current) {
      const caliperConfigs = [
        { pos: [-2.1, 0.86, -3.4], rot: [0, 0.4, 0] },
        { pos: [2.1, 0.86, -3.4], rot: [0, -0.35, 0] },
        { pos: [-2.4, 0.86, 3.4], rot: [0, 0.25, 0] },
        { pos: [2.4, 0.86, 3.4], rot: [0, -0.5, 0] },
      ];

      caliperConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        calipersRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      calipersRef.current.instanceMatrix.needsUpdate = true;
    }

    // 7. Optical Stereo Inspection Microscopes (3 instances)
    if (microscopesRef.current) {
      const microscopeConfigs = [
        { pos: [-2.6, 0.85, -3.0], rot: [0, 0.2, 0] },
        { pos: [2.6, 0.85, -3.0], rot: [0, -0.2, 0] },
        { pos: [2.0, 0.85, 3.0], rot: [0, Math.PI - 0.2, 0] },
      ];

      microscopeConfigs.forEach((cfg, idx) => {
        dummy.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        dummy.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        microscopesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      microscopesRef.current.instanceMatrix.needsUpdate = true;
    }

    // 8. Ventilation Duct Flanges / Wall Collars (18 instances)
    if (ductFlangesRef.current) {
      const flangeConfigs: [number, number, number][] = [
        // Ceiling main exhaust runs
        [-6, 4.2, -6],
        [-6, 4.2, -3],
        [-6, 4.2, 0],
        [-6, 4.2, 3],
        [-6, 4.2, 6],
        [6, 4.2, -6],
        [6, 4.2, -3],
        [6, 4.2, 0],
        [6, 4.2, 3],
        [6, 4.2, 6],
        // Cross ties
        [-3, 4.2, 0],
        [0, 4.2, 0],
        [3, 4.2, 0],
        [-3, 4.2, -6],
        [3, 4.2, -6],
        // Wall penetrations
        [-9.8, 3.6, -4],
        [9.8, 3.6, -4],
        [0, 3.8, -13.5],
      ];

      flangeConfigs.forEach((pos, idx) => {
        dummy.position.set(pos[0], pos[1], pos[2]);
        dummy.rotation.set(Math.PI / 2, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        ductFlangesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      ductFlangesRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  // Frame loop for dynamic LED digital matrix display on CW-5200 chiller
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (chillerLedRef.current) {
      const mat = chillerLedRef.current.material as THREE.MeshStandardMaterial;
      if (isOverheat) {
        // Flashing urgent red
        const flash = Math.sin(time * 10) > 0;
        mat.color.set(flash ? '#ef4444' : '#7f1d1d');
        mat.emissive.set(flash ? '#ef4444' : '#000000');
        mat.emissiveIntensity = flash ? 2.5 : 0.1;
      } else {
        // Steady emerald normal running
        mat.color.set('#10b981');
        mat.emissive.set('#10b981');
        mat.emissiveIntensity = 1.4;
      }
    }
  });

  return (
    <group name="IndustrialAuxiliaryProps">
      {/* =======================================================================
          THE 8 THREE.InstancedMesh NODES (Draw Call Budget Optimization < 100)
         ======================================================================= */}
      {/* 1. Gas Cylinders */}
      <instancedMesh
        ref={cylindersRef}
        args={[cylinderGeometry, cylinderMaterial, 10]}
        castShadow
        receiveShadow
      />

      {/* 2. E-Stop Mushroom Buttons */}
      <instancedMesh ref={eStopsRef} args={[eStopGeometry, eStopMaterial, 8]} />

      {/* 3. ISO 7010 Laser Hazard Signs */}
      <instancedMesh ref={isoSignsRef} args={[isoSignGeometry, isoSignMaterial, 8]} />

      {/* 4. Industrial Equipment Workbenches */}
      <instancedMesh
        ref={workbenchesRef}
        args={[workbenchGeometry, workbenchMaterial, 4]}
        castShadow
        receiveShadow
      />

      {/* 5. Conductive ESD Specimen Trays */}
      <instancedMesh ref={traysRef} args={[trayGeometry, trayMaterial, 6]} castShadow />

      {/* 6. Digital Vernier Calipers */}
      <instancedMesh ref={calipersRef} args={[caliperGeometry, caliperMaterial, 4]} />

      {/* 7. Optical Stereo Inspection Microscopes */}
      <instancedMesh
        ref={microscopesRef}
        args={[microscopeGeometry, microscopeMaterial, 3]}
        castShadow
      />

      {/* 8. Ventilation Duct Flanges */}
      <instancedMesh ref={ductFlangesRef} args={[ductFlangeGeometry, ductFlangeMaterial, 18]} />

      {/* =======================================================================
          DYNAMIC UNIQUE PROP 1: RECIRCULATING WATER CHILLER UNIT (CW-5200)
         ======================================================================= */}
      <group position={[-7.6, 0, -3.2]} rotation={[0, 0.35, 0]} name="WaterChiller_CW5200">
        {/* Main Cabinet Body */}
        <mesh
          position={[0, 0.42, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.35 })}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.48, 0.84, 0.62]} />
        </mesh>

        {/* Front Louvered Condenser Intake Grille */}
        <mesh
          position={[0, 0.28, 0.312]}
          material={new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 })}
        >
          <planeGeometry args={[0.42, 0.44]} />
        </mesh>

        {/* Top Recessed Handles */}
        <mesh
          position={[-0.18, 0.845, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 })}
        >
          <boxGeometry args={[0.06, 0.02, 0.22]} />
        </mesh>
        <mesh
          position={[0.18, 0.845, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.4 })}
        >
          <boxGeometry args={[0.06, 0.02, 0.22]} />
        </mesh>

        {/* Brand & Model Banner */}
        <SafeText
          position={[0, 0.76, 0.313]}
          fontSize={0.038}
          color="#0284c7"
          anchorX="center"
          anchorY="middle"
        >
          CW-5200
        </SafeText>
        <SafeText
          position={[0, 0.71, 0.313]}
          fontSize={0.016}
          color="#475569"
          anchorX="center"
          anchorY="middle"
        >
          INDUSTRIAL WATER CHILLER
        </SafeText>

        {/* Digital Matrix LED Readout Panel Screen */}
        <mesh
          position={[0, 0.61, 0.313]}
          material={
            new THREE.MeshStandardMaterial({
              color: '#020617',
              roughness: 0.1,
              metalness: 0.8,
            })
          }
        >
          <planeGeometry args={[0.38, 0.14]} />
        </mesh>

        {/* Digital LED Display Text */}
        <SafeText
          ref={chillerTempTextRef}
          position={[-0.08, 0.63, 0.316]}
          fontSize={0.035}
          color={isOverheat ? '#ef4444' : '#10b981'}
          anchorX="center"
          anchorY="middle"
        >
          {isOverheat ? '38.6°C' : '22.4°C'}
        </SafeText>
        <SafeText
          position={[0.09, 0.63, 0.316]}
          fontSize={0.028}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          4.8 L/M
        </SafeText>
        <SafeText
          position={[0, 0.56, 0.316]}
          fontSize={0.018}
          color={isOverheat ? '#f87171' : '#a7f3d0'}
          anchorX="center"
          anchorY="middle"
        >
          {isOverheat ? 'ALARM: OVERHEAT' : 'STATUS: NORMAL'}
        </SafeText>

        {/* Status Indicator LED bulb */}
        <mesh ref={chillerLedRef} position={[0.15, 0.74, 0.315]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial
            color={isOverheat ? '#ef4444' : '#10b981'}
            emissive={isOverheat ? '#ef4444' : '#10b981'}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* Pressure Gauge Dial on side */}
        <group position={[-0.242, 0.55, 0.12]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh material={new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })}>
            <cylinderGeometry args={[0.035, 0.035, 0.01, 20]} />
          </mesh>
          <SafeText position={[0, 0, 0.006]} fontSize={0.012} color="#0f172a" anchorX="center">
            0.4 MPa
          </SafeText>
        </group>

        {/* Dual Polyurethane Water Supply & Return Hoses connecting to CO2 laser */}
        {/* Blue Cold Water Supply Hose */}
        <mesh position={[0.1, 0.45, -0.35]} rotation={[0.4, 0.2, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.6, 12]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* Red Warm Water Return Hose */}
        <mesh position={[-0.1, 0.45, -0.35]} rotation={[0.4, -0.2, 0]}>
          <cylinderGeometry args={[0.016, 0.016, 0.6, 12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
      </group>

      {/* =======================================================================
          DYNAMIC UNIQUE PROP 2: FUME EXTRACTION UNIT WITH ARTICULATED DUCT
         ======================================================================= */}
      <group position={[-4.8, 0, -5.4]} rotation={[0, -0.5, 0]} name="FumeExtractionUnit">
        {/* Turbine Filter Cabinet */}
        <mesh
          position={[0, 0.55, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.55, 1.1, 0.55]} />
        </mesh>

        {/* 4 Caster Wheels */}
        {[-0.22, 0.22].map((x, xi) =>
          [-0.22, 0.22].map((z, zi) => (
            <mesh
              key={`${xi}-${zi}`}
              position={[x, 0.04, z]}
              material={new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8 })}
            >
              <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
            </mesh>
          ))
        )}

        {/* Model Decal */}
        <SafeText
          position={[0, 0.95, 0.278]}
          fontSize={0.032}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          FUME EXTRACTOR
        </SafeText>
        <SafeText
          position={[0, 0.88, 0.278]}
          fontSize={0.016}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          HEPA + ACTIVATED CARBON
        </SafeText>

        {/* Power Rocker Switch (Lit Green when cutting) */}
        <mesh position={[0.18, 0.82, 0.278]}>
          <boxGeometry args={[0.03, 0.05, 0.01]} />
          <meshStandardMaterial
            color={isCuttingJob ? '#22c55e' : '#475569'}
            emissive={isCuttingJob ? '#22c55e' : '#000000'}
            emissiveIntensity={isCuttingJob ? 1.5 : 0}
            toneMapped={false}
          />
        </mesh>

        {/* =====================================================================
            ARTICULATED GOOSENECK DUCT & INTAKE HOOD
           ===================================================================== */}
        {/* Base duct collar */}
        <mesh
          position={[0, 1.12, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8 })}
        >
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        </mesh>

        {/* Flexible segmented duct curving over towards machine bed */}
        {/* Segment 1: Upward */}
        <mesh
          position={[0, 1.35, 0.08]}
          rotation={[0.3, 0, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 })}
        >
          <cylinderGeometry args={[0.075, 0.075, 0.45, 16]} />
        </mesh>

        {/* Segment 2: Arching forward */}
        <mesh
          position={[-0.1, 1.7, 0.35]}
          rotation={[0.8, -0.2, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 })}
        >
          <cylinderGeometry args={[0.072, 0.072, 0.55, 16]} />
        </mesh>

        {/* Segment 3: Extending towards laser chamber */}
        <mesh
          position={[-0.25, 1.95, 0.85]}
          rotation={[1.2, -0.3, 0]}
          material={new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5 })}
        >
          <cylinderGeometry args={[0.07, 0.07, 0.6, 16]} />
        </mesh>

        {/* Flared Conical Suction Intake Hood */}
        <group position={[-0.38, 1.82, 1.25]} rotation={[0.4, -0.3, 0]}>
          <mesh
            material={
              new THREE.MeshStandardMaterial({
                color: '#475569',
                roughness: 0.3,
                metalness: 0.7,
              })
            }
          >
            <cylinderGeometry args={[0.06, 0.22, 0.18, 24, 1, true]} />
          </mesh>

          {/* Transparent Acrylic Draft Skirt */}
          <mesh
            position={[0, -0.09, 0]}
            material={
              new THREE.MeshStandardMaterial({
                color: '#e0f2fe',
                transparent: true,
                opacity: 0.35,
                roughness: 0.1,
              })
            }
          >
            <cylinderGeometry args={[0.22, 0.26, 0.08, 24, 1, true]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default IndustrialAuxiliaryProps;
