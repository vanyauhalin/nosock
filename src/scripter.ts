import type { Context } from './context';
import { run } from './runner';

interface Scripter {
  <C extends (this: void) => unknown | PromiseLike<unknown>>(
    command: string,
    callback: C,
    options?: {
      allowCancellation: boolean;
    },
  ): (this: void) => (
    Promise<C extends (this: void) => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
}

function define(context: Context): Scripter {
  return ((command, callback, options) => {
    const script = {
      ...options ? { options } : {},
      command,
      callback,
    };
    context.store[command] = script;
    return run.bind(undefined, context, script);
  }) as Scripter;
}

export type { Scripter };
export { define };
