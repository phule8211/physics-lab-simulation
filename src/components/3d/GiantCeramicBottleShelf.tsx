import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { GIANT_SHELF_CONFIG } from '../../data/staircaseConfig';

/**
 * 2.5-Liter Round-Bottom Stoneware Bottle (Chai sành 2,5 lít đít tròn)
 * Features:
 * - Spherical bulbous round bottom (đít tròn)
 * - Tapered neck with rolled lip
 * - Stoneware ear loop handle (quai xách gốm sành)
 * - Natural cork stopper
 * - Vintage reagent laboratory label
 */
function RoundBottomCeramicBottle({ position, labelText = 'REAGENT 2.5L', glazeColor = '#78350f' }: { position: [number, number, number]; labelText?: string; glazeColor?: string }) {
  return (
    <group position={position}>
      {/* 1. Spherical Bulbous Round Bottom (Đít tròn 2.5 lít) */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.088, 24, 24]} />
        <meshStandardMaterial
          color={glazeColor}
          roughness={0.28}
          metalness={0.12}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* 2. Bottle Shoulder & Upper Taper */}
      <mesh position={[0, 0.19, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.086, 0.09, 24]} />
        <meshStandardMaterial
          color={glazeColor}
          roughness={0.28}
          metalness={0.12}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* 3. Cylindrical Neck */}
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.024, 0.028, 0.07, 20]} />
        <meshStandardMaterial
          color={glazeColor}
          roughness={0.28}
          metalness={0.12}
          envMapIntensity={0.9}
        />
      </mesh>

      {/* 4. Rolled Stoneware Lip Ring */}
      <mesh position={[0, 0.298, 0]}>
        <torusGeometry args={[0.022, 0.007, 12, 20]} />
        <meshStandardMaterial
          color={glazeColor}
          roughness={0.24}
          metalness={0.15}
        />
      </mesh>

      {/* 5. Natural Cork Stopper (Nút bần) */}
      <mesh position={[0, 0.315, 0]}>
        <cylinderGeometry args={[0.016, 0.019, 0.03, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 6. Stoneware Jug Loop Handle (Quai cầm sành) */}
      <mesh position={[0.052, 0.22, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.032, 0.008, 12, 20, Math.PI * 1.3]} />
        <meshStandardMaterial
          color={glazeColor}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 7. Vintage Laboratory Paper Reagent Label on Belly */}
      <mesh position={[0, 0.14, 0.086]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[0.085, 0.055]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  );
}

/**
 * Circular Wooden Recessed Cradle Ring
 * Custom cradle slot on the shelf holding each round-bottom bottle safely upright
 */
