import { env } from 'node:process';
import kleur from 'kleur';
import { log } from './log';
import type { Context, ContextScript } from './script';

function scan(context: Context, file: string): ContextScript {
  log('Scanning scripts ...').note(file);
  const { scripts } = context;

  const commands = [];
  for (const key in env) {
    if (!/^npm_package_scripts_.+/.test(key)) break;
    const command = key.replace(/^npm_package_scripts_/, '').replace(/_/g, '-');
    commands.push(command);
  }

  for (const command in scripts) {
    if (commands.includes(command)) break;
    log.warn(`The ${kleur.blue(command)} not found in package.json`);
  }

  const command = env['npm_lifecycle_event'];
  if (!command) throw new Error('Missing a run command');

  const script = scripts[command];
  if (!script) throw new Error(`The ${command} is not described`);

  return script;
}

export { scan };
