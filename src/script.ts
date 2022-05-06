import kleur from 'kleur';
import type { Logger } from 'types/logger';
import type { Callback, Script } from 'types/script';
import { isAsync, stopwatch } from './utils';

function create(log: Logger): Script {
  const rejected = new Set<string>();
  const running = new Set<string>();
  const scripts = new Map<string, Callback<unknown>>();
  function inner<T extends unknown>(
    script: string,
    callback: Callback<T>,
  ): void {
    scripts.set(script, callback);
  }
  function empty(): void {
    if (!running.size) log.empty();
  }
  inner.run = (
    script = process.env['npm_lifecycle_event'],
  ) => new Promise((resolve) => {
    const { lap } = stopwatch();

    if (!script) {
      log.error.trace('No script to run');
      return;
    }
    if (rejected.size) return;
    const colored = kleur.blue(script);

    empty();
    running.add(script);
    log(`Running ${colored} ...`);

    const reject = (message: string): void => {
      running.delete(script);
      rejected.add(script);
      log.error.trace(message);
      empty();
    };
    if (!scripts.has(script)) {
      reject(`${colored} not found`);
      return;
    }
    const callback = scripts.get(script);
    if (!callback) {
      reject(`Callback for ${colored} not found`);
      return;
    }

    const done = (returns: unknown): void => {
      log[rejected.size
        ? 'error'
        : 'done'](`Finished ${colored} after ${lap()}`);
      running.delete(script);
      empty();
      resolve(returns);
    };
    const returns = callback();
    if (isAsync(callback, returns)) {
      (returns as Promise<unknown>).then(done);
      return;
    }
    done(returns);
  });
  return inner;
}

export {
  create,
};
