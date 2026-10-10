import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { artefactFileDigest, sealRunState } from '../../lib/control-state/run-seal.js';
import { digest } from '../../lib/control-state/approval-command-contract.js';

// Synthetic non-authorizing control data confined to a temporary test repository.
export function artifactReadinessFixture(gate = 'PRD', language = 'de', runId = 'synthetic-draft') {
  const root = mkdtempSync(join(tmpdir(), 'agdf-artifact-check-'));
  execFileSync('git', ['init', '--quiet', root], { stdio: 'pipe' });
  execFileSync(process.execPath, [resolve(import.meta.dirname, '../../../cli/bin/create-agdf.js'), 'init', '--dir', root, '--language', 'en'], { stdio: 'pipe' });
  const revision = randomUUID(), gates = ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'];
  const prefix = `.agdf/control/artefacts/${runId}/`, runDir = join(root, `.agdf/control/runs/${runId}`);
  mkdirSync(join(root, prefix), { recursive: true });
  mkdirSync(join(runDir, 'presentations'), { recursive: true });
  writeFileSync(join(root, '.agdf/control/config.json'), JSON.stringify({ artifact_language: 'en', chat_language: language, runtime_language: 'en' }));
  rmLegacy(root);
  for (const name of ['UR', 'PRD', 'SD', 'TP', 'BROWNFIELD_REVIEW']) writeFileSync(join(root, `${prefix}${name}.md`), `# ${name}: Synthetic document\n\nThis document records the existing synthetic source for isolated readiness tests.\n`);
  const approvals = gates.map((g, index) => {
    if (index >= gates.indexOf(gate)) return `| ${g} | missing | |`;
    const id = randomUUID(), record = { schema_version: 1, presentation_id: id, run_id: runId, gate: g,
      revision_id: randomUUID(), artefact_digest: artefactFileDigest(root, `${prefix}${g}.md`) };
    const hash = digest(JSON.stringify(record));
    writeFileSync(join(runDir, 'presentations', `${id}.json`), JSON.stringify({ record, digest: hash }));
    return `| ${g} | approved | Approval: ${g}; presentation ${id} ${hash} |`;
  }).join('\n');
  let body = `# AGDF Run State\n\n## Run Meta\n- control_state_version: 2\n- run_id: ${runId}\n- lifecycle: active\n- revision: 1\n- revision_id: ${revision}\n- mode: structured_delivery\n- current_gate: ${gate}\n- decision: in_progress\n- owner: synthetic-test\n\n## Objective\nSynthetic isolated authoring check.\n\n## Approvals\n| Gate | Status | Evidence |\n|---|---|---|\n${approvals}\n\n## Artefacts\n| Type | Path | Status | Notes |\n|---|---|---|---|\n`;
  for (const g of gates.slice(0, 5)) body += `| ${g} | ${gates.indexOf(g) < gates.indexOf(gate) ? `${prefix}${g}.md` : ''} | ${gates.indexOf(g) < gates.indexOf(gate) ? 'approved' : 'missing'} | synthetic |\n`;
  body += `| Brownfield Review | ${prefix}BROWNFIELD_REVIEW.md | done | synthetic |\n\n## Mode/Slice Decision\n- decision: structured_delivery\n- required_next_gate: PRD\n- scope_reason: Synthetic test scope\n- evidence: ${prefix}BROWNFIELD_REVIEW.md\n\n## Artefact Chain\n| From | Relationship | To | Evidence |\n|---|---|---|---|\n| UR | approved_by | Approval: UR | synthetic |\n| PRD | derived_from | UR | synthetic |\n| SD | derived_from | PRD | synthetic |\n| TP | derived_from | SD | synthetic |\n\n## Closeout\n- next_allowed_action: Draft the current artifact.\n`;
  const runPath = join(runDir, 'RUN_STATE.md');
  writeFileSync(runPath, sealRunState(root, body));
  return { root, runId, revision, gate, prefix, runPath, path: join(root, `${prefix}${gate}.md`),
    reseal: change => writeFileSync(runPath, sealRunState(root, change(readFileSync(runPath, 'utf8')))) };
}

function rmLegacy(root) { rmSync(join(root, '.agdf/control/AGDF_RUN.md'), { force: true }); }

export const readyPrd = `# PRD: Synthetic readiness\n\nOwner: Synthetic product owner\nTraceability contract: criteria-chain-v1\n\n## Product Scope\nRead the existing source without changing control state.\n\n## Acceptance Criteria\n- criterion_id: AC-001\n- expected_result: The user can read the selected document.\n\n## Approval Decisions\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n| Scope | before_prd | resolved | Reading only | Synthetic product owner |\n\n## AGDF Approval Summary (de; source=en)\n- Ziel: Die gewählte Quelle lesen.\n- Umfang: Nur Lesen, keine Änderung.\n- AC-001: Die gewählte Quelle bleibt lesbar.\n- Entscheidungen: Der Leseumfang ist geklärt.\n`;
