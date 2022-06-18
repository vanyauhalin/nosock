# Utils

A few functions that are primarily used inside the library and are not meant to be used outside of it.

## API

```js
import { deepener, stopwatch } from 'nosock/utils';
```

### `cancellable`

A wrapper that adds a `cancel` method to the passed `callback`.

```ts
cancellable<C extends (this: void) => unknown | PromiseLike<unknown>>(
  callback: C,
): {
  (this: void): (
    Promise<undefined | C extends (this: void) => PromiseLike<unknown>
      ? Awaited<ReturnType<C>>
      : ReturnType<C>>
  );
  cancel(this: void): void;
}
```

```js
let result = false;
const callback = cancellable(async () => {
  await delay(1500);
  result = true;
});
callback();
callback.cancel();
// result is false
```

### `deepener`

A group of functions for working with a deep array.

```ts
type DeepArray<T> = (T | DeepArray<T>)[]
```

#### `deepener.dive()`

Dives into a deep array relative to all last elements of the array.

```ts
deepener.dive<T>(array: DeepArray<T>): T[]
```

```js
const array = [1, [[[2]], [3]]];
const result = deepener.dive(array);
result.push(4);
// array is [1, [[[2]], [3, 4]]]
```

#### `deepener.raise()`

Raises all elements of a deep array to the simple array.

```ts
deepener.raise<T>(array: DeepArray<T>): T[]
```

```js
const array = [1, [[[2]], [3]]];
const result = deepener.raise(array);
// result is [1, 2, 3]
```

### `stopwatch()`

Stopwatch to calculate elapsed time.

```ts
stopwatch(): () => string
```

```js
const lap = stopwatch();
const time = lap();
// time is 0.01ms
```
