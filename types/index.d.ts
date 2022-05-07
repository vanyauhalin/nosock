declare type LoggerTraceReturns = {
  message: string;
  path?: string;
};
declare type LoggerTypes = 'done' | 'error' | 'warn';

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
  LoggerTraceReturns,
  LoggerTypes,
  Script,
  ScriptContext,
  Stopwatch,
};
