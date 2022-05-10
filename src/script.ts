import { env, exit, hrtime } from 'node:process';
import kleur from 'kleur';
import type { Context, ContextScript, Script } from 'types';
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

async function scan(ctx: Context, file: string): Promise<ContextScript> {
  const { lap } = stopwatch();
  log('Scanning scripts ...').note(file);

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

  const script = ctx.scripts[cmd];
  if (!script) {
    log.error(`The ${kleur.blue(cmd)} is not described`)
      .error(`${finished}${lap()}`);
    throw new Error();
  }

  log.done(`${finished}${lap()}`);
  return script;
}

async function run(
  ctx: Context,
  script: ContextScript,
): Promise<unknown> {
  const { lap } = stopwatch();
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
    }) as Script,
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

export {
  script,
  exec,
};
