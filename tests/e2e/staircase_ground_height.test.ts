import { describe, it, expect } from './testHarness';
import { getGroundHeightAt, MEZZANINE_CONFIG } from '../../src/data/staircaseConfig';

export function registerStaircaseGroundHeightTests() {
  describe('Staircase & Mezzanine Height-Aware Ground Physics', () => {
    it('SG-1: ground floor player walking under elevated stairs remains at ground level Y=0', () => {
      // Under the stairs at Z = 3.0 where stair treads are at Y = 2.0m
      const groundAt3 = getGroundHeightAt(2.4, 3.0, 0.0);
      expect(groundAt3).toBe(0);

      // Under the stairs at Z = 4.0 where stair treads are at Y = 2.66m
      const groundAt4 = getGroundHeightAt(2.4, 4.0, 0.0);
      expect(groundAt4).toBe(0);
    });

    it('SG-2: ground floor player walking under mezzanine (Z >= 3.2) remains at ground level Y=0', () => {
      // Fiber Laser machine position: [-6, 0, 4]
      const fiberLaserGround = getGroundHeightAt(-6.0, 4.0, 0.0);
      expect(fiberLaserGround).toBe(0);

      // Sensor Station position: [6, 0, 4]
      const sensorStationGround = getGroundHeightAt(6.0, 4.0, 0.0);
      expect(sensorStationGround).toBe(0);

      // Center walkway at Z = 7.0 on ground floor
      const groundWalkway = getGroundHeightAt(0.0, 7.0, 0.0);
      expect(groundWalkway).toBe(0);
    });

    it('SG-3: player entering staircase from bottom base smoothly steps up', () => {
      // Approaching bottom of stairs (Z = 0.1, footY = 0.0)
      const stairBase = getGroundHeightAt(2.4, 0.1, 0.0);
      expect(stairBase).toBeGreaterThan(0);
      expect(stairBase).toBeLessThan(0.2);

      // Stepping onto Z = 0.4
      const stairStep2 = getGroundHeightAt(2.4, 0.4, 0.15);
      expect(stairStep2).toBeGreaterThan(0.2);
    });

    it('SG-4: player climbing staircase ascends smoothly to 2nd floor', () => {
      // Mid-stair at Z = 2.3 (stairY ~ 1.53m)
      const midStair = getGroundHeightAt(2.4, 2.3, 1.5);
      expect(Math.abs(midStair - 1.53)).toBeLessThan(0.05);

      // Near top at Z = 4.0 (stairY ~ 2.66m)
      const nearTop = getGroundHeightAt(2.4, 4.0, 2.6);
      expect(Math.abs(nearTop - 2.66)).toBeLessThan(0.05);

      // Landing at Z = 4.6 (stairY = 3.06m)
      const landing = getGroundHeightAt(2.4, 4.6, 3.0);
      expect(Math.abs(landing - 3.06)).toBeLessThan(0.02);
    });

    it('SG-5: player walking on 2nd floor mezzanine deck remains at floorY = 3.06m', () => {
      const footElevated = MEZZANINE_CONFIG.floorY; // 3.06

      // Lab Table 3 on 2nd floor
      const table3Floor = getGroundHeightAt(-0.8, 6.8, footElevated);
      expect(table3Floor).toBe(MEZZANINE_CONFIG.floorY);

      // Computer desk at [-6.0, 9.8] on 2nd floor
      const compDeskFloor = getGroundHeightAt(-6.0, 9.8, footElevated);
      expect(compDeskFloor).toBe(MEZZANINE_CONFIG.floorY);
    });

    it('SG-6: player descending staircase from 2nd floor smoothly descends to ground', () => {
      // Entering top of stairwell at Z = 4.5, feet at 3.06m
      const topStairwell = getGroundHeightAt(2.4, 4.5, 3.06);
      expect(Math.abs(topStairwell - 2.99)).toBeLessThan(0.05);

      // Walking down to Z = 2.0 (stairY = 1.33m)
      const midDescent = getGroundHeightAt(2.4, 2.0, 1.4);
      expect(Math.abs(midDescent - 1.33)).toBeLessThan(0.05);

      // Reaching base of stairs at Z = 0.0
      const bottomDescent = getGroundHeightAt(2.4, 0.0, 0.1);
      expect(bottomDescent).toBe(0);
    });
  });
}

