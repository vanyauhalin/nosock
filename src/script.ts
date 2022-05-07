import kleur from 'kleur';
import type { Script, ScriptCallback } from 'types';
import { log } from './logger';
import { isAsync, stopwatch } from './utils';

function create(): Script {
  const rejected = new Set<string>();
  const running = new Set<string>();
  const scripts = new Map<string, ScriptCallback<unknown>>();
  function empty(): void {
    if (!running.size) log.empty();
  }
  function inner<T extends unknown>(
    event: string,
    callback: ScriptCallback<T>,
  ): void {
    scripts.set(event, callback);
  }
  inner.run = (
    event = process.env['npm_lifecycle_event'],
  ) => new Promise((resolve) => {
    const { lap } = stopwatch();

    if (!event) {
      log.error.trace('No script to run');
      return;
    }
    if (rejected.size) return;
    const colored = kleur.blue(event);

    running.add(event);
    log(`Running ${colored} ...`);

    const reject = (message: string): void => {
      running.delete(event);
      rejected.add(event);
      log.error.trace(message);
      empty();
    };
    if (!scripts.has(event)) {
      reject(`${colored} not found`);
      return;
    }
    const callback = scripts.get(event);
    if (!callback) {
      reject(`Callback for ${colored} not found`);
      return;
    }

    const done = (returns: unknown): void => {
      log[rejected.size
        ? 'error'
        : 'done'](`Finished ${colored} after ${lap()}`);
      running.delete(event);
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
