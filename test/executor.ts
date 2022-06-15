import { env } from 'node:process';
import { test } from 'uvu';
import {
  equal,
  instance,
  match,
  type,
  unreachable,
} from 'uvu/assert';
import { define as defineContext } from '../src/context';
import { define as defineExecutor } from '../src/executor';

test('defines via function', () => {
  type(defineExecutor, 'function');
});

test('defines as a function', () => {
  const context = defineContext();
  type(defineExecutor(context), 'function');
});

test('executes a run command', async () => {
  env['npm_lifecycle_event'] = 'some';
  const context = defineContext();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  const executor = defineExecutor(context);
  await executor();
});

test('merges the passed options with context options', async () => {
  env['npm_lifecycle_event'] = 'some';
  const context = defineContext();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  const executor = defineExecutor(context);
  await executor({
    cwd: '/lib',
    file: '/lib/index.js',
    noCancel: true,
    noColor: true,
    require: ['tsm'],
  });
  equal(context.options, {
    cwd: '/lib',
    file: '/lib/index.js',
    noCancel: true,
    noColor: true,
    require: ['tsm'],
  });
});

test('throws an error if scripts is missing', async () => {
  const context = defineContext();
  const executor = defineExecutor(context);
  try {
    await executor();
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Missing scripts');
  }
});

test('throws an error if a run command is missing', async () => {
  delete env['npm_lifecycle_event'];
  const context = defineContext();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  const executor = defineExecutor(context);
  try {
    await executor();
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Missing a run command');
  }
});

test('throws an error if a script is not described', async () => {
  env['npm_lifecycle_event'] = 'first';
  const context = defineContext();
  context.store['second'] = {
    command: 'second',
    callback: () => 'second',
  };
  const executor = defineExecutor(context);
  try {
    await executor();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'The first is not described');
  }
});

test.run();
