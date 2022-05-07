import { hrtime } from 'node:process';
import type { Stopwatch } from 'types';

function stopwatch(): Stopwatch {
  let start: number;
  function inner(): Stopwatch {
    start = Number(hrtime.bigint());
    return inner;
  }
  inner.lap = () => `${((Number(hrtime.bigint()) - start) / 1e6).toFixed(2)}ms`;
  return inner();
}

export {
  stopwatch,
};
