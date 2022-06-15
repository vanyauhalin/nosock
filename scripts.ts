import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { basename, resolve } from 'node:path';
import { env } from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { BuildOptions } from 'esbuild';
import { build } from 'esbuild';
import { exec, script } from './src/index';

const readdir = promisify(fs.readdir);
const rm = promisify(fs.rm);
const writeFile = promisify(fs.writeFile);

script('build', async () => {
  const LIBRARY = resolve('lib');
  const SOURCES = resolve('src');
  const sources = await readdir(SOURCES);
  await Promise.all(sources.map(async (file) => {
    const options: BuildOptions = {
      entryPoints: [`${SOURCES}/${file}`],
      allowOverwrite: true,
      platform: 'node',
    };
    await build({
      ...options,
      outfile: `${LIBRARY}/${basename(file).replace('.ts', '.mjs')}`,
    });
    const cjs: BuildOptions = {
      ...options,
      format: 'cjs',
      outdir: LIBRARY,
    };
    if (file.includes('loader')) {
      /**
       * @see https://github.com/evanw/esbuild/issues/1492
       */
      await writeFile(
        'imu.js',
        'export var imu = require("url").pathToFileURL(__filename);',
      );
      await build({
        ...cjs,
        inject: ['./imu.js'],
        define: {
          'import.meta.url': 'imu',
        },
      });
      await rm('imu.js');
      return;
    }
    await build(cjs);
  }));
});

script('test', async () => {
  const TEST = resolve('test');
  const files = await readdir(TEST, { withFileTypes: true });
  await Promise.all(files.map(async (file) => {
    await script(`test/${file.name}`, () => {
      const process = spawnSync('node', ['-r', 'tsm', `${TEST}/${file.name}`]);
      if (process.status === 0) return;
      const trimmed = process.stdout.toString()
        .replace(/.*[•✘].*/g, '')
        .replace(/.*(Total|Passed|Skipped|Duration).*/g, '')
        .trim();
      throw new Error(trimmed);
    })();
  }));
});

await exec({
  file: fileURLToPath(import.meta.url),
  noCancel: !!(env['npm_lifecycle_event'] === 'test'),
});
