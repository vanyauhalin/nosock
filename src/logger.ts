import kleur from 'kleur';
import type { LoggerTraceReturns, LoggerTypes } from 'types';

const formatter = new Intl.DateTimeFormat('en-us', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
});
function prefix(): string {
  return `[${formatter.format(Date.now())}] `;
}

function trace(error: Error): LoggerTraceReturns {
  function done(path?: string): LoggerTraceReturns {
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

const map: Record<LoggerTypes, keyof kleur.Kleur> = {
  done: 'green',
  error: 'red',
  warn: 'yellow',
};

const max = (() => {
  const lengths = [];
  for (const key in map) lengths.push(key.length);
  return Math.max.apply(null, lengths);
})();

const colored = {} as Record<LoggerTypes, string>;
for (const key in map) {
  const type = key as LoggerTypes;
  colored[type] = kleur[map[type]](type.length === max
    ? type
    : type.padEnd(max, ' '));
}

const pd = {
  default: `${' '.repeat(max)} `,
  longer: `${' '.repeat(prefix().length + max)} `,
};

const log = (() => {
  function inner(type: string, message?: string): typeof log {
    function parse(): string {
      if (typeof message === 'string') {
        const trimmed = message.trim();
        return trimmed.length ? `${type} ${trimmed}` : type;
      }
      return `${pd.default}${type}`;
    }
    process.stdout.write(`${prefix()}${parse()}\n`);
    return inner;
  }
  inner.done = (message: string) => {
    inner(colored.done, message);
    return inner;
  };
  inner.empty = (message?: string) => {
    process.stdout.write(message ? `${message}\n` : '\n');
    return inner;
  };
  inner.error = (() => {
    function errorInner(message: string): typeof log {
      inner(colored.error, message);
      return inner;
    }
    errorInner.trace = (message: string) => {
      const traced = trace(new Error(message));
      inner(colored.error, `${traced.message}${traced.path
        ? `\n${pd.longer}${kleur.gray(traced.path)}`
        : ''}`);
      return inner;
    };
    return errorInner;
  })();
  inner.warn = (message: string) => {
    inner(colored.warn, message);
    return inner;
  };
  return inner;
})();

export {
  log,
};
