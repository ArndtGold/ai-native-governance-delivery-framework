import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, parse, relative, resolve, sep } from "node:path";

function isInside(root, candidate) {
  const path = relative(root, candidate);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function repositoryMarker(directory) {
  const marker = `${directory}${sep}.git`;
  if (!existsSync(marker)) return false;
  try {
    const stats = lstatSync(marker);
    if (stats.isSymbolicLink()) return false;
    let gitDirectory;
    if (stats.isDirectory()) gitDirectory = marker;
    else if (stats.isFile()) {
      const match = /^gitdir:\s*(.+)\s*$/u.exec(readFileSync(marker, "utf8"));
      if (!match) return false;
      gitDirectory = realpathSync(resolve(directory, match[1]));
      const gitStats = lstatSync(gitDirectory);
      if (!gitStats.isDirectory() || gitStats.isSymbolicLink()) return false;
    } else return false;
    const head = `${gitDirectory}${sep}HEAD`;
    if (!existsSync(head)) return false;
    const headStats = lstatSync(head);
    if (!headStats.isFile() || headStats.isSymbolicLink()) return false;
    const value = readFileSync(head, "utf8").trim();
    return /^ref:\s+refs\/[A-Za-z0-9._\/-]+$/u.test(value) || /^[a-f0-9]{40}(?:[a-f0-9]{24})?$/u.test(value);
  } catch {
    return false;
  }
}

export function resolveRepositoryContextByMarker(workingDirectory) {
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

  const filesystemRoot = parse(canonicalWorkingDirectory).root;
  let candidate = canonicalWorkingDirectory;
  while (true) {
    if (repositoryMarker(candidate)) {
      const repositoryRoot = realpathSync(candidate);
      if (isInside(repositoryRoot, canonicalWorkingDirectory)) {
        return Object.freeze({
          context_state: "repository_bound",
          working_directory: canonicalWorkingDirectory,
          repository_root: repositoryRoot,
          reason_code: "verified_git_marker",
          authorizes: false,
        });
      }
    }
    if (candidate === filesystemRoot) break;
    const parent = dirname(candidate);
    if (parent === candidate) break;
    candidate = parent;
  }
  return Object.freeze({
    context_state: "repo_less",
    working_directory: canonicalWorkingDirectory,
    repository_root: "",
    reason_code: "not_in_git_worktree",
    authorizes: false,
  });
}
