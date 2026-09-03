import { spawnSync } from "node:child_process";
import { existsSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, sep } from "node:path";

function isInside(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

export function resolveRepositoryContext(workingDirectory, dependencies = {}) {
  const runGit = dependencies.runGit ?? spawnSync;
  const rawPath = String(workingDirectory ?? "").trim();
  if (!rawPath || !isAbsolute(rawPath) || !existsSync(rawPath)) {
    return Object.freeze({
      context_state: "repo_less",
      working_directory: rawPath || "unavailable",
      repository_root: "",
      reason_code: "working_directory_unavailable",
      authorizes: false,
    });
  }
  let canonicalWorkingDirectory;
  try {
    canonicalWorkingDirectory = realpathSync(rawPath);
    if (!statSync(canonicalWorkingDirectory).isDirectory()) throw new Error("not_directory");
  } catch {
    return Object.freeze({
      context_state: "repo_less",
      working_directory: rawPath,
      repository_root: "",
      reason_code: "working_directory_unavailable",
      authorizes: false,
    });
  }
  const child = runGit("git", ["-C", canonicalWorkingDirectory, "rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 5000,
  });
  if (child.status !== 0) {
    return Object.freeze({
      context_state: "repo_less",
      working_directory: canonicalWorkingDirectory,
      repository_root: "",
      reason_code: "not_in_git_worktree",
      authorizes: false,
    });
  }
  try {
    const repositoryRoot = realpathSync(String(child.stdout ?? "").trim());
    if (!isInside(repositoryRoot, canonicalWorkingDirectory)) throw new Error("root_mismatch");
    return Object.freeze({
      context_state: "repository_bound",
      working_directory: canonicalWorkingDirectory,
      repository_root: repositoryRoot,
      reason_code: "verified_git_worktree",
      authorizes: false,
    });
  } catch {
    return Object.freeze({
      context_state: "repo_less",
      working_directory: canonicalWorkingDirectory,
      repository_root: "",
      reason_code: "repository_root_unavailable",
      authorizes: false,
    });
  }
}
