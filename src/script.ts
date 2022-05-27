import { exit } from 'node:process';
import type { ContextScript } from './context';
import { define } from './context';
import { log } from './log';
import { run } from './runner';
import { scan } from './scanner';

const { script, exec } = (() => {
  const ctx = define();
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
    async exec(file: string) {
      log.empty();
      try {
        const cur = await scan(ctx, file);
        await run(ctx, cur);
        log.empty();
      } catch (err) {
        log.empty();
        exit(0);
      }
    },
  };
})();

export {
  script,
  exec,
};
