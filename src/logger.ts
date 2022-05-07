import kleur from 'kleur';
import type { LoggerTypes } from 'types';
import { pd, time, trace } from './utils';

const prefix = (() => {
  function inner(): string {
    return `[${time()}] `;
  }
  inner.len = inner().length;
  return inner;
})();
const map = {
  done: 'green',
  error: 'red',
  warn: 'yellow',
};
const max = Math.max.apply(null, Object.keys(map).map((type) => type.length));
const raw = Object.keys(map).reduce((acc, type) => ({
  ...acc,
  [type]: type.length === max ? type : type.padEnd(max, ' '),
}), {} as Record<LoggerTypes, string>);
const colored = (Object.entries(map) as [LoggerTypes, keyof kleur.Kleur][])
  .reduce((acc, [type, color]) => ({
    ...acc,
    [type]: kleur[color](raw[type]),
  }), {} as Record<LoggerTypes, string>);

const log = (() => {
  function inner(type: string, message?: string): void {
    function parse(): string {
      if (typeof message === 'string') {
        const trimmed = message.trim();
        return trimmed.length ? `${type} ${trimmed}` : type;
      }
      return `${pd(max)}${type}`;
    }
    process.stdout.write(`${prefix()}${parse()}\n`);
  }
  inner.done = (message: string) => {
    inner(colored.done, message);
  };
  inner.empty = () => {
    process.stdout.write('\n');
  };
  inner.error = (() => {
    function errorInner(message: string): void {
      inner(colored.error, message);
    }
    errorInner.trace = (message: string) => {
      const traced = trace(new Error(message));
      inner(colored.error, `${traced.message}${traced.path
        ? `\n${pd(prefix.len + max)}${kleur.gray(traced.path)}`
        : ''}`);
    };
    return errorInner;
  })();
  inner.warn = (message: string) => {
    inner(colored.warn, message);
  };
  return inner;
})();

export {
  log,
};
