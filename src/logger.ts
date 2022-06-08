import { stderr, stdout } from 'node:process';
import kleur from 'kleur';

const ACCENT = kleur.magenta;
const ACCENT_ATTENTION = kleur.yellow;
const ACCENT_NEGATIVE = kleur.red;
const ACCENT_POSITIVE = kleur.green;
const PRIMARY = kleur.blue;
const DONE = `${ACCENT_POSITIVE('done')}  `;
const ERROR = `${ACCENT_NEGATIVE('error')} `;
const WARN = `${ACCENT_ATTENTION('warn')}  `;
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

function inject(body: string, values: string[]): string {
  if (values.length === 0) return body;
  const matched = body.match(/(%\w{2})|(%\w)/g);
  if (!matched) return body;
  let injected = body;
  for (const flag of matched) {
    const value = values.shift();
    if (!value) break;
    let modifier;
    switch (flag) {
      case '%a': modifier = ACCENT; break;
      case '%aa': modifier = ACCENT_ATTENTION; break;
      case '%an': modifier = ACCENT_NEGATIVE; break;
      case '%ap': modifier = ACCENT_POSITIVE; break;
      case '%p': modifier = PRIMARY; break;
      default: break;
    }
    if (modifier) injected = injected.replace(flag, modifier(value));
  }
  return injected;
}

interface Logger {
  (this: void, message: string, ...values: string[]): Logger;
  done(this: void, message: string, ...values: string[]): Logger;
  error(this: void, message: string, ...values: string[]): Logger;
  warn(this: void, message: string, ...values: string[]): Logger;
}

const log: Logger = (() => {
  function inner(message: string, ...values: string[]): Logger {
    stdout.write(`${prefix()}${SHORT}${inject(message, values)}\n`);
    return inner;
  }
  inner.done = (message: string, ...values: string[]) => {
    stdout.write(`${prefix()}${DONE}${inject(message, values)}\n`);
    return inner;
  };
  inner.error = (message: string, ...values: string[]) => {
    stderr.write(align(`${prefix()}${ERROR}`, inject(message, values)));
    return inner;
  };
  inner.warn = (message: string, ...values: string[]) => {
    stdout.write(`${prefix()}${WARN}${inject(message, values)}\n`);
    return inner;
  };
  return inner;
})();

export { log };
