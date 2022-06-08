import console from 'node:console';
import type { Context, ContextScript } from './context';
import { log } from './logger';
import { delay, stopwatch } from './utils';

async function run(context: Context, script: ContextScript): Promise<unknown> {
  const lap = stopwatch();
  const { callback, command } = script;
  if (context.rejected.length > 0) {
    context.rejected.push(command);
    return undefined;
  }
  log('Running %p ...', command);
  try {
    const result = await Promise.resolve(callback());
    if (context.rejected.length === 0) {
      context.resolved.push(command);
      return result;
    }
    context.rejected.push(command);
  } catch (error) {
    await delay();
    console.log(error);
    context.rejected.push(command);
  } finally {
    log[context.rejected.length > 0
      ? 'error'
      : 'done']('Finished %p after %a', command, lap());
  }
  return undefined;
}

export { run };
