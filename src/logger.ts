import { stderr, stdout } from 'node:process';
import kleur from 'kleur';

const ACCENT = kleur.blue;
const SHADOW = kleur.gray;
const DONE = `${kleur.green('done')}  `;
const ERROR = `${kleur.red('error')} `;
const WARN = `${kleur.yellow('warn')}  `;
const SHORT = '      ';
const LONG = `               ${SHORT}`;
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

function align(head: string, body: string): string {
  if (!body.includes('\n')) return `${head}${body}\n`;
  const [first, ...other] = body.split('\n');
  if (!first) return `${head}${body}\n`;
  let aligned = `${head}${first}\n`;
  for (const line of other) aligned += `${LONG}${line}\n`;
  return aligned;
}

interface Logger {
  (message: string): Logger;
  done(message: string): Logger;
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
  inner.error = (message: string) => {
    stderr.write(align(`${prefix()}${ERROR}`, message));
    return inner;
  };
  inner.note = (message: string) => {
    stdout.write(`${LONG}${SHADOW(message)}\n`);
    return inner;
  };
  inner.trace = (error: Error) => {
    if (!error.stack) return inner;
    const [, ...positions] = error.stack.split('\n');
    for (const position of positions) {
      const matched = position.match(/\/[^/]\S+:\d*:\d*/);
      if (matched) {
        const [path] = matched;
        if (path) return inner.note(path);
      }
    }
    return inner;
  };
  inner.warn = (message: string) => {
    stdout.write(`${prefix()}${WARN}${message}\n`);
    return inner;
  };
  return inner;
})();

export { ACCENT, log };
