import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabStore } from '../../store/useLabStore';

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  dpr: number;
  gpuName: string;
}

// Global reference for fast access without unnecessary React re-renders every single frame
export const livePerformanceMetrics: PerformanceMetrics = {
  fps: 60,
  frameTimeMs: 16.6,
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  dpr: 1,
  gpuName: 'WebGL 2.0 Hardware Accelerated',
};

export function PerformanceTracker() {
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    try {
      const dbg = gl.getContext().getExtension('WEBGL_debug_renderer_info');
      if (dbg) {
        const renderer = gl.getContext().getParameter(dbg.UNMASKED_RENDERER_WEBGL);
        if (renderer) {
          livePerformanceMetrics.gpuName = renderer.replace(/(ANGLE \([^,]+, | Direct3D11 vs_[^)]+\))/g, '').trim();
        }
      }
    } catch {
      // Fallback
    }
  }, [gl]);

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;

    frameCount.current++;

    // Update every 400ms for stable readout
    if (now - lastTime.current >= 400) {
      const elapsed = now - lastTime.current;
      livePerformanceMetrics.fps = Math.round((frameCount.current * 1000) / elapsed);
      livePerformanceMetrics.frameTimeMs = parseFloat(delta.toFixed(1));
      livePerformanceMetrics.drawCalls = gl.info.render.calls;
      livePerformanceMetrics.triangles = gl.info.render.triangles;
      livePerformanceMetrics.geometries = gl.info.memory.geometries;
      livePerformanceMetrics.textures = gl.info.memory.textures;
      livePerformanceMetrics.dpr = parseFloat(gl.getPixelRatio().toFixed(2));

      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

