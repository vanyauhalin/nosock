import { stderr, stdout } from 'node:process';
import kleur from 'kleur';
import { suite } from 'uvu';
import { equal, is, type } from 'uvu/assert';
import * as logger from '../lib/logger';

function stringify(value: string): string {
  return JSON.stringify(value).replace(/"/g, '');
}
function wrest(value: string): string {
  return stringify(value).replace(/\\/g, '\\\\').replace(/\[/g, '\\[');
}

const types = {
  done: wrest(kleur.green('done')),
  error: wrest(kleur.red('error')),
  warn: wrest(kleur.yellow('warn')),
};
const injections = (() => {
  const single: [string, (value: string) => string][] = [
    ['%a', (value) => wrest(kleur.magenta(value))],
    ['%aa', (value) => wrest(kleur.yellow(value))],
    ['%an', (value) => wrest(kleur.red(value))],
    ['%ap', (value) => wrest(kleur.green(value))],
    ['%p', (value) => wrest(kleur.blue(value))],
  ];
  const multiply = {
    colorize: (value: string) => single.map(([, cl]) => cl(value)).join(''),
    flags: single.map(([flag]) => flag).join(''),
    repeat: (value: string) => value.repeat(single.length),
  };
  return { single, multiply };
})();

let output = '';
function reset(): void {
  output = '';
}
function actual(): string {
  return output;
}
function update(chunk: string | Uint8Array): void {
  if (typeof chunk === 'string') output = stringify(chunk);
}
const originalStdout = process.stdout.write.bind(process.stdout);
stdout.write = (chunk) => {
  update(chunk);
  return originalStdout(chunk);
};
const originalStderr = process.stderr.write.bind(process.stdout);
stderr.write = (chunk) => {
  update(chunk);
  return originalStderr(chunk);
};

// ---

const log = suite('log');
log.before.each(reset);

log('is a function', () => {
  type(logger.log, 'function');
});

log('returns log instance', () => {
  equal(logger.log('b'), logger.log);
});

log('writes a time prefix', () => {
  logger.log('b');
  const regexp = /^\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?] {7}b\\n$/;
  is(regexp.test(actual()), true);
});

for (const [flag, colorize] of injections.single) {
  log(`writes ${flag} injection`, () => {
    logger.log(flag, 'b');
    const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] {7}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
    is(regexp.test(actual()), true);
  });
}

log('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  logger.log(flags, ...repeat('b'));
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] {7}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

log.run();

// ---

const done = suite('log.done');
done.before.each(reset);

done('is a function', () => {
  type(logger.log.done, 'function');
});

done('returns log instance', () => {
  equal(logger.log.done('b'), logger.log);
});

done('writes a time prefix with type', () => {
  logger.log.done('b');
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.done} {2}b(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

for (const [flag, colorize] of injections.single) {
  done(`writes ${flag} injection`, () => {
    logger.log.done(flag, 'b');
    const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.done} {2}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
    is(regexp.test(actual()), true);
  });
}

done('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  logger.log.done(flags, ...repeat('b'));
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.done} {2}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

done.run();

// ---

const empty = suite('log.empty');
empty.before.each(reset);

empty('is a function', () => {
  type(logger.log.empty, 'function');
});

empty('returns log instance', () => {
  equal(logger.log.empty('b'), logger.log);
});

empty('writes only a new line', () => {
  logger.log.empty();
  const regexp = /^(?:\\r\\n|\\r|\\n)$/;
  is(regexp.test(actual()), true);
});

empty('writes a message', () => {
  logger.log.empty('b');
  const regexp = /^b(?:\\r\\n|\\r|\\n)$/;
  is(regexp.test(actual()), true);
});

for (const [flag, colorize] of injections.single) {
  empty(`writes ${flag} injection`, () => {
    logger.log.empty(flag, 'b');
    const regexp = new RegExp(`^${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
    is(regexp.test(actual()), true);
  });
}

empty('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  logger.log.empty(flags, ...repeat('b'));
  const regexp = new RegExp(`^${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

empty.run();

// ---

const error = suite('log.error');
error.before.each(reset);

error('is a function', () => {
  type(logger.log.error, 'function');
});

error('returns log instance', () => {
  equal(logger.log.error('b'), logger.log);
});

error('writes a time prefix with type', () => {
  logger.log.error('b');
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.error} b(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

for (const [flag, colorize] of injections.single) {
  error(`writes ${flag} injection`, () => {
    logger.log.error(flag, 'b');
    const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.error} ${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
    is(regexp.test(actual()), true);
  });
}

error('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  logger.log.error(flags, ...repeat('b'));
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.error} ${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

error.run();

// ---

const warn = suite('log.warn');
warn.before.each(reset);

warn('is a function', () => {
  type(logger.log.warn, 'function');
});

warn('returns log instance', () => {
  equal(logger.log.warn('b'), logger.log);
});

warn('writes a time prefix with type', () => {
  logger.log.warn('b');
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.warn} {2}b(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

for (const [flag, colorize] of injections.single) {
  warn(`writes ${flag} injection`, () => {
    logger.log.warn(flag, 'b');
    const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.warn} {2}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
    is(regexp.test(actual()), true);
  });
}

warn('writes multiply injections', () => {
  const { colorize, flags, repeat } = injections.multiply;
  logger.log.warn(flags, ...repeat('b'));
  const regexp = new RegExp(`^\\[\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{3})?] ${types.warn} {2}${colorize('b')}(?:\\\\r\\\\n|\\\\r|\\\\n)$`);
  is(regexp.test(actual()), true);
});

warn.run();
