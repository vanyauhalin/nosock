import { suite } from 'uvu';
import { is, type } from 'uvu/assert';
import * as utils from '../lib/utils';

const stopwatch = suite('stopwatch');

stopwatch('is a function', () => {
  type(utils.stopwatch, 'function');
});

stopwatch('returns a function', () => {
  type(utils.stopwatch(), 'function');
});

stopwatch('lap matches the pattern', () => {
  is(/\d*\.\d*ms/.test(utils.stopwatch()()), true);
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
