import console from 'node:console';
import type { Context, ContextScript } from './context';
import { log } from './logger';
import { delay, stopwatch } from './utils';

async function run(context: Context, script: ContextScript): Promise<unknown> {
  const lap = stopwatch();
  if (context.rejected.length > 0) return undefined;
  const { callback, command } = script;
  log('Running %p ...', command);
  try {
    const result = await Promise.resolve(callback());
    context.resolved.push(command);
    return result;
  } catch (error) {
    await delay();
    context.rejected.push(command);
    console.log(error);
    return undefined;
  } finally {
    log[context.rejected.length > 0
      ? 'error'
      : 'done']('Finished %p after %a', command, lap());
  }
}

export { run };
