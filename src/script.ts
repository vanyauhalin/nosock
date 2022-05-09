import kleur from 'kleur';
import type { Context, Script } from 'types';
import { log } from './logger';
import { stopwatch } from './utils';

function create(ctx: Context): Script {
  const inner = ((cmd, callback) => {
    const promised = (): Promise<unknown> => Promise
      .resolve(callback(ctx));
    ctx.scripts[cmd] = promised;
    return inner.run.bind(null, cmd, promised);
  }) as Script;
  inner.run = async (cmd, callback) => {
    const { lap } = stopwatch();
    if (ctx.rejected.length) return;
    const colored = kleur.blue(cmd);
    log(`Running ${colored} ...`);
    try {
      await callback(ctx);
    } catch (error) {
      ctx.rejected.push(cmd);
    }
    log[ctx.rejected.length
      ? 'error'
      : 'done'](`Finished ${colored} after ${lap()}`);
  };
  return inner;
}

export {
  create,
};
