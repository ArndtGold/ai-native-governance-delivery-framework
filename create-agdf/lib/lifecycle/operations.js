import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";
import { evaluateOpenCodeStatus, openCodeNpmInvocation } from "../installers/opencode.js";
import { inspectPluginSurface } from "../installers/plugin-installers.js";

const CODEX_DISABLE_MARKER = "# AGDF-OWNED-REPOSITORY-PLUGIN-STATE";

function pluginSection(content, selector) {
  const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`))?.[0] ?? "";
}

function repositorySelector(targetDir) {
  return existsSync(join(targetDir, ".agents", "plugins", "marketplace.json")) ? "agdf@agdf-repo" : "agdf@agdf";
}

export function planRepositoryDisable(targetDir, surface) {
  if (surface !== "codex") {
    throw new Error(`Repository disable is not supported safely for ${surface}; no files were changed.`);
  }
  const path = join(targetDir, ".codex", "config.toml");
  const existing = existsSync(path) ? readFileSync(path, "utf8") : "";
  const selector = repositorySelector(targetDir);
  const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sectionPattern = new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`);
  const currentSection = pluginSection(existing, selector);
  const enabledMatches = [...currentSection.matchAll(/^enabled\s*=\s*(true|false)\s*$/gm)];
  if (currentSection && enabledMatches.length !== 1) {
    throw new Error(`Refusing to modify ambiguous AGDF plugin state in ${path}.`);
  }
  const section = currentSection
    ? currentSection.replace(/^enabled\s*=\s*(true|false)\s*$/m, "enabled = false")
    : `${CODEX_DISABLE_MARKER}\n[plugins.${JSON.stringify(selector)}]\nenabled = false`;
  const content = currentSection
    ? existing.replace(sectionPattern, section).replace(/\s*$/, "\n")
    : `${existing.replace(/\s*$/, "")}${existing.trim() ? "\n\n" : ""}${section}\n`;
  return Object.freeze({
    operation: "disable",
    surface,
    scope: "repository",
    mutations: Object.freeze([{ kind: "write", path, content, ownership: currentSection ? "exact_plugin_section" : "agdf_marker" }]),
    retained: Object.freeze([join(targetDir, ".agdf", "control"), "global AGDF plugin availability"]),
    expected: Object.freeze({ repository_status: "disabled" }),
  });
}

export function verifyRepositoryDisabled(targetDir) {
  const path = join(targetDir, ".codex", "config.toml");
  if (!existsSync(path)) return { status: "failed", evidence: [`missing:${path}`] };
  const selector = repositorySelector(targetDir);
  const section = pluginSection(readFileSync(path, "utf8"), selector);
  const matches = [...section.matchAll(/^enabled\s*=\s*(true|false)\s*$/gm)];
  return matches.length === 1 && matches[0][1] === "false"
    ? { status: "healthy", evidence: [`${path}:${selector}:enabled=false`] }
    : { status: "failed", evidence: [`postcondition_failed:${path}:${selector}`] };
}

export function verifyGlobalUninstall(plan, targetDir, { configDir, exec, inspect = inspectPluginSurface, evaluateOpenCode = evaluateOpenCodeStatus } = {}) {
  if (plan.surface === "opencode") {
    const report = evaluateOpenCode(targetDir, configDir);
    const remainingOwnedFiles = plan.mutations
      .filter((mutation) => mutation.kind === "remove")
      .map((mutation) => mutation.path)
      .filter((path) => existsSync(path));
    return report.status === "not_configured" && remainingOwnedFiles.length === 0
      ? { status: "healthy", evidence: [report.global_config.path, "marker_owned_global_files_removed"] }
      : { status: "failed", evidence: [report.global_config.path, ...remainingOwnedFiles.map((path) => `still_present:${path}`)] };
  }
  const report = inspect(plan.surface, exec);
  return report.status === "not_installed"
    ? { status: "healthy", evidence: report.evidence }
    : { status: "failed", evidence: [...report.evidence, `observed:${report.status}`] };
}

