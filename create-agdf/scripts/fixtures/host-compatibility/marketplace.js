import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { prepareLocalMarketplace } from "../../../lib/installers/local-marketplace.js";
import { pluginDefinition } from "../../../lib/cli/runtime-context.js";

// Command stimuli belong to the synthetic host. Assertions belong to the common suite.
export function createMarketplaceFixture(base, surface, built, install) {
  const cache = join(base, "host-cache");
  const state = { registration: "", installed: false, calls: [], failInstall: false, failRollback: false };
  let transaction;
  const exec = (executable, args) => {
    if (executable !== surface) throw new Error(`Unexpected host: ${executable}`);
    const command = args.join(" "); state.calls.push(command);
    if (command === "plugin marketplace list --json") {
      const entries = state.registration ? [{ name: "agdf", source: { source: state.registration, sourceType: "local" } }] : [];
      return JSON.stringify(surface === "codex" ? { marketplaces: entries } : entries);
    }
    if (args[1] === "marketplace") {
      if (args[2] === "add") state.registration = args[3];
      else if (args[2] === "remove") state.registration = "";
      else if (args[2] !== "update") throw new Error(`Unexpected command: ${command}`);
      return "";
    }
    if (command === "plugin list") {
      if (!state.installed) return "";
      const manifest = JSON.parse(readFileSync(join(cache, surface === "codex" ? ".codex-plugin/plugin.json" : ".claude-plugin/plugin.json"), "utf8"));
      return `agdf@agdf ${manifest.version}\n`;
    }
    if (["add", "install"].includes(args[1])) {
      if (state.failInstall) { state.failInstall = false; throw new Error("injected plugin operation failure"); }
      rmSync(cache, { recursive: true, force: true });
      cpSync(join(state.registration, "plugins/agdf"), cache, { recursive: true });
      state.installed = true; return "";
    }
    if (args[1] === "uninstall") { state.installed = false; return ""; }
    throw new Error(`Unexpected command: ${command}`);
  };
  return {
    state, cache,
    permissionState: () => ({ installed: state.installed }),
    install(source = built) {
      const prepare = options => {
        transaction = prepareLocalMarketplace({ ...options, builtPluginRoot: source });
        return { ...transaction, rollback() {
          if (state.failRollback) throw new Error("injected filesystem rollback failure");
          transaction.rollback();
        } };
      };
      return install({ exec, prepare, dataRoot: join(base, "data"), recoverCache: () => ({ status: "unavailable", reason: "fixture_failure" }) });
    },
    stagedRoot: () => transaction?.pluginRoot,
    dispose: () => rmSync(base, { recursive: true, force: true }),
  };
}
