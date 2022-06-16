import { test } from 'uvu';
import { is, match } from 'uvu/assert';
import type { HistoryEvent } from '../lib/context';
import { define } from '../lib/context';
import { run } from '../lib/runner';

test('is a asynchronous function', () => {
  const AsyncFunction = (async () => {}).constructor;
  is(run instanceof AsyncFunction, true);
});

// ---

test('finishes resolved script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  is(context.state.depth, 0);
});

test('finishes rejected script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  await run(context, script);
  is(context.state.depth, 0);
});

test('resolves the script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  is(context.state.hasError, false);
});

test('rejects the script', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  await run(context, script);
  is(context.state.hasError, true);
});

// ---

test('saves the script as an event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  is(event.command, 'some');
});

test('finishes resolved event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  match(event.duration || '', 'ms');
});

test('finishes rejected event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  match(event.duration || '', 'ms');
});

test('resolves the event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  is(event.type, 'done');
});

test('rejects the event', async () => {
  const context = define();
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  await run(context, script);
  const event = context.history[0] as HistoryEvent;
  is(event.type, 'error');
  is(event.error?.message, 'some');
});

test('returns the value from the resolved script', async () => {
  const script = {
    command: 'some',
    callback: () => 'some',
  };
  const context = define();
  const result = await run(context, script);
  is(result, 'some');
});

test('returns undefined from the rejected script', async () => {
  const script = {
    command: 'some',
    callback() { throw new Error('some'); },
  };
  const context = define();
  const result = await run(context, script);
  is(result, undefined);
});

// ---

test('finishes resolved nested scripts', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  is(context.state.depth, 0);
});

test('finishes rejected nested scripts', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  is(context.state.depth, 0);
});

test('resolves nested scripts', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  is(context.state.hasError, false);
});

test('rejects nested scripts', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  is(context.state.hasError, true);
});

// ---

test('saves nested scripts as an event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = (context.history[0] as HistoryEvent[])[0] as HistoryEvent;
  is(event.command, 'second');
});

test('finishes resolved nested event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = (context.history[0] as HistoryEvent[])[0] as HistoryEvent;
  match(event.duration || '', 'ms');
});

test('finishes rejected nested event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = (context.history[0] as HistoryEvent[])[0] as HistoryEvent;
  match(event.duration || '', 'ms');
});

test('finishes canceled nested event', async () => {
  const context = define();
  const third = {
    command: 'third',
    callback: () => 'third',
  };
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    async callback() {
      await run(context, second);
      await run(context, third);
    },
  };
  await run(context, first);
  const event = (context.history[1] as HistoryEvent[])[0] as HistoryEvent;
  is(event.duration, undefined);
});

test('resolves nested event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = (context.history[0] as HistoryEvent[])[0] as HistoryEvent;
  is(event.type, 'done');
});

test('rejects nested event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = (context.history[0] as HistoryEvent[])[0] as HistoryEvent;
  is(event.type, 'error');
  is(event.error?.message, 'second');
});

test('rejects event with rejected nested event', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  await run(context, first);
  const event = context.history[1] as HistoryEvent;
  is(event.type, 'error');
  is(event.error, undefined);
});

test('cancels nested event', async () => {
  const context = define();
  const third = {
    command: 'third',
    callback: () => 'third',
  };
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    async callback() {
      await run(context, second);
      await run(context, third);
    },
  };
  await run(context, first);
  const event = (context.history[1] as HistoryEvent[])[0] as HistoryEvent;
  is(event.type, 'cancel');
});

test('disables the cancellation of nested event', async () => {
  const context = define();
  context.options.noCancel = true;
  const third = {
    command: 'third',
    callback: () => 'third',
  };
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    async callback() {
      await run(context, second);
      await run(context, third);
    },
  };
  await run(context, first);
  const event = (context.history[1] as HistoryEvent[])[0] as HistoryEvent;
  is(event.type, 'done');
});

test('returns the value from the resolved nested script', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback: () => 'second',
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  const result = await run(context, first);
  is(result, 'second');
});

test('returns undefined from the resolved nested script', async () => {
  const context = define();
  const second = {
    command: 'second',
    callback() { throw new Error('second'); },
  };
  const first = {
    command: 'first',
    callback: run.bind(undefined, context, second),
  };
  const result = await run(context, first);
  is(result, undefined);
});

test.run();
