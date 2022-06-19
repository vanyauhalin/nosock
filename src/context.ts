import { argv, env } from 'node:process';
import type { DeepArray } from './utils';

interface Context {
  history: DeepArray<HistoryEvent>;
  options: {
    allowCancellation: boolean;
    command: string;
    cwd: string;
    file?: string;
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
  cancel?(): void;
}

interface StoreScript {
  command: string;
  options?: {
    allowCancellation: boolean;
  };
  callback(): unknown | PromiseLike<unknown>;
}

const actual = (() => {
  const isCli = argv.some((argument) => /bin[/\\]nosock\.js/.test(argument));
  const context: Context = {
    history: [],
    options: {
      allowCancellation: false,
      command: (isCli ? env['npm_lifecycle_event'] : [...argv].pop()) || '',
      cwd: '.',
      noColor: false,
      require: [],
    },
    state: {
      depth: 0,
      hasError: false,
    },
    store: {},
  };
  return () => context;
})();

export type { Context, HistoryEvent, StoreScript };
export { actual };
