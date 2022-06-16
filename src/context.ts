import type { DeepArray } from './utils';

interface Context {
  history: DeepArray<HistoryEvent>;
  options: {
    cwd: string;
    file?: string;
    noCancel: boolean;
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
  callback(this: void): unknown;
}

function define(): Context {
  return {
    history: [],
    options: {
      cwd: '.',
      noCancel: false,
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
