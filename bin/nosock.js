#!/usr/bin/env node
const console = require('node:console');
const { argv, env, exit } = require('node:process');
const sade = require('sade');
const { version } = require('../package.json');

const hasImport = (() => {
  try {
    new Function('import').call(0);
    return true;
  } catch (error) {
    return !/unexpected/i.test(error.message);
  }
})();
const dImport = (path) => new Function(`return import('${path}')`).call(0);
const cross = (() => {
  const requirer = hasImport ? dImport : require;
  return (path) => Promise.resolve(requirer(path));
})();

sade('nosock [command]')
  .version(version)
  .option('-c, --cwd', 'The current directory to resolve from', '.')
  .option('-r, --require', 'Additional module(s) to preload')
  .option('--allow-cancellation', 'Allow scripts cancellation', false)
  .option('--no-color', 'Disable colorized output', false)
  .action(async (command, options) => {
    try {
      const { cwd, noColor, require: modules = '' } = options;
      env['FORCE_COLOR'] = noColor ? '0' : '1';
      const { load } = await cross('nosock/loader');
      const loaded = await load({
        cwd,
        require: modules,
      });
      await (hasImport && loaded.require.length === 0
        ? dImport(`file://${loaded.file}`)
        : cross(loaded.file));
      const { global } = await cross('nosock/context');
      const context = global();
      context.options = {
        ...context.options,
        ...loaded,
        ...command ? { command } : {},
        noColor,
      };
    } catch (error) {
      console.error(error.stack || error.message);
      exit(1);
    }
  })
  .parse(argv);
