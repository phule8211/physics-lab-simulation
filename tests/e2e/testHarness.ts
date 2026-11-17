/**
 * Autonomous TypeScript/Node Test Harness for Laser Lab E2E Testing
 * Provides zero-dependency assertion primitives, test runners, and summary reporting.
 */

// Headless Node environment shims for Three.js, event listeners, and audio
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    AudioContext: undefined,
    navigator: (globalThis as any).navigator || mockNavigator,
  };
  (globalThis as any).document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    exitPointerLock: () => {},
    getElementById: () => null,
  };
} else if (!(globalThis as any).window.navigator) {
  (globalThis as any).window.navigator = (globalThis as any).navigator || mockNavigator;
}

export interface TestResult {
  name: string;
  suite: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
}

export interface SuiteResult {
  name: string;
  passed: number;
  failed: number;
  total: number;
  durationMs: number;
  tests: TestResult[];
}

export interface OverallResult {
  suites: SuiteResult[];
  totalSuites: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalDurationMs: number;
  success: boolean;
}

type TestFn = () => void | Promise<void>;

interface RegisteredTestCase {
  name: string;
  fn: TestFn;
}

interface RegisteredSuite {
  name: string;
  tests: RegisteredTestCase[];
}

const registeredSuites: RegisteredSuite[] = [];
let currentSuite: RegisteredSuite | null = null;

export function describe(suiteName: string, fn: () => void): void {
  const suite: RegisteredSuite = {
    name: suiteName,
    tests: [],
  };
  currentSuite = suite;
  registeredSuites.push(suite);
  fn();
  currentSuite = null;
}

export function it(testName: string, fn: TestFn): void {
  if (!currentSuite) {
    describe('Default Suite', () => {
      currentSuite!.tests.push({ name: testName, fn });
    });
    return;
  }
  currentSuite.tests.push({ name: testName, fn });
}

export const test = it;

function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object';
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (!isObject(a) || !isObject(b)) return false;

  // Handle TypedArrays
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
    if (a.byteLength !== b.byteLength) return false;
    const u8a = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const u8b = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    for (let i = 0; i < u8a.length; i++) {
      if (u8a[i] !== u8b[i]) return false;
    }
    return true;
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

export class Matcher {
  private isNot: boolean;

  constructor(private actual: unknown, isNot = false) {
    this.isNot = isNot;
  }

  get not(): Matcher {
    return new Matcher(this.actual, !this.isNot);
  }

  private assert(condition: boolean, message: string, detail?: string): void {
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      const prefix = this.isNot ? 'Expected NOT to satisfy assertion:' : 'Assertion failed:';
      const fullMessage = detail
        ? `${prefix} ${message}\n  Details: ${detail}`
        : `${prefix} ${message}\n  Actual: ${JSON.stringify(this.actual)}`;
      throw new Error(fullMessage);
    }
  }

  toBe(expected: unknown): void {
    const passed = Object.is(this.actual, expected);
    this.assert(
      passed,
      `Expected ${JSON.stringify(this.actual)} to be ${JSON.stringify(expected)}`
    );
  }

  toEqual(expected: unknown): void {
    const passed = deepEqual(this.actual, expected);
    this.assert(
      passed,
      `Expected ${JSON.stringify(this.actual)} to deeply equal ${JSON.stringify(expected)}`
    );
  }

  toBeCloseTo(expected: number, delta = 0.001): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected a number but received ${typeof this.actual}`);
    }
    const diff = Math.abs(this.actual - expected);
    const passed = diff <= delta;
    this.assert(
      passed,
      `Expected ${this.actual} to be within ${delta} of ${expected} (diff: ${diff.toFixed(6)})`
    );
  }

  toBeGreaterThan(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected a number but received ${typeof this.actual}`);
    }
    const passed = this.actual > expected;
    this.assert(passed, `Expected ${this.actual} > ${expected}`);
  }

  toBeGreaterThanOrEqual(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected a number but received ${typeof this.actual}`);
    }
    const passed = this.actual >= expected;
    this.assert(passed, `Expected ${this.actual} >= ${expected}`);
  }

  toBeLessThan(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected a number but received ${typeof this.actual}`);
    }
    const passed = this.actual < expected;
    this.assert(passed, `Expected ${this.actual} < ${expected}`);
  }

  toBeLessThanOrEqual(expected: number): void {
    if (typeof this.actual !== 'number') {
      throw new Error(`Expected a number but received ${typeof this.actual}`);
    }
    const passed = this.actual <= expected;
    this.assert(passed, `Expected ${this.actual} <= ${expected}`);
  }

  toBeTruthy(): void {
    const passed = Boolean(this.actual);
    this.assert(passed, `Expected truthy value, got ${JSON.stringify(this.actual)}`);
  }

  toBeFalsy(): void {
    const passed = !this.actual;
    this.assert(passed, `Expected falsy value, got ${JSON.stringify(this.actual)}`);
  }

  toBeNull(): void {
    const passed = this.actual === null;
    this.assert(passed, `Expected null, got ${JSON.stringify(this.actual)}`);
  }

  toBeUndefined(): void {
    const passed = this.actual === undefined;
    this.assert(passed, `Expected undefined, got ${JSON.stringify(this.actual)}`);
  }

  toBeDefined(): void {
    const passed = this.actual !== undefined && this.actual !== null;
    this.assert(passed, `Expected defined value, got ${JSON.stringify(this.actual)}`);
  }

  toContain(item: unknown): void {
    if (typeof this.actual === 'string' && typeof item === 'string') {
      const passed = this.actual.includes(item);
      this.assert(passed, `Expected string "${this.actual}" to contain substring "${item}"`);
      return;
    }

    if (Array.isArray(this.actual)) {
      const passed = this.actual.some((x) => deepEqual(x, item));
      this.assert(passed, `Expected array to contain item ${JSON.stringify(item)}`);
      return;
    }

    throw new Error(`toContain requires string or array, got ${typeof this.actual}`);
  }

  toHaveLength(expectedLen: number): void {
    if (!this.actual || typeof (this.actual as { length?: number }).length !== 'number') {
      throw new Error(`Expected object with length property`);
    }
    const actualLen = (this.actual as { length: number }).length;
    const passed = actualLen === expectedLen;
    this.assert(passed, `Expected length ${expectedLen}, got ${actualLen}`);
  }

  toThrow(expectedPattern?: string | RegExp): void {
    if (typeof this.actual !== 'function') {
      throw new Error(`toThrow requires a function`);
    }
    let threw = false;
    let thrownError: unknown = null;
    try {
      (this.actual as () => void)();
    } catch (err) {
      threw = true;
      thrownError = err;
    }

    if (!threw) {
      this.assert(false, 'Expected function to throw an error, but it did not throw.');
      return;
    }

    if (expectedPattern && thrownError instanceof Error) {
      const msg = thrownError.message;
      const matched =
        typeof expectedPattern === 'string'
          ? msg.includes(expectedPattern)
          : expectedPattern.test(msg);
      this.assert(
        matched,
        `Expected error message matching ${expectedPattern}, but got "${msg}"`
      );
    } else {
      this.assert(true, 'Function threw as expected.');
    }
  }
}

