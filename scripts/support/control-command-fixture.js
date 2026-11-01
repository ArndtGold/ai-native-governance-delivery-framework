import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveControlCommandTarget } from "../../packages/cli/lib/control-command.js";
import { createRun } from '../../packages/core/lib/control-state/run-state-repository.js';
import { parseRunState } from '../../packages/core/lib/control-state/run-state-parser.js';
import { runDocumentPath } from '../../packages/core/lib/control-state/run-identity.js';
import { clarifiedUr } from '../../packages/core/test/planned-fixtures.js';

export const sourceCli = fileURLToPath(new URL("../../packages/cli/bin/create-agdf.js", import.meta.url));
export function invoke(cli, args, expected = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  assert.equal(result.status, expected, `${args[0]}: ${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
export function json(cli, args, expected = 0) { return JSON.parse(invoke(cli, args, expected)); }
export function approvalArgs(fixture, command = fixture.command) {
  return ["run-approve", "--dir", fixture.root, "--run", command.run_id, "--gate", command.gate,
    "--revision", command.expected_revision_id, "--presentation", command.presentation_id,
    "--response", command.response, "--operation", command.operation_id, "--assurance", command.assurance];
}
export function commandFixture({ cli = sourceCli, base = tmpdir(), runId = 'command-test', operation = randomUUID() } = {}) {
  const root = realpathSync(mkdtempSync(join(base, 'agdf-command-')));
  try {
    assert.equal(spawnSync('git', ['init', '-q'], { cwd: root }).status, 0);
    json(cli, ['init', '--dir', root, '--language', 'en']);
    const runPath = createRun(root, runId), revision = () => parseRunState(readFileSync(runPath, 'utf8')).meta.revision_id;
    const urPath = join(root, 'incoming-ur.md');
    writeFileSync(urPath, clarifiedUr + '\n## AGDF Approval Summary (de; source=en)\n- Problem: Eine gebundene Freigabe fehlt.\n- Ziel: Das genaue Dokument bewusst prüfen.\n- Umfang: Ein lokaler Freigabebefehl.\n');
    const recorded = json(cli, ['run-step', '--dir', root, '--run', runId, '--revision', revision(), '--step', 'ur', '--title', 'Command test', '--evidence', urPath]);
    assert.equal(recorded.outcome, 'accepted');
    const beforePresentation = readFileSync(runPath, 'utf8');
    const presentation = json(cli, ['run-present', '--dir', root, '--run', runId, '--gate', 'UR', '--revision', revision(), '--language', 'de']);
    assert.equal(presentation.outcome, 'accepted');
    assert.equal(readFileSync(runPath, 'utf8'), beforePresentation, 'presentation must not mutate the revision');
    return { root, runId, runPath, urPath: join(root, runDocumentPath(runId, 'UR.md')), presentation, command: {
      schema_version: '1', action: 'record_gate_approval', target_id: resolveControlCommandTarget(root).target_id,
      run_id: runId, gate: 'UR', expected_revision_id: revision(), presentation_id: presentation.family_result.presentation_id,
      response: 'Approval: UR', operation_id: operation, assurance: 'cooperative_local',
    }, cleanup: () => rmSync(root, { recursive: true, force: true }) };
  } catch (error) { rmSync(root, { recursive: true, force: true }); throw error; }
}

// Private fault harness: use the same resolved current envelope as the public
// facade, while retaining checkpoint injection below that existing boundary.
import { executeApprovalCommand as executeApprovalFamily } from '../../packages/core/lib/control-state/approval-command.js';
import { resolveMcpInput } from '../../packages/core/lib/mcp-input-resolution.js';
import { withInputResolution } from '../../packages/core/lib/control-state/input-resolution.js';
import { inspectRunInputResolution } from '../../packages/core/lib/control-state/run-input-resolution.js';
import { commandGroupDefinition, runCommandRequestDigest } from '../../packages/core/lib/control-state/run-command-schema.js';
import { resources } from '../../packages/cli/lib/runtime/control-context.js';
export function executeBoundApproval(root, command, dependencies) {
  const target = resolveControlCommandTarget(root);
  const original = { working_directory: process.cwd(), primary_target: target.root, target_source: 'explicit_target',
    target_id: command.target_id, run_id: command.run_id, expected_revision_id: command.expected_revision_id,
    operation_id: command.operation_id, assurance: command.assurance,
    command: { kind: 'approval.record', payload: { gate: command.gate, presentation_id: command.presentation_id, response: command.response } } };
  const selected = resolveMcpInput(commandGroupDefinition('agdf_approve'), original, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution });
  return withInputResolution(selected.resolution, () => executeApprovalFamily(root, command, {
    ...dependencies, afterWrite: dependencies.afterWrite ?? dependencies.checkpoint,
    commandContext: { request_digest: runCommandRequestDigest(selected.arguments) },
  }), selected.original);
}
