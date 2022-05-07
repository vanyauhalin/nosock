import type { Script } from 'types';
import { log } from './logger';
import { create } from './script';

const suite = (): Script => create();
const script = suite();

export {
  log,
  script,
};
