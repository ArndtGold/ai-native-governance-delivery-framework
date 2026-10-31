import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { commandFixture } from '../../../scripts/support/control-command-fixture.js';
import { executeApprovalCommand } from '../lib/control-state/approval-command.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { withOwnedFileLock } from '../lib/control-state/run-state-writer.js';
import { runSealState } from '../lib/control-state/run-seal.js';
import { readApprovalOperations } from '../lib/control-state/approval-operations.js';

const dependencies = { evaluateGateCheck, packageVersion: '0.20.2' };
for (const legacy of ['absent', 'conflicted', 'locked']) {
  test(`approval does not depend on ${legacy} legacy backlog`, () => {
    const f = commandFixture();
    try {
      const path = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
      if (legacy === 'absent') rmSync(path, { force: true });
      if (legacy === 'conflicted') writeFileSync(path, '<<<<<<< old\nlegacy idea\n=======\nother idea\n>>>>>>> branch\n');
      const before = existsSync(path) ? readFileSync(path, 'utf8') : null;
      const approve = () => executeApprovalCommand(f.root, f.command, dependencies);
      const result = legacy === 'locked' ? withOwnedFileLock(path, approve) : approve();
      assert.equal(result.outcome, 'accepted', JSON.stringify(result));
      assert.equal(existsSync(path) ? readFileSync(path, 'utf8') : null, before);
      const content = readFileSync(f.runPath, 'utf8');
      assert.equal(runSealState(f.root, content).status, 'valid');
      assert.equal(readApprovalOperations(content).receipts.length, 1);
      assert.equal(approve().outcome, 'already_applied');
      assert.equal(readFileSync(f.runPath, 'utf8'), content);
    } finally { f.cleanup(); }
  });
}
