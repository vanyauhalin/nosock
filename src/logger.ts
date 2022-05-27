import { stdout } from 'node:process';
import kleur from 'kleur';

const DONE = `${kleur.green('done')}  `;
const ERROR = `${kleur.red('error')} `;
const WARN = `${kleur.yellow('warn')}  `;
const SHADOW = kleur.gray;
const ACCENT = kleur.blue;
const SHORT = '     ';
const LONG = '             ';
const DATE = new Intl.DateTimeFormat('en-us', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  fractionalSecondDigits: 3,
  hour12: false,
});

function prefix(): string {
  return `[${DATE.format(Date.now())}] `;
}

interface Logger {
  (message: string): Logger;
  done(message: string): Logger;
  empty(): Logger;
  error(message: string): Logger;
  note(message: string): Logger;
  trace(error: Error): Logger;
  warn(message: string): Logger;
}

const log: Logger = (() => {
  function inner(message: string): Logger {
    stdout.write(`${prefix()}${SHORT}${message}\n`);
    return inner;
  }
  inner.done = (message: string) => {
    stdout.write(`${prefix()}${DONE}${message}\n`);
    return inner;
  };
  inner.empty = () => {
    stdout.write('\n');
    return inner;
  };
  inner.error = (message: string) => {
    stdout.write(`${prefix()}${ERROR}${message}\n`);
    return inner;
  };
  inner.note = (message: string) => {
    stdout.write(`${LONG}${SHADOW(message)}\n`);
    return inner;
  };
  inner.trace = (error: Error) => {
    if (!error.stack) return inner;
    const [, file] = error.stack.split('\n');
    if (!file) return inner;
    const matched = file.match(/file:\/\/(.+:\d*:\d*)/);
    if (!matched) return inner;
    const [, path] = matched;
    if (!path) return inner;
    return inner.note(path);
  };
  inner.warn = (message: string) => {
    stdout.write(`${prefix()}${WARN}${message}\n`);
    return inner;
  };
  return inner;
})();

export {
  ACCENT,
  log,
};
