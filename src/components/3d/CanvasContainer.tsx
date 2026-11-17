import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { WorkshopEnvironment } from './WorkshopEnvironment';
import { ProceduralStation } from './fallbacks/ProceduralMachineBox';
import { PlayerController } from './PlayerController';
import { PostProcessingEffects } from './PostProcessingEffects';
import { STATIONS } from '../../data/labConfig';
import { IndustrialAuxiliaryProps } from './props/IndustrialAuxiliaryProps';
import { LabEngineerNPC } from './characters/LabEngineerNPC';
import { SafetyGearVisualizer } from './characters/SafetyGearVisualizer';
import { OperatorHandsHUD } from './characters/OperatorHandsHUD';

export function CanvasContainer() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 4] }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        {/* Deep Atmospheric Cleanroom Fog & Dark Navy Background */}
        <color attach="background" args={['#080e1e']} />
        <fogExp2 attach="fog" args={['#080e1e', 0.024]} />

        {/* Workshop Architectural Scene, PBR Materials, Lighting & Procedural HDRI */}
        <WorkshopEnvironment />

        {/* R2: Industrial Auxiliary Props (8 InstancedMesh Groups, Water Chiller, Fume Extractor) */}
        <IndustrialAuxiliaryProps />

        {/* R2: Cleanroom Lab Engineer NPC with Dynamic OD7+ Goggles */}
        <LabEngineerNPC position={[3.6, 0, 3.2]} rotation={[0, -Math.PI / 3, 0]} />

        {/* R2: Mandatory PPE Station & Safety Gear Visualizer */}
        <SafetyGearVisualizer />

        {/* 4 Interactive Machine Workstations */}
        {Object.values(STATIONS).map((st) => (
          <ProceduralStation
            key={st.id}
            id={st.id}
            position={st.position}
            rotation={st.rotation}
          />
        ))}

        {/* First-Person Controller with Collision & Inspection Lerp */}
        <PlayerController />

        {/* R2: First-Person Operator Hands HUD */}
        <OperatorHandsHUD />

        {/* Cinematic Post-Processing: Bloom, SMAA Anti-Aliasing & Vignette */}
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
}

