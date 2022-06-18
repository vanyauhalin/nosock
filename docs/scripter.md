# Scripter

The main module used to describe scripts.

## API

```js
import { script } from 'nosock';
```

### `script()`

Describes what needs to be call for a specific command.

```ts
script<C extends (this: void) => unknown | PromiseLike<unknown>>(
  command: string,
  callback: C,
  options?: {
    allowCancellation: boolean;
  },
): (this: void) => (
  Promise<C extends (this: void) => PromiseLike<unknown>
    ? Awaited<ReturnType<C>>
    : ReturnType<C>>
)
```

#### `callback`

The `callback` can be only an asynchronous function. If pass a synchronous, the TypeScript language server will not notify of the error, because `callback` will be resolved via `Promise.resolve`. But don't use synchronous functions such as `fs.readFile`, `fs.writeFile`, etc., because this is not be resolved and can lead to unexpected results.

#### `options.allowCancellation`

By default, callbacks are not cancelled, but this can be changed.

```js
const jerry = script('jerry', () => 'he-he');
const tom = script('tom', () => { throw new Error('anvil'); });

script('house', async () => {
  await tom();
  await jerry();
});
```

In this case, `tom` script will throw an error, but `jerry` script will still be executed. Pretty safely, can disable this behavior and cancel `jerry` script execution.

```js
const jerry = script('jerry', () => 'he-he', { allowCancellation: true });
const tom = script('tom', () => { throw new Error('anvil'); });

script('house', async () => {
  await tom();
  await jerry();
});
```

Things get more complicated with scripts created on the fly and execute in parallel.

```js
script('house', async () => {
  await Promise.all(['tom', 'jerry'].map(async (someone) => {
    await script(someone, () => {
      if (someone === 'tom') throw new Error('anvil');
      return 'cheese';
    }, { allowCancellation: true })();
  }));
});
```

In this case, `jerry` script will also be cancelled. But in more complex systems, `tom` script with more complex logic will take much longer to execute, and `jerry` script will have time to be executed. Take note of this when using `allowCancellation`.

## Examples

Below are the basic use cases, but remember, the nosock doesn't add limits, so turn on your fantasy!

### Copy file

```js
import fs from 'node:fs';
import { promisify } from 'node:util';
import { script } from 'nosock';

const copyFile = promisify(fs.copyFile);

script('copy', async () => {
  await copyFile('./src/main.ts', './dst/main.ts');
});
```

### Build styles

```js
import fs from 'node:fs';
import { promisify } from 'node:util';
import { script } from 'nosock';
import postcss from 'postcss';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

script('build', async () => {
  const file = readFile('src/main.css')
  const result = await postcss().process(file, { from: 'src/main.css' });
  writeFile('lib/main.css', result.css);
});
```

### Run tests

```js
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { script } from 'nosock';

const readdir = promisify(fs.readdir);

script('test', async () => {
  const files = await readdir('test');
  await Promise.all(files.map(async (file) => {
    await script(`test/${file}`, () => {
      const process = spawnSync('node', [`test/${file}`]);
      if (process.status === 0) return;
      const message = process.stdout.toString();
      throw new Error(message);
    }, { allowCancellation: true })();
  }));
});
```
