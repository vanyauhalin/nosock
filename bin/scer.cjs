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
  .action(async () => {
    try {
      const { exec, load } = await cross('../lib');
      const file = await load();
      await exec(file);
    } catch (error) {
      stdout.write(`${error.message}\n`);
      exit(1);
    }
  })
  .parse(argv);
