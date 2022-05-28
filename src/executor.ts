import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { scan } from './scanner';

interface Executor {
  (file: string): Promise<void>;
}

function define(context: Context): Executor {
  async function inner(file: string): Promise<void> {
    log.empty()('Running scripts ...').note(file);
    const script = scan(context);
    await run(context, script);
    log.empty();
  }
  return inner;
}

export type { Executor };
export { define };
