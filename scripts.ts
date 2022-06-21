import { spawnSync } from 'node:child_process';
import {
  readFile,
  readdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { BuildOptions } from 'esbuild';
import { build as esbuild } from 'esbuild';
import { script } from './src/index';

async function build(output: string, toModules = false): Promise<void> {
  const OUTPUT = resolve(output);
  const SOURCES = resolve('src');
  const sources = await readdir(SOURCES);
  await Promise.all(sources.map(async (file) => {
    const general: BuildOptions = {
      entryPoints: [join(SOURCES, file)],
      allowOverwrite: true,
      platform: 'node',
    };
    if (toModules) {
      await esbuild({
        ...general,
        outfile: join(OUTPUT, file.replace('.ts', '.mjs')),
      });
    }
    const commonjs: BuildOptions = {
      ...general,
      format: 'cjs',
      outdir: OUTPUT,
    };
    if (file.includes('loader')) {
      /**
       * @see https://github.com/evanw/esbuild/issues/1492
       */
      await writeFile(
        'imu.js',
        'export var imu = require("url").pathToFileURL(__filename);',
      );
      await esbuild({
        ...commonjs,
        inject: ['imu.js'],
        define: {
          'import.meta.url': 'imu',
        },
      });
      await unlink('imu.js');
      return;
    }
    await esbuild(commonjs);
  }));
}

async function test(directory: string, flags: string[] = []): Promise<void> {
  const TEST = resolve(directory);
  const tests = await readdir(TEST, { withFileTypes: true });
  await Promise.all(tests.map(async (file) => {
    if (!file.isFile()) return;
    await script(`test/${file.name}`, () => {
      const process = spawnSync('node', [...flags, join(TEST, file.name)]);
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
}

script('build', build.bind(undefined, 'lib', true));
script('test', test.bind(undefined, 'test', ['-r', 'tsm']));
script('build-ci', async () => {
  const DISTRIBUTION = resolve('dist');
  const DISTRIBUTION_TEST = join(DISTRIBUTION, 'test');
  const TEST = resolve('test');
  const general: BuildOptions = {
    allowOverwrite: true,
    platform: 'node',
    format: 'cjs',
  };
  await script('build/sources', build.bind(undefined, 'dist/lib'))();
  await script('build/test', async () => {
    const tests = await readdir(TEST, { withFileTypes: true });
    await Promise.all(tests.map(async (file) => {
      if (!file.isFile()) return;
      await esbuild({
        ...general,
        entryPoints: [join(TEST, file.name)],
        outdir: DISTRIBUTION_TEST,
      });
    }));
  })();
  await script('build/scripts', async () => {
    await esbuild({
      ...general,
      entryPoints: ['scripts.ts'],
      outdir: DISTRIBUTION,
    });
    const file = join(DISTRIBUTION, 'scripts.js');
    const content = await readFile(file);
    const transformed = content.toString().replace('./src', './lib');
    await writeFile(file, transformed);
  })();
});
script('ci', test.bind(undefined, 'dist/test'));

script.exec();