function BottleCradleSocket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Outer circular wooden collar */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.095, 0.102, 0.024, 24]} />
        <meshStandardMaterial color="#4e342e" roughness={0.5} />
      </mesh>
      {/* Soft dark cork / rubber inner cushion ring */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.082, 0.008, 12, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * Giant Storage Shelf (Kệ siêu to) holding 20 Round-Bottom 2.5L Stoneware Bottles
 */
export function GiantCeramicBottleShelf() {
  const woodTexture = useTexture('/textures/wood.jpg');
  useMemo(() => {
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(3, 1);
  }, [woodTexture]);

  const cfg = GIANT_SHELF_CONFIG;

  // 4 Shelves vertical positions (Y from base of shelf)
  const shelfYLevels = [0.15, 0.8, 1.45, 2.1];

  // 5 Bottle positions along X axis per shelf (5 x 4 = 20 bottles)
  const bottleXOffsets = [-1.2, -0.6, 0, 0.6, 1.2];

  // Stoneware glaze colors: traditional eel-skin brown, honey amber, deep terracotta, celadon stoneware
  const glazePalette = [
    '#5c2e0b', // Deep eel-skin brown (Nâu da lươn)
    '#78350f', // Warm terracotta stoneware (Gốm sành nung đỏ)
    '#854d0e', // Honey amber glazed (Men mật ong)
    '#451a03', // Dark chocolate iron glaze (Men nâu đen)
    '#365314', // Ancient antique celadon olive (Men gốm rạn rêu)
  ];

  const reagentLabels = [
    'ETHANOL 96%',
    'ACIDUM ACETICUM',
    'AQUA DESTILLATA',
    'SOLUTIO IODI',
    'GLYCEROLUM',
    'ISOPROPANOL 99%',
    'ACIDUM NITRICUM',
    'AMMONIA PURA',
    'ETHER AETHEREUS',
    'ACETONE TECH',
    'CHLOROFORMUM',
    'FORMALIN 37%',
    'SILICON ETCH-A',
    'PHOTORESIST-AZ',
    'XYLENE PURUM',
    'TETRACHLORO-ETH',
    'PHENOL PURUM',
    'SULFURIC ACID 98%',
    'BENZENE TECH',
    'METHANOL HPLC',
  ];

  return (
    <group position={cfg.position} rotation={cfg.rotation}>
      {/* =======================================================================
          1. INDUSTRIAL SHELVING UNIT FRAME (Khung kệ siêu to thép hộp & giằng chữ X)
         ======================================================================= */}
      {/* 4 Heavy Steel Upright Posts (4 Trụ đứng thép hộp đen) */}
      {[-cfg.width / 2 + 0.05, cfg.width / 2 - 0.05].map((px) =>
        [-cfg.depth / 2 + 0.05, cfg.depth / 2 - 0.05].map((pz) => (
          <group key={`shelf_post_${px}_${pz}`} position={[px, cfg.height / 2, pz]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.08, cfg.height, 0.08]} />
              <meshStandardMaterial color="#18181b" metalness={0.9} roughness={0.3} />
            </mesh>
            {/* Top decorative finial cap */}
            <mesh position={[0, cfg.height / 2 + 0.02, 0]}>
              <boxGeometry args={[0.1, 0.04, 0.1]} />
              <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        ))
      )}

      {/* Rear Diagonal X-Cross Bracing (Giằng chéo chữ X gia cố tải trọng nặng) */}
      <group position={[0, cfg.height / 2, -cfg.depth / 2 + 0.04]}>
        <mesh rotation={[0, 0, 0.65]}>
          <boxGeometry args={[cfg.width * 1.1, 0.03, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.35} />
        </mesh>
        <mesh rotation={[0, 0, -0.65]}>
          <boxGeometry args={[cfg.width * 1.1, 0.03, 0.015]} />
          <meshStandardMaterial color="#334155" metalness={0.88} roughness={0.35} />
        </mesh>
      </group>

      {/* =======================================================================
          2. 4 THICK SOLID WOOD SHELVES WITH STEEL PERIMETER RAILS
         ======================================================================= */}
      {shelfYLevels.map((sy, shelfIndex) => (
        <group key={`shelf_tier_${shelfIndex}`} position={[0, sy, 0]}>
          {/* Solid Wood Shelf Board (Ván kệ gỗ tự nhiên dày 5cm) */}
          <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
            <boxGeometry args={[cfg.width - 0.05, 0.05, cfg.depth - 0.05]} />
            <meshStandardMaterial
              map={woodTexture}
              color="#5d4037"
              roughness={0.35}
              metalness={0.08}
            />
          </mesh>

          {/* Under-shelf Steel Support Crossbeams */}
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[cfg.width - 0.06, 0.04, cfg.depth - 0.06]} />
            <meshStandardMaterial color="#18181b" metalness={0.92} roughness={0.25} />
          </mesh>

          {/* Front Safety Retainer Rail (Thanh chắn phía trước chống trượt) */}
          <mesh position={[0, 0.08, cfg.depth / 2 - 0.04]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, cfg.width - 0.1, 16]} />
            <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* 5 Bottle Cradle Sockets & 5 Round-Bottom Stoneware Bottles per Shelf */}
          {bottleXOffsets.map((bx, bottleIndex) => {
            const globalIndex = shelfIndex * 5 + bottleIndex;
            const glaze = glazePalette[globalIndex % glazePalette.length];
            const label = reagentLabels[globalIndex] || 'REAGENT 2.5L';

            return (
              <group key={`shelf_bottle_${shelfIndex}_${bottleIndex}`} position={[bx, 0.05, 0]}>
                {/* Circular Wooden Cradle Ring */}
                <BottleCradleSocket position={[0, 0, 0]} />

                {/* 2.5L Round-Bottom Ceramic Bottle */}
                <RoundBottomCeramicBottle
                  position={[0, 0, 0]}
                  labelText={label}
                  glazeColor={glaze}
                />
              </group>
            );
          })}
        </group>
      ))}

      {/* Top Header Board with Brass Lab Plaque */}
      <group position={[0, cfg.height - 0.05, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[cfg.width - 0.05, 0.08, cfg.depth - 0.05]} />
          <meshStandardMaterial map={woodTexture} color="#4e342e" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, cfg.depth / 2 - 0.015]}>
          <planeGeometry args={[1.6, 0.06]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
