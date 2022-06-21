import { global } from './context';
import { exec } from './executor';
import { run } from './runner';

interface Scripter {
  <C extends (...parameters: Parameters<C>) => unknown | PromiseLike<unknown>>(
    command: string,
    callback: C,
    options?: {
      allowCancellation: boolean;
    },
  ): (...parameters: Parameters<C>) => (
    Promise<C extends (...temporary: Parameters<C>) => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  exec(this: void): void;
}

const script = (() => {
  const context = global();
  function inner(
    command: string,
    callback: (...parameters: unknown[]) => unknown | PromiseLike<unknown>,
    options?: {
      allowCancellation: boolean;
    },
  ): (...parameters: unknown[]) => Promise<unknown> {
    const saved = {
      ...options ? { options } : {},
      command,
      callback,
    };
    context.store[command] = saved;
    async function container(
      this: unknown,
      ...parameters: unknown[]
    ): Promise<unknown> {
      saved.callback = saved.callback.bind(this, ...parameters);
      const result = await run(context, saved);
      return result;
    }
    return container;
  }
  inner.exec = () => {
    setTimeout.call(undefined, exec.bind(undefined, context));
  };
  return inner as Scripter;
})();

export type { Scripter };
export { script };
