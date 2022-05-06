/* eslint-disable no-console */
import kleur from 'kleur';
import type { Logger, Types } from 'types/logger';
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
}), {} as Record<Types, string>);
const colored = (Object.entries(map) as [Types, keyof kleur.Kleur][])
  .reduce((acc, [type, color]) => ({
    ...acc,
    [type]: kleur[color](raw[type]),
  }), {} as Record<Types, string>);

function create(): Logger {
  function inner(type: string, message?: string): void {
    console.log(`${prefix()}${message
      ? `${type} ${message}`
      : `${pd(max)}${type}`}`);
  }
  inner.done = (message: string) => {
    inner(colored.done, message);
  };
  inner.empty = () => {
    console.log();
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
}

export {
  create,
};
