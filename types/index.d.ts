declare type LoggerTypes = 'done' | 'error' | 'warn';

interface Script {
  <T extends unknown>(event: string, callback: ScriptCallback<T>): void;
  run(event?: string): Promise<unknown>;
}
declare type ScriptCallback<T> = (() => T) | (() => Promise<T>);

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
  Stopwatch,
  TraceReturns,
};
