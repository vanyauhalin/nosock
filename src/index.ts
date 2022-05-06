import { create as createLogger } from './logger';
import { create as createScript } from './script';

const log = createLogger();
const script = createScript(log);

export {
  createLogger,
  createScript,
  log,
  script,
};
