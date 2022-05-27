import { hrtime } from 'node:process';

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

export { stopwatch };
