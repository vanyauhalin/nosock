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
    callback = cancellable(script.callback.bind({}));
    current.cancel = callback.cancel.bind({});
  } else {
    callback = script.callback.bind({});
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
    log('Running "%p" ...', current.command);
    try {
      result = await callback();
      if (!current.type) {
        current.type = 'done';
        delete current.cancel;
      }
    } catch (error) {
      for (const event of floor) {
        if (event.cancel) {
          event.type = 'cancel';
          event.cancel();
          delete event.cancel;
        }
      }
      current.type = 'error';
      current.error = error as Error;
      state.hasError = true;
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

  const {
    command,
    duration,
    error,
    type,
  } = current;
  switch (type) {
    case 'done':
      log.done('Finished "%p" after %a', command, duration || '');
      break;
    case 'error':
      if (error) console.error(error);
      log.error('Finished "%p" after %a', command, duration || '');
      break;
    case 'cancel':
      log.warn('Canceled "%p"', command);
      break;
    default:
      break;
  }

  return result;
}

export { run };
