import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs';
import { dirname } from 'node:path';
import { exit, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import kleur from 'kleur';

const FILE = (file: string): string => kleur.white().bold().underline(file);
const PASS = kleur.bgGreen().bold().black(' PASS ');
const FAIL = kleur.bgRed().bold().black(' FAIL ');
const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = dirname(FILENAME);
let code = 0;

stderr.write('\n');

const files = await promisify(readdir)(DIRNAME);
for (const file of files) {
  if (file !== 'index.ts') {
    const process = spawnSync('node', ['-r', 'tsm', `${DIRNAME}/${file}`]);
    stdout.write(`${FILE(file)} `);
    if (process.status === 0) {
      stdout.write(`${PASS}\n\n`);
    } else {
      stdout.write(`${FAIL}\n\n`);
      const trimmed = process.stdout.toString()
        .replace(/.*[•✘].*/g, '')
        .replace(/.*(Total|Passed|Skipped|Duration).*/g, '')
        .trim();
      stderr.write(`   ${trimmed}\n\n`);
      code = 1;
    }
  }
}

exit(code);
