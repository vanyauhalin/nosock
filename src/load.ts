import { readdir } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { exec } from './script';

async function load(): Promise<void> {
  const cwd = resolve('.');
  const rc = (await promisify(readdir)(cwd))
    .find((el) => /\.?((scripts|scer)(rc)?)\.([cm]js|[jt]s)/.test(el));
  if (!rc) throw new Error('Scripts file not found');
  await import(`${cwd}/${rc}`);
  await exec();
}

export {
  load,
};
