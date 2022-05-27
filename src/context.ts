interface Context {
  rejected: number;
  scripts: Record<string, ContextScript>;
}
type ContextScript = {
  command: string;
  callback(this: void): Promise<unknown>;
};

function define(): Context {
  return {
    rejected: 0,
    scripts: {},
  };
}

export type { Context, ContextScript };
export { define };
