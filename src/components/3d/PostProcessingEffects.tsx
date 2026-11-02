import React from 'react';
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';

export function PostProcessingEffects() {
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      {/* 1. Cinematic Mipmap Bloom for Lasers, Plasma Tubes & Emissive LEDs */}
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.68}
        luminanceSmoothing={0.32}
        mipmapBlur
      />

      {/* 2. Edge Vignette for Cinematic Laboratory Focus */}
      <Vignette offset={0.15} darkness={0.52} />

      {/* 3. Subpixel Morphological Anti-Aliasing */}
      <SMAA />
    </EffectComposer>
  );
}
