import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

export const COPILOT_TRANSPORT_REVISION = 1;

export function copilotMarketplaceSpec(root, sourceDigest) {
  if (!/^[a-f0-9]{64}$/.test(sourceDigest)) throw new Error("Invalid Copilot marketplace source digest.");
  return `${pathToFileURL(resolve(root)).href}#agdf-${sourceDigest}`;
}

export function copilotMarketplaceSource(root, sourceDigest) {
  copilotMarketplaceSpec(root, sourceDigest);
  return { source: "git", url: pathToFileURL(resolve(root)).href, ref: `agdf-${sourceDigest}` };
}

function git(root, args, { exec = execFileSync } = {}) {
  return String(exec("git", [
    "--git-dir", join(root, ".git"), "--work-tree", root,
    "-c", "core.autocrlf=false", "-c", "core.fsmonitor=false",
    "-c", `core.hooksPath=${join(root, ".git", "agdf-no-hooks")}`, "-c", "commit.gpgsign=false", ...args,
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 30000,
    env: { ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))),
      GIT_AUTHOR_NAME: "AGDF package builder", GIT_AUTHOR_EMAIL: "package@agdf.invalid",
      GIT_COMMITTER_NAME: "AGDF package builder", GIT_COMMITTER_EMAIL: "package@agdf.invalid",
      GIT_AUTHOR_DATE: "2000-01-01T00:00:00Z", GIT_COMMITTER_DATE: "2000-01-01T00:00:00Z" },
  }));
}

function files(root, relative = "") {
  return readdirSync(join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    if (!relative && entry.name === ".git") return [];
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Symlink in Copilot marketplace transport: ${path}`);
    return entry.isDirectory() ? files(root, path) : [path];
  }).sort();
}

export function verifyCopilotMarketplaceTransport(root, sourceDigest, adapters = {}) {
  if (!lstatSync(join(root, ".git")).isDirectory()) throw new Error("Copilot marketplace Git metadata is missing or not owned.");
  const branch = `agdf-${sourceDigest}`;
  if (git(root, ["symbolic-ref", "--short", "HEAD"], adapters).trim() !== branch) {
    throw new Error("Copilot marketplace Git branch does not match its source digest.");
  }
  const entries = git(root, ["ls-tree", "-r", "-z", "HEAD"], adapters).split("\0").filter(Boolean);
  const tracked = new Map(entries.map((entry) => {
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(entry);
    if (!match) throw new Error("Unexpected Copilot marketplace Git tree entry.");
    return [match[3], match[2]];
  }));
  const paths = files(root);
  if (tracked.size !== paths.length) throw new Error("Copilot marketplace Git tree is incomplete.");
  for (const path of paths) {
    const content = readFileSync(join(root, path));
    const hash = createHash("sha1").update(`blob ${content.length}\0`).update(content).digest("hex");
    if (tracked.get(path) !== hash) throw new Error(`Copilot marketplace Git content mismatch: ${path}`);
  }
  return copilotMarketplaceSpec(root, sourceDigest);
}

export function buildCopilotMarketplaceTransport(root, sourceDigest, adapters = {}) {
  // The canonical staged marketplace is the Git source. No second package tree
  // or host-cache patch is needed; a new payload gets a new native Git ref.
  writeFileSync(join(root, ".gitattributes"), "* -text\n");
  git(root, ["init", "--quiet", "--template=", "--object-format=sha1", `--initial-branch=agdf-${sourceDigest}`], adapters);
  git(root, ["add", "--force", "--all"], adapters);
  git(root, ["commit", "--quiet", "--no-verify", "-m", "AGDF Copilot package"], adapters);
  return verifyCopilotMarketplaceTransport(root, sourceDigest, adapters);
}
