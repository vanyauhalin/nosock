interface Context {
  rejected: string[];
  scripts: Record<string, () => Promise<unknown>>;
}

interface Logger {
  (type: string, message?: string): Logger;
  error: {
    (message: string): Logger;
    trace(message: string): Logger;
  };
  done(message: string): Logger;
  empty(message?: string): Logger;
  warn(message: string): Logger;
}

interface Script {
  <C extends (ctx: Context) => unknown>(
    cmd: string,
    callback: C,
  ): () => (
    Promise<C extends (ctx: Context) => Promise<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  run(
    cmd: string,
    callback: (ctx: Context) => Promise<unknown>,
  ): Promise<void>;
}

interface Stopwatch {
  (): Stopwatch;
  lap(): string;
}

export {
  Context,
  Logger,
  Script,
  Stopwatch,
};
