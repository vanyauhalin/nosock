import { existsSync, promises } from 'node:fs';
import { build } from 'esbuild';
import postcss from 'postcss';
import postcssCsso from 'postcss-csso';
import { exec, script } from '../../lib/index.js';

const { mkdir, readFile, writeFile } = promises;

const styles = script('build-styles', async () => {
  const file = await readFile('src/main.css');
  const result = await postcss()
    .use(postcssCsso())
    .process(file, { from: 'src/main.css' });
  if (!existsSync('dist')) await mkdir('dist');
  await writeFile('dist/main.css', result.css, { flag: 'w' });
});

const scripts = script('build-scripts', async () => {
  await build({
    entryPoints: ['src/main.js'],
    minify: true,
    platform: 'browser',
    outfile: 'dist/main.js',
  });
});

script('build', async () => {
  await Promise.all([styles(), scripts()]);
});

await exec();
