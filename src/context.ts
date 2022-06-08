interface Context {
  rejected: string[];
  resolved: string[];
  scripts: Record<string, ContextScript>;
}

interface ContextScript {
  command: string;
  callback(this: void): unknown;
}

function define(): Context {
  return {
    rejected: [],
    resolved: [],
    scripts: {},
  };
}

export type { Context, ContextScript };
export { define };
