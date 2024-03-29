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
    cwd: '.',
    require: ['uvu'],
  });
  equal(loaded, {
    cwd: cwd(),
    file: join(cwd(), 'scripts.ts'),
    require: ['uvu'],
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
      cwd: '.',
      require: ['not-a-module'],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Cannot fine module "not-a-module"');
  }
});

test.run();
