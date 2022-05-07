import kleur from 'kleur';
import type { Script, ScriptContext } from 'types';
import { log } from './logger';
import { extractCommands, isAsync, stopwatch } from './utils';

const commands = extractCommands();

function init(ctx: ScriptContext): Script {
  return ((cmd, callback) => {
    ctx.scripts[cmd] = callback;
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

    const callback = ctx.scripts[cmd];
    if (!callback) {
      ctx.running.delete(cmd);
      ctx.rejected.add(cmd);
      log.error.trace(`${colored} is not described or has no callback`);
      if (!ctx.running.size) log.empty();
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
  const ctx: ScriptContext = {
    rejected: new Set<string>(),
    running: new Set<string>(),
    scripts: {},
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
