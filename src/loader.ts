import { readdir } from 'node:fs';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

async function load(): Promise<string> {
  const cwd = resolve('.');
  const files = await promisify(readdir)(cwd);
  let file = files
    .find((name) => /^\.?(scripts(rc)?)\.([cm]js|[jt]s)/.test(name));
  if (!file) throw new Error('Scripts file not found');
  file = `${cwd}/${file}`;
  await import(file);
  return file;
}

export { load };
