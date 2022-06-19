# Scripter

The main module used to describe scripts.

## API

```js
import { script } from '@vanyauhalin/nosock';
```

```ts
interface Scripter {
  <C extends () => unknown | PromiseLike<unknown>>(
    command: string,
    callback: C,
    options?: {
      allowCancellation: boolean;
    },
  ): () => (
    Promise<C extends () => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  exec(): void;
}
```

### `script()`

Describes what needs to be call for a specific command.

```ts
script<C extends () => unknown | PromiseLike<unknown>>(
  command: string,
  callback: C,
  options?: {
    allowCancellation: boolean;
  },
): () => (
  Promise<C extends () => PromiseLike<unknown>
    ? Awaited<ReturnType<C>>
    : ReturnType<C>>
)
```

#### `callback`

The `callback` can be only an asynchronous function. Don't use synchronous functions such as `fs.readFile`, `fs.writeFile`, etc., because this is not be resolved and can lead to unexpected results.

#### `options.allowCancellation`

By default, callbacks are not cancelled, but this can be changed.

```js
const jerry = script('jerry', () => 'cheese');
const tom = script('tom', () => { throw new Error('anvil'); });

script('house', async () => {
  await tom();
  await jerry();
});
```

In this case, `tom` script will throw an error, but `jerry` script will still be executed. Pretty safely, you can disable this behavior and cancel `jerry` script execution.

```js
const jerry = script('jerry', () => 'cheese', { allowCancellation: true });
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

### `script.exec()`

Executes scripts and nothing more.

```ts
script.exec(): void
```

```js
script('jerry', () => 'cheese');
script('tom', () => { throw new Error('anvil'); });
script.exec();
```
