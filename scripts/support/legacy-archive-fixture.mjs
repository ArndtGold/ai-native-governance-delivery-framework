import * as fs from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
export function legacyArchiveFixture() {
  const root = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), 'agdf-archive-test-')));
  const put = (path, text) => { fs.mkdirSync(join(root, '.agdf/control', path, '..'), { recursive: true }); fs.writeFileSync(join(root, '.agdf/control', path), text); };
  put('config.json', '{"control_layout":"master-backlog-v1","artifact_language":"en"}\n');
  put('MASTER_BACKLOG.md', '# Historical backlog\nPreserve these exact bytes.\n');
  put('runs/old-run/RUN_STATE.md', '# AGDF Run State\n\n## Run Meta\n\n- control_state_version: 2\n- run_id: old-run\n- lifecycle: completed\n- current_gate: OR\n\n## Objective\n\nHistorisches Vorhaben\n\n## Approvals\n\n| Gate | Status | Evidence |\n|---|---|---|\n| UR | approved | Deliberate old reply |\n');
  put('artefacts/old-run/UR.md', '# UR: Erhalten\r\n\r\nUnveränderte Übernahme: äöü.\r\n');
  put('artefacts/old-run/RECORD-old.json', '{"old":"binding","path":"original"}\n');
  fs.mkdirSync(join(root, '.agdf/control/artefacts/old-run/empty'), { recursive: true });
  return { root, put, dispose: () => fs.rmSync(root, { recursive: true, force: true }) };
}
