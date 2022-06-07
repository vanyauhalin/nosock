import { hrtime } from 'node:process';

/**
 * Promised `setTimeout`.
 * @param ms Milliseconds to wait. `0` by default.
 */
function delay(ms = 0): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Stopwatch to calculate elapsed time.
 *
 * ```js
 * const lap = stopwatch();
 * console.log(`Finished after ${lap()}`);
 * ```
 */
function stopwatch(): () => string {
  const start = Number(hrtime.bigint());
  return () => `${((Number(hrtime.bigint()) - start) / 1e6).toFixed(2)}ms`;
}

export { delay, stopwatch };
