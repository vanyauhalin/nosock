import { suite } from 'uvu';
import {
  equal,
  is,
  match,
  type,
} from 'uvu/assert';
import * as utils from '../lib/utils';

function delay(ms = 0): Promise<unknown> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ---

const cancellable = suite('cancellable');

cancellable('is a function', () => {
  type(utils.cancellable, 'function');
});

cancellable('returns a function with cancel method', () => {
  const callback = utils.cancellable(() => {});
  type(callback, 'function');
  type(callback.cancel, 'function');
});

cancellable('cancels the callback', () => {
  let result = false;
  const callback = utils.cancellable(async () => {
    await delay(1500);
    result = true;
  });
  callback().then(() => result).catch(() => {});
  callback.cancel();
});

cancellable.run();

// ---

const deepener = suite('deepener');

deepener('dive is a method', () => {
  type(utils.deepener.dive, 'function');
});

deepener('dives into a deep array', () => {
  const array = [1, [[[2]], [3]]];
  const result = utils.deepener.dive(array);
  equal(result, [3]);
});

deepener('updates a deep array', () => {
  const array = [1, [[[2]], [3]]];
  const result = utils.deepener.dive(array);
  result.push(4);
  equal(array, [1, [[[2]], [3, 4]]]);
});

deepener('raise is a method', () => {
  type(utils.deepener.raise, 'function');
});

deepener('raises all elements of a deep array', () => {
  const array = [1, [[[2]], [3]]];
  const result = utils.deepener.raise(array);
  equal(result, [1, 2, 3]);
});

deepener.run();

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
