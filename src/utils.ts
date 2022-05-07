import { env, hrtime } from 'node:process';
import type { Stopwatch, TraceReturns } from 'types';

function extractCommands(): string[] {
  const commands = [];
  for (const key in env) {
    if (/^npm_package_scripts_.+/.test(key)) {
      commands.push(key
        .replace(/^npm_package_scripts_/, '')
        .replace(/_/g, '-'));
    }
  }
  return commands;
}

function stopwatch(): Stopwatch {
  let start: number;
  function inner(): Stopwatch {
    start = Number(hrtime.bigint());
    return inner;
  }
  inner.lap = () => `${((Number(hrtime.bigint()) - start) / 1e6).toFixed(2)}ms`;
  return inner();
}

const formatter = new Intl.DateTimeFormat('en-us', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
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
  extractCommands,
  stopwatch,
  time,
  trace,
};
