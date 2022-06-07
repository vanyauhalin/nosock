import { spawnSync } from 'node:child_process';
import kleur from 'kleur';
import type { Test } from 'uvu';
import { suite } from 'uvu';
import { is, type } from 'uvu/assert';
import * as logger from '../lib/logger';

const log = suite('log');
const done = suite('log.done');
const error = suite('log.error');
const note = suite('log.note');
const trace = suite('log.trace');
const warn = suite('log.warn');
const all = [log, done, error, note, trace, warn];

(() => {
  const methods: [Test, unknown][] = [
    [log, logger.log],
    [done, logger.log.done],
    [error, logger.log.error],
    [note, logger.log.note],
    [trace, logger.log.trace],
    [warn, logger.log.warn],
  ];
  for (const [test, instance] of methods) {
    test('is a function', () => {
      type(instance, 'function');
    });
  }
})();

function spawnIsEqual(code: string): boolean {
  return !!spawnSync('node', [
    '-e',
    // Takes out of uvu dependencies.
    `const { stdout } = require("node:process");
    const { dequal } = require("dequal");
    const { log } = require("./lib/logger");
    stdout.write(String(dequal(${code}, log)));`,
  ]).stdout.toString().split('\n').some(Boolean);
}

for (const test of all) {
  test('returns log instance', (context) => {
    const isEqual = spawnIsEqual(`${context.__suite__}(${context.__suite__
      .includes('trace') ? 'new Error("b")' : '"b"'})`);
    is(isEqual, true);
  });
}

function prefixize(pattern: string): RegExp {
  return new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}\\.\\d{3}] ${pattern}\\\\n$`);
}

function spawnOutput(code: string, isError = false): string {
  return JSON.stringify(spawnSync('node', [
    '-e',
    `const { log } = require("./lib/logger"); ${code};`,
  ])[isError ? 'stderr' : 'stdout'].toString()).replace(/"/g, '');
}

function colorize(color: keyof kleur.Kleur, value: string): string {
  return JSON.stringify(kleur[color](value))
    .replace(/"/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[');
}

const patterns: [Test, string, boolean?][] = [
  [log, '{7}'],
  [done, `${colorize('green', 'done')} {2}`],
  [error, `${colorize('red', 'error')} `, true],
  [warn, `${colorize('yellow', 'warn')} {2}`],
];

for (const [test, part, isError] of patterns) {
  test('matches the pattern containing a time prefix', (context) => {
    const output = spawnOutput(`${context.__suite__}("b")`, isError);
    const pattern = prefixize(`${part}b`);
    is(pattern.test(output), true);
  });
}

function lengthen(pattern: string): RegExp {
  return new RegExp(`^ {21}${pattern}\\\\n$`);
}

note('matches the pattern containing a long padding', (context) => {
  const output = spawnOutput(`${context.__suite__}("b")`);
  const colored = colorize('gray', 'b');
  const pattern = lengthen(colored);
  is(pattern.test(output), true);
});

(() => {
  const colored = colorize('gray', '%').replace('%', '\\/[^/]\\S+:\\d*:\\d*');
  const pattern = lengthen(colored);
  const errors: [string, string][] = [
    ['new', 'new Error("b")'],
    ['try-catch', `(() => {
      try {
        throw new Error('b');
      } catch (error) {
        return error;
      }
    })()`],
  ];
  for (const [name, body] of errors) {
    trace(
      `matches the pattern containing path to file from ${name} error`,
      (context) => {
        const output = spawnOutput(`${context.__suite__}(${body})`);
        is(pattern.test(output), true);
      },
    );
  }
})();

const injections: [string, keyof kleur.Kleur][] = [
  ['a', 'magenta'],
  ['aa', 'yellow'],
  ['an', 'red'],
  ['ap', 'green'],
  ['n', 'gray'],
  ['p', 'blue'],
];

for (const [flag, color] of injections) {
  const body = `("%${flag}", "b")`;
  const colored = colorize(color, 'b');
  for (const [test, part, isError] of patterns) {
    test(`matches the pattern containing the ${flag} injection`, (context) => {
      const output = spawnOutput(`${context.__suite__}${body}`, isError);
      const pattern = prefixize(`${part}${colored}`);
      is(pattern.test(output), true);
    });
  }
}

(() => {
  const values = '"b", '.repeat(injections.length).slice(0, -2);
  const message = injections.map(([flag]) => `%${flag}`).join(' ');
  const body = `("${message}", ${values})`;
  const colored = injections.map(([, color]) => colorize(color, 'b')).join(' ');
  for (const [test, part, isError] of patterns) {
    test(
      'matches the pattern containing multiply color injections',
      (context) => {
        const output = spawnOutput(`${context.__suite__}${body}`, isError);
        const pattern = prefixize(`${part}${colored}`);
        is(pattern.test(output), true);
      },
    );
  }
})();

for (const test of all) test.run();
