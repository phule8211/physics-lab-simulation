/**
 * Main E2E Test Suite Runner
 * Aggregates and executes all 4 tiers of tests:
 * - Tier 1: Feature Coverage (F1 to F15)
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Industrial Application Scenarios
 */

declare const process: any;
import { clearSuites, runAllRegisteredSuites } from './testHarness';
import { registerTier1Tests } from './tier1_features.test';
import { registerTier2Tests } from './tier2_boundaries.test';
import { registerTier3Tests } from './tier3_interactions.test';
import { registerTier4Tests } from './tier4_scenarios.test';
import { registerStaircaseGroundHeightTests } from './staircase_ground_height.test';

export async function runAllTests() {
  clearSuites();

  console.log('Registering Staircase & Mezzanine Height-Aware Ground Physics tests...');
  registerStaircaseGroundHeightTests();

  console.log('Registering Tier 1 Feature Coverage tests (F1 - F15)...');
  registerTier1Tests();

  console.log('Registering Tier 2 Boundary & Corner Cases tests...');
  registerTier2Tests();

  console.log('Registering Tier 3 Cross-Feature Interaction tests...');
  registerTier3Tests();

  console.log('Registering Tier 4 Real-World Application Scenario tests...');
  registerTier4Tests();

  const results = await runAllRegisteredSuites();
  return results;
}

// Direct execution entrypoint
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.includes('runAllTests')) {
  runAllTests()
    .then((results) => {
      process.exit(results.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal test runner execution failure:', err);
      process.exit(1);
    });
}
