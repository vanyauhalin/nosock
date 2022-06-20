import { test } from 'uvu';
import { is, type } from 'uvu/assert';
import { global } from '../lib/context';
import { script } from '../lib/scripter';

test('is a function', () => {
  type(script, 'function');
});

test('saves a synchronous script to store', () => {
  const context = global();
  script('sync', () => 'sync');
  const command = context.store['sync']?.command;
  const value = context.store['sync']?.callback();
  is(command, 'sync');
  is(value, 'sync');
});

test('saves a asynchronous script to store', async () => {
  const context = global();
  script('async', async () => 'async');
  const command = context.store['async']?.command;
  const value = await context.store['async']?.callback();
  is(command, 'async');
  is(value, 'async');
});

test('saves a promised script to store', async () => {
  const context = global();
  script('prom', () => Promise.resolve('prom'));
  const command = context.store['prom']?.command;
  const value = await context.store['prom']?.callback();
  is(command, 'prom');
  is(value, 'prom');
});

test.run();
