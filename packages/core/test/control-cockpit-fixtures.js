import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { upsertTableRow, replaceFirstScalar } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
export function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'agdf-cockpit-')));
  execFileSync(process.execPath, [join(import.meta.dirname, '../../cli/bin/create-agdf.js'), 'init', '--dir', root]);
  const runPath = createRun(root, 'fixture-a');
  const documentPath = '.agdf/control/artefacts/fixture-a/UR.md';
  fs.mkdirSync(join(root, '.agdf/control/artefacts/fixture-a'), { recursive: true });
  fs.writeFileSync(join(root, documentPath), '# Fixture document\n\nOriginal source: ä, β, 日本語.\n');
  let source = fs.readFileSync(runPath, 'utf8');
  source = upsertTableRow(source, 'Artefacts', 0, 'UR', ['UR', documentPath, 'draft', '']);
  fs.writeFileSync(runPath, sealRunState(root, source));
  const completePath = createRun(root, 'fixture-completed');
  source = replaceFirstScalar(fs.readFileSync(completePath, 'utf8'), 'lifecycle', 'completed');
  fs.writeFileSync(completePath, sealRunState(root, source));
  return { root, runPath, documentPath, close: () => fs.rmSync(root, { recursive: true, force: true }),
    register(type, path) {
      const text = upsertTableRow(fs.readFileSync(runPath, 'utf8'), 'Artefacts', 0, type, [type, path, 'draft', '']);
      fs.writeFileSync(runPath, sealRunState(root, text));
    } };
}
export function treeBytes(root) {
  const entries = {};
  const walk = path => { for (const name of fs.readdirSync(path)) {
    const file = join(path, name), stats = fs.lstatSync(file);
    entries[file.slice(root.length)] = stats.isDirectory() ? 'directory' : fs.readFileSync(file).toString('base64');
    if (stats.isDirectory()) walk(file);
  } };
  walk(join(root, '.agdf/control')); return entries;
}
