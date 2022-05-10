#!/usr/bin/env node
const { argv, exit, stdout } = require('node:process');
const sade = require('sade');
const pack = require('../package.json');

const imp = (path) => new Function(`return import(${JSON
  .stringify(path)})`).call(0);

const hasImport = (() => {
  try {
    new Function('import').call(0);
    return true;
  } catch (err) {
    return !/unexpected/i.test(err.message);
  }
})();

sade('scer [file]')
  .version(pack.version)
  .action(async () => {
    try {
      const { load } = await (() => (hasImport
        ? imp('../lib/load.js')
        : require('../lib/load.cjs')))();
      load();
    } catch (err) {
      stdout.write(`${err.message}\n`);
      exit(1);
    }
  })
  .parse(argv);
