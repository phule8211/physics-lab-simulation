import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { WorkshopEnvironment } from './WorkshopEnvironment';
import { ProceduralStation } from './fallbacks/ProceduralMachineBox';
import { PlayerController } from './PlayerController';
import { PostProcessingEffects } from './PostProcessingEffects';
import { STATIONS } from '../../data/labConfig';

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

        {/* Cinematic Post-Processing: Bloom, SMAA Anti-Aliasing & Vignette */}
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
}
