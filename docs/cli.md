# CLI

The main role of `nosock` CLI is to load scripts and execute them. Using the CLI is optional, but more on that [below](#isolation).

## Usage

```sh
nosock --help
```

```txt
Usage
  $ nosock [command] [options]

Options
  -c, --cwd               The current directory to resolve from  (default .)
  -r, --require           Additional module(s) to preload
  --allow-cancellation    Allow scripts cancellation  (default false)
  --no-color              Disable colorized output  (default false)
  -v, --version           Displays current version
  -h, --help              Displays this message
```

### `command`

By default, nosock match command from the NodeJS environment is used, so it is recommended to use the CLI from `package.json` without this argument. But you can specify which command that need to execute.

### `-r`, `--require`

Allows to preload additional packages, modules. For example, to work with legacy ES modules via [esm](https://github.com/standard-things/esm) or TypeScript via [tsm](https://github.com/lukeed/tsm).

### `--allow-cancellation`

Sets the default value for the scripts cancellation. Can be overridden for each script separately.

## Isolation

When running `nosock`, it looks for `scripts.{cjs,js,mjs,ts}` file and will execute specify script by command. But may need to run scripts from another file. In this situation, `node` comes to the rescue.

```sh
nosock build
```

```sh
node scripts.js build
```

`nosock`, like `node`, uses the `--require` hook, so it's easy to apply `nosock` arguments to `node`.

```sh
nosock -r esm build
nosock -r tsm build
```

```sh
node -r esm scripts.js build
node -r tsm scripts.js build
```
