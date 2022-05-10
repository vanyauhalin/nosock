import { readdirSync } from 'fs';
import { exit } from 'node:process';
import { basename, resolve } from 'path';
import { buildSync } from 'esbuild';

/**
 * @param {import('esbuild').BuildOptions} options
 */
function build(options) {
  if (buildSync({
    ...options,
    allowOverwrite: true,
    platform: 'node',
  }).errors.length > 0) exit(1);
}

const src = resolve('src');
const outdir = resolve('lib');
readdirSync(src).forEach((file) => {
  const entryPoints = [`${src}/${file}`];
  build({
    entryPoints,
    outdir,
  });
  build({
    entryPoints,
    format: 'cjs',
    outfile: `${outdir}/${basename(file).replace('.ts', '.cjs')}`,
  });
});
