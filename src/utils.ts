import { hrtime } from 'node:process';

type DeepArray<T> = (T | DeepArray<T>)[];

/**
 * Utils to work with deep array.
 */
const deepener = (() => {
  /**
   * Dives into a deep array relative to all last elements of the array.
   *
   * ```js
   * const array = [1, [[[2]], [3]]];
   * const result = deepener.dive(array);
   * result.push(4);
   * // array is now [1, [[[2]], [3, 4]]]
   * ```
   */
  function dive<T>(array: DeepArray<T>): DeepArray<T> {
    const result = array[array.length - 1];
    if (!Array.isArray(result)) return array;
    return dive(result);
  }
  /**
   * Raises all elements of a deep array to the simple array.
   *
   * ```js
   * const array = [1, [[[2]], [3]]];
   * const result = deepener.float(array);
   * // result is [1, 2, 3]
   * ```
   */
  function float<T>(array: DeepArray<T>): T[] {
    const result = array.flat();
    return result.some((item) => Array.isArray(item))
      ? float(result as DeepArray<T>)
      : result as T[];
  }
  return { dive, float };
})();

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

export type { DeepArray };
export { deepener, stopwatch };
