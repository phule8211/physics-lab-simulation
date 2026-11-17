import React, { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SMAA,
  N8AO,
} from '@react-three/postprocessing';
import { useLabStore } from '../../store/useLabStore';

export function PostProcessingEffects() {
  const graphicsQuality = useLabStore((state) => state.graphicsQuality);

  // In LOW mode (Cấu hình yếu / Siêu mượt):
  // Completely bypass EffectComposer to eliminate fullscreen render-target passes,
  // raymarching SSAO, and bloom downscale pyramids. Directly renders to screen buffer at 60 FPS.
  if (graphicsQuality === 'LOW') {
    return null;
  }

  // In MEDIUM mode (Cân bằng - Khuyên dùng):
  // Zero multisampling overhead, lightweight single-pass bloom without mipmap blur pyramid,
  // and subtle vignette. Smooth 60 FPS without GPU lag.
  if (graphicsQuality === 'MEDIUM') {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.25}
          mipmapBlur={false}
        />
        <Vignette offset={0.18} darkness={0.42} />
      </EffectComposer>
    );
  }

  // In HIGH mode (Đồ họa cao):
  // N8AO contact shadows (halfRes), cinematic bloom with mipmapBlur, vignette, and SMAA.
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {/* 1. Next-Gen Contact Shadows & Deep Crevices (Half-resolution for optimal speed) */}
      <N8AO
        aoRadius={1.0}
        distanceFalloff={0.25}
        intensity={1.9}
        color="#020617"
        quality="low"
        halfRes
      />

      {/* 2. Cinematic Multi-Layer Mipmap Bloom */}
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.74}
        luminanceSmoothing={0.28}
        mipmapBlur
      />

      {/* 3. Edge Vignette for Cinematic Focus */}
      <Vignette offset={0.16} darkness={0.5} />

      {/* 4. Subpixel Morphological Anti-Aliasing */}
      <SMAA />
    </EffectComposer>
  );
}
