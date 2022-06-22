import { spawnSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import {
  basename,
  extname,
  join,
  resolve,
} from 'node:path';
import { build as esbuild } from 'esbuild';
import { script } from './src/index';

function prepare(directory: string, entryPath: string, extension: string): {
  file: string;
  filePath: string;
} {
  const directoryPath = resolve(directory);
  const entry = basename(entryPath);
  const file = entry.replace(extname(entry), extension);
  const filePath = join(directoryPath, file);
  return { file, filePath };
}

async function outdated(directory: string, entryPath: string): Promise<void> {
  const { file, filePath } = prepare(directory, entryPath, '.js');
  await esbuild({
    allowOverwrite: true,
    entryPoints: [entryPath],
    format: 'cjs',
    logLevel: 'error',
    outfile: filePath,
    platform: 'node',
    target: 'node10',
  });
  const fileContent = await readFile(filePath);
  // NodeJS v10, v12 doesn't resolve `node` modules.
  let transformed = fileContent.toString()
    .replace(/require\("node:(.+)"\)/g, 'require("$1")')
    .replace('require("fs/promises")', 'require("fs").promises');
  /**
   * `module.createRequire` has been added in NodeJS v12.
   * esbuild doesn't transform `import.meta.url`.
   * @see https://nodejs.org/api/module.html#modulecreaterequirefilename
   * @see https://github.com/evanw/esbuild/issues/1492
   */
  if (file === 'loader.js') {
    transformed = transformed
      .replace(/var import_node_module.*(?:\r\n|\r|\n)/, '')
      .replace(/const import_meta.*(?:\r\n|\r|\n)/, '')
      .replace(/const require2.*(?:\r\n|\r|\n)/, '')
      .replace(/require2/g, 'require');
  }
  /**
   * `Array.prototype.flat()` has been added in NodeJS v11.
   * @see https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
   */
  if (file === 'loader.js' || file === 'utils.js') {
    transformed = transformed.replace(/(module.exports = __toCommonJS.*)/, `$1
if (!Array.prototype.flat)
  Object.defineProperty(Array.prototype, 'flat', {
    configurable: true,
    value: function flat() {
      const depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
      return depth ? Array.prototype.reduce.call(this, (accumulator, current) => {
        if (Array.isArray(current)) {
          accumulator.push.apply(accumulator, flat.call(current, depth - 1));
        } else {
          accumulator.push(current);
        }
        return accumulator;
      }, []) : Array.prototype.slice.call(this);
    },
    writable: true,
  });`);
  }
  if (file === 'scripts.js') {
    transformed = transformed.replace('./src', './lib');
  }
  await writeFile(filePath, transformed);
}

async function modern(directory: string, entryPath: string): Promise<void> {
  const { filePath } = prepare(directory, entryPath, '.mjs');
  await esbuild({
    allowOverwrite: true,
    entryPoints: [entryPath],
    outfile: filePath,
    platform: 'node',
  });
  const fileContent = await readFile(filePath);
  // Modules don't allow relative paths for some reason.
  const transformed = fileContent.toString()
    .replace(/from "\.\/(.+)"/g, 'from "@vanyauhalin/nosock/lib/$1"');
  await writeFile(filePath, transformed);
}

async function build(output: string, toModern = false): Promise<void> {
  const SOURCES = resolve('src');
  const sources = await readdir(SOURCES);
  await Promise.all(sources.map(async (file) => {
    const entry = join(SOURCES, file);
    await outdated(output, entry);
    if (toModern) await modern(output, entry);
  }));
}

async function test(directory: string, flags: string[] = []): Promise<void> {
  const TEST = resolve(directory);
  const tests = await readdir(TEST);
  await Promise.all(tests.map(async (file) => {
    await script(`test/${file}`, () => {
      const process = spawnSync('node', [...flags, join(TEST, file)]);
      if (process.status === 0) return;
      const cleared = process.stdout.toString()
        .replace(/^.*[•✘].*$/gm, '')
        .replace(/^ {4}at .*$/gm, '')
        .replace(/[\S\s]*?FAIL/, 'FAIL')
        .replace(/(?:\r\n|\r|\n){2,}/g, '\n\n')
        .trim();
      throw new Error(`\n\n   ${cleared}\n`);
    })();
  }));
}

script('build', build.bind(undefined, 'lib', true));
script('test', test.bind(undefined, 'test', ['-r', 'tsm']));
script('build-ci', async () => {
  const TEST = resolve('test');
  await script('build/sources', build.bind(undefined, 'dist/lib'))();
  await script('build/test', async () => {
    const tests = await readdir(TEST);
    await Promise.all(tests.map(async (file) => {
      await outdated('dist/test', join(TEST, file));
    }));
  })();
  await script('build/scripts', async () => {
    await outdated('dist', 'scripts.ts');
  })();
});
script('ci', test.bind(undefined, 'dist/test'));

script.exec();
