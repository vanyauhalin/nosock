import { argv, env } from 'node:process';
import { test } from 'uvu';
import {
  instance,
  match,
  type,
  unreachable,
} from 'uvu/assert';
import { define } from '../lib/context';
import { exec } from '../lib/executor';

test('is a function', () => {
  type(exec, 'function');
});

test('throws an error if scripts is missing', async () => {
  const context = define();
  try {
    await exec(context);
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Missing scripts');
  }
});

// ---

test('executes a command from env', async () => {
  const saved = env['npm_lifecycle_event'];
  env['npm_lifecycle_event'] = 'some';
  const context = define();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  await exec(context);
  env['npm_lifecycle_event'] = saved;
});

test('throws an error if a command from env is not described', async () => {
  const saved = env['npm_lifecycle_event'];
  env['npm_lifecycle_event'] = 'first';
  const context = define();
  context.store['second'] = {
    command: 'second',
    callback: () => 'second',
  };
  try {
    await exec(context);
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'The "first" is not described');
  }
  env['npm_lifecycle_event'] = saved;
});

// ---

test('executes a command from argv', async () => {
  const saved = env['npm_lifecycle_event'];
  delete env['npm_lifecycle_event'];
  argv.push('some');
  const context = define();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  await exec(context);
  env['npm_lifecycle_event'] = saved;
  argv.pop();
});

test('throws an error if a command from argv is not described', async () => {
  const saved = env['npm_lifecycle_event'];
  delete env['npm_lifecycle_event'];
  argv.push('first');
  const context = define();
  context.store['second'] = {
    command: 'second',
    callback: () => 'second',
  };
  try {
    await exec(context);
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'The "first" is not described');
  }
  env['npm_lifecycle_event'] = saved;
  argv.pop();
});

// ---

test('throws an error if a command is missing', async () => {
  const savedEnvironment = env['npm_lifecycle_event'];
  const savedArguments = argv;
  delete env['npm_lifecycle_event'];
  process.argv = [];
  const context = define();
  context.store['some'] = {
    command: 'some',
    callback: () => 'some',
  };
  try {
    await exec(context);
    unreachable();
  } catch (error) {
    instance(error, Error);
    match((error as Error).message, 'Missing a run command');
  }
  env['npm_lifecycle_event'] = savedEnvironment;
  process.argv = savedArguments;
});

test.run();
