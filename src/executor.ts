import { env } from 'node:process';
import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { deepener, stopwatch } from './utils';

function repeat(flag: string, length: number): string {
  return `%${flag}, `.repeat(length).slice(0, -2);
}

interface ExecutorOptions {
  cwd?: string;
  file?: string;
  noCancel?: boolean;
  noColor?: boolean;
  require?: string | string[];
}

function define(context: Context) {
  return async (options?: ExecutorOptions): Promise<void> => {
    const lap = stopwatch();
    context.options = { ...context.options, ...options };
    const { history, store } = context;
    const { file, noCancel } = context.options;
    const command = env['npm_lifecycle_event'];

    log.empty(file ? `\n  File:     ${file}` : '');
    try {
      const commands = Object.keys(store);
      if (commands.length === 0) throw new Error('Missing scripts');
      log.empty(`  Scripts:  ${repeat('p', commands.length)}`, ...commands);

      if (!command) throw new Error('Missing a run command');
      const script = store[command];
      if (!script) throw new Error(`The ${command} is not described`);

      log.empty();
      await run(context, script);
    } catch (error) {
      const { message } = error as Error;
      log.empty();
      if (command) {
        log.error(`${message.replace(command, '%p')}`, command);
      } else {
        log.error(message);
      }
      throw new Error(message);
    } finally {
      const events = deepener.raise(history);
      const sections: [string, string, string][] = [
        ['done', 'Resolved', 'ap'],
        ['error', 'Rejected', 'an'],
      ];
      if (!noCancel) sections.push(['cancel', 'Canceled', 'aa']);
      const values = [];
      let message = '';

      for (const [type, section, flag] of sections) {
        const filtered = events.filter((event) => event.type === type);
        if (filtered.length > 0) {
          const commands = filtered.map((event) => event.command);
          message += `  ${section}: ${repeat(flag, commands.length)}\n`;
          values.push(...commands);
        }
      }

      log.empty(`\n${message}  Duration: ${lap()}\n`, ...values);
    }
  };
}

export type { ExecutorOptions };
export { define };
