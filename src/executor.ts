import { env } from 'node:process';
import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { stopwatch } from './utils';

function merge(values: string[], flag = 'p'): string {
  return `${`%${flag}, `.repeat(values.length).slice(0, -2)}\n`;
}

function define(context: Context) {
  return async (file?: string): Promise<void> => {
    const lap = stopwatch();
    log.empty(file ? `\n  File:     ${file}` : '');
    const command = env['npm_lifecycle_event'];
    const commands = Object.keys(context.scripts);
    try {
      if (commands.length === 0) {
        log.empty();
        throw new Error('Missing scripts');
      }
      log.empty(`  Scripts:  ${merge(commands)}`, ...commands);
      if (!command) throw new Error('Missing a run command');
      const script = context.scripts[command];
      if (!script) throw new Error(`The ${command} is not described`);
      await run(context, script);
    } catch (error) {
      const errored = error as Error;
      if (command) {
        log.error(errored.message.replace(command, '%p'), command);
      } else {
        log.error(errored.message);
      }
      throw new Error(errored.message);
    } finally {
      let report = '';
      const { rejected, resolved } = context;
      if (rejected.length > 0) report += `  Rejected: ${merge(rejected, 'an')}`;
      if (resolved.length > 0) report += `  Resolved: ${merge(resolved, 'ap')}`;
      log.empty(`\n${report}  Duration: ${lap()}\n`, ...rejected, ...resolved);
    }
  };
}

export { define };
