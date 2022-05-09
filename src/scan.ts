import { env, exit } from 'node:process';
import kleur from 'kleur';
import type { Context } from 'types';
import { log } from './log';
import { stopwatch } from './utils';

function create(ctx: Context) {
  return async (): Promise<[
    keyof Context['scripts'],
    Context['scripts'][0],
  ]> => {
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
    if (!cmd) {
      log.error('Missing a run command')
        .error(`Finished scanning after ${lap()}`);
      exit(0);
    }

    const callback = ctx.scripts[cmd];
    if (!callback) {
      log.error.trace(`The ${kleur.blue(cmd)} is not described`)
        .error(`Finished scanning after ${lap()}`);
      exit(0);
    }

    log.done(`Finished scanning after ${lap()}`);
    return [cmd, callback];
  };
}

export {
  create,
};
