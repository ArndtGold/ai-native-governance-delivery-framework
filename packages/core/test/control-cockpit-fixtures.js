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

// Canonical approval setup is confined to disposable fixtures, outside app-only windows.
export async function approvalFixture() {
  const { recordRunStep } = await import('../lib/control-state/run-steps.js');
  const { policyForRunContent } = await import('../lib/control-evaluation/run-step-policy.js');
  const { parseRunState } = await import('../lib/control-state/run-state-parser.js');
  const { prepareRunPresentation } = await import('../lib/control-state/run-presentation.js');
  const { approveRunGate } = await import('../lib/control-state/run-recording.js');
  const { evaluateGateCheck } = await import('../lib/control-evaluation/gate-check.js');
  const f = fixture();
  try {
    fs.writeFileSync(join(f.root, f.documentPath), '# UR: Approval fixture\n\n## Problem\nInspect stored pointers independently from current Run authority.\n\n## Goal\nKeep provenance and human approval separate.\n\n## Scope\nDisposable fixture only.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Gespeicherte Angaben getrennt vom aktuellen Run prüfen.\n- Ziel: Herkunft und Freigabe getrennt halten.\n- Umfang: Nur isolierter Test.\n');
    fs.writeFileSync(f.runPath, sealRunState(f.root, fs.readFileSync(f.runPath, 'utf8')));
    fs.writeFileSync(join(f.root,'.agdf/control/artefacts/fixture-a/BROWNFIELD_REVIEW.md'),'# Brownfield Review\n');
    const revision = () => parseRunState(fs.readFileSync(f.runPath, 'utf8'), 'fixture-a').meta.revision_id;
    const step = (name, values) => recordRunStep(f.root, { runId:'fixture-a', revisionId:revision(), step:name, ...values },
      { policy:policyForRunContent, date:'2026-10-07' });
    for (const result of [step('ur', {title:'Approval fixture'}), step('route', {route:'quick_task',reason:'isolated approval fixture',evidence:'test'})]) {
      if (result.outcome !== 'recorded') throw Error(JSON.stringify(result));
    }
    const presentation = prepareRunPresentation(f.root, {runId:'fixture-a',gate:'UR',revisionId:revision()}, {evaluateGateCheck});
    if (presentation.outcome !== 'prepared') throw Error(JSON.stringify(presentation));
    return {...f, revision, approve:() => approveRunGate(f.root, {runId:'fixture-a',gate:'UR',revisionId:revision(),response:'Approval: UR',presentationId:presentation.presentation_id}, {evaluateGateCheck})};
  } catch (error) { f.close(); throw error; }
}
