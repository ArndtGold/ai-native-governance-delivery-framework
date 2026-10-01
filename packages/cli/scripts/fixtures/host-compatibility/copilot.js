import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { installCopilotGlobalPlugin } from "../../../lib/host-adapters/copilot/plugin.js";
import { pluginDefinition } from "../../../lib/cli/runtime-context.js";
const built = fileURLToPath(new URL("../../../generated/plugins/copilot/agdf", import.meta.url));
const json = path => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(value, null, 2)+"\n"); };
export const skills = root => pluginDefinition.skillSet.map(({ slug }) => ({ name: `agdf-${slug}`, source: "plugin", enabled: true, path: join(root, "copilot-skills", `agdf-${slug}`) }));

export function createCopilotFixture(base) {
  const settingsPath = join(base, 'home/settings.json');
  const checkout = join(base, 'host-checkout');
  const state = { installed: false, failSkills: false, failRecovery: false, recovering: false, calls: [] };
  writeJson(settingsPath, { model: 'auto', enabledPlugins: { unrelated: false }, extraKnownMarketplaces: {} });
  const exec = (_executable, args) => {
    const command = args.join(' '); state.calls.push(command);
    const settings = json(settingsPath);
    if (command === 'plugin list') return state.installed ? `agdf@agdf ${pluginDefinition.version}\n` : '';
    if (command === 'plugin marketplace list') {
      const source = settings.extraKnownMarketplaces?.agdf?.source;
      return !source ? '' : source.source === 'directory' ? `agdf (Local: ${source.path})` : `agdf (URL: ${source.url})`;
    }
    if (command === 'plugin uninstall agdf@agdf') { state.installed = false; return ''; }
    if (command === 'plugin marketplace remove agdf') { delete settings.extraKnownMarketplaces.agdf; writeJson(settingsPath, settings); return ''; }
    if (command === 'plugin install agdf@agdf') {
      if (state.recovering && state.failRecovery) throw new Error("injected native plugin recovery failure");
      const source = settings.extraKnownMarketplaces.agdf.source;
      rmSync(checkout, { recursive: true, force: true });
      if (source.source === 'directory') cpSync(source.path, checkout, { recursive: true });
      else execFileSync('git', ['-c', 'core.autocrlf=true', 'clone', '--quiet', '--branch', source.ref, source.url, checkout], { stdio: 'pipe' });
      settings.enabledPlugins = { ...settings.enabledPlugins, 'agdf@agdf': true };
      writeJson(settingsPath, settings);
      state.installed = true; return '';
    }
    if (command === 'skill list --json') { state.recovering = state.failSkills; return JSON.stringify(state.failSkills ? [] : skills(join(checkout, 'plugins/agdf'))); }
    throw new Error(`Unexpected fixture command: ${command}`);
  };
  const install = (pluginRoot = built) => installCopilotGlobalPlugin({ pluginRoot, dataRoot: join(base, 'data'), copilotSettingsPath: settingsPath, exec });
  return { state, install, settingsPath, checkout };
}
