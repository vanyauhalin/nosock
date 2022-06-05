import fs from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { BuildOptions } from 'esbuild';
import { build } from 'esbuild';
import { exec, script } from './src/index';

const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const rm = promisify(fs.rm);
const writeFile = promisify(fs.writeFile);
const LIBRARY = resolve('lib');
const SOURCES = resolve('src');

script('prebuild', async () => {
  const library = await readdir(`${LIBRARY}/src`);
  await Promise.all(library.map((file) => (
    rename(`${LIBRARY}/src/${file}`, `${LIBRARY}/${file}`)
  )));
  const temporary = ['src', 'test', 'scripts.d.ts'];
  await Promise.all(temporary.map((file) => rm(`${LIBRARY}/${file}`, {
    recursive: true,
    force: true,
  })));
});

script('build', async () => {
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

await exec(fileURLToPath(import.meta.url));
