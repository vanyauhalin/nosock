import type { Context } from 'types';
import { log } from './log';
import { create as createScan } from './scan';
import { create as createScript } from './script';

const ctx: Context = {
  rejected: [],
  scripts: {},
};
const scan = createScan(ctx);
const script = createScript(ctx);

export {
  log,
  scan,
  script,
};
