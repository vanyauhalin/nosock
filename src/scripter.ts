import type { Context } from './context';
import { run } from './runner';

interface Scripter {
  <C extends (this: void) => unknown>(
    command: string,
    callback: C,
    options?: {
      noCancel: boolean;
    },
  ): (this: void) => (
    Promise<C extends (this: void) => Promise<unknown>
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
