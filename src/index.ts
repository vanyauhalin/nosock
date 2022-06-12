import { define as defineContext } from './context';
import { define as defineExecutor } from './executor';
import { define as defineScripter } from './scripter';

const { exec, script } = (() => {
  const context = defineContext();
  return {
    exec: defineExecutor(context),
    script: defineScripter(context),
  };
})();

export { exec, script };
export { load } from './loader';
export { log } from './logger';
