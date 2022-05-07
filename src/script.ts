import kleur from 'kleur';
import type { Script, ScriptCallback, ScriptContext } from 'types';
import { log } from './logger';
import { extractEvents, isAsync, stopwatch } from './utils';

const events = extractEvents();

function init(ctx: ScriptContext): Script {
  return ((event, callback) => {
    ctx.scripts.set(event, callback);
  }) as Script;
}

function runner(ctx: ScriptContext, event: string): Promise<unknown> {
  return new Promise((resolve) => {
    const { lap } = stopwatch();
    if (ctx.rejected.size) return;
    const colored = kleur.blue(event);

    ctx.running.add(event);
    log(`Running ${colored} ...`);
    if (!events.includes(event)) {
      log.warn(`${colored} not found in package.json`);
    }

    const reject = (message: string): void => {
      ctx.running.delete(event);
      ctx.rejected.add(event);
      log.error.trace(message);
      if (!ctx.running.size) log.empty();
    };
    if (!ctx.scripts.has(event)) {
      reject(`${colored} not found`);
      return;
    }
    const callback = ctx.scripts.get(event);
    if (!callback) {
      reject(`Callback for ${colored} not found`);
      return;
    }

    const done = (returns: unknown): void => {
      ctx.running.delete(event);
      log[ctx.rejected.size
        ? 'error'
        : 'done'](`Finished ${colored} after ${lap()}`);
      if (!ctx.running.size) log.empty();
      resolve(returns);
    };
    const returns = callback();
    if (isAsync(callback, returns)) {
      (returns as Promise<unknown>).then(done);
      return;
    }
    done(returns);
  });
}

function create(): Script {
  const ctx = {
    rejected: new Set<string>(),
    running: new Set<string>(),
    scripts: new Map<string, ScriptCallback<unknown>>(),
  };
  const script = init(ctx);
  script.run = async (event = process.env['npm_lifecycle_event']) => {
    if (!event) {
      log.error.trace('No script to run');
      return;
    }
    await runner(ctx, event);
  };
  return script;
}

export {
  create,
};
