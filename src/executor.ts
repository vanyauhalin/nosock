import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { scan } from './scanner';

interface Executor {
  (config: string): Promise<void>;
}

function define(context: Context): Executor {
  async function inner(config: string): Promise<void> {
    log.empty();
    const script = scan(context, config);
    await run(context, script);
    log.empty();
  }
  return inner;
}

export type { Executor };
export { define };
