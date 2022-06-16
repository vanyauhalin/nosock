#!/usr/bin/env node
const console = require('node:console');
const { argv, env, exit } = require('node:process');
const sade = require('sade');
const { version } = require('../package.json');

const cross = (() => {
  const requirer = (() => {
    try {
      new Function('import').call(0);
      return true;
    } catch (error) {
      return !/unexpected/i.test(error.message);
    }
  })()
    ? (path) => new Function(`return import('${path}')`).call(0)
    : require;
  return (path) => Promise.resolve(requirer(path));
})();

sade('nosock [command]')
  .version(version)
  .option('-c, --cwd', 'The current directory to resolve from', '.')
  .option('-f, --file', 'The file containing scripts')
  .option('-r, --require', 'Additional module(s) to preload', [])
  .option('--no-cancel', 'Disable scripts cancelation', false)
  .option('--no-color', 'Print colorized output', false)
  .action(async (command, options) => {
    try {
      env['FORCE_COLOR'] = options.noColor ? '0' : '1';
      const { load } = await cross('nosock/loader');
      const loaded = await load({
        file: options.file,
        cwd: options.cwd,
        require: options.require,
      });
      const { exec } = await cross('nosock');
      await exec({
        ...loaded,
        command,
        noColor: options.noColor,
      });
    } catch (error) {
      console.error(error.stack || error.message);
      exit(1);
    }
  })
  .parse(argv);
