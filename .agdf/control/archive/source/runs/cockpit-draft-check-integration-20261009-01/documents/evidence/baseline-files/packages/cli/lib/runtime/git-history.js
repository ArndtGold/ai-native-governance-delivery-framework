import { execFileSync } from "node:child_process";
export function readGitHistory(root, path) {
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000, maxBuffer: 1024 * 1024 });
  return git(["log", "--all", "--follow", "--format=%H", "--", path]).trim().split(/\r?\n/u).filter(Boolean).slice(0, 25).flatMap(commit => {
    try { return [{ path, commit, content: git(["show", `${commit}:${path}`]) }]; } catch { return []; }
  });
}
