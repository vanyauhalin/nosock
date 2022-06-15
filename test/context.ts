import { test } from 'uvu';
import { equal, type } from 'uvu/assert';
import { define } from '../lib/context';

test('defines via function', () => {
  type(define, 'function');
});

test('defines with default values', () => {
  const context = define();
  equal(context, {
    history: [],
    options: {
      cwd: '.',
      noCancel: false,
      noColor: false,
      require: [],
    },
    state: {
      depth: -1,
      hasError: false,
    },
    store: {},
  });
});

test.run();
