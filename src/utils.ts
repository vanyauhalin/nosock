import { hrtime } from 'node:process';

interface Canceller<C extends (this: void) => unknown | PromiseLike<unknown>> {
  (this: void): (
    Promise<undefined | C extends (this: void) => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  cancel(this: void): void;
}

function cancellable<
  C extends (this: void) => unknown | PromiseLike<unknown>,
>(callback: C): Canceller<C> {
  const flag = Symbol('cancel');
  let cancel: (value: symbol) => void;
  async function inner(): Promise<unknown> {
    const result = await Promise.race([
      new Promise((resolve) => {
        cancel = resolve;
      }),
      Promise.resolve(callback()),
    ]);
    cancel(flag);
    return result === flag ? undefined : result;
  }
  inner.cancel = () => {
    cancel(flag);
  };
  return inner as Canceller<C>;
}

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
   * const result = deepener.raise(array);
   * // result is [1, 2, 3]
   * ```
   */
  function raise<T>(array: DeepArray<T>): T[] {
    const result = array.flat();
    return result.some((item) => Array.isArray(item))
      ? raise(result as DeepArray<T>)
      : result as T[];
  }
  return { dive, raise };
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

export type { Canceller, DeepArray };
export { cancellable, deepener, stopwatch };
