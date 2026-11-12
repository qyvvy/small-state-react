import { afterEach, expect } from 'bun:test';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import chalk from 'chalk'


//expect.extend(matchers);

// context.utils.EXPECTED_COLORがないというエラーを抑制： https://github.com/oven-sh/bun/issues/18500
{
  function ensureExpectedColor(fn: any) {
    return function (...args: any[]) {
      this.utils.EXPECTED_COLOR = chalk.green
      this.utils.RECEIVED_COLOR = chalk.red
      return fn.apply(this, args)
    }
  }

  // apply the color overrides to all matcher functions within jest-dom matchers
  function patchObjectMethods<T extends object>(obj: T) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, typeof value === 'function' ? ensureExpectedColor(value) : value])
    )
  }

  expect.extend(patchObjectMethods(matchers))
}

afterEach(() => {
  cleanup()
})


//globalThis.IS_REACT_ACT_ENVIRONMENT = true