export function expect(actual: unknown): Matcher {
  return new Matcher(actual);
}

export async function runAllRegisteredSuites(): Promise<OverallResult> {
  const startTime = Date.now();
  const suiteResults: SuiteResult[] = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log('\n======================================================================');
  console.log('🚀 EXECUTING TEST SUITES — Virtual Physics & Industrial Laser Lab');
  console.log('======================================================================\n');

  for (const suite of registeredSuites) {
    console.log(`\n📦 SUITE: ${suite.name}`);
    console.log('----------------------------------------------------------------------');
    const suiteStartTime = Date.now();
    const testResults: TestResult[] = [];
    let suitePassed = 0;
    let suiteFailed = 0;

    for (const t of suite.tests) {
      totalTests++;
      const testStart = Date.now();
      let passed = true;
      let error: Error | undefined;

      try {
        await t.fn();
      } catch (err) {
        passed = false;
        error = err instanceof Error ? err : new Error(String(err));
      }

      const durationMs = Date.now() - testStart;
      testResults.push({
        name: t.name,
        suite: suite.name,
        passed,
        durationMs,
        error,
      });

      if (passed) {
        suitePassed++;
        totalPassed++;
        console.log(`  ✓ [PASS] ${t.name} (${durationMs}ms)`);
      } else {
        suiteFailed++;
        totalFailed++;
        console.log(`  ✗ [FAIL] ${t.name} (${durationMs}ms)`);
        if (error) {
          console.log(`      Error: ${error.message}`);
          if (error.stack) {
            const relevantStack = error.stack
              .split('\n')
              .slice(1, 4)
              .map((l) => `        ${l.trim()}`)
              .join('\n');
            console.log(relevantStack);
          }
        }
      }
    }

    const suiteDurationMs = Date.now() - suiteStartTime;
    suiteResults.push({
      name: suite.name,
      passed: suitePassed,
      failed: suiteFailed,
      total: suite.tests.length,
      durationMs: suiteDurationMs,
      tests: testResults,
    });

    console.log(
      `  Suite Summary: ${suitePassed}/${suite.tests.length} passed in ${suiteDurationMs}ms`
    );
  }

  const totalDurationMs = Date.now() - startTime;
  const overall: OverallResult = {
    suites: suiteResults,
    totalSuites: suiteResults.length,
    totalTests,
    totalPassed,
    totalFailed,
    totalDurationMs,
    success: totalFailed === 0,
  };

  printOverallSummary(overall);
  return overall;
}

function printOverallSummary(result: OverallResult): void {
  console.log('\n======================================================================');
  console.log('📊 FINAL TEST EXECUTION SUMMARY');
  console.log('======================================================================');
  console.log(`Total Suites : ${result.totalSuites}`);
  console.log(`Total Tests  : ${result.totalTests}`);
  console.log(`Passed Tests : \x1b[32m${result.totalPassed}\x1b[0m`);
  console.log(`Failed Tests : ${result.totalFailed > 0 ? `\x1b[31m${result.totalFailed}\x1b[0m` : '0'}`);
  console.log(`Duration     : ${(result.totalDurationMs / 1000).toFixed(3)}s`);
  console.log('----------------------------------------------------------------------');
  if (result.success) {
    console.log('\x1b[32m✔ ALL TEST SUITES PASSED SUCCESSFULLY (Exit Code 0)\x1b[0m');
  } else {
    console.log('\x1b[31m✖ TEST FAILURES DETECTED (Exit Code 1)\x1b[0m');
  }
  console.log('======================================================================\n');
}

export function clearSuites(): void {
  registeredSuites.length = 0;
  currentSuite = null;
}
