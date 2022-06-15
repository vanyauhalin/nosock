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

test('saves the synchronous script to store', () => {
  const context = contexter.define();
  const script = scripter.define(context);
  script('some', () => 'some');
  const command = context.store['some']?.command;
  const value = context.store['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test('saves the asynchronous script to store', async () => {
  const context = contexter.define();
  const script = scripter.define(context);
  // eslint-disable-next-line @typescript-eslint/require-await
  script('some', async () => 'some');
  const command = context.store['some']?.command;
  const value = await context.store['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test('saves the promised script to store', async () => {
  const context = contexter.define();
  const script = scripter.define(context);
  script('some', () => Promise.resolve('some'));
  const command = context.store['some']?.command;
  const value = await context.store['some']?.callback();
  is(command, 'some');
  is(value, 'some');
});

test.run();
