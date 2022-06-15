import console from 'node:console';
import type {
  Context,
  History,
  HistoryEvent,
  StoreScript,
} from './context';
import { log } from './logger';
import { deepener, stopwatch } from './utils';

function report(history: History): void {
  for (const event of deepener.raise(history)) {
    switch (event.type) {
      case 'done':
        log.done('Finished %p after %a', event.command, event.duration);
        break;
      case 'error':
        if (event.error) console.error(event.error);
        log.error('Finished %p after %a', event.command, event.duration);
        break;
      case 'cancel':
        log.warn('Canceled %p', event.command);
        break;
      default:
        break;
    }
  }
}

async function run(context: Context, script: StoreScript): Promise<unknown> {
  const lap = stopwatch();
  const { history, options, state } = context;
  const { callback, command } = script;
  const event = { command } as HistoryEvent;
  let result;

  if (state.depth === 0) history.push([]);
  const floor = deepener.dive(history);
  if (state.depth >= 0) floor.length += 1;
  const depth = floor.length - 1;
  state.depth += 1;

  if (!options.noCancel && state.hasError) {
    event.type = 'cancel';
  } else {
    log('Running %p ...', event.command);
    try {
      result = await Promise.resolve(callback());
      event.type = 'done';
    } catch (error) {
      event.error = error as Error;
      event.type = 'error';
      state.hasError = true;
    }
  }

  if (depth === -1) {
    floor.push({
      ...event,
      duration: lap(),
      type: event.type === 'error' || state.hasError ? 'error' : 'done',
    });
    report(history);
  } else {
    floor[depth] = {
      ...event,
      duration: lap(),
    };
  }

  state.depth -= 1;
  return result;
}

export { run };
