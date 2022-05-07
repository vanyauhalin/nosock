/**
 * In this file, we can disable the rules below for better performance.
 * It's safe.
 */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

import kleur from 'kleur';
import type { LoggerTypes } from 'types';
import { time, trace } from './utils';

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

function prefix(): string {
  return `[${time()}] `;
}

const pd = {
  default: `${' '.repeat(max)} `,
  longer: `${' '.repeat(prefix().length + max)} `,
};

const log = (() => {
  function inner(type: string, message?: string): void {
    function parse(): string {
      if (typeof message === 'string') {
        const trimmed = message.trim();
        return trimmed.length ? `${type} ${trimmed}` : type;
      }
      return `${pd.default}${type}`;
    }
    process.stdout.write(`${prefix()}${parse()}\n`);
  }
  inner.done = (message: string) => {
    inner(colored.done, message);
  };
  inner.empty = (message?: string) => {
    process.stdout.write(message ? `${message}\n` : '\n');
  };
  inner.error = (() => {
    function errorInner(message: string): void {
      inner(colored.error, message);
    }
    errorInner.trace = (message: string) => {
      const traced = trace(new Error(message));
      inner(colored.error, `${traced.message}${traced.path
        ? `\n${pd.longer}${kleur.gray(traced.path)}`
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
