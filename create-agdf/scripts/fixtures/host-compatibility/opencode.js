import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pluginDefinition } from "../../../lib/cli/runtime-context.js";
import { digestNormalizedPluginSource } from "../../../lib/runtime/plugin-provenance.js";

// Reuses the smoke test's isolated npm/package projection. All commands are closed fixture inputs.
export function setup(base, built) {
  mkdirSync(base, { recursive: true });
  const config = join(base, "config"); mkdirSync(config);
  const state = { failInstall: false, failRollback: false, calls: [] };
  const npm = join(base, "npm.cjs");
  writeFileSync(npm, `const fs=require("node:fs"),path=require("node:path");
const root=process.env.HAC_FIXTURE_ROOT;
if(process.cwd()!==root||!root||!process.env.HAC_FIXTURE_SOURCE)throw new Error("outside fixture");
const args=process.argv.slice(2);
if(args[0]!=="install"||args.at(-1)!==${JSON.stringify(`${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`)})throw new Error("unexpected npm invocation");
fs.appendFileSync(path.join(root,"commands.jsonl"),JSON.stringify(args)+"\\n");
const target=path.join(root,"node_modules/create-agdf");fs.mkdirSync(target,{recursive:true});
for(const name of ["bin","lib","opencode-plugin.js"]){fs.cpSync(path.join(${JSON.stringify(fileURLToPath(new URL("../../../", import.meta.url)))},name),path.join(target,name),{recursive:true});}
fs.writeFileSync(path.join(target,"package.json"),JSON.stringify({name:"create-agdf",version:${JSON.stringify(pluginDefinition.version)},type:"module",main:"opencode-plugin.js"}));
const payload=path.join(target,"generated/plugins/agdf");fs.rmSync(payload,{recursive:true,force:true});fs.cpSync(process.env.HAC_FIXTURE_SOURCE,payload,{recursive:true});
const sdk=path.join(root,"node_modules/@opencode-ai/plugin");fs.mkdirSync(path.join(sdk,"dist"),{recursive:true});
fs.writeFileSync(path.join(sdk,"package.json"),JSON.stringify({name:"@opencode-ai/plugin",version:process.versions.node,types:"dist/index.d.ts"}));
fs.writeFileSync(path.join(sdk,"dist/index.d.ts"),'export type Hooks={"experimental.chat.system.transform":unknown;"experimental.session.compacting":unknown;};');
if(process.env.HAC_FIXTURE_FAIL==="1"){console.error("injected interrupted package operation");process.exit(1);}
`);
  const cache = join(config, "node_modules/create-agdf/generated/plugins/agdf");
  return {
    state, cache, config,
    permissionState: () => JSON.parse(readFileSync(join(config, "opencode.json"), "utf8")).permission,
    install(source = built) {
      const child = spawnSync(process.execPath, [fileURLToPath(new URL("./opencode-exec.mjs", import.meta.url))], {
        cwd: base, encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
        env: { ...process.env, NODE_ENV: "test", AGDF_TEST_NPM_CLI_PATH: npm, AGDF_OPENCODE_BIN: process.execPath,
          OPENCODE_CONFIG_DIR: config, HAC_FIXTURE_ROOT: config, HAC_FIXTURE_SOURCE: resolve(source), HAC_FIXTURE_FAIL: state.failInstall ? "1" : "0" },
      });
      state.calls = existsSync(join(config, "commands.jsonl")) ? readFileSync(join(config, "commands.jsonl"), "utf8").trim().split("\n") : [];
      const response = child.stdout?.trim() ? JSON.parse(child.stdout) : null;
      if (child.error || child.status !== 0 || response?.error) throw Object.assign(new Error(response?.error?.message || child.stderr || "fixture execution failed"), response?.error);
      return { pluginRoot: cache, sourceDigest: digestNormalizedPluginSource(cache, pluginDefinition.version),
        runtimeDigest: JSON.parse(readFileSync(join(cache, "runtime/runtime-manifest.json"), "utf8")).digest };
    },
    stagedRoot: () => cache,
    dispose: () => rmSync(base, { recursive: true, force: true }),
  };
}
