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
  <C extends (() => unknown)>(
    cmd: string,
    callback: C,
  ): () => Promise<C extends (() => Promise<unknown>)
    ? Awaited<ReturnType<C>>
    : ReturnType<C>>;
  run(cmd?: string): Promise<void>;
}
interface ScriptContext {
  rejected: string[];
  scripts: Record<string, () => Promise<unknown>>;
}

interface Stopwatch {
  (): Stopwatch;
  lap(): string;
}

export {
  Logger,
  Script,
  ScriptContext,
  Stopwatch,
};
