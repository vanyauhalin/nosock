import { env, stdout } from 'node:process';
import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';

interface Executor {
  (file: string): Promise<void>;
}

function define(context: Context): Executor {
  return async (file) => {
    stdout.write('\n');
    log('Running scripts ...').note(file);
    const command = env['npm_lifecycle_event'];
    if (!command) throw new Error('Missing a run command');
    const script = context.scripts[command];
    if (!script) throw new Error(`The ${command} is not described`);
    await run(context, script);
    stdout.write('\n');
  };
}

export type { Executor };
export { define };
