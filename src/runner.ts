import kleur from 'kleur';
import type { Context, ContextScript } from './context';
import { log } from './log';
import { stopwatch } from './utils';

async function run(context: Context, script: ContextScript): Promise<unknown> {
  const lap = stopwatch();
  if (context.rejected) return undefined;
  const { callback, command } = script;
  const colored = kleur.blue(command);
  log(`Running ${colored} ...`);
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
    : 'done'](`Finished ${colored} after ${lap()}`);
  return result;
}

export { run };
