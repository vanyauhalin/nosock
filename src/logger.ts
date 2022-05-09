import { stdout } from 'node:process';
import kleur from 'kleur';
import type { LoggerTraceReturns } from 'types';

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

const { format } = new Intl.DateTimeFormat('en-us', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
});
function prefix(): string {
  return `[${format(Date.now())}] `;
}

const DONE = `${kleur.green('done')} `;
const ERROR = kleur.red('error');
const WARN = `${kleur.yellow('warn')} `;
const TYPE_LENGTH = 5;
const DEFAULT_PADDING = `${' '.repeat(TYPE_LENGTH)} `;
const LONGER_PADDING = `${' '.repeat(prefix().length + TYPE_LENGTH)} `;

const log = (() => {
  function inner(type: string, message?: string): typeof log {
    function parse(): string {
      if (typeof message === 'string') {
        const trimmed = message.trim();
        return trimmed.length ? `${type} ${trimmed}` : type;
      }
      return `${DEFAULT_PADDING}${type}`;
    }
    stdout.write(`${prefix()}${parse()}\n`);
    return inner;
  }
  inner.done = (message: string) => {
    inner(DONE, message);
    return inner;
  };
  inner.empty = (message?: string) => {
    stdout.write(message ? `${message}\n` : '\n');
    return inner;
  };
  inner.error = (() => {
    function errorInner(message: string): typeof log {
      inner(ERROR, message);
      return inner;
    }
    errorInner.trace = (message: string) => {
      const traced = trace(new Error(message));
      inner(ERROR, `${traced.message}${traced.path
        ? `\n${LONGER_PADDING}${kleur.gray(traced.path)}`
        : ''}`);
      return inner;
    };
    return errorInner;
  })();
  inner.warn = (message: string) => {
    inner(WARN, message);
    return inner;
  };
  return inner;
})();

export {
  log,
};
