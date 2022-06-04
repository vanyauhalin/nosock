#!/usr/bin/env node
const console = require('node:console');
const { argv, env, exit } = require('node:process');
const sade = require('sade');
const pack = require('../package.json');

const cross = (() => {
  const requirer = (() => {
    try {
      // Need to check if esm supports.
      // eslint-disable-next-line no-new-func
      new Function('import').call(0);
      return true;
    } catch (error) {
      return !/unexpected/i.test(error.message);
    }
  })()
    // Simulate esm import call.
    // eslint-disable-next-line no-new-func
    ? (path) => new Function(`return import('${path}')`).call(0)
    : require;
  return (path) => Promise.resolve(requirer(path));
})();

sade('nosock [file]')
  .version(pack.version)
  .option('-c, --cwd', 'The current directory to resolve from', '.')
  .option('-r, --require', 'Additional module(s) to preload', [])
  .option('--color', 'Print colorized output', true)
  .action(async (file, options) => {
    try {
      const { exec, load } = await cross('nosock');
      // Follow the rules for redefining env in TS.
      // eslint-disable-next-line dot-notation
      if (options.color) env['FORCE_COLOR'] = '1';
      const loaded = await load({
        file,
        cwd: options.cwd,
        require: options.require,
      });
      await exec(loaded);
    } catch (error) {
      console.error(error.stack || error.message);
      exit(1);
    }
  })
  .parse(argv);
