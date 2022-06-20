# Logger

Wrapper for `process.stdout` that adds a time prefix, types and [color injection](#color-injection).

## API

```js
import { log } from '@vanyauhalin/nosock';
```

```ts
interface Logger {
  (message: string, ...values: string[]): Logger;
  done(this: void, message: string, ...values: string[]): Logger;
  empty(this: void, message?: string, ...values: string[]): Logger;
  error(this: void, message: string, ...values: string[]): Logger;
  warn(this: void, message: string, ...values: string[]): Logger;
}
```

### `log()`

Writes a message with a time prefix and [color injection](#color-injection).

```ts
log(message: string, ...values: string[]): Logger
```

```js
log('Hello World!');
```

```txt
[15:49:17.245]       Hello World!
```

### `log.done()`

Writes a message with a time prefix, type and [color injection](#color-injection).

```ts
log.done(this: void, message: string, ...values: string[]): Logger
```

```js
log.done('Everything went well');
```

```txt
[15:49:17.245] done  Everything went well
```

### `log.empty()`

Writes an empty new line or message with [color injection](#color-injection).

```ts
log.empty(this: void, message?: string, ...values: string[]): Logger
```

```js
log.empty().empty('Something here is somehow empty');
```

```txt

Something here is somehow empty
```

### `log.error()`

Writes a message with a time prefix, type and [color injection](#color-injection).

```ts
log.error(this: void, message: string, ...values: string[]): Logger
```

```js
log.error('We screwed up somewhere');
```

```txt
[15:49:17.245] error We screwed up somewhere
```

### `log.warn()`

Writes a message with a time prefix, type and [color injection](#color-injection).

```ts
log.warn(this: void, message: string, ...values: string[]): Logger
```

```js
log.warn('Are you sure?');
```

```txt
[15:49:17.245] warn  Are you sure?
```

## Color injection

Color injection works similar to NodeJS [`utils.format`](https://nodejs.org/api/util.html#utilformatformat-args) by replacing the flags on the message with the passed values. Visit [kleur](https://github.com/lukeed/kleur) for more information about colors.

```txt
%a   accent            magenta
%aa  accent attention  yellow
%an  accent negative   red
%ap  accent positive   green
%p   primary           blue
```

Single color injection.

```js
log('%a', 'hello');
```

Multiply color injection.

```js
log('%a %p', 'hello', 'world');
```
