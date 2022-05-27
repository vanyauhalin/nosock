import { define as defineContext } from './context';
import { define as defineExecutor } from './executor';
import { define as defineScript } from './scripter';

const { exec, script } = (() => {
  const context = defineContext();
  return {
    exec: defineExecutor(context),
    script: defineScript(context),
  };
})();

export * from './utils';
export { exec, script };
export { log } from './log';
