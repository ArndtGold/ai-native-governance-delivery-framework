import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveTaskTarget } from "../lib/task-target-resolution.js";
import { resolveRepositoryContext } from "../lib/repository-context.js";
import { runValidatorCli } from "../lib/runtime/validator-application.js";

const root = mkdtempSync(join(tmpdir(), "agdf-target-check-"));
const repo = join(root, "repo");
const chat = join(root, "chat");
const file = join(repo, "src", "feature.js");
mkdirSync(join(repo, "src"), { recursive: true });
mkdirSync(chat, { recursive: true });
writeFileSync(file, "export const feature = true;\n");
execFileSync("git", ["init", "-q", repo]);

try {
  assert.equal(resolveRepositoryContext("relative").context_state, "repo_less");
  assert.equal(resolveRepositoryContext(chat).reason_code, "not_in_git_worktree");
  const repositoryContext = resolveRepositoryContext(join(repo, "src"));
  assert.equal(repositoryContext.context_state, "repository_bound");
  assert.equal(repositoryContext.repository_root, realpathSync(repo));

  const base = { workingDirectory: chat };
  const noTarget = resolveTaskTarget(base);
  assert.equal(noTarget.reason_code, "no_reliable_target");
  assert.equal(noTarget.governance_target, "");
  assert.equal(noTarget.working_directory, realpathSync(chat));

  const missingContext = resolveTaskTarget({
    workingDirectory: join(root, "missing-context"),
    targetSource: "explicit_target",
    primaryTarget: repo,
  });
  assert.equal(missingContext.reason_code, "target_content_mismatch");
  assert.equal(missingContext.target_source, "explicit_target");

  const multiple = resolveTaskTarget({
    ...base,
    targetSource: "explicit_target",
    candidates: [repo, file],
  });
  assert.equal(multiple.reason_code, "multiple_plausible_targets");
  assert.equal(multiple.primary_target, "");

  const unavailable = resolveTaskTarget({ ...base, targetSource: "explicit_target", primaryTarget: join(root, "missing") });
  assert.equal(unavailable.reason_code, "target_unavailable");
  assert.equal(unavailable.target_source, "explicit_target");

  const relative = resolveTaskTarget({ ...base, targetSource: "explicit_target", primaryTarget: "repo" });
  assert.equal(relative.reason_code, "target_content_mismatch");

  const nonRepository = resolveTaskTarget({ ...base, targetSource: "explicit_target", primaryTarget: chat });
  assert.equal(nonRepository.reason_code, "target_content_mismatch");

  const explicit = resolveTaskTarget({
    ...base,
    targetSource: "explicit_target",
    primaryTarget: file,
    evidenceSources: ["user request"],
    targetChanged: true,
  });
  assert.equal(explicit.resolution_state, "resolved");
  assert.equal(explicit.reason_code, "explicit_target");
  assert.equal(explicit.primary_target, realpathSync(file));
  assert.equal(explicit.governance_target, realpathSync(repo));
  assert.equal(explicit.target_source, "explicit_target");
  assert.equal(explicit.target_changed, true);
  assert.equal(explicit.authorizes, false);

  const continued = resolveTaskTarget({ ...base, targetSource: "continued_target", primaryTarget: repo });
  assert.equal(continued.reason_code, "continued_target");

  const staleContinued = resolveTaskTarget({ ...base, targetSource: "continued_target", primaryTarget: repo, targetChanged: true });
  assert.equal(staleContinued.reason_code, "target_content_mismatch");
  assert.equal(staleContinued.resolution_state, "unresolved");

  const current = resolveTaskTarget({ workingDirectory: join(repo, "src"), targetSource: "current_repository", primaryTarget: repo });
  assert.equal(current.reason_code, "explicit_target");
  assert.equal(current.target_source, "current_repository");

  const repoLessCurrent = resolveTaskTarget({ ...base, targetSource: "current_repository", primaryTarget: repo });
  assert.equal(repoLessCurrent.reason_code, "target_content_mismatch");
  assert.equal(repoLessCurrent.resolution_state, "unresolved");

  const currentFile = resolveTaskTarget({ ...base, targetSource: "current_repository", primaryTarget: file });
  assert.equal(currentFile.reason_code, "target_content_mismatch");

  const output = [];
  const exitCode = await runValidatorCli([
    "target-check", "--json", "--target-source", "explicit_target", "--primary-target", repo,
    "--working-directory", chat,
  ], { io: { log(value) { output.push(value); }, error(value) { output.push(value); } } });
  assert.equal(exitCode, 0);
  const targetCheckOutput = JSON.parse(output[0]);
  assert.equal(targetCheckOutput.governance_target, realpathSync(repo));
  assert.equal(targetCheckOutput.task_target_orientation.semantic_block, "task_target_orientation");

  const unresolvedOutput = [];
  const unresolvedExit = await runValidatorCli(["target-check", "--json", "--working-directory", chat], {
    io: { log(value) { unresolvedOutput.push(value); }, error(value) { unresolvedOutput.push(value); } },
  });
  assert.equal(unresolvedExit, 2);
  assert.equal(JSON.parse(unresolvedOutput[0]).reason_code, "no_reliable_target");

  const germanOutput = [];
  await runValidatorCli(["target-check", "--json", "--language", "de", "--working-directory", chat], {
    io: { log(value) { germanOutput.push(value); }, error(value) { germanOutput.push(value); } },
  });
  const germanPresentation = JSON.parse(germanOutput[0]).task_target_orientation.markdown;
  assert.match(germanPresentation, /Ein primäres Ziel benennen\./);
  assert.doesNotMatch(germanPresentation, /Name exactly one/);
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("task target resolution tests passed");
