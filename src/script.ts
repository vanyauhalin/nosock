import { exit } from 'node:process';
import kleur from 'kleur';
import { log } from './log';
import { scan } from './scanner';
import { stopwatch } from './utils';

interface Context {
  rejected: number;
  scripts: Record<string, ContextScript>;
}
type ContextScript = {
  cmd: string;
  cb(): Promise<unknown>;
};

async function run(
  ctx: Context,
  script: ContextScript,
): Promise<unknown> {
  const lap = stopwatch();
  if (ctx.rejected) return undefined;
  const colored = kleur.blue(script.cmd);
  log(`Running ${colored} ...`);
  let result;
  try {
    result = await script.cb();
  } catch (err) {
    ctx.rejected = +1;
    log.error((err as Error).message).trace(err as Error);
  }
  log[ctx.rejected ? 'error' : 'done'](`Finished ${colored} after ${lap()}`);
  return result;
}

const { script, exec } = (() => {
  const ctx: Context = {
    rejected: 0,
    scripts: {},
  };
  return {
    script: ((cmd, cb) => {
      const cur: ContextScript = {
        cmd,
        cb: () => Promise.resolve(cb()),
      };
      ctx.scripts[cmd] = cur;
      return run.bind(null, ctx, cur);
    }) as {
      <C extends () => unknown>(cmd: string, cb: C): () => (
        Promise<C extends () => Promise<unknown>
          ? Awaited<ReturnType<C>>
          : ReturnType<C>>
      );
    },
    async exec(file: string) {
      log.empty();
      try {
        const cur = await scan(ctx, file);
        await run(ctx, cur);
        log.empty();
      } catch (err) {
        log.empty();
        exit(0);
      }
    },
  };
})();

export type { Context, ContextScript };
export {
  script,
  exec,
};
