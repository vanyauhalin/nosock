#!/usr/bin/env node
const { argv, exit, stdout } = require('node:process');
const sade = require('sade');
const pack = require('../package.json');

const imp = (() => {
  try {
    new Function('import').call(0);
    return true;
  } catch (error) {
    return !/unexpected/i.test(error.message);
  }
})()
  ? (path) => new Function(`return import(${JSON.stringify(path)})`).call(0)
  : require;

function cross(path) {
  return (() => Promise.resolve(imp(path)))();
}

sade('scer [file]')
  .version(pack.version)
  .option('--color', 'Print colorized output', true)
  .option('--cwd', 'The current directory to resolve from', '.')
  .option('--require', 'Additional module(s) to preload', [])
  .action(async (file, options) => {
    try {
      if (options.color) process.env.FORCE_COLOR = '1';
      const { exec, load } = await cross('../lib');
      const loaded = await load(file, options);
      await exec(loaded);
    } catch (error) {
      stdout.write(`${error.message}\n`);
      exit(1);
    }
  })
  .parse(argv);
