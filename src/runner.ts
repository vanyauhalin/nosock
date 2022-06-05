import type { Context, ContextScript } from './context';
import { log } from './logger';
import { stopwatch } from './utils';

async function run(context: Context, script: ContextScript): Promise<unknown> {
  const lap = stopwatch();
  if (context.rejected) return undefined;
  const { callback, command } = script;
  log('Running %p ...', command);
  let result;
  try {
    result = await callback();
  } catch (error) {
    context.rejected = +1;
    const errored = error as Error;
    log.error(errored.message).trace(errored);
  }
  log[context.rejected
    ? 'error'
    : 'done']('Finished %p after %a', command, lap());
  return result;
}

export { run };
