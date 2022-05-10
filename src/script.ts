import { env, exit, hrtime } from 'node:process';
import kleur from 'kleur';
import type { Context, Script } from 'types';
import { log } from './log';

function stopwatch(): {
  (): ReturnType<typeof stopwatch>;
  lap(): string;
} {
  let start: number;
  function inner(): ReturnType<typeof stopwatch> {
    start = Number(hrtime.bigint());
    return inner;
  }
  inner.lap = () => `${((Number(hrtime.bigint()) - start) / 1e6).toFixed(2)}ms`;
  return inner();
}

async function scan(ctx: Context): Promise<[string, () => Promise<unknown>]> {
  const { lap } = stopwatch();
  log('Scanning scripts ...');

  const cmds = [] as string[];
  for (const key in env) {
    if (/^npm_package_scripts_.+/.test(key)) {
      cmds.push(key.replace(/^npm_package_scripts_/, '').replace(/_/g, '-'));
    }
  }

  for (const cmd in ctx.scripts) {
    if (!cmds.includes(cmd)) {
      log.warn(`The ${kleur.blue(cmd)} not found in package.json`);
    }
  }

  const cmd = env['npm_lifecycle_event'];
  const finished = 'Finished scanning after ';
  if (!cmd) {
    log.error('Missing a run command').error(`${finished}${lap()}`);
    throw new Error();
  }

  const cb = ctx.scripts[cmd];
  if (!cb) {
    log.error(`The ${kleur.blue(cmd)} is not described`)
      .error(`${finished}${lap()}`);
    throw new Error();
  }

  log.done(`${finished}${lap()}`);
  return [cmd, cb];
}

async function run(
  ctx: Context,
  cmd: string,
  cb: () => Promise<unknown>,
): Promise<unknown> {
  const { lap } = stopwatch();
  if (ctx.rejected) return undefined;
  const colored = kleur.blue(cmd);
  log(`Running ${colored} ...`);
  let result;
  try {
    result = await cb();
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
      const promised = (): Promise<unknown> => Promise.resolve(cb());
      ctx.scripts[cmd] = promised;
      return run.bind(null, ctx, cmd, promised);
    }) as Script,
    async exec() {
      log.empty();
      try {
        const [cmd, cb] = await scan(ctx);
        await run(ctx, cmd, cb);
        log.empty();
      } catch (err) {
        log.empty();
        exit(0);
      }
    },
  };
})();

export {
  script,
  exec,
};
