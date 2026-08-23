import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const tempDir = mkdtempSync(join(tmpdir(), "agdf-release-bootstrap-"));
const expectedVersion = process.env.AGDF_EXPECTED_VERSION
  || JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const homeDir = join(tempDir, "home");
const npmCacheDir = join(tempDir, "npm-cache");
const targetDir = join(tempDir, "target");
const logPath = join(tempDir, "codex.log");
const markerPath = join(homeDir, "codex-plugin-installed");
const binDir = join(tempDir, "bin");

mkdirSync(homeDir, { recursive: true });
mkdirSync(npmCacheDir, { recursive: true });
mkdirSync(targetDir, { recursive: true });
mkdirSync(binDir, { recursive: true });

const fakeCodexPath = join(binDir, "codex");
writeFileSync(fakeCodexPath, `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.AGDF_BOOTSTRAP_CODEX_LOG, JSON.stringify(args) + "\\n");
if (args.join(" ") === "plugin marketplace list --json") console.log(JSON.stringify({ marketplaces: [] }));
if (args.join(" ") === "plugin add agdf@agdf --json") fs.writeFileSync(process.env.AGDF_BOOTSTRAP_MARKER, "installed\\n");
if (args.join(" ") === "plugin list") console.log("agdf@agdf " + process.env.AGDF_EXPECTED_VERSION);
`, "utf8");
chmodSync(fakeCodexPath, 0o755);

try {
  const output = execFileSync("npx", ["--yes", "@agdf/cli@latest", "codex"], {
    cwd: targetDir,
    encoding: "utf8",
    stdio: "pipe",
    env: {
      ...process.env,
      HOME: homeDir,
      NPM_CONFIG_CACHE: npmCacheDir,
      AGDF_BOOTSTRAP_CODEX_LOG: logPath,
      AGDF_BOOTSTRAP_MARKER: markerPath,
      AGDF_EXPECTED_VERSION: expectedVersion,
      AGDF_DATA_DIR: join(homeDir, "agdf-data"),
      PATH: `${binDir}${delimiter}${process.env.PATH}`,
    },
  });

  if (!output.includes(`Version: ${expectedVersion} (verified)`)
    || !output.includes("Installation scope: global")
    || !output.includes("Verification: healthy")
    || !output.includes("Restart required: yes")) {
    throw new Error("Clean public bootstrap did not report the verified global lifecycle Success Card.");
  }

  const calls = readFileSync(logPath, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line).join(" "));
  const expectedCalls = [
    "plugin marketplace list --json",
    `plugin marketplace add ${join(homeDir, "agdf-data", "marketplaces", "agdf")} --json`,
    "plugin add agdf@agdf --json",
    "plugin list",
  ];
  if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) {
    throw new Error(`Clean public bootstrap dispatch changed: ${calls.join(" | ")}`);
  }

  if (!existsSync(markerPath)) throw new Error("Clean public bootstrap did not produce the expected isolated installation marker.");
  console.log("Clean public bootstrap smoke test passed with release-built local marketplace distribution.");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
