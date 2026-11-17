/**
 * Standalone Runner for Adversarial Stress Tests
 */

declare const process: any;
import { clearSuites, runAllRegisteredSuites } from '../e2e/testHarness';
import { registerStressTests } from './adversarial_stress.test';

export async function runStressTests() {
  clearSuites();

  console.log('Registering Tier 5 Adversarial Stress Tests...');
  registerStressTests();

  const results = await runAllRegisteredSuites();
  return results;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.includes('runStressTests')) {
  runStressTests()
    .then((results) => {
      process.exit(results.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal stress test runner failure:', err);
      process.exit(1);
    });
}
