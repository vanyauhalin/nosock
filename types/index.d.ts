declare type LoggerTraceReturns = {
  message: string;
  path?: string;
};
declare type LoggerTypes = 'done' | 'error' | 'warn';

interface Script {
  <T extends unknown>(
    cmd: string,
    callback: (() => T) | (() => Promise<T>),
  ): void;
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
