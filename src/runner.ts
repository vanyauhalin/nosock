import console from 'node:console';
import type { Context, HistoryEvent, StoreScript } from './context';
import { log } from './logger';
import { deepener, stopwatch } from './utils';

async function run(context: Context, script: StoreScript): Promise<unknown> {
  const { history, options, state } = context;
  const { callback, command } = script;
  const event = { command } as HistoryEvent;
  let result;

  if (state.depth === 1) history.push([]);
  const floor = deepener.dive(history);
  if (state.depth >= 1) floor.length += 1;
  const index = floor.length - 1;

  state.depth += 1;
  if (state.hasError && !options.noCancel) {
    event.type = 'cancel';
  } else {
    const lap = stopwatch();
    log('Running "%p" ...', event.command);
    try {
      result = await Promise.resolve(callback());
      event.type = 'done';
    } catch (error) {
      event.error = error as Error;
      event.type = 'error';
      state.hasError = true;
    }
    event.duration = lap();
  }
  state.depth -= 1;

  if (state.depth === 0) {
    event.type = event.type === 'error' || state.hasError ? 'error' : 'done';
    floor.push(event);
  } else {
    floor[index] = event;
  }

  switch (event.type) {
    case 'done':
      log.done('Finished "%p" after %a', event.command, event.duration);
      break;
    case 'error':
      if (event.error) console.error(event.error);
      log.error('Finished "%p" after %a', event.command, event.duration);
      break;
    case 'cancel':
      log.warn('Canceled "%p"', event.command);
      break;
    default:
      break;
  }

  return result;
}

export { run };
