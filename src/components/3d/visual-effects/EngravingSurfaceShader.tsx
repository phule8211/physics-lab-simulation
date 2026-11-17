import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useLabStore } from '../../../store/useLabStore';
import { MaterialType } from '../../../data/materialsConfig';

export interface EngravingSurfaceShaderProps {
  materialType?: MaterialType;
  baseColor?: string;
  baseRoughness?: number;
  baseMetalness?: number;
  depthMapTexture?: THREE.Texture | null;
  processMode?: 'through-cut' | 'surface-engrave' | 'color-annealing' | 'relief-2.5d' | 'CUT' | 'ENGRAVE';
  laserPosition?: [number, number]; // [u, v] in [0, 1]
  isLaserActive?: boolean;
  spotRadius?: number;
  filmThicknessNm?: number;
  hazWidth?: number;
  hazColor?: string;
  maxDepthMm?: number;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uBaseColor;
uniform float uBaseRoughness;
uniform float uBaseMetalness;
uniform sampler2D uDepthMap;
uniform int uProcessMode;       // 0: through-cut, 1: surface-engrave, 2: color-annealing, 3: relief-2.5d
uniform int uMaterialType;      // 0: WOOD, 1: ACRYLIC, 2: STEEL, 3: ALUMINUM, 4: SILICON, 5: GLASS
uniform vec2 uLaserPosition;
uniform float uLaserActive;
uniform float uLaserSpotRadius;
uniform float uFilmThicknessNm;
uniform float uHazWidth;
uniform vec3 uHazColor;
uniform float uMaxDepthMm;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

// Radial sampling for thermal Heat-Affected Zone (HAZ)
float sampleMaxNeighborDepth(vec2 uv, float radius) {
  float maxD = 0.0;
  float r = max(0.005, radius);
  maxD = max(maxD, texture2D(uDepthMap, uv + vec2(r, 0.0)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv - vec2(r, 0.0)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv + vec2(0.0, r)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv - vec2(0.0, r)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv + vec2(r * 0.707, r * 0.707)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv - vec2(r * 0.707, r * 0.707)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv + vec2(-r * 0.707, r * 0.707)).a);
  maxD = max(maxD, texture2D(uDepthMap, uv + vec2(r * 0.707, -r * 0.707)).a);
  return maxD;
}

void main() {
  vec4 depthSample = texture2D(uDepthMap, vUv);
  vec3 localNormal = normalize(depthSample.rgb * 2.0 - 1.0);
  float depth01 = clamp(depthSample.a, 0.0, 1.0);

  vec3 surfaceColor = uBaseColor;
  float roughness = uBaseRoughness;
  float metalness = uBaseMetalness;
  float opacity = (uMaterialType == 1 || uMaterialType == 5) ? 0.42 : 1.0;
  vec3 emissive = vec3(0.0);

  // -------------------------------------------------------------
  // 1. CO2 Wood Carbonization with exponential HAZ (Material 0)
  // -------------------------------------------------------------
  if (uMaterialType == 0) {
    float neighborDepth = sampleMaxNeighborDepth(vUv, uHazWidth);
    // Radial exponential thermal gradient around ablation tracks
    float hazGradient = exp(-pow((1.0 - neighborDepth) / 0.45, 2.0)) * smoothstep(0.001, 0.02, neighborDepth);
    vec3 scorchedHalo = mix(uBaseColor, uHazColor, hazGradient * 0.9);

    // Core carbonized charcoal soot
    float charFactor = smoothstep(0.015, 0.10, depth01);
    vec3 charcoalBlack = vec3(0.03, 0.02, 0.015);

    // Deep relief groove shadow
    if (uProcessMode == 3) {
      charcoalBlack *= (1.0 - depth01 * 0.5);
    }

    surfaceColor = mix(scorchedHalo, charcoalBlack, charFactor);
    roughness = mix(uBaseRoughness, 0.98, max(hazGradient * 0.5, charFactor));
    metalness = 0.0;
  }
  // -------------------------------------------------------------
  // 2. CO2/UV Frosted Micro-Cracking / Bubbling (Acrylic 1, Glass 5)
  // -------------------------------------------------------------
  else if (uMaterialType == 1 || uMaterialType == 5) {
    // High-frequency crystalline micro-crack procedural noise
    float crack1 = fract(sin(dot(vUv * 920.0, vec2(12.9898, 78.233))) * 43758.5453);
    float crack2 = fract(sin(dot(vUv * 1480.0, vec2(93.9898, 67.345))) * 24634.6345);
    float microCrack = crack1 * 0.65 + crack2 * 0.35;

    float frostFactor = smoothstep(0.012, 0.08, depth01);
    vec3 frostedWhite = vec3(0.96, 0.98, 1.0) * (0.86 + 0.28 * microCrack);

    surfaceColor = mix(uBaseColor, frostedWhite, frostFactor);
    roughness = mix(uBaseRoughness, 0.90, frostFactor);
    metalness = mix(uBaseMetalness, 0.02, frostFactor);
    // Internal light scattering turns transparent optical media opaque white
    opacity = mix(0.42, 0.96, frostFactor);
  }
  // -------------------------------------------------------------
  // 3. Fiber 1064nm Color Annealing on Steel / Titanium (Material 2)
  // -------------------------------------------------------------
  else if (uMaterialType == 2) {
    // Airy thin-film interference oxide layer with zero stock depression
    vec3 V = normalize(vViewPosition);
    vec3 N = normalize(vNormal + vec3(localNormal.xy * 0.3, 0.0));
    float cosTheta = max(0.02, dot(N, V));

    float n_film = 2.45; // Refractive index of TiO2 / Cr2O3 oxide
    float sinThetaT2 = (1.0 - cosTheta * cosTheta) / (n_film * n_film);
    float cosThetaT = sqrt(max(0.0, 1.0 - sinThetaT2));

    // Optical path difference in nanometers
    float filmThickness = (uFilmThicknessNm > 1.0) ? uFilmThicknessNm : (30.0 + depth01 * 260.0);
    float opd = 2.0 * n_film * filmThickness * cosThetaT;

    // Spectral wavelengths for Red (650nm), Green (532nm), Blue (450nm)
    vec3 wavelengths = vec3(650.0, 532.0, 450.0);
    vec3 phase = (2.0 * 3.1415926535 * opd) / wavelengths;
    // Multi-beam Airy cosine approximation
    vec3 interferenceRgb = 0.5 + 0.5 * cos(phase);
    // Metallic color vibrancy boost
    interferenceRgb = clamp(pow(interferenceRgb, vec3(1.35)) * 1.3, 0.0, 1.0);

    float annealStrength = smoothstep(0.005, 0.05, depth01);
    if (uProcessMode == 2) {
      annealStrength = smoothstep(0.002, 0.03, depth01);
    }

    surfaceColor = mix(uBaseColor, interferenceRgb, annealStrength);
    metalness = mix(uBaseMetalness, 0.94, annealStrength);
    roughness = mix(uBaseRoughness, 0.20, annealStrength);
  }
  // -------------------------------------------------------------
  // 4. UV 355nm Zero-HAZ Cold Micro-Machining (Silicon 4, Aluminum 3)
  // -------------------------------------------------------------
  else if (uMaterialType == 4) {
    // Silicon wafer: zero HAZ knife-edge peel exposing gold/copper circuit track
    float edgeCut = step(0.015, depth01);
    vec3 exposedCircuitMetal = vec3(0.96, 0.78, 0.28); // Au/Cu contact metallization
    surfaceColor = mix(uBaseColor, exposedCircuitMetal, edgeCut);
    roughness = mix(uBaseRoughness, 0.12, edgeCut);
    metalness = mix(uBaseMetalness, 0.98, edgeCut);
  }
  else if (uMaterialType == 3) {
    // Black anodized aluminum: stripped to pure snow-white aluminum substrate
    float stripCut = step(0.015, depth01);
    vec3 brightAl = vec3(0.96, 0.97, 0.99);
    surfaceColor = mix(uBaseColor, brightAl, stripCut);
    roughness = mix(uBaseRoughness, 0.18, stripCut);
    metalness = mix(uBaseMetalness, 0.95, stripCut);
  }

  // -------------------------------------------------------------
  // 5. Real-time Laser Contact Spot Incandescence Bloom
  // -------------------------------------------------------------
  if (uLaserActive > 0.01) {
    float distToLaser = length(vUv - uLaserPosition);
    float spotRadius = max(0.002, uLaserSpotRadius);
    float spotGlow = exp(-pow(distToLaser / spotRadius, 2.0)) * uLaserActive;

    // HDR Incandescence emission
    vec3 incCore = vec3(1.0, 0.95, 0.85);
    vec3 incRim = vec3(1.0, 0.45, 0.08);
    vec3 incColor = mix(incRim, incCore, smoothstep(0.0, 0.6, spotGlow));
    emissive += incColor * (spotGlow * 4.8);
  }

  // -------------------------------------------------------------
  // PBR Lighting Composite (Directional + Ambient + Specular)
  // -------------------------------------------------------------
  vec3 N = normalize(vNormal + vec3(localNormal.xy * 0.75, 0.0));
  vec3 V = normalize(vViewPosition);
  vec3 L = normalize(vec3(0.4, 0.7, 0.6));

  float NdotL = max(0.0, dot(N, L));
  float ambient = 0.35;
  vec3 diffuse = surfaceColor * (NdotL * 0.65 + ambient);

  vec3 H = normalize(L + V);
  float NdotH = max(0.0, dot(N, H));
  float shininess = mix(12.0, 128.0, 1.0 - roughness);
  float specFactor = pow(NdotH, shininess) * mix(0.1, 0.9, metalness);
  vec3 specular = vec3(specFactor);

  vec3 finalRgb = diffuse + specular + emissive;
  gl_FragColor = vec4(finalRgb, opacity);
}
`;

/**
 * Creates a static 1x1 default normal/depth texture to avoid WebGL binding warnings
 */
function createDefaultDepthTexture(): THREE.DataTexture {
  const data = new Uint8Array([128, 128, 255, 0]); // Nx=0, Ny=0, Nz=1, Depth=0
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.needsUpdate = true;
  return tex;
}

const DEFAULT_DEPTH_TEXTURE = createDefaultDepthTexture();

export function materialTypeToInt(mat: MaterialType): number {
  switch (mat) {
    case 'WOOD':
      return 0;
    case 'ACRYLIC':
      return 1;
    case 'STEEL':
      return 2;
    case 'ALUMINUM':
      return 3;
    case 'SILICON':
      return 4;
    case 'GLASS':
      return 5;
    default:
      return 0;
  }
}

export function processModeToInt(mode?: string): number {
  switch (mode) {
    case 'through-cut':
    case 'CUT':
      return 0;
    case 'surface-engrave':
    case 'ENGRAVE':
      return 1;
    case 'color-annealing':
      return 2;
    case 'relief-2.5d':
      return 3;
    default:
      return 1;
  }
}

/**
 * Factory function to create a Three.js ShaderMaterial with all required physical uniforms
 */
export function createEngravingShaderMaterial(
  customUniforms?: Record<string, { value: unknown }>
): THREE.ShaderMaterial {
  const uniforms = {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color('#d97706') },
    uBaseRoughness: { value: 0.8 },
    uBaseMetalness: { value: 0.0 },
    uDepthMap: { value: DEFAULT_DEPTH_TEXTURE },
    uProcessMode: { value: 1 },
    uMaterialType: { value: 0 },
    uLaserPosition: { value: new THREE.Vector2(0.5, 0.5) },
    uLaserActive: { value: 0.0 },
    uLaserSpotRadius: { value: 0.02 },
    uFilmThicknessNm: { value: 50.0 },
    uHazWidth: { value: 0.04 },
    uHazColor: { value: new THREE.Color('#3d210c') },
    uMaxDepthMm: { value: 2.0 },
    ...customUniforms,
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

/**
 * R3F Component rendering a physical engraving surface shader plane
 */
export function EngravingSurfaceShader({
  materialType,
  baseColor,
  baseRoughness,
  baseMetalness,
  depthMapTexture,
  processMode,
  laserPosition = [0.5, 0.5],
  isLaserActive,
  spotRadius = 0.02,
  filmThicknessNm = 52.0,
  hazWidth = 0.045,
  hazColor = '#451a03',
  maxDepthMm = 2.0,
  width = 1.0,
  height = 1.0,
  position = [0, 0, 0],
  rotation = [-Math.PI / 2, 0, 0],
}: EngravingSurfaceShaderProps) {
  // Sync with global store when props are omitted
  const storeMaterial = useLabStore((state) => state.selectedMaterial);
  const storeRunning = useLabStore((state) => state.isCuttingJob && state.isMachineRunning && !state.isLidOpen);
  const storeProcessMode = useLabStore((state) => state.processMode);

  const effectiveMaterial = materialType || storeMaterial;
  const effectiveActive = isLaserActive !== undefined ? (isLaserActive ? 1.0 : 0.0) : (storeRunning ? 1.0 : 0.0);
  const effectiveMode = processMode || storeProcessMode;

  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(baseColor || '#d97706') },
      uBaseRoughness: { value: baseRoughness !== undefined ? baseRoughness : 0.8 },
      uBaseMetalness: { value: baseMetalness !== undefined ? baseMetalness : 0.0 },
      uDepthMap: { value: depthMapTexture || DEFAULT_DEPTH_TEXTURE },
      uProcessMode: { value: processModeToInt(effectiveMode) },
      uMaterialType: { value: materialTypeToInt(effectiveMaterial) },
      uLaserPosition: { value: new THREE.Vector2(laserPosition[0], laserPosition[1]) },
      uLaserActive: { value: effectiveActive },
      uLaserSpotRadius: { value: spotRadius },
      uFilmThicknessNm: { value: filmThicknessNm },
      uHazWidth: { value: hazWidth },
      uHazColor: { value: new THREE.Color(hazColor) },
      uMaxDepthMm: { value: maxDepthMm },
    };
  }, []);

  // Update uniforms when dynamic props change
  useEffect(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    if (baseColor) u.uBaseColor.value.set(baseColor);
    if (baseRoughness !== undefined) u.uBaseRoughness.value = baseRoughness;
    if (baseMetalness !== undefined) u.uBaseMetalness.value = baseMetalness;
    if (depthMapTexture) {
      u.uDepthMap.value = depthMapTexture;
    }
    u.uProcessMode.value = processModeToInt(effectiveMode);
    u.uMaterialType.value = materialTypeToInt(effectiveMaterial);
    u.uLaserPosition.value.set(laserPosition[0], laserPosition[1]);
    u.uLaserActive.value = effectiveActive;
    u.uLaserSpotRadius.value = spotRadius;
    u.uFilmThicknessNm.value = filmThicknessNm;
    u.uHazWidth.value = hazWidth;
    if (hazColor) u.uHazColor.value.set(hazColor);
    u.uMaxDepthMm.value = maxDepthMm;
  }, [
    baseColor,
    baseRoughness,
    baseMetalness,
    depthMapTexture,
    effectiveMode,
    effectiveMaterial,
    laserPosition,
    effectiveActive,
    spotRadius,
    filmThicknessNm,
    hazWidth,
    hazColor,
    maxDepthMm,
  ]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default EngravingSurfaceShader;
