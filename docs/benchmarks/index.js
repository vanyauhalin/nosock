import { execFile } from 'node:child_process';
import { error, log } from 'node:console';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { exit, hrtime } from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const spawn = promisify(execFile);
const filename = fileURLToPath(import.meta.url);
const cwd = dirname(filename);
const require = createRequire(filename);
const packages = [
  ['gulp  ', 'gulp/bin/gulp.js'],
  ['nosock', '@vanyauhalin/nosock/bin/nosock.js'],
];

function format(array) {
  const number = Math.round(array[1] / 1e6);
  if (array[0] > 0) return `${(array[0] + number / 1e3).toFixed(2)}s`;
  return `${number}ms`;
}

try {
  log();
  const state = [];
  let temporary = [];
  for (let index = 0; index < 3; index += 1) {
    for (const [name, path] of packages) {
      const resolved = require.resolve(path);
      const timer = hrtime();
      const pid = await spawn('node', [resolved, 'build'], { cwd });
      const delta = hrtime(timer);
      const output = (pid.stderr || pid.stdout).toString();
      const [, ms] = output.match(/.+Finished.*?([\d.]* ?ms)/s);
      temporary.push([name, delta, ms]);
      log(output);
    }
    state.push(temporary);
    temporary = [];
  }
  for (let index = 0; index < packages.length; index += 1) {
    const mss = state.map((item) => Number.parseFloat(item[index][2], 10));
    const min = mss.indexOf(Math.min(...mss));
    temporary.push(state[min][index]);
  }
  log('name   | total | self   ');
  log('------ | ----- | -------');
  for (const [name, delta, ms] of temporary) {
    log(`${name} | ${format(delta)} | ${ms}`);
  }
  log();
} catch (error_) {
  error('Hmm...', error_);
  exit(1);
}
