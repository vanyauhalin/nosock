import type { ContextScript } from './context';
import { run } from './runner';

const { script } = (() => {
  return {
    script: ((command, callback) => {
      const cur: ContextScript = {
        command,
        callback: () => Promise.resolve(callback()),
      };
      ctx.scripts[command] = cur;
      return run.bind(null, ctx, cur);
    }) as {
      <C extends () => unknown>(command: string, callback: C): () => (
        Promise<C extends () => Promise<unknown>
          ? Awaited<ReturnType<C>>
          : ReturnType<C>>
      );
    },
  };
})();

export {
  script,
};
