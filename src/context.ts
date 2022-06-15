import type { DeepArray } from './utils';

interface Context {
  history: History;
  options: {
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

type History = DeepArray<HistoryEvent>;
interface HistoryEvent {
  command: string;
  duration: string;
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
      noColor: false,
      require: [],
    },
    state: {
      depth: -1,
      hasError: false,
    },
    store: {},
  };
}

export type {
  Context,
  History,
  HistoryEvent,
  StoreScript,
};
export { define };
