import { define as defineContext } from './context';
import { define as defineExecutor } from './executor';
import { define as defineScripter } from './scripter';

const { actual, exec, script } = (() => {
  const context = defineContext();
  return {
    actual: () => context,
    exec: defineExecutor(context),
    script: defineScripter(context),
  };
})();

export { actual, exec, script };
export { log } from './logger';
