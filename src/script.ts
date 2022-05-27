import { exit } from 'node:process';
import { log } from './log';
import { run } from './runner';
import { scan } from './scanner';

interface Context {
  rejected: number;
  scripts: Record<string, ContextScript>;
}
type ContextScript = {
  command: string;
  callback(this: void): Promise<unknown>;
};

const { script, exec } = (() => {
  const ctx: Context = {
    rejected: 0,
    scripts: {},
  };
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

export type { Context, ContextScript };
export {
  script,
  exec,
};
