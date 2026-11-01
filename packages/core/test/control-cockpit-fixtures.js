import { randomUUID } from 'node:crypto';
import { currentFixture } from './fixtures/current-run.js';
import { clarifiedUr } from './planned-fixtures.js';
import { runDocumentPath } from '../lib/control-state/run-identity.js';
import { parseRunState, parseControlState } from '../lib/control-state/run-state-parser.js';
import { artefactFileDigest } from '../lib/control-state/run-seal.js';
import { deliveryRelationships } from '../lib/control-evaluation/delivery-relationships.js';
import { resolveMcpInput } from '../lib/mcp-input-resolution.js';
import { resources } from '../lib/resources/context.js';
import { commandGroupDefinition, runCommandRequestDigest } from '../lib/control-state/run-command-schema.js';
import { withInputResolution, bindInputResolution } from '../lib/control-state/input-resolution.js';
import { ARTEFACT_BINDING_VERSION, artefactBindingDigest, appendArtefactBinding, validArtefactBinding, readArtefactBindings } from '../lib/control-state/artefact-bindings.js';
import { operationSources, operationReceipt } from '../lib/control-state/run-operation-proof.js';
import { evidenceSourceSetDigest } from '../lib/control-state/evidence-bindings.js';
import { appendRunOperation } from '../lib/control-state/run-operations.js';
import { canonicalJson, COOPERATIVE_ASSURANCE } from '../lib/control-state/approval-command-contract.js';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { upsertTableRow, replaceFirstScalar } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';
export function fixture({ layout = 'run-folders-v1' } = {}) {
  if (layout !== 'run-folders-v1') throw Error('unsupported_fixture_layout');
  const cleanup = [], f = currentFixture({ after(fn) { cleanup.push(fn); } });
  const root = f.root, runPath = createRun(root, 'fixture-a'), documentPath = runDocumentPath('fixture-a', 'UR.md');
  const revision = () => parseRunState(fs.readFileSync(runPath, 'utf8')).meta.revision_id;
  const binding = () => ({ run_id: 'fixture-a', expected_revision_id: revision() });
  const content = clarifiedUr.replace('Independent work', 'Fixture document') + '\nOriginal source: ä, β, 日本語.\n';
  const recorded = f.call('step.record', { step: 'ur', title: 'Fixture document', source: f.material(binding(), 'UR', content) }, binding());
  if (recorded.outcome !== 'accepted') throw Error(JSON.stringify(recorded));
  const completePath = createRun(root, 'fixture-completed');
  fs.writeFileSync(completePath, sealRunState(root, fs.readFileSync(completePath, 'utf8').replace('lifecycle: active', 'lifecycle: completed')));
  return { root, runPath, documentPath, context: f, binding, revision,
    close() { for (const fn of cleanup.reverse()) fn(); },
    // Synthetic projection seeds, including malformed negatives. This is not a
    // successful production command or evidence of human acceptance.
    register(type, path) { seedProjectionResource(f, runPath, type, path); },
  };
}
export function seedProjectionResource(f, statePath, type, path) {
  const original = fs.readFileSync(statePath, 'utf8'), parsed = parseRunState(original), runId = parsed.meta.run_id;
  const revision = Number(parsed.meta.revision) + 1, next = randomUUID(), operation = randomUUID();
  const observed = artefactFileDigest(f.root, path), hash = observed.startsWith('sha256:') ? observed : 'sha256:' + '0'.repeat(64);
  const formal = deliveryRelationships.find(row => row.requiredBy !== 'UR' && row.from === type);
  const step = type === 'UR' ? 'ur' : type === 'Brownfield Review' ? 'route' : type;
  const payload = formal ? { gate: formal.requiredBy, material: { path, digest: hash }, reviewer: 'Synthetic fixture reviewer', reviewed: true, update_draft: false }
    : { step: ['ur', 'route'].includes(step) ? step : 'internal', source: { path, digest: hash },
      ...(step === 'ur' ? { title: 'Fixture document' } : step === 'route' ? { route: 'quick_task', reason: 'Synthetic projection only' } : { internal_step: step, decision: 'pass' }) };
  const input = f.request(formal ? 'artefact.record' : 'step.record', payload, { run_id: runId, expected_revision_id: parsed.meta.revision_id, operation_id: operation });
  const selected = resolveMcpInput(commandGroupDefinition('agdf_record'), input, { defaults: resources.defaults });
  let text = withInputResolution(selected.resolution, () => {
    if (formal) {
      const sourcePath = parseControlState(original).artefacts.get(formal.to)?.path ?? runDocumentPath(runId, formal.to + '.md');
      const sourceDigest = artefactFileDigest(f.root, sourcePath);
      const receipt = bindInputResolution({ schema_version: ARTEFACT_BINDING_VERSION, binding_id: randomUUID(), target_id: f.base.target_id, run_id: runId,
        relationship: { from: formal.from, relationship: formal.relationship, to: formal.to }, destination: { type, path, digest: hash, status: type === 'QA_REPORT' ? 'pass' : 'draft' },
        source: { type: formal.to, path: sourcePath, digest: sourceDigest.startsWith('sha256:') ? sourceDigest : 'sha256:' + '0'.repeat(64) },
        review: { reviewer: 'Synthetic fixture reviewer', reviewed: true }, origin: 'reviewed_mapping',
        operation: { id: operation, previous_revision_id: parsed.meta.revision_id, resulting_revision_id: next, revision, request_digest: runCommandRequestDigest(selected.arguments) }, supersedes: (readArtefactBindings(original).latest??[]).find(row => row.relationship.from === formal.from)?.binding_id ?? null });
      return validArtefactBinding(receipt) ? appendArtefactBinding(original, receipt)
        : appendRaw(original, 'Artefact Bindings', '| binding_id | receipt_digest | receipt |', operation, artefactBindingDigest(receipt), receipt);
    }
    const sources = operationSources(f.root, parseControlState(original), step);
    const evidence = { schema_version: '1', run_id: runId, operation_id: operation, action: 'step.record', step,
      report: { path, digest: hash }, sources, source_set_digest: evidenceSourceSetDigest(sources),
      producer: { contract: 'run-command/1', package_version: '0.20.2' }, assurance: COOPERATIVE_ASSURANCE };
    let candidate = appendRaw(original, 'Evidence Bindings', '| operation_id | binding |', operation, null, evidence);
    const receipt = operationReceipt(f.root, { meta: parsed.meta }, { kind: 'step.record', operation_id: operation, request_digest: runCommandRequestDigest(selected.arguments) }, next,
      { evidence_binding_id: operation, status: 'done', covers: 'Synthetic projection fixture' }, '0.20.2');
    return appendRunOperation(candidate, receipt);
  });
  text = replaceFirstScalar(replaceFirstScalar(text, 'revision', String(revision)), 'revision_id', next);
  try { text = sealRunState(f.root, text); } catch { /* Deliberately malformed references remain invalid test input. */ }
  fs.writeFileSync(statePath, text);
}
function appendRaw(content, heading, header, id, hash, receipt) {
  const encoded = Buffer.from(canonicalJson(receipt)).toString('base64url');
  const row = hash ? `| ${receipt.binding_id} | ${hash} | ${encoded} |` : `| ${id} | ${encoded} |`;
  const marker = `## ${heading}`, start = content.indexOf(marker), block = `${marker}\n\n- schema_version: 1\n\n${header}\n${hash ? '|---|---|---|' : '|---|---|'}\n${row}\n`;
  if (start < 0) return content.trimEnd() + '\n\n' + block;
  const end = content.indexOf('\n## ', start + marker.length), at = end < 0 ? content.length : end;
  return content.slice(0, at).trimEnd() + '\n' + row + '\n' + content.slice(at);
}
// Windows without Developer Mode refuses symlinks (EPERM). Only the symlink assertions are
// skipped there: a whole test via `t`, otherwise the caller skips its own symlink step.
export function symlinkOrSkip(target, path, t, type) {
  try { fs.symlinkSync(target, path, type); return true; }
  catch (error) {
    if (process.platform !== 'win32' || error.code !== 'EPERM') throw error;
    const reason = 'symlinks need elevated privileges or Windows Developer Mode (EPERM)';
    if (t) t.skip(reason); else console.warn(`SKIPPED symlink assertions: ${reason}`);
    return false;
  }
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
  const f = fixture();
  try {
    const prepared = f.context.call('presentation.prepare', { gate: 'UR' }, f.binding());
    if (prepared.outcome !== 'accepted') throw Error(JSON.stringify(prepared));
    return { ...f, presentationId: prepared.family_result.presentation_id,
      approve: () => f.context.call('approval.record', { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' }, f.binding()) };
  } catch (error) { f.close(); throw error; }
}
