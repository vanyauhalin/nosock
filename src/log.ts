import { stdout } from 'node:process';
import kleur from 'kleur';
import type { Logger } from 'types';

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
  inner.done = (message: string) => {
    inner(DONE, message);
    return inner;
  };
  inner.empty = (message?: string) => {
    stdout.write(message ? `${message}\n` : '\n');
    return inner;
  };
  inner.error = (message: string) => {
    inner(ERROR, message);
    return inner;
  };
  inner.trace = () => {
    const err = new Error();
    if (!err.stack) return inner;
    const [,,, file] = err.stack.split('\n');
    if (!file) return inner;
    const matched = file.match(/file:\/\/(.+)/);
    if (!matched) return inner;
    const [, path] = matched;
    if (!path) return inner;
    inner.empty(`${LONGER_PADDING}${kleur.gray(path)}`);
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
