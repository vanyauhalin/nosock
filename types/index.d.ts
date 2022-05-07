declare type LoggerTypes = 'done' | 'error' | 'warn';

interface Script {
  <T extends unknown>(event: string, callback: ScriptCallback<T>): void;
  run(event?: string): Promise<unknown>;
}
declare type ScriptCallback<T> = (() => T) | (() => Promise<T>);
interface ScriptContext {
  rejected: Set<string>;
  running: Set<string>;
  scripts: Map<string, ScriptCallback<unknown>>;
}

interface Stopwatch {
  (): Stopwatch;
  lap(): string;
}
declare type TraceReturns = {
  message: string;
  path?: string;
};

export {
  LoggerTypes,
  Script,
  ScriptCallback,
  ScriptContext,
  Stopwatch,
  TraceReturns,
};
