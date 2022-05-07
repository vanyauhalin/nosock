import type { Stopwatch, TraceReturns } from 'types';

const AsyncConstructor = (async () => {}).constructor;
function isAsync(fn: unknown, returns: unknown): boolean {
  return !!(fn instanceof AsyncConstructor
    || (typeof fn === 'function'
      && !!(typeof returns === 'object'
        && typeof (returns as Record<string, unknown>)['then']
          === 'function')));
}

function pd(number: number): string {
  return `${' '.repeat(number)} `;
}

function stopwatch(): Stopwatch {
  let start: number;
  function inner(): Stopwatch {
    start = Date.now();
    return inner;
  }
  inner.lap = () => `${(Date.now() - start).toFixed(2)}ms`;
  return inner();
}

const formatter = new Intl.DateTimeFormat('en-us', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
  timeZone: 'UTC',
});
function time(): string {
  return formatter.format(Date.now());
}

function trace(error: Error): TraceReturns {
  function done(path?: string): TraceReturns {
    return {
      ...path ? { path } : {},
      message: error.message,
    };
  }
  if (!error.stack) return done();
  const [,,,, file] = error.stack.split('\n');
  if (!file) return done();
  const matched = file.match(/file:\/\/(.+)/);
  if (!matched) return done();
  const [, path] = matched;
  if (!path) return done();
  return done(path);
}

export {
  isAsync,
  pd,
  stopwatch,
  time,
  trace,
};
