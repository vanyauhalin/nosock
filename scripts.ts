import {
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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
  /**
   * @see https://github.com/evanw/esbuild/issues/1492
   */
  writeFileSync(
    'import-meta-url.js',
    'export var import_meta_url = require("url").pathToFileURL(__filename);',
  );
  const sources = readdirSync(SOURCES);
  for (const file of sources) {
    const entryPoints = [`${SOURCES}/${file}`];
    build({
      entryPoints,
      outfile: `${OUTPUT}/${basename(file).replace('.ts', '.mjs')}`,
    });
    build({
      entryPoints,
      outdir: OUTPUT,
      format: 'cjs',
      ...file.includes('loader')
        ? {
          inject: ['./import-meta-url.js'],
          define: {
            'import.meta.url': 'import_meta_url',
          },
        }
        : {},
    });
  }
  rmSync('import-meta-url.js');
});

await exec(fileURLToPath(import.meta.url));
