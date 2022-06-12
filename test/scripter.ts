import { test } from 'uvu';
import { is, type } from 'uvu/assert';
import * as contexter from '../lib/context';
import * as scripter from '../lib/scripter';

test('defines via function', () => {
  type(scripter.define, 'function');
});

test('defines as function', () => {
  const context = contexter.define();
  const script = scripter.define(context);
  type(script, 'function');
});

test('adds a synchronous script to context', () => {
  const context = contexter.define();
  const script = scripter.define(context);
  script('some', () => 'some');
  const command = context.scripts['some']?.command;
  const value = context.scripts['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test('adds a asynchronous script to context', async () => {
  const context = contexter.define();
  const script = scripter.define(context);
  // eslint-disable-next-line @typescript-eslint/require-await
  script('some', async () => 'some');
  const command = context.scripts['some']?.command;
  const value = await context.scripts['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test('adds a promised script to context', async () => {
  const context = contexter.define();
  const script = scripter.define(context);
  script('some', () => Promise.resolve('some'));
  const command = context.scripts['some']?.command;
  const value = await context.scripts['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test.run();
