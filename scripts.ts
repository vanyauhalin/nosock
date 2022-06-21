import { spawnSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import type { BuildOptions } from 'esbuild';
import { build as esbuild } from 'esbuild';
import { script } from './src/index';

async function oldie(
  directory: string,
  file: string,
  replaces?: [string, string],
): Promise<void> {
  const resolved = join(directory, file.replace(extname(file), '.js'));
  const content = await readFile(resolved);
  let transformed = content.toString()
    .replace(/require\("node:(.+)"\)/g, 'require("$1")')
    .replace('require("fs/promises")', 'require("fs").promises');
  if (replaces && replaces.length > 0) {
    transformed = transformed.replace(replaces[0], replaces[1]);
  }
  await writeFile(resolved, transformed);
}

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
    await esbuild({
      ...general,
      format: 'cjs',
      logLevel: 'error',
      outdir: OUTPUT,
      target: 'node10',
    });
    await oldie(OUTPUT, file, [
      'import_meta = {}',
      'import_meta = { url: require("url").pathToFileURL(__filename) }',
    ]);
    if (!toModules) return;
    await esbuild({
      ...general,
      outfile: join(OUTPUT, file.replace('.ts', '.mjs')),
    });
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
      await oldie(DISTRIBUTION_TEST, file.name);
    }));
  })();
  await script('build/scripts', async () => {
    await esbuild({
      ...general,
      entryPoints: ['scripts.ts'],
      outdir: DISTRIBUTION,
    });
    await oldie(DISTRIBUTION, 'scripts.js', ['./src', './lib']);
  })();
});
script('ci', test.bind(undefined, 'dist/test'));

script.exec();
