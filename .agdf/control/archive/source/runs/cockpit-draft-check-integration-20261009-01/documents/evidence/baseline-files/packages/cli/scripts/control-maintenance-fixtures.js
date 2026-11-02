import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { initializeCanonicalControl } from "../lib/scaffold/canonical-init.js";
import { generatedFilesForTarget } from "../lib/scaffold/plan.js";
import { renderRunState } from "#agdf-core/control-state/run-state-repository.js";
import { sealRunState } from "#agdf-core/control-state/run-seal.js";

export function repository(base, name, { language = "en", scaffold = true } = {}) {
  const root = join(base, name);
  mkdirSync(root, { recursive: true });
  if (scaffold) initializeCanonicalControl(root, generatedFilesForTarget("init", root, false, {
    artifact_language: "en", chat_language: language, runtime_language: "en", source: "parameter", detected_locale: language,
  }));
  return root;
}

export function addRun(root, id, { sealed = false, transform = (text) => text } = {}) {
  const directory = join(root, ".agdf/control/runs", id);
  mkdirSync(directory);
  let text = transform(renderRunState(id));
  if (sealed) text = sealRunState(root, text);
  const path = join(directory, "RUN_STATE.md");
  writeFileSync(path, text);
  return path;
}

export function treeDigest(root) {
  const hash = createHash("sha256");
  const walk = (directory) => {
    for (const name of readdirSync(directory).sort()) {
      if (name === ".git") continue;
      const path = join(directory, name);
      const stat = lstatSync(path);
      hash.update(path.slice(root.length));
      if (stat.isDirectory()) walk(path);
      else if (stat.isFile()) hash.update(readFileSync(path));
      else hash.update("unsafe-path");
    }
  };
  walk(root);
  return hash.digest("hex");
}

export function git(root, ...args) {
  return execFileSync("git", ["-c", "user.name=Maintenance Fixture", "-c", "user.email=fixture@example.invalid", "-c", "core.hooksPath=/dev/null", ...args], { cwd: root, stdio: "pipe" });
}
