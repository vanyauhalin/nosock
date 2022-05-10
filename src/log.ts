import { stdout } from 'node:process';
import {
  gray,
  green,
  red,
  yellow,
} from 'kleur';
import type { Logger } from 'types';

function trace(error: Error): {
  message: string;
  path?: string;
} {
  function done(path?: string): ReturnType<typeof trace> {
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

const DONE = `${green('done')} `;
const ERROR = red('error');
const WARN = `${yellow('warn')} `;
const TYPE_LENGTH = 5;
const DEFAULT_PADDING = `${' '.repeat(TYPE_LENGTH)} `;
const LONGER_PADDING = `${' '.repeat(prefix().length + TYPE_LENGTH)} `;

const log = (() => {
  function inner(type: string, message?: string): Logger {
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
  inner.error = (() => {
    function errorInner(message: string): Logger {
      inner(ERROR, message);
      return inner;
    }
    errorInner.trace = (message: string) => {
      const traced = trace(new Error(message));
      inner(ERROR, `${traced.message}${traced.path
        ? `\n${LONGER_PADDING}${gray(traced.path)}`
        : ''}`);
      return inner;
    };
    return errorInner;
  })();
  inner.done = (message: string) => {
    inner(DONE, message);
    return inner;
  };
  inner.empty = (message?: string) => {
    stdout.write(message ? `${message}\n` : '\n');
    return inner;
  };
  inner.warn = (message: string) => {
    inner(WARN, message);
    return inner;
  };
  return inner;
})();

export {
  log,
};