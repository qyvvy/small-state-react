import { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import { Matchers, AsymmetricMatchers } from 'bun:test';

// testing-library の matcher の拡張
declare module 'bun:test' {
  interface Matchers<T>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> { }
  interface AsymmetricMatchers extends TestingLibraryMatchers { }
}
