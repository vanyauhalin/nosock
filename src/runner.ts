import console from 'node:console';
import type { Context, StoreScript } from './context';
import { log } from './logger';
import { stopwatch } from './utils';

async function run(context: Context, script: StoreScript): Promise<unknown> {
  const lap = stopwatch();
  const { callback, command } = script;
  let result;
  if (context.rejected.length > 0) {
    context.rejected.push(command);
    return result;
  }
  log('Running %p ...', command);
  try {
    result = await Promise.resolve(callback());
    context[context.rejected.length > 0
      ? 'rejected'
      : 'resolved'].push(command);
  } catch (error) {
    console.log(error);
    context.rejected.push(command);
  }
  log[context.rejected.length > 0
    ? 'error'
    : 'done']('Finished %p after %a', command, lap());
  return result;
}

export { run };
