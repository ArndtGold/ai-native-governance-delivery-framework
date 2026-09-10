import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createInstallSetupPreflight, createInstallSetupResult } from "../lib/install-setup/contract.js";
import { createLifecycleResult } from "../lib/lifecycle/result.js";
import { normalizeInstallScopeChoice, normalizeInstallSetupChoice, selectInstallScope, selectInstallSetup } from "../lib/install-setup/interaction.js";
import {
  installSetupChoiceOptions,
  installSetupScopeOptions,
  projectInstallSetupResult,
  renderInstallSetupPreflight,
  renderInstallSetupScopePreflight,
  renderInstallSetupText,
} from "../lib/install-setup/presentation.js";

const registry = JSON.parse(readFileSync(new URL("../../plugin/meta/agdf-interaction-locales.json", import.meta.url), "utf8"));

function preflight(overrides = {}) {
  return createInstallSetupPreflight({
    surface: "codex",
    version: "0.14.5",
    interaction: "required",
    plugin: { status: "observed", evidence: [] },
    mcp_by_scope: {
      project: { status: "not_configured", capability: "unverified", selected_status: "absent", effective_source: "user", registration_path: "/tmp/project/.codex/config.toml", available: true, block_reason: "none", removal_command: "remove project" },
      user: { status: "not_configured", capability: "unverified", selected_status: "absent", effective_source: "none", registration_path: "/tmp/home/.codex/config.toml", available: true, block_reason: "none", removal_command: "remove user" },
    },
    target: "/tmp/project",
    target_source: "interactive_invocation_cwd_proposal",
    invocation_directory_source: "process_cwd",
    requested_scope: null,
    effective_scope: null,
    plugin_configuration: null,
    local_execution: true,
    package_acquisition_required: true,
    removal_overview: "agdf uninstall --surface codex --scope global",
    full_available: true,
    full_block_reason: "none",
    authorizes: false,
    ...overrides,
  });
}

assert.equal(normalizeInstallSetupChoice("1"), "full");
assert.equal(normalizeInstallSetupChoice("plugin-only"), "plugin_only");
assert.equal(normalizeInstallSetupChoice("C"), "cancel");
assert.equal(normalizeInstallSetupChoice(""), "empty");
assert.equal(normalizeInstallSetupChoice("yes"), "invalid");
assert.equal(normalizeInstallSetupChoice(null), "eof");
assert.equal(normalizeInstallScopeChoice("1"), "project");
assert.equal(normalizeInstallScopeChoice("U"), "user");
assert.equal(normalizeInstallScopeChoice("back"), "back");
assert.equal(normalizeInstallScopeChoice(""), "empty");

const options = installSetupChoiceOptions(preflight(), { registry, language: "de-DE" });
assert.deepEqual(options.map(({ value }) => value), ["full", "plugin_only", "cancel"]);
assert.equal(options[0].recommended, true);
assert.equal(options[0].enabled, true);
assert.equal(options.some((option) => Object.hasOwn(option, "selected")), false);
const scopeOptions = installSetupScopeOptions(preflight(), { registry, language: "de" });
assert.deepEqual(scopeOptions.map(({ value }) => value), ["project", "user", "back"]);
assert.equal(scopeOptions[0].recommended, true);
assert.equal(scopeOptions.every((option) => !Object.hasOwn(option, "default")), true);

{
  const answers = ["", "other", "2"];
  const requests = [];
  const output = [];
  const selected = await selectInstallScope(preflight(), {
    registry,
    language: "de",
    write: (value) => output.push(value),
    readChoice(request) { requests.push(request); return answers.shift(); },
  });
  assert.equal(selected, "user");
  assert.equal(requests.every((request) => request.default === null), true);
  assert.match(output[0], /MCP-Registrierungsbereich auswählen/);
  assert.match(output[0], /Benutzerweit einrichten/);
  assert.match(output[0], /Benutzerkonfiguration/);
}

assert.equal(await selectInstallScope(preflight(), {
  registry, language: "en", present: false, write() {}, readChoice() { return "3"; },
}), "back");
assert.equal(await selectInstallScope(preflight(), {
  registry, language: "en", present: false, write() {}, readChoice() { return null; },
}), "cancel");

{
  const answers = ["", "yes", "1"];
  const output = [];
  const requests = [];
  const result = await selectInstallSetup(preflight(), {
    registry,
    language: "de",
    write: (value) => output.push(value),
    readChoice(request) { requests.push(request); return answers.shift(); },
  });
  assert.equal(result, "full");
  assert.equal(requests.length, 3);
  assert.equal(requests.every((request) => request.default === null), true);
  assert.match(output[0], /AGDF-Installation einrichten/);
  assert.match(output[1], /Keine Auswahl/);
  assert.match(output[2], /genau 1, 2 oder 3/);
}

