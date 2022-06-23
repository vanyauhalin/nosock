import { hrtime } from 'node:process';

interface Canceller<C extends () => unknown | PromiseLike<unknown>> {
  (): (
    Promise<undefined | C extends () => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  cancel(this: void): void;
}

function cancellable<
  C extends () => unknown | PromiseLike<unknown>,
>(callback: C): Canceller<C> {
  const flag = Symbol('cancel');
  let cancel: (value: symbol) => void;
  async function inner(this: unknown): Promise<unknown> {
    const result = await Promise.race([
      new Promise((resolve) => {
        cancel = resolve;
      }),
      Promise.resolve(callback.apply(this)),
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

const deepener = (() => {
  function dive<T>(array: DeepArray<T>): T[] {
    const result = array[array.length - 1];
    if (!Array.isArray(result)) return array as T[];
    return dive(result);
  }
  function raise<T>(array: DeepArray<T>): T[] {
    const result = array.flat();
    return result.some((item) => Array.isArray(item))
      ? raise(result as DeepArray<T>)
      : result as T[];
  }
  return { dive, raise };
})();

const defer = (() => {
  let timeout: NodeJS.Timeout;
  return (callback: () => unknown) => {
    clearTimeout(timeout);
    timeout = setTimeout(callback);
  };
})();

function stopwatch(): () => string {
  const start = Number(hrtime.bigint());
  return () => `${((Number(hrtime.bigint()) - start) / 1e6).toFixed(2)}ms`;
}

export type { Canceller, DeepArray };
export {
  cancellable,
  deepener,
  defer,
  stopwatch,
};
