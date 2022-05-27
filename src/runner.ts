import type { Context, ContextScript } from './context';
import { ACCENT, log } from './log';
import { stopwatch } from './utils';

async function run(context: Context, script: ContextScript): Promise<unknown> {
  const lap = stopwatch();
  if (context.rejected) return undefined;
  const { callback, command } = script;
  const accented = ACCENT(command);
  log(`Running ${accented} ...`);
  let result;
  try {
    result = await callback();
  } catch (error) {
    const errored = error as Error;
    context.rejected = +1;
    log.error(errored.message).trace(errored);
  }
  log[context.rejected
    ? 'error'
    : 'done'](`Finished ${accented} after ${lap()}`);
  return result;
}

export { run };
