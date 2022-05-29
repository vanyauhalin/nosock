import type { Context } from './context';
import { log } from './logger';
import { run } from './runner';
import { scan } from './scanner';

interface Executor {
  (file: string): Promise<void>;
}

function define(context: Context): Executor {
  return async (file) => {
    log.empty()('Running scripts ...').note(file);
    const script = scan(context);
    await run(context, script);
    log.empty();
  };
}

export type { Executor };
export { define };
