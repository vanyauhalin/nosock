import kleur from 'kleur';
import type { Script, ScriptContext } from 'types';
import { log } from './logger';
import { extractCommands, stopwatch } from './utils';

const commands = extractCommands();

function init(ctx: ScriptContext): Script {
  return ((cmd, callback) => {
    ctx.scripts[cmd] = () => Promise.resolve(callback());
  }) as Script;
}

async function runner(ctx: ScriptContext, cmd: string): Promise<void> {
  const { lap } = stopwatch();
  if (ctx.rejected.length) return;
  const colored = kleur.blue(cmd);

  log(`Running ${colored} ...`);
  if (!commands.includes(cmd)) {
    log.warn(`${colored} not found in package.json`);
  }

  const callback = ctx.scripts[cmd];
  if (!callback) {
    ctx.rejected.push(cmd);
    log.error.trace(`${colored} is not described or has no callback`);
    return;
  }

  await callback();
  log[ctx.rejected.length
    ? 'error'
    : 'done'](`Finished ${colored} after ${lap()}`);
}

function create(): Script {
  const ctx: ScriptContext = {
    rejected: [],
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
