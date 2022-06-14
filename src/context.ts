interface Context {
  rejected: string[];
  resolved: string[];
  store: Record<string, StoreScript>;
}

interface StoreScript {
  command: string;
  callback(this: void): unknown;
}

function define(): Context {
  return {
    rejected: [],
    resolved: [],
    store: {},
  };
}

export type { Context, StoreScript };
export { define };
