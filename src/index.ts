import type { Context } from 'types';
import { log } from './logger';
import { create as createScript } from './script';

const ctx: Context = {
  rejected: [],
  scripts: {},
};
const script = createScript(ctx);

export {
  log,
  script,
};
