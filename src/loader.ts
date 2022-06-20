import { promises } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const { readdir } = promises;
const require = createRequire(import.meta.url);

function isModuleExists(name: string): boolean {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
}

interface LoaderOptions {
  cwd: string;
  require: string | string[];
}

interface LoadedOptions {
  cwd: string;
  file: string;
  require: string | string[];
}

async function load(options: LoaderOptions): Promise<LoadedOptions> {
  const cwd = resolve(options.cwd);
  const files = await readdir(cwd);
  let file = files.find((name) => /^scripts\.([cm]js|[jt]s)/.test(name));
  if (!file) throw new Error('Scripts file not found');
  file = `${cwd}/${file}`;

  const modules = [options.require].flat().filter(Boolean);
  for (const module of modules) {
    let path;
    if (isModuleExists(module)) {
      path = module;
    } else {
      path = resolve(module);
      if (!isModuleExists(path)) {
        throw new Error(`Cannot fine module "${module}"`);
      }
    }
    require(path);
  }

  if (modules.length > 0) {
    require(file);
  } else {
    await import(`file://${file}`);
  }

  return {
    cwd,
    file,
    require: modules,
  };
}

export type { LoadedOptions, LoaderOptions };
export { load };
