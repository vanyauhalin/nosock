import { spawnSync } from 'node:child_process';
import kleur from 'kleur';
import { suite } from 'uvu';
import { equal, is, type } from 'uvu/assert';
import * as logger from '../lib/logger';

function stringify(value: string): string {
  return JSON.stringify(value).replace(/"/g, '');
}

function spawnErrorOutput(code: string): string {
  return stringify(spawnSync('node', [
    '-e', `const { log } = require("./lib/logger"); ${code};`,
  ]).stderr.toString());
}

function spawnOutput(code: string): string {
  return stringify(spawnSync('node', [
    '-e', `const { log } = require("./lib/logger"); ${code};`,
  ]).stdout.toString());
}

const injections = (() => {
  const single: [string, (value: string) => string][] = [
    ['%a', (value) => stringify(kleur.magenta(value))],
    ['%aa', (value) => stringify(kleur.yellow(value))],
    ['%an', (value) => stringify(kleur.red(value))],
    ['%ap', (value) => stringify(kleur.green(value))],
    ['%p', (value) => stringify(kleur.blue(value))],
  ];
  const multiply = {
    colorize: (value: string) => single
      .map(([, colorize]) => colorize(value))
      .join(''),
    flags: single
      .map(([flag]) => flag)
      .join(''),
    repeat: (value: string) => `"${value}", `
      .repeat(single.length)
      .slice(0, -2),
  };
  return { single, multiply };
})();

// ---

const log = suite('log');

log('is a function', () => {
  type(logger.log, 'function');
});

log('returns log instance', () => {
  equal(logger.log('b'), logger.log);
});

log('writes a time prefix', () => {
  const output = spawnOutput('log("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] {7}b\\n$/;
  is(pattern.test(output), true);
});

for (const [flag, colorize] of injections.single) {
  log(`writes the ${flag} injection`, () => {
    const colored = colorize('b');
    const output = spawnOutput(`log("${flag}", "b")`);
    const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] {7}\S*\\n$/;
    is(pattern.test(output), true);
    is(output.includes(colored), true);
  });
}

log('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  const colored = colorize('b');
  const output = spawnOutput(`log("${flags}", ${repeat('b')})`);
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] {7}\S*\\n$/;
  is(pattern.test(output), true);
  is(output.includes(colored), true);
});

log.run();

// ---

const done = suite('log.done');

done('is a function', () => {
  type(logger.log.done, 'function');
});

done('returns log instance', () => {
  equal(logger.log.done('b'), logger.log);
});

done('writes a time prefix', () => {
  const output = spawnOutput('log.done("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*done\S* {2}b\\n$/;
  is(pattern.test(output), true);
});

done('writes the type', () => {
  const typed = stringify(kleur.green('done'));
  const output = spawnOutput('log.done("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*done\S* {2}b\\n$/;
  is(pattern.test(output), true);
  is(output.includes(typed), true);
});

for (const [flag, colorize] of injections.single) {
  done(`writes the ${flag} injection`, () => {
    const typed = stringify(kleur.green('done'));
    const colored = colorize('b');
    const output = spawnOutput(`log.done("${flag}", "b")`);
    const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*done\S* {2}\S*\\n$/;
    is(pattern.test(output), true);
    is(output.includes(colored), true);
    is(output.includes(typed), true);
  });
}

done('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  const typed = stringify(kleur.green('done'));
  const colored = colorize('b');
  const output = spawnOutput(`log.done("${flags}", ${repeat('b')})`);
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*done\S* {2}\S*\\n$/;
  is(pattern.test(output), true);
  is(output.includes(colored), true);
  is(output.includes(typed), true);
});

done.run();

// ---

const empty = suite('log.empty');

empty('is a function', () => {
  type(logger.log.empty, 'function');
});

empty('returns log instance', () => {
  equal(logger.log.empty('b'), logger.log);
});

empty('writes only a new line', () => {
  const output = spawnOutput('log.empty()');
  const pattern = /^\\n$/;
  is(pattern.test(output), true);
});

empty('writes the message', () => {
  const output = spawnOutput('log.empty("b")');
  const pattern = /^b\\n$/;
  is(pattern.test(output), true);
});

for (const [flag, colorize] of injections.single) {
  empty(`writes the ${flag} injection`, () => {
    const colored = colorize('b');
    const output = spawnOutput(`log.empty("${flag}", "b")`);
    const pattern = /^\S*\\n$/;
    is(pattern.test(output), true);
    is(output.includes(colored), true);
  });
}

empty('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  const colored = colorize('b');
  const output = spawnOutput(`log.empty("${flags}", ${repeat('b')})`);
  const pattern = /^\S*\\n$/;
  is(pattern.test(output), true);
  is(output.includes(colored), true);
});

empty.run();

// ---

const error = suite('log.error');

error('is a function', () => {
  type(logger.log.error, 'function');
});

error('returns log instance', () => {
  equal(logger.log.error('b'), logger.log);
});

error('writes a time prefix', () => {
  const output = spawnErrorOutput('log.error("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*error\S* b\\n$/;
  is(pattern.test(output), true);
});

error('writes the type', () => {
  const typed = stringify(kleur.red('error'));
  const output = spawnErrorOutput('log.error("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*error\S* b\\n$/;
  is(pattern.test(output), true);
  is(output.includes(typed), true);
});

for (const [flag, colorize] of injections.single) {
  error(`writes the ${flag} injection`, () => {
    const typed = stringify(kleur.red('error'));
    const colored = colorize('b');
    const output = spawnErrorOutput(`log.error("${flag}", "b")`);
    const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*error\S* \S*\\n$/;
    is(pattern.test(output), true);
    is(output.includes(colored), true);
    is(output.includes(typed), true);
  });
}

error('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  const typed = stringify(kleur.red('error'));
  const colored = colorize('b');
  const output = spawnErrorOutput(`log.error("${flags}", ${repeat('b')})`);
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*error\S* \S*\\n$/;
  is(pattern.test(output), true);
  is(output.includes(colored), true);
  is(output.includes(typed), true);
});

error.run();

// ---

const warn = suite('log.warn');

warn('is a function', () => {
  type(logger.log.warn, 'function');
});

warn('returns log instance', () => {
  equal(logger.log.warn('b'), logger.log);
});

warn('writes a time prefix', () => {
  const output = spawnOutput('log.warn("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*warn\S* {2}b\\n$/;
  is(pattern.test(output), true);
});

warn('writes the type', () => {
  const typed = stringify(kleur.yellow('warn'));
  const output = spawnOutput('log.warn("b")');
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*warn\S* {2}b\\n$/;
  is(pattern.test(output), true);
  is(output.includes(typed), true);
});

for (const [flag, colorize] of injections.single) {
  warn(`writes the ${flag} injection`, () => {
    const typed = stringify(kleur.yellow('warn'));
    const colored = colorize('b');
    const output = spawnOutput(`log.warn("${flag}", "b")`);
    const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*warn\S* {2}\S*\\n$/;
    is(pattern.test(output), true);
    is(output.includes(colored), true);
    is(output.includes(typed), true);
  });
}

warn('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  const typed = stringify(kleur.yellow('warn'));
  const colored = colorize('b');
  const output = spawnOutput(`log.warn("${flags}", ${repeat('b')})`);
  const pattern = /^\[\d{2}:\d{2}:\d{2}\.\d{3}] \S*warn\S* {2}\S*\\n$/;
  is(pattern.test(output), true);
  is(output.includes(colored), true);
  is(output.includes(typed), true);
});

warn.run();
