import { argv, env } from 'node:process';
import type { DeepArray } from './utils';

interface Context {
  history: DeepArray<HistoryEvent>;
  options: {
    allowCancellation: boolean;
    command: string;
    cwd: string;
    file?: string;
    isCli: boolean;
    noColor: boolean;
    require: string | string[];
  };
  state: {
    depth: number;
    hasError: boolean;
  };
  store: Record<string, StoreScript>;
}

interface HistoryEvent {
  command: string;
  duration?: string;
  error?: Error;
  type: 'done' | 'error' | 'cancel';
  cancel?(this: void): void;
}

interface StoreScript {
  command: string;
  options?: {
    allowCancellation: boolean;
  };
  callback(this: void): unknown | PromiseLike<unknown>;
}

function define(): Context {
  return {
    history: [],
    options: {
      allowCancellation: false,
      command: env['npm_lifecycle_event'] || [...argv].pop() || '',
      cwd: '.',
      isCli: argv.some((argument) => /^.*bin[/\\]nosock\.js$/.test(argument)),
      noColor: false,
      require: [],
    },
    state: {
      depth: 0,
      hasError: false,
    },
    store: {},
  };
}

const global = (() => {
  const context = define();
  return () => context;
})();

export type { Context, HistoryEvent, StoreScript };
export { define, global };
