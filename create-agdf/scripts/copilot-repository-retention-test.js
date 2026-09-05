import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../lib/cli/application.js";
import { prepareCopilotMarketplace } from "../lib/installers/local-marketplace.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";

const root = mkdtempSync(join(tmpdir(), "agdf-copilot-retention-"));
execFileSync("git", ["init", "-q"], { cwd: root });
writeFileSync(join(root, ".gitignore"), ".github/copilot/settings.local.json\n", "utf8");
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
const builtPluginRoot = join(packageRoot, "generated", "plugins", "copilot", "agdf");
const prepare = (options) => prepareCopilotMarketplace({ ...options, dataRoot: join(root, "data"), builtPluginRoot });
const env = { ...process.env, AGDF_DATA_DIR: join(root, "data"), COPILOT_HOME: join(root, "home") };


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
        if (args.slice(-3).join(" ") === "skill list --json") return JSON.stringify(pluginDefinition.skillSet.map(({ slug }) => ({
          name: `agdf-${slug}`, source: "plugin", enabled: true, path: join(builtPluginRoot, "copilot-skills", `agdf-${slug}`),
        })));
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

  assert.equal(await runCli(["disable", "--surface", "copilot", "--scope", "repository", "--dir", root, "--json"], { io, env }), 0);
  assert.equal(JSON.parse(readFileSync(join(root, ".github", "copilot", "settings.local.json"), "utf8")).enabledPlugins["agdf@agdf"], false);
  assertRetained("personal Copilot repository disable");
  output.length = 0;

  execFileSync("git", ["add", "-f", ".github/copilot/settings.local.json"], { cwd: root });
  assert.equal(await runCli(["disable", "--surface", "copilot", "--scope", "repository", "--dir", root, "--json"], { io, env }), 1);
  const trackedLocalReport = JSON.parse(output.at(-1));
  assert.equal(trackedLocalReport.failure.phase, "repository_preflight");
  assert.match(trackedLocalReport.failure.message, /LOCAL_SETTINGS_NOT_IGNORED/);
  assertRetained("tracked personal Copilot settings rejection");
  output.length = 0;

  assert.equal(await runCli(["disable", "--surface", "copilot", "--scope", "repository", "--shared", "--dir", root, "--json"], { io, env }), 0);
  assert.equal(JSON.parse(readFileSync(join(root, ".github", "copilot", "settings.json"), "utf8")).enabledPlugins["agdf@agdf"], false);
  const sharedReport = JSON.parse(output.at(-1));
  assert.equal(sharedReport.activation.status, "pending_restart");
  assert.match(sharedReport.next_action.text, /\/plugin list/);
  assert.ok(sharedReport.retained.includes("independent repository instructions"));
  assertRetained("shared Copilot repository disable");
  output.length = 0;

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
