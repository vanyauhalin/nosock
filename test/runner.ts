import { test } from 'uvu';
import { is } from 'uvu/assert';
import { define } from '../lib/context';
import { run } from '../lib/runner';

test('is a asynchronous function', () => {
  const AsyncFunction = (async () => {}).constructor;
  is(run instanceof AsyncFunction, true);
});

test('adds a resolved script to the context', async () => {
  const script = {
    command: 'script',
    callback: () => 'script',
  };
  const context = define();
  await run(context, script);
  is(context.resolved[0], 'script');
});

test('adds nested resolved scripts to the context', async () => {
  const first = {
    command: 'first',
    callback: () => 'first',
  };
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const context = define();
  await run(context, first);
  await run(context, second);
  is(context.resolved[0], 'first');
  is(context.resolved[1], 'second');
});

test('adds a rejected script to the context', async () => {
  const script = {
    command: 'script',
    callback() { throw new Error('script'); },
  };
  const context = define();
  await run(context, script);
  is(context.rejected[0], 'script');
});

test('adds nested rejected scripts to the context', async () => {
  const first = {
    command: 'first',
    callback() { throw new Error('first'); },
  };
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const context = define();
  await run(context, first);
  await run(context, second);
  is(context.rejected[0], 'first');
  is(context.rejected[1], 'second');
});

test('returns a value from the resolved script', async () => {
  const script = {
    command: 'script',
    callback: () => 'script',
  };
  const context = define();
  const result = await run(context, script);
  is(result, 'script');
});

test('returns a values from the nested resolved scripts', async () => {
  const first = {
    command: 'first',
    callback: () => 'first',
  };
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const context = define();
  const firstValue = await run(context, first);
  const secondValue = await run(context, second);
  is(firstValue, 'first');
  is(secondValue, 'second');
});

test('returns undefined from the rejected script', async () => {
  const script = {
    command: 'script',
    callback() { throw new Error('script'); },
  };
  const context = define();
  const result = await run(context, script);
  is(result, undefined);
});

test('returns undefined from nested rejected scripts', async () => {
  const first = {
    command: 'first',
    callback() { throw new Error('first'); },
  };
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const context = define();
  const firstValue = await run(context, first);
  const secondValue = await run(context, second);
  is(firstValue, undefined);
  is(secondValue, undefined);
});

test.run();
