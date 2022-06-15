import { env } from 'node:process';
import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { deepener, stopwatch } from './utils';

function repeat(flag: string, length: number): string {
  return `%${flag}, `.repeat(length).slice(0, -2);
}

function define(context: Context) {
  return async (file?: string): Promise<void> => {
    const lap = stopwatch();
    log.empty(file ? `\n  File:     ${file}` : '');
    const command = env['npm_lifecycle_event'];
    const commands = Object.keys(context.store);
    try {
      if (commands.length === 0) {
        log.empty();
        throw new Error('Missing scripts');
      }
      log.empty(`  Scripts:  ${repeat('p', commands.length)}\n`, ...commands);
      if (!command) throw new Error('Missing a run command');
      const script = context.store[command];
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
      const { history } = context;
      const events = deepener.raise(history);
      const sections: [string, string, string][] = [
        ['done', 'Resolved', 'ap'],
        ['error', 'Rejected', 'an'],
        ['cancel', 'Canceled', 'aa'],
      ];
      const values: string[] = [];
      let report = '';
      for (const [type, message, flag] of sections) {
        const filtered = events.filter((event) => event.type === type);
        if (filtered.length > 0) {
          const list = filtered.map((event) => event.command);
          report += `  ${message}: ${repeat(flag, list.length)}\n`;
          values.push(...list);
        }
      }
      log.empty(`\n${report}  Duration: ${lap()}\n`, ...values);
    }
  };
}

export { define };
