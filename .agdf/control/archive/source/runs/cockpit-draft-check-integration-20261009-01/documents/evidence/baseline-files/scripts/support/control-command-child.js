// Private child-process harness. No public flags or environment variables enable these checkpoints.
import { existsSync, writeFileSync } from "node:fs";
import { executeApprovalCommand } from "../../packages/core/lib/control-state/approval-command.js";
import { evaluateGateCheck } from "../../packages/core/lib/control-evaluation/gate-check.js";
import { cliGitObservation } from "../../packages/cli/lib/control-evaluation/git-observation.js";
process.once("message", ({ root, command, pauseAt, marker, release }) => {
  const result = executeApprovalCommand(root, command, {
    packageVersion: "0.14.5", evaluateGateCheck: (target, selection) => evaluateGateCheck(target, selection, cliGitObservation),
    checkpoint: (stage) => {
      if (stage !== pauseAt) return;
      writeFileSync(marker, stage);
      const until = Date.now() + 20000;
      while (!existsSync(release)) {
        if (Date.now() > until) throw new Error("private checkpoint timed out");
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
      }
    },
  });
  process.send(result, () => process.disconnect());
});
