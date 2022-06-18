import { env } from 'node:process';
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
}

interface StoreScript {
  command: string;
  options?: {
    allowCancellation: boolean;
  };
  callback(this: void): unknown;
}

function define(): Context {
  return {
    history: [],
    options: {
      allowCancellation: false,
      command: env['npm_lifecycle_event'] || '',
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
}

export type { Context, HistoryEvent, StoreScript };
export { define };
