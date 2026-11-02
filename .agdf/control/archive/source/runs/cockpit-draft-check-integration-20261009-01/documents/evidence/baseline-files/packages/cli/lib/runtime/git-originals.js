import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isSafeControlRelativePath } from "#agdf-core/control-state/contained-file.js";
import { directoryIdentity } from "#agdf-core/control-state/run-store-inspection.js";
import { canonicalRunText } from "#agdf-core/control-state/run-seal.js";
const textDigest = content => `sha256:${createHash("sha256").update(canonicalRunText(content)).digest("hex")}`;
function git(root, args) {
  return execFileSync("git", args, { cwd: root, stdio: ["ignore", "pipe", "ignore"], timeout: 3000, maxBuffer: 2 * 1024 * 1024 });
}

// Search only this checkout's current history and the exact referenced path. Git is a source
// of original bytes, never proof of a historical approval. Symlink/tree objects are not sources.
export function readGitOriginals(root, path) {
  if (!isSafeControlRelativePath(path)) return [];
  try {
    directoryIdentity(git(root, ["rev-parse", "--show-toplevel"]).toString().replace(/\r?\n$/u, ""));
    // Git resolves Windows short/long directory aliases; filesystem-relative paths do not.
    const prefix = git(root, ["rev-parse", "--show-prefix"]).toString().replace(/\r?\n$/u, "");
    const objectPath = `${prefix}${path}`;
    if (!isSafeControlRelativePath(objectPath)) return [];
    const commits = [...new Set([git(root, ["rev-parse", "HEAD"]).toString().trim(),
      ...git(root, ["log", "-8", "--format=%H", "--", path]).toString().trim().split(/\r?\n/u)])]
      .filter((commit) => /^[0-9a-f]{40,64}$/u.test(commit));
    const originals = [];
    for (const commit of commits) {
      try {
        const tree = git(root, ["ls-tree", "--full-tree", "-z", commit, "--", objectPath]).toString();
        if (!/^100(?:644|755) blob [0-9a-f]+\t/u.test(tree) || tree.slice(tree.indexOf("\t") + 1, -1) !== objectPath) continue;
        const bytes = git(root, ["show", `${commit}:${objectPath}`]);
        originals.push({ path, git_path: objectPath, source: "git", commit, digest: textDigest(bytes.toString("utf8")), bytes: bytes.toString("base64") });
      } catch { /* Missing or oversized objects require manual recovery. */ }
    }
    return originals;
  } catch { return []; }
}

