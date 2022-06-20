import { actual } from './context';
import { exec } from './executor';
import { run } from './runner';

interface Scripter {
  <C extends () => unknown | PromiseLike<unknown>>(
    command: string,
    callback: C,
    options?: {
      allowCancellation: boolean;
    },
  ): () => (
    Promise<C extends () => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  exec(this: void): void;
}

const script = (() => {
  const context = actual();
  function inner(
    command: string,
    callback: () => unknown | PromiseLike<unknown>,
    options?: {
      allowCancellation: boolean;
    },
  ): () => Promise<unknown> {
    const saved = {
      ...options ? { options } : {},
      command,
      callback,
    };
    context.store[command] = saved;
    return run.bind(undefined, context, saved);
  }
  inner.exec = () => {
    setTimeout.call(undefined, exec.bind(undefined, context));
  };
  return inner as Scripter;
})();

export type { Scripter };
export { script };
