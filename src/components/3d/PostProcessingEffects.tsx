import React, { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
  N8AO,
  ChromaticAberration,
} from '@react-three/postprocessing';
import * as THREE from 'three';

export function PostProcessingEffects() {
  const caOffset = useMemo(() => new THREE.Vector2(0.0012, 0.0012), []);

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* 1. Unreal-Style Next-Gen Ambient Occlusion (Lumen Contact Shadows & Deep Crevices) */}
      <N8AO
        aoRadius={1.1}
        distanceFalloff={0.25}
        intensity={2.2}
        color="#020617"
        quality="medium"
        halfRes
      />

      {/* 2. Cinematic Multi-Layer Mipmap Bloom for Laser Plasma, LEDs & Emissive Tubes */}
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.28}
        mipmapBlur
      />

      {/* 3. Subtle Optical Chromatic Aberration (Simulates Cinema Lens Edge Distortion) */}
      <ChromaticAberration
        offset={caOffset}
        radialModulation
        modulationOffset={0.45}
      />

      {/* 4. Edge Vignette for Cinematic Laboratory Focus */}
      <Vignette offset={0.16} darkness={0.52} />

      {/* 5. Subpixel Morphological Anti-Aliasing (Crisp Jagged-free Edges) */}
      <SMAA />
    </EffectComposer>
  );
}