{
  const blocked = preflight({ full_available: false, full_block_reason: "mcp_foreign" });
  const answers = ["full", "2"];
  const output = [];
  assert.equal(await selectInstallSetup(blocked, {
    registry,
    language: "en",
    write: (value) => output.push(value),
    readChoice() { return answers.shift(); },
  }), "plugin_only");
  assert.equal(output.some((line) => line.includes("registration is foreign")), true);
}

let mutationCalls = 0;
for (const terminalChoice of [null, undefined]) {
  assert.equal(await selectInstallSetup(preflight(), {
    registry,
    language: "en",
    present: false,
    readChoice() { return terminalChoice; },
    write() { mutationCalls += 1; },
  }), "cancel");
}
assert.equal(await selectInstallSetup(preflight(), {
  registry,
  language: "en",
  present: false,
  readChoice() { throw new Error("EOF"); },
  write() { mutationCalls += 1; },
}), "cancel");
assert.equal(mutationCalls, 0);

const englishFallback = renderInstallSetupPreflight(preflight(), { registry, language: "fr-CA" });
assert.match(englishFallback, /AGDF installation setup/);
assert.doesNotMatch(englishFallback, /AGDF-Installation einrichten/);
const german = renderInstallSetupPreflight(preflight(), { registry, language: "de-AT" });
assert.match(german, /Vollständig einrichten/);
assert.match(german, /lokalen AGDF-MCP-Server bereitstellen und.*registrieren/s);
assert.match(german, /MCP-Ziel: \/tmp\/project/);
assert.match(german, /MCP-Zustand: Projekt, Benutzerkonto/);
assert.match(renderInstallSetupScopePreflight(preflight(), { registry, language: "de" }), /Aufruf- und Prioritätskontext: \/tmp\/project/);
let germanChoicePrompt;
assert.equal(await selectInstallSetup(preflight(), {
  registry,
  language: "de",
  present: false,
  readChoice({ prompt }) { germanChoicePrompt = prompt; return "2"; },
}), "plugin_only");
assert.equal(germanChoicePrompt, "Lokalen MCP-Server einrichten? (1-3): ");

const cancelled = createInstallSetupResult({
  setup_request: "cancel",
  surface: "codex",
  target: null,
  target_source: "none",
  invocation_directory_source: "none",
  requested_scope: null,
  effective_scope: null,
  plugin: { status: "not_run" },
  runtime_checks: { status: "not_run" },
  mcp: { status: "not_requested" },
  discovery: { status: "not_checked" },
  restart: { required: false, reasons: [] },
  failure: null,
  next_action: { code: "cancelled", parameters: {}, text: null },
  authorizes: false,
});
const projected = projectInstallSetupResult(cancelled, { registry, language: "de" });
assert.equal(projected.next_action.text, "Keine Änderung wurde vorgenommen. Starten Sie das Setup bei Bedarf erneut.");
assert.match(renderInstallSetupText(cancelled, { registry, language: "de" }), /Ergebnis: abgebrochen/);
assert.match(renderInstallSetupText(cancelled, { registry, language: "de" }), /AGDF-Version: keine/);
assert.match(renderInstallSetupText(cancelled, { registry, language: "de" }), /Automatische Prüfungen: nicht ausgeführt/);
assert.equal(projected.authorizes, false);

const failedRuntime = createInstallSetupResult({
  setup_request: "plugin_only",
  surface: "codex",
  target: null,
  target_source: "none",
  invocation_directory_source: "none",
  requested_scope: null,
  effective_scope: null,
  plugin: createLifecycleResult({
    operation: "install",
    result: "success",
    surface: "codex",
    scope: "global",
    version: { expected: "0.14.5", installed: "0.14.5", status: "verified" },
    verification: { status: "healthy", evidence: ["installed"] },
    restart: { required: true, reason: "host_reload" },
    next_action: { kind: "restart", text: "Restart." },
  }),
  runtime_checks: { requested: "manual", effective: "failed", reason: "configuration_invalid" },
  mcp: { status: "not_checked" },
  discovery: { status: "not_checked" },
  restart: { required: true, reasons: ["plugin_reload"] },
  failure: { phase: "runtime_check_permission", code: "runtime_check_permission_failed", message: "English technical detail.", evidence: [] },
  next_action: { code: "review_runtime_checks", parameters: {}, text: null },
  authorizes: false,
});
const failedRuntimeGerman = renderInstallSetupText(failedRuntime, { registry, language: "de" });
assert.match(failedRuntimeGerman, /Automatische Prüfungen: fehlgeschlagen/);
assert.match(failedRuntimeGerman, /Fehler: Auswahl automatischer Prüfungen: Prüfauswahl fehlgeschlagen/);
assert.doesNotMatch(failedRuntimeGerman, /Receipt write failed/);

const badRegistry = structuredClone(registry);
delete badRegistry.locales.de.installSetup.actions.cancelled;
assert.throws(() => projectInstallSetupResult(cancelled, { registry: badRegistry, language: "de" }), /Invalid AGDF interaction locale registry/);
console.log("install setup interaction tests passed");
