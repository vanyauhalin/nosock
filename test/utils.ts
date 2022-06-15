import { suite } from 'uvu';
import { is, match, type } from 'uvu/assert';
import * as utils from '../lib/utils';

function delay(ms = 0): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

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
  await delay(1);
  const second = Number.parseFloat(lap());
  is(second > first, true);
});

stopwatch('there is no cascade of laps', async () => {
  const firstLap = utils.stopwatch();
  await delay(1);
  const secondLap = utils.stopwatch();
  const second = Number.parseFloat(secondLap());
  const first = Number.parseFloat(firstLap());
  is(first > second, true);
});

stopwatch.run();
