import { suite } from 'uvu';
import { type } from 'uvu/assert';
import * as nosock from '../lib';

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
