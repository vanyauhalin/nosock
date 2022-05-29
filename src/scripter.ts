import type { Context } from './context';
import { run } from './runner';

interface Scripter {
  <C extends (this: void) => unknown>(command: string, callback: C): () => (
    Promise<C extends (this: void) => Promise<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
}

function define(context: Context): Scripter {
  return ((command, callback) => {
    const script = {
      command,
      callback() {
        return Promise.resolve(callback());
      },
    };
    context.scripts[command] = script;
    return run.bind(undefined, context, script);
  }) as Scripter;
}

export type { Scripter };
export { define };
