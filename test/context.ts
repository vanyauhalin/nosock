import { argv, env } from 'node:process';
import { suite } from 'uvu';
import { equal, is, type } from 'uvu/assert';
import * as context from '../lib/context';

const define = suite('define');

define('defines via function', () => {
  type(context.define, 'function');
});

define('defines with default values', () => {
  const defined = context.define();
  equal(defined, {
    history: [],
    options: {
      allowCancellation: false,
      command: defined.options.command,
      cwd: '.',
      noColor: false,
      require: [],
    },
    state: {
      depth: 0,
      hasError: false,
    },
    store: {},
  });
});

define('defines with a command from env', () => {
  const saved = env['npm_lifecycle_event'];
  env['npm_lifecycle_event'] = 'some';
  const defined = context.define();
  is(defined.options.command, 'some');
  env['npm_lifecycle_event'] = saved;
});

define('defines with a command from argv', () => {
  const saved = env['npm_lifecycle_event'];
  delete env['npm_lifecycle_event'];
  argv.push('some');
  const defined = context.define();
  is(defined.options.command, 'some');
  env['npm_lifecycle_event'] = saved;
  argv.pop();
});

define('defines without command', () => {
  const savedEnvironment = env['npm_lifecycle_event'];
  const savedArguments = argv;
  delete env['npm_lifecycle_event'];
  process.argv = [];
  const defined = context.define();
  is(defined.options.command, '');
  env['npm_lifecycle_event'] = savedEnvironment;
  process.argv = savedArguments;
});

define.run();

// ---

const global = suite('global');

global('returns global via function', () => {
  type(context.global, 'function');
});

global('persistence default values', () => {
  const saved = env['npm_lifecycle_event'];
  env['npm_lifecycle_event'] = 'some';
  const globalized = context.global();
  is.not(globalized.options.command, 'some');
  env['npm_lifecycle_event'] = saved;
});

global.run();
