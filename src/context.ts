import type { DeepArray } from './utils';

interface Context {
  history: History;
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
