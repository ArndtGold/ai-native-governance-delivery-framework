import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../lib/cli/application.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";

const root = mkdtempSync(join(tmpdir(), "agdf-copilot-retention-"));
const paths = [
  "AGENTS.md",
  "AGENTS.agdf.md",
  join(".github", "copilot-instructions.md"),
  join(".github", "skills", "legacy", "SKILL.md"),
  join(".agdf", "control", "RUN_STATE.md"),
];
for (const [index, relativePath] of paths.entries()) {
  const path = join(root, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `user-owned-${index}\n`, "utf8");
}
const snapshot = () => Object.fromEntries(paths.map((relativePath) => [relativePath, readFileSync(join(root, relativePath), "utf8")]));
const baseline = snapshot();
const output = [];
const io = { log(value = "") { output.push(String(value)); }, error(value = "") { output.push(String(value)); } };
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const prepare = () => ({
  root: join(root, "marketplace"),
  pluginRoot: join(packageRoot, "generated", "plugins", "copilot", "agdf"),
  commit() {},
  rollback() {},
});
const env = { ...process.env, AGDF_DATA_DIR: join(root, "data") };

function assertRetained(label) {
  assert.deepEqual(snapshot(), baseline, `${label} must retain existing Copilot and AGDF repository files byte-for-byte`);
}

try {
  for (const phase of ["install", "update"]) {
    let listCalls = 0;
    const code = await runCli(["copilot", "--dir", root, "--json", "--runtime-checks", "manual"], {
      io,
      env,
      prepare,
      exec() {
        const error = new Error("spawn copilot ENOENT");
        error.code = "ENOENT";
        throw error;
      },
      packagedCopilotExec(_executable, args) {
        if (args.at(-2) === "plugin" && args.at(-1) === "list") {
          listCalls += 1;
          return listCalls === 1 ? "" : `agdf@agdf ${pluginDefinition.version}\n`;
        }
        return `${phase} complete\n`;
      },
    });
    assert.equal(code, 0, `${phase} fixture must complete: ${output.join("\n")}`);
    output.length = 0;
    assertRetained(phase);
  }

  await runCli(["status", "--surface", "copilot", "--dir", root, "--json"], {
    io,
    env,
    exec(_executable, args) {
      return args.at(-1) === "list" ? `agdf@agdf ${pluginDefinition.version}\n` : "";
    },
  });
  assertRetained("status");

  assert.equal(await runCli(["disable", "--surface", "copilot", "--scope", "repository", "--dir", root, "--json"], { io, env }), 1);
  assertRetained("unsupported Copilot repository disable");

  assert.equal(await runCli(["uninstall", "--surface", "copilot", "--scope", "global", "--confirm", "--dir", root, "--json"], {
    io,
    env,
    exec(_executable, args) {
      if (args.at(-1) === "list") {
        return "";
      }
      return "";
    },
  }), 0);
  assertRetained("uninstall");

  assert.equal(await runCli(["copilot", "--dir", root, "--json", "--runtime-checks", "manual"], {
    io,
    env,
    prepare,
    exec() {
      throw new Error("host operation failed");
    },
  }), 1);
  assertRetained("failed install");

  console.log("Copilot repository retention tests passed (install, update, status, disable, uninstall and failure)");
} finally {
  rmSync(root, { recursive: true, force: true });
}
