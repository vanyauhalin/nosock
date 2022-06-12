import { suite } from 'uvu';
import { is, type } from 'uvu/assert';
import * as nosock from '../lib';

const exec = suite('exec');

exec('is a asynchronous function', () => {
  const AsyncFunction = (async () => {}).constructor;
  is(nosock.exec instanceof AsyncFunction, true);
});

exec.run();

// ---

const log = suite('log');

log('is a function', () => {
  type(nosock.log, 'function');
});

log.run();

// ---

const script = suite('script');

script('is a function', () => {
  type(nosock.script, 'function');
});

script.run();
