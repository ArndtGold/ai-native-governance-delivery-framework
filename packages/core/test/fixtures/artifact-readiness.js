import { seedProjectionResource } from '../control-cockpit-fixtures.js';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { currentFixture } from './current-run.js';
import { createRun } from '../../lib/control-state/run-state-repository.js';
import { parseRunState } from '../../lib/control-state/run-state-parser.js';
import { sealRunState } from '../../lib/control-state/run-seal.js';
import { createPrdDefinitionTestRun } from '../../../cli/scripts/fixtures/prd-definition.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../../cli/scripts/fixtures/sd-definition.js';
import { createTpDefinitionTestRun, syntheticTp } from '../../../cli/scripts/fixtures/tp-definition.js';
import { clarifiedUr } from '../planned-fixtures.js';

// Actual current upstream receipts, synthetic disposable approvals. The selected
// candidate remains unregistered so read-only authoring checks may inspect edits.
export function artifactReadinessFixture(gate = 'PRD', language = 'de', runId = 'synthetic-draft') {
  const cleanup = [], context = currentFixture({ after(fn) { cleanup.push(fn); } });
  const root = context.root, cli = resolve(import.meta.dirname, '../../../cli/bin/create-agdf.js');
  let authoring;
  if (gate !== 'UR') authoring = ({ PRD: createPrdDefinitionTestRun, SD: createSdDefinitionTestRun, TP: createTpDefinitionTestRun }[gate])(root, cli, runId);
  const runPath = authoring?.state ?? createRun(root, runId), prefix = `.agdf/control/runs/${runId}/documents/`;
  mkdirSync(join(root, prefix), { recursive: true });
  const path = join(root, prefix, gate + '.md');
  writeFileSync(path, ({ UR: clarifiedUr, PRD: readyPrd, SD: syntheticSd(), TP: syntheticTp() })[gate]);
  const config = join(root, '.agdf/control/config.json');writeFileSync(config, JSON.stringify({ ...JSON.parse(readFileSync(config, 'utf8')), chat_language: language }));
  const currentRevision = () => parseRunState(readFileSync(runPath, 'utf8')).meta.revision_id;
  return { root, runId, gate, prefix, runPath, path, get revision(){return currentRevision();}, currentRevision,
    registerProjection(){seedProjectionResource(context,runPath,gate,prefix+gate+'.md');},
    close() { for (const fn of cleanup.reverse()) fn(); },
    recordCandidate(update = false, content = readFileSync(path, 'utf8')) {
      writeFileSync(authoring.file(gate + '.md'), content); return authoring.recordGate(gate, update);
    },
    approveCandidate() { const p = authoring.present(gate, language); if (p.value?.outcome !== 'accepted') return p; return authoring.approve(gate, p.value.family_result.presentation_id); },
    reseal: change => writeFileSync(runPath, sealRunState(root, change(readFileSync(runPath, 'utf8')))) };
}

export const readyPrd = `# PRD: Synthetic readiness\n\nOwner: Synthetic product owner\nTraceability contract: criteria-chain-v1\n\n## Product Scope\nRead the existing source without changing control state.\n\n## Acceptance Criteria\n- criterion_id: AC-001\n- observable_success: The user can read the selected document.\n\n## Approval Decisions\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n| Scope | before_prd | resolved | Reading only | Synthetic product owner |\n\n## AGDF Approval Summary (de; source=en)\n- Ziel: Die gewählte Quelle lesen.\n- Umfang: Nur Lesen, keine Änderung.\n- AC-001: Die gewählte Quelle bleibt lesbar.\n- Entscheidungen: Der Leseumfang ist geklärt.\n`;
