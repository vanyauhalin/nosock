import { readdirSync, renameSync, rmSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BuildOptions } from 'esbuild';
import { buildSync } from 'esbuild';
import { exec, script } from './src/index';

const SOURCES = resolve('src');
const OUTPUT = resolve('lib');

script('prebuild', () => {
  for (const file of readdirSync(`${OUTPUT}/src`)) {
    renameSync(`${OUTPUT}/src/${file}`, `${OUTPUT}/${file}`);
  }
  for (const some of ['src', 'test', 'scripts.d.ts']) {
    rmSync(`${OUTPUT}/${some}`, {
      recursive: true,
      force: true,
    });
  }
});

function build(options: BuildOptions): void {
  const { errors } = buildSync({
    ...options,
    allowOverwrite: true,
    platform: 'node',
  });
  if (errors.length > 0) throw new Error(errors.join('\n'));
}

script('build', () => {
  for (const file of readdirSync(SOURCES)) {
    const entryPoints = [`${SOURCES}/${file}`];
    build({
      entryPoints,
      outdir: OUTPUT,
    });
    build({
      entryPoints,
      format: 'cjs',
      outfile: `${OUTPUT}/${basename(file).replace('.ts', '.cjs')}`,
    });
  }
});

await exec(fileURLToPath(import.meta.url));
