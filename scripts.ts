import { spawnSync } from 'node:child_process';
import { promises } from 'node:fs';
import { basename, resolve } from 'node:path';
import type { BuildOptions } from 'esbuild';
import { build } from 'esbuild';
import { script } from './src/index';

const { readdir, unlink, writeFile } = promises;

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
      await unlink('imu.js');
      return;
    }
    await build(cjs);
  }));
});

script('test', async () => {
  const TEST = resolve('test');
  const files = await readdir(TEST, { withFileTypes: true });
  await Promise.all(files.map(async (file) => {
    if (!file.isFile()) return;
    await script(`test/${file.name}`, () => {
      const process = spawnSync('node', ['-r', 'tsm', `${TEST}/${file.name}`]);
      if (process.status === 0) return;
      const cleared = process.stdout.toString()
        .replace(/^.*[•✘].*$/gm, '')
        .replace(/^ {4}at .*$/gm, '')
        .replace(/[\S\s]*?FAIL/, 'FAIL')
        .replace(/(?:\r\n|[\nr]){2,}/g, '\n\n')
        .trim();
      throw new Error(`\n\n   ${cleared}\n`);
    })();
  }));
});

script.exec();
