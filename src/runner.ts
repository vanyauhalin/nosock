import console from 'node:console';
import type { Context, HistoryEvent, StoreScript } from './context';
import { log } from './logger';
import { cancellable, deepener, stopwatch } from './utils';

async function run(context: Context, script: StoreScript): Promise<unknown> {
  const { history, options, state } = context;
  const { allowCancellation } = script.options || options;
  const current = { command: script.command } as HistoryEvent;
  let callback;
  let result;

  if (allowCancellation) {
    callback = cancellable(script.callback);
    current.cancel = callback.cancel;
  } else {
    callback = script.callback;
  }

  if (state.depth === 1) history.push([]);
  const floor = deepener.dive(history);
  if (state.depth > 0) floor.push(current);
  const index = floor.length - 1;

  state.depth += 1;
  if (state.hasError && allowCancellation) {
    current.type = 'cancel';
    delete current.cancel;
  } else {
    const lap = stopwatch();
    log('Starting "%p" ...', current.command);
    try {
      result = await callback();
      if (!current.type) {
        current.type = 'done';
        delete current.cancel;
      }
    } catch (error) {
      state.hasError = true;
      for (const event of floor) {
        if (event.cancel) {
          event.type = 'cancel';
          event.cancel();
          delete event.cancel;
        }
      }
      current.type = 'error';
      current.error = error as Error;
    }
    current.duration = lap();
  }
  state.depth -= 1;

  if (state.depth > 0) {
    floor[index] = current;
  } else {
    current.type = current.type === 'error' || state.hasError
      ? 'error'
      : 'done';
    floor.push(current);
  }

  switch (current.type) {
    case 'done':
      if (current.duration) {
        log.done('Finished "%p" after %a', current.command, current.duration);
      } else {
        log.done('Finished "%p"', current.command);
      }
      break;
    case 'error':
      if (current.error) console.error(current.error);
      if (current.duration) {
        log.error('Finished "%p" after %a', current.command, current.duration);
      } else {
        log.error('Finished "%p"', current.command);
      }
      break;
    case 'cancel':
      if (current.duration) {
        log.warn('Canceled "%p" after %a', current.command, current.duration);
      } else {
        log.warn('Canceled "%p"', current.command);
      }
      break;
    default:
      break;
  }

  return result;
}

export { run };
