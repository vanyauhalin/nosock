import { test } from 'uvu';
import { is, match } from 'uvu/assert';
import type { HistoryEvent } from '../lib/context';
import { define } from '../lib/context';
import { run } from '../lib/runner';
import { deepener } from '../lib/utils';

test('is a asynchronous function', () => {
  const AsyncFunction = (async () => {}).constructor;
  is(run instanceof AsyncFunction, true);
});

// ---

test('resolves a script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  const result = await run(context, script);
  is(context.state.depth, 0);
  is(context.state.hasError, false);
  is(result, 'some');
});

test('rejects a script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  const result = await run(context, script);
  is(context.state.depth, 0);
  is(context.state.hasError, true);
  is(result, undefined);
});

// ---

test('resolves an event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  is(event.command, 'some');
  match(event.duration || '', 'ms');
  is(event.type, 'done');
});

test('rejects an event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  is(event.command, 'some');
  match(event.duration || '', 'ms');
  is(event.type, 'error');
  is(event.error?.message, 'some');
});

// ---

test('resolves a script with sequential events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback: () => 'child',
  };
  const parent = {
    command: 'parent',
    async callback() {
      await run(context, child);
      await run(context, pet);
    },
  };
  await run(context, parent);
  is(context.state.depth, 0);
  is(context.state.hasError, false);
});

test('rejects a script with sequential events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await run(context, child);
      await run(context, pet);
    },
  };
  await run(context, parent);
  is(context.state.depth, 0);
  is(context.state.hasError, true);
});

// ---

test('resolves a sequential events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback: () => 'child',
  };
  const parent = {
    command: 'parent',
    async callback() {
      await run(context, child);
      await run(context, pet);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'done');
  is(second?.command, 'pet');
  match(second?.duration || '', 'ms');
  is(second?.type, 'done');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'done');
});

test('rejects a sequential events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await run(context, child);
      await run(context, pet);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'error');
  is(first?.error?.message, 'child');
  is(second?.command, 'pet');
  match(second?.duration || '', 'ms');
  is(second?.type, 'done');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'error');
  is(third?.error, undefined);
});

test('cancels a sequential events', async () => {
  const context = define();
  context.options.allowCancellation = true;
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await run(context, child);
      await run(context, pet);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'error');
  is(first?.error?.message, 'child');
  is(second?.command, 'pet');
  is(second?.duration, undefined);
  is(second?.type, 'cancel');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'error');
  is(third?.error, undefined);
});

// ---

test('resolves a script with parallel events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback: () => 'child',
  };
  const parent = {
    command: 'parent',
    async callback() {
      await Promise.all([run(context, child), run(context, pet)]);
    },
  };
  await run(context, parent);
  is(context.state.depth, 0);
  is(context.state.hasError, false);
});

test('rejects a script with parallel events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await Promise.all([run(context, child), run(context, pet)]);
    },
  };
  await run(context, parent);
  is(context.state.depth, 0);
  is(context.state.hasError, true);
});

// ---

test('resolves a parallel events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback: () => 'child',
  };
  const parent = {
    command: 'parent',
    async callback() {
      await Promise.all([run(context, child), run(context, pet)]);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'done');
  is(second?.command, 'pet');
  match(second?.duration || '', 'ms');
  is(second?.type, 'done');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'done');
});

test('rejects a parallel events', async () => {
  const context = define();
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await Promise.all([run(context, child), run(context, pet)]);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'error');
  is(first?.error?.message, 'child');
  is(second?.command, 'pet');
  match(second?.duration || '', 'ms');
  is(second?.type, 'done');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'error');
  is(third?.error, undefined);
});

test('cancels a parallel events', async () => {
  const context = define();
  context.options.allowCancellation = true;
  const pet = {
    command: 'pet',
    callback: () => 'pet',
  };
  const child = {
    command: 'child',
    callback() { throw new Error('child'); },
  };
  const parent = {
    command: 'parent',
    async callback() {
      await Promise.all([run(context, child), run(context, pet)]);
    },
  };
  await run(context, parent);
  const [first, second, third] = deepener.raise(context.history);
  is(first?.command, 'child');
  match(first?.duration || '', 'ms');
  is(first?.type, 'error');
  is(first?.error?.message, 'child');
  is(second?.command, 'pet');
  match(second?.duration || '', 'ms');
  is(second?.type, 'cancel');
  is(third?.command, 'parent');
  match(third?.duration || '', 'ms');
  is(third?.type, 'error');
  is(third?.error, undefined);
});

test.run();
