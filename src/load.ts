import { readdir } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

async function load(opts: {
  cwd?: string;
}): Promise<void> {
  const cwd = resolve(opts.cwd || '..');
  const rc = (await promisify(readdir)(cwd))
    .find((el) => /\.?((scripts|scer)(rc)?)\.([cm]js|[jt]s)/.test(el));
  if (!rc) throw new Error('Scripts file not found');
  await import(`${cwd}/${rc}`);
}

export {
  load,
};
