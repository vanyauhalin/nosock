import { join } from 'node:path';
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

test('loads a scripts file with modules', async () => {
  const loaded = await load({
    cwd: 'test/reference',
    require: ['tsm'],
  });
  equal(loaded, {
    cwd: join(cwd(), 'test', 'reference'),
    file: join(cwd(), 'test', 'reference', 'scripts.js'),
    require: ['tsm'],
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

test.run();
