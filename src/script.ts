import kleur from 'kleur';
import type { Script, ScriptCallback, ScriptContext } from 'types';
import { log } from './logger';
import { extractCommands, isAsync, stopwatch } from './utils';

const commands = extractCommands();

function init(ctx: ScriptContext): Script {
  return ((cmd, callback) => {
    ctx.scripts.set(cmd, callback);
  }) as Script;
}

function runner(ctx: ScriptContext, cmd: string): Promise<unknown> {
  return new Promise((resolve) => {
    const { lap } = stopwatch();
    if (ctx.rejected.size) return;
    const colored = kleur.blue(cmd);

    ctx.running.add(cmd);
    log(`Running ${colored} ...`);
    if (!commands.includes(cmd)) {
      log.warn(`${colored} not found in package.json`);
    }

    const reject = (message: string): void => {
      ctx.running.delete(cmd);
      ctx.rejected.add(cmd);
      log.error.trace(message);
      if (!ctx.running.size) log.empty();
    };
    if (!ctx.scripts.has(cmd)) {
      reject(`${colored} not found`);
      return;
    }
    const callback = ctx.scripts.get(cmd);
    if (!callback) {
      reject(`Callback for ${colored} not found`);
      return;
    }

    const done = (returns: unknown): void => {
      ctx.running.delete(cmd);
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
  script.run = async (cmd = process.env['npm_lifecycle_event']) => {
    if (!cmd) {
      log.error.trace('No script to run');
      return;
    }
    await runner(ctx, cmd);
  };
  return script;
}

export {
  create,
};
