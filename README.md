<p align="center">
  <sub>
    logo in development...
  </sub>
</p>

<p align="center">
  Easy-to-use, lightweight runner based on npm scripts
</p>

<p align="center">
  <a href="https://github.com/vanyauhalin/scer/actions">
    <img
      alt="build status"
      src="https://github.com/vanyauhalin/scer/workflows/build/badge.svg"
    />
  </a>
  <a href="https://packagephobia.com/badge?p=scer">
    <img
      alt="install size"
      src="https://packagephobia.com/result?p=scer"
    />
  </a>
</p>

## Motivation

scer was born from the reluctance to once again install, configure gulp and remember its api in order to merge two css, js files. Do we really need to download [5.5 mb](https://packagephobia.com/result?p=gulp@4.0.2) of dependencies in order to run scripts? Why limit ourselves to an external api when all the power of node is available to us? After asking myself these questions, I decided to write a simple runner that just... will run my scripts.

## Install

Install package via your favorite manager from github registry.

```sh
echo "scer:registry = https://npm.pkg.github.com" > .npmrc
npm install --save-dev scer
```

## Usage

Add a script to `package.json`.

```json
{
  "scripts": {
    "build": "scer"
  }
}
```

Describe the script in one of the rc-file: 

- `scripts.{cjs,js,mjs,ts}`
- `.scripts.{cjs,js,mjs,ts}`
- `scriptsrc.{cjs,js,mjs,ts}`
- `.scriptsrc.{cjs,js,mjs,ts}`
- `scer.{cjs,js,mjs,ts}`
- `.scer.{cjs,js,mjs,ts}`
- `scerrc.{cjs,js,mjs,ts}`
- `.scerrc.{cjs,js,mjs,ts}`

```js
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import { build } from 'esbuild';
import postcss from 'postcss';
import postcssCsso from 'postcss-csso';
import { script } from 'scer';

async function buildScripts() {
  await build({
    entryPoints: ['src/main.js'],
    minify: true,
    outdir: 'dist',
  });
}

async function buildStyles() {
  const file = await promisify(readFile)('src/styles.css');
  const result = await postcss()
    .use(postcssCsso())
    .use(postcssImport())
    .process(file, { from: 'src/styles.css' });
  await promisify(writeFile)('dist/styles.css', result.css);
}

script('build', async () => {
  await Promise.all([buildScripts, buildStyles]);
});
```

Then run the script.

```sh
npm run build
```

See the [docs](docs/README.md) for more examples and alternative gulp utilities.

## API

- [`script()`]('docs/script.md) — the main entry for describing scripts.
- [`log()`](docs/log.md) — improved `stdout` for logging.

## Benchmarks

In progress...

## License

[MIT](LICENSE).

<p align="center">
  <sub>
    Inspired by the lightness of
    <a href="https://github.com/lukeed/uvu">uvu</a>.
    <br>
    #youmightnotneedgulpjs
  </sub>
</p>
