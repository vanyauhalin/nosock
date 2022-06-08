import { env, stdout } from 'node:process';
import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { stopwatch } from './utils';

function define(context: Context) {
  return async (file?: string): Promise<void> => {
    const lap = stopwatch();
    stdout.write('\n');
    if (file) log(`Runnings scripts ${file}`);
    let command;
    try {
      command = env['npm_lifecycle_event'];
      if (!command) throw new Error('Missing a run command');
      const script = context.scripts[command];
      if (!script) throw new Error('The %p is not described');
      await run(context, script);
    } catch (error) {
      const { message } = error as Error;
      log.error(message, command || 'run command');
      throw new Error(message);
    } finally {
      stdout.write(`\n  Duration: ${lap()}\n\n`);
    }
  };
}

export { define };