export function planGlobalUninstall(surface, { configDir } = {}) {
  if (surface === "codex") {
    return nativeUninstallPlan(surface, "codex", ["plugin", "remove", "agdf@agdf"]);
  }
  if (surface === "claude") {
    return nativeUninstallPlan(surface, "claude", ["plugin", "uninstall", "agdf@agdf", "--scope", "user"]);
  }
  if (surface === "opencode") {
    if (!configDir) throw new Error("OpenCode uninstall requires its explicit config directory.");
    const configPath = join(configDir, "opencode.json");
    if (!existsSync(configPath)) throw new Error(`OpenCode config not found: ${configPath}`);
    let config;
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      throw new Error(`Refusing to modify unreadable OpenCode config: ${configPath}`);
    }
    if (config.plugin !== undefined && !Array.isArray(config.plugin)) {
      throw new Error(`Refusing to modify OpenCode config with non-array plugin field: ${configPath}`);
    }
    const next = { ...config };
    next.plugin = (config.plugin ?? []).filter((entry) => entry !== pluginDefinition.opencode.npmPackage);
    if (Array.isArray(config.instructions)) next.instructions = config.instructions.filter((entry) => entry !== "AGDF.md");
    const npm = openCodeNpmInvocation(["uninstall", "--silent", pluginDefinition.opencode.npmPackage]);
    const mutations = [
      { kind: "write", path: configPath, content: `${JSON.stringify(next, null, 2)}\n`, ownership: "exact_known_entries" },
      { kind: "command", executable: npm.executable, args: npm.args, cwd: configDir },
    ];
    const retained = ["repository AGDF files", ".agdf/control"];
    for (const candidate of openCodeOwnedGlobalFiles(configDir)) {
      if (!existsSync(candidate.path)) continue;
      const content = readFileSync(candidate.path, "utf8");
      if (candidate.owned(content)) mutations.push({ kind: "remove", path: candidate.path, ownership: "agdf_marker" });
      else retained.push(candidate.path);
    }
    return Object.freeze({
      operation: "uninstall",
      surface,
      scope: "global",
      mutations: Object.freeze(mutations),
      retained: Object.freeze(retained),
      expected: Object.freeze({ installation_status: "not_installed" }),
    });
  }
  throw new Error(`Global uninstall is not supported for ${surface}.`);
}

function openCodeOwnedGlobalFiles(configDir) {
  const firstLine = (marker) => (content) => content.split(/\r?\n/)[0] === marker;
  const afterFrontmatter = (marker) => (content) => {
    const lines = content.split(/\r?\n/);
    const end = lines.findIndex((line, index) => index > 0 && line === "---");
    return end >= 0 && lines[end + 1] === marker;
  };
  const files = [
    { path: join(configDir, pluginDefinition.opencode.instructionsFileName), owned: firstLine("<!-- AGDF-GLOBAL-INSTRUCTIONS -->") },
    { path: join(configDir, pluginDefinition.opencode.runtimeContractFileName), owned: firstLine("<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->") },
  ];
  for (const moduleName of ["gate-transition.md", "interaction.md", "modes.md", "quality.md", "context-graph.md", "control-scaffold.md", "closeout.md"]) {
    files.push({ path: join(configDir, "contracts", moduleName), owned: firstLine("<!-- AGDF-GLOBAL-RUNTIME-CONTRACT -->") });
  }
  for (const skill of pluginDefinition.skillSet) {
    const name = `${pluginDefinition.opencode.globalSkillPrefix}${skill.slug}`;
    const marker = `<!-- AGDF-GLOBAL-SKILL: ${name} -->`;
    files.push({ path: join(configDir, "skills", name, "SKILL.md"), owned: afterFrontmatter(marker) });
  }
  return files;
}

function nativeUninstallPlan(surface, executable, args) {
  return Object.freeze({
    operation: "uninstall",
    surface,
    scope: "global",
    mutations: Object.freeze([{ kind: "command", executable, args: Object.freeze(args) }]),
    retained: Object.freeze(["repository AGDF files", ".agdf/control", "ambiguous configuration"]),
    expected: Object.freeze({ installation_status: "not_installed" }),
  });
}

export function applyLifecyclePlan(plan, { exec = execFileSync } = {}) {
  const completed = [];
  for (const mutation of plan.mutations) {
    try {
      if (mutation.kind === "write") {
        mkdirSync(dirname(mutation.path), { recursive: true });
        writeFileSync(mutation.path, mutation.content, "utf8");
        completed.push({ kind: "write", path: mutation.path });
      } else if (mutation.kind === "remove") {
        rmSync(mutation.path);
        completed.push({ kind: "remove", path: mutation.path });
      } else if (mutation.kind === "command") {
        exec(mutation.executable, mutation.args, { cwd: mutation.cwd, stdio: "inherit" });
        completed.push({ kind: "command", executable: mutation.executable, args: mutation.args });
      }
    } catch (error) {
      return { status: completed.length ? "partial" : "failed", completed, error, retained: [...plan.retained] };
    }
  }
  return { status: "success", completed, error: null, retained: [...plan.retained] };
}
