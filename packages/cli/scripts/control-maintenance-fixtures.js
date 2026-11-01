import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { initializeCurrentControl } from "../../core/test/fixtures/current-init.js";

import { createRun } from "#agdf-core/control-state/run-state-repository.js";
import { sealRunState } from "#agdf-core/control-state/run-seal.js";

export function repository(base, name, { language = "en", scaffold = true } = {}) {
  const root = join(base, name);
  mkdirSync(root, { recursive: true });
  if (scaffold) {
    initializeCurrentControl(root, 'en');
    const path = join(root, '.agdf/control/config.json');
    writeFileSync(path, JSON.stringify({ ...JSON.parse(readFileSync(path, 'utf8')), chat_language: language }));
  }
  return root;
}

export function addRun(root, id, { sealed = true, version = 4, transform = text => text } = {}) {
  const path = createRun(root, id);
  let text = transform(readFileSync(path, 'utf8'));
  if (sealed) text = sealRunState(root, text);
  if (version !== 4) text = text.replace('control_state_version: 4', 'control_state_version: ' + version);
  writeFileSync(path, text); return path;
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
