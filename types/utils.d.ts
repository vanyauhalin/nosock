interface Stopwatch {
  (): Stopwatch;
  lap(): string;
}
declare type TraceReturns = {
  message: string;
  path?: string;
};

export {
  Stopwatch,
  TraceReturns,
};
