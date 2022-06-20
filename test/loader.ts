import { cwd } from 'node:process';
import { test } from 'uvu';
import {
  equal,
  instance,
  match,
  type,
  unreachable,
} from 'uvu/assert';
import { load } from '../lib/loader';

test('is a function', () => {
  type(load, 'function');
});

test('founds a scripts file', async () => {
  try {
    await load({
      cwd: '.',
      require: [],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, `${cwd()}/scripts.ts`);
  }
});

test('resolves a scripts file', async () => {
  await load({
    cwd: 'test/reference',
    require: [],
  });
});

test('throws an error if a scripts file not found', async () => {
  try {
    await load({
      cwd: 'test',
      require: [],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Scripts file not found');
  }
});

test('requires modules', async () => {
  await load({
    cwd: 'test/reference',
    require: ['tsm'],
  });
});

test('throws an error if a module is not found', async () => {
  try {
    await load({
      cwd: 'test/reference',
      require: ['not-a-module'],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Cannot fine module "not-a-module"');
  }
});

test('returns a loaded options', async () => {
  const loaded = await load({
    cwd: 'test/reference',
    require: ['tsm'],
  });
  equal(loaded, {
    cwd: `${cwd()}/test/reference`,
    file: `${cwd()}/test/reference/scripts.js`,
    require: ['tsm'],
  });
});

test.run();
