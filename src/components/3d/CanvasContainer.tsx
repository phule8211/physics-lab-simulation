import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { WorkshopEnvironment } from './WorkshopEnvironment';
import { ProceduralStation } from './fallbacks/ProceduralMachineBox';
import { PlayerController } from './PlayerController';
import { DoraemonPlayer } from './first-person/DoraemonPlayer';
import { PostProcessingEffects } from './PostProcessingEffects';
import { PerformanceTracker } from './PerformanceTracker';
import { STATIONS } from '../../data/labConfig';
import { useLabStore } from '../../store/useLabStore';

// Configure Google Draco 3D geometry decoder path for any GLTF/GLB models
try {
  useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
} catch {
  // Ignore in environments where useGLTF is mocked
}

/**
 * FPS Governor: Throttles WebGL rendering precisely to 30 FPS when targetFps === 30
 * By switching Canvas to frameloop="demand" and calling invalidate() at ~33.33ms intervals,
 * this saves up to 50% GPU/CPU thermal load and battery on low-end machines.
 */
function FpsGovernor() {
  const { invalidate } = useThree();
  const targetFps = useLabStore((state) => state.targetFps);

  useEffect(() => {
    if (targetFps === 60) return; // In 60 FPS mode, canvas runs on native frameloop="always"

    let animId: number;
    let lastTime = performance.now();
    const interval = 1000 / 30; // 33.33ms

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);
      const elapsed = now - lastTime;
      if (elapsed >= interval - 2.5) {
        lastTime = now - (elapsed % interval);
        invalidate();
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [targetFps, invalidate]);

  return null;
}

export function CanvasContainer() {
  const graphicsQuality = useLabStore((state) => state.graphicsQuality);
  const targetFps = useLabStore((state) => state.targetFps);

  // Dynamic DPR based on graphics quality:
  // - LOW: 0.85 to 1.0 (prevents 2x/3x Retina resolution on high-DPI screens which renders up to 9x pixels)
  // - MEDIUM: 1.0 to 1.25 (sharp and performant for standard laptops)
  // - HIGH: 1.0 to 1.5 (crisp high-DPI rendering)
  const dpr = useMemo<[number, number]>(() => {
    if (graphicsQuality === 'LOW') return [0.85, 1.0];
    if (graphicsQuality === 'MEDIUM') return [1.0, 1.25];
    return [1.0, 1.5];
  }, [graphicsQuality]);

  const enableShadows = graphicsQuality !== 'LOW';

  return (
    <div className="w-full h-full relative z-0 isolate">
      <Canvas
        frameloop={targetFps === 30 ? 'demand' : 'always'}
        shadows={enableShadows ? { type: THREE.PCFSoftShadowMap } : false}
        camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.7, 4] }}
        gl={{
          antialias: graphicsQuality !== 'LOW',
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          stencil: false,
          depth: true,
        }}
        dpr={dpr}
        performance={{ min: 0.5, debounce: 200 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = enableShadows;
          if (enableShadows) {
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }
        }}
      >
        {/* Dynamic Resolution & Event Adaptive Optimization */}
        <AdaptiveDpr pixelated={false} />
        <AdaptiveEvents />

        {/* 30 FPS / 60 FPS Throttling Governor */}
        <FpsGovernor />

        {/* Real-time WebGL Performance Diagnostics Monitor */}
        <PerformanceTracker />

        {/* Deep Atmospheric Cleanroom Fog & Dark Navy Background */}
        <color attach="background" args={['#080e1e']} />
        <fogExp2 attach="fog" args={['#080e1e', 0.024]} />

        {/* Workshop Architectural Scene, PBR Materials, Lighting & Procedural HDRI */}
        <WorkshopEnvironment />

        {/* 5 Interactive Machine Workstations & Spray Coating Booth */}
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

        {/* Doraemon Player: First-Person Hands & 3rd-Person Full Body Avatar [Phím 9] */}
        <DoraemonPlayer />

        {/* Cinematic Post-Processing: Adaptive Quality (Disabled on LOW, Light on MEDIUM, Full on HIGH) */}
        <PostProcessingEffects />
      </Canvas>
    </div>
  );
}
