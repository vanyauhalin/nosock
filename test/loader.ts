import { cwd } from 'node:process';
import { test } from 'uvu';
import {
  instance,
  is,
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
    cwd: 'lib',
    file: 'index.js',
    require: [],
  });
});

test('requires modules', async () => {
  await load({
    cwd: 'src',
    file: 'index.ts',
    require: ['tsm'],
  });
});

test('throws an error if a scripts file not found', async () => {
  try {
    await load({
      cwd: '..',
      require: [],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Scripts file not found');
  }
});

test('throws an error if a scripts file not exist', async () => {
  try {
    await load({
      cwd: '.',
      file: 'not-a-file.js',
      require: [],
    });
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Scripts file not exists');
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
    match((error as Error).message, 'Cannot fine module \'not-a-module\'');
  }
});

test('returns a scripts file', async () => {
  const file = await load({
    cwd: 'lib',
    file: 'index.js',
    require: [],
  });
  is(file, `${cwd()}/lib/index.js`);
});

test.run();
