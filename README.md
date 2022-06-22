<p align="center">
  <img
    width="100"
    height="100"
    alt="nosock logo"
    src="docs/assets/nosock.svg"
  />
  <br>
  <a href="https://github.com/vanyauhalin/nosock/actions">
    <img
      alt="ci status"
      src="https://github.com/vanyauhalin/nosock/workflows/ci/badge.svg"
    />
  </a>
  <img
    alt="install size"
    src="https://badgen.net/badge/install%20size/≈%20100%20kB/green"
  />
  <br>
  nosock is a tiny scripts runner
  <br>
  <br>
  <img
    alt="demo"
    src="./docs/assets/demo.svg"
    width="600"
  />
</p>

## Motivation

Do we really need to download [5.5 mb](https://packagephobia.com/result?p=gulp@4.0.2) of dependencies in order to run scripts? Why limit ourselves to an external API when all the power of NodeJS is available to us? After asking myself these questions, I decided to write a tool that just... will run my scripts `¯\_(ツ)_/¯`.

## Features

- Tiny size.
- Supports `async` / `await`.
- Supports cancellation.
- 0.1% new API.

## Installation

Include a line specifying the package [registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) in `.npmrc` file.

```properties
@vanyauhalin:registry=https://npm.pkg.github.com
```

Install package via your favorite manager.

```sh
npm install --save-dev @vanyauhalin/nosock
```

## Usage

Add a script to `package.json`.

```json
{
  "scripts": {
    "build": "nosock"
  }
}
```

Describe the script in `scripts.{cjs,js,mjs,ts}`.

```js
import { existsSync, promises } from 'node:fs';
import { script } from '@vanyauhalin/nosock';
import { build } from 'esbuild';
import postcss from 'postcss';
import postcssCsso from 'postcss-csso';

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

script.exec();
```

Then execute the script.

```sh
npm run build
```

This demo is available in the [docs](docs/demo/scripts.js) directory.

## API

- [`script()`](docs/scripter.md) — the main module used to describe scripts.
- [`log()`](docs/logger.md) — wrapper for `process.stdout` that adds a time prefix, types and [color injection](docs/logger.md#color-injection).

## Benchmarks

In progress...

## License

[MIT](LICENSE) License © 2022 [@vanyauhalin](https://github.com/vanyauhalin).

<p align="center">
  <sub>
    Inspired by <a href="https://github.com/lukeed">@lukeed</a>'s projects.
  </sub>
  <br>
  <sup>
    #youmightnotneedgulpjs
  </sup>
</p>
