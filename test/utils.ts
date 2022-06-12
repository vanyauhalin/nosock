import { suite } from 'uvu';
import { is, match, type } from 'uvu/assert';
import * as utils from '../lib/utils';

const delay = suite('delay');

delay('is a function', () => {
  type(utils.delay, 'function');
});

delay('returns a promise', () => {
  type(utils.delay(), 'object');
});

delay.run();

// ---

const stopwatch = suite('stopwatch');

stopwatch('is a function', () => {
  type(utils.stopwatch, 'function');
});

stopwatch('returns a function', () => {
  type(utils.stopwatch(), 'function');
});

stopwatch('lap matches the pattern', () => {
  match(utils.stopwatch()(), /\d*\.\d*ms/);
});

stopwatch('the next lap is higher than the previous', async () => {
  const lap = utils.stopwatch();
  const first = Number.parseFloat(lap());
  await utils.delay(1);
  const second = Number.parseFloat(lap());
  is(second > first, true);
});

stopwatch('there is no cascade of laps', async () => {
  const firstLap = utils.stopwatch();
  await utils.delay(1);
  const secondLap = utils.stopwatch();
  const second = Number.parseFloat(secondLap());
  const first = Number.parseFloat(firstLap());
  is(first > second, true);
});

stopwatch.run();
