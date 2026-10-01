import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveControlCommandTarget } from "../../lib/control-command.js";

export const sourceCli = fileURLToPath(new URL("../../bin/create-agdf.js", import.meta.url));
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
export function commandFixture({ cli = sourceCli, base = tmpdir(), runId = "command-test", operation = randomUUID() } = {}) {
  const root = realpathSync(mkdtempSync(join(base, "agdf-command-")));
  const runPath = join(root, ".agdf/control/runs", runId, "RUN_STATE.md");
  try {
    assert.equal(spawnSync("git", ["init", "-q"], { cwd: root }).status, 0);
    invoke(cli, ["init", "--dir", root, "--language", "de"]);
    invoke(cli, ["config", "--dir", root, "--language", "de"]);
    const revision = invoke(cli, ["run-create", "--dir", root, "--run", runId]).match(/^revision_id: (\S+)$/mu)[1];
    const urPath = join(root, ".agdf/control/artefacts", runId, "UR.md");
    mkdirSync(dirname(urPath), { recursive: true });
    writeFileSync(urPath, "# UR: Command test\n\n## Problem\nAdd subtract. The user should review this document before approval.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Eine gebundene Freigabe fehlt.\n- Ziel: Den gespeicherten Run freigeben.\n- Umfang: Ein lokaler Freigabebefehl.\n");
    const recorded = json(cli, ["run-step", "--dir", root, "--run", runId, "--revision", revision,
      "--step", "ur", "--title", "Command test"]);
    const beforePresentation = readFileSync(runPath, "utf8");
    const presentation = json(cli, ["run-present", "--dir", root, "--run", runId, "--gate", "UR", "--revision", recorded.revision_id]);
    assert.equal(readFileSync(runPath, "utf8"), beforePresentation, "presentation must not mutate the revision");
    return { root, runId, runPath, urPath, presentation, command: {
      schema_version: "1", action: "record_gate_approval", target_id: resolveControlCommandTarget(root).target_id,
      run_id: runId, gate: "UR", expected_revision_id: recorded.revision_id,
      presentation_id: presentation.presentation_id, response: "Approval: UR", operation_id: operation, assurance: "cooperative_local",
    }, cleanup: () => rmSync(root, { recursive: true, force: true }) };
  } catch (error) { rmSync(root, { recursive: true, force: true }); throw error; }
}
