import { existsSync, readdir } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import type { Options } from './options';

async function find(cwd: string): Promise<string> {
  const files = await promisify(readdir)(resolve(cwd));
  const founded = files
    .find((name) => /^(scripts|nosock)\.([cm]js|[jt]s)/.test(name));
  if (!founded) throw new Error('Scripts file not found');
  return founded;
}

async function load(
  file: string | undefined,
  options: Options,
): Promise<string> {
  const founded = file || await find(options.cwd);
  const loadable = resolve(options.cwd, founded);
  if (!existsSync(loadable)) throw new Error('Scripts file not exists');
  await import(loadable);
  return loadable;
}

export { load };
