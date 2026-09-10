import { createInterface } from "node:readline/promises";
import process from "node:process";
import { interactionLocales } from "../cli/runtime-context.js";
import { localePack } from "../interaction-presentation.js";
import {
  installSetupChoiceOptions,
  installSetupScopeOptions,
  renderInstallSetupPreflight,
  renderInstallSetupScopePreflight,
} from "./presentation.js";

const CHOICES = Object.freeze({
  "1": "full",
  f: "full",
  full: "full",
  "2": "plugin_only",
  p: "plugin_only",
  plugin_only: "plugin_only",
  "plugin-only": "plugin_only",
  "3": "cancel",
  c: "cancel",
  cancel: "cancel",
});
const SCOPE_CHOICES = Object.freeze({
  "1": "project",
  p: "project",
  project: "project",
  "2": "user",
  u: "user",
  user: "user",
  "3": "back",
  b: "back",
  back: "back",
});

export function normalizeInstallSetupChoice(value) {
  if (typeof value !== "string") return value === null || value === undefined ? "eof" : "invalid";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "empty";
  return CHOICES[normalized] ?? "invalid";
}

export function normalizeInstallScopeChoice(value) {
  if (typeof value !== "string") return value === null || value === undefined ? "eof" : "invalid";
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "empty";
  return SCOPE_CHOICES[normalized] ?? "invalid";
}

export async function selectInstallSetup(preflight, {
  readChoice,
  write = () => {},
  registry = interactionLocales,
  language = "en",
  present = true,
} = {}) {
  if (typeof readChoice !== "function") throw new Error("AGDF_INSTALL_SETUP_INTERACTION_READER_REQUIRED");
  const pack = localePack(registry, language).installSetup;
  const options = installSetupChoiceOptions(preflight, { registry, language });
  if (present) write(renderInstallSetupPreflight(preflight, { registry, language }));
  while (true) {
    let raw;
    try {
      raw = await readChoice(Object.freeze({ options, default: null, prompt: pack.choicePrompt }));
    } catch {
      return "cancel";
    }
    const decision = normalizeInstallSetupChoice(raw);
    if (decision === "eof") return "cancel";
    if (decision === "empty") {
      write(pack.emptyChoice);
      continue;
    }
    if (decision === "invalid") {
      write(pack.invalidChoice);
      continue;
    }
    if (decision === "full" && !preflight.full_available) {
      const option = options.find(({ value }) => value === "full");
      write(pack.blockedChoice.replaceAll("{reason}", option.blocked_reason));
      continue;
    }
    return decision;
  }
}

export async function selectInstallScope(preflight, {
  readChoice,
  write = () => {},
  registry = interactionLocales,
  language = "en",
  present = true,
} = {}) {
  if (typeof readChoice !== "function") throw new Error("AGDF_INSTALL_SETUP_SCOPE_READER_REQUIRED");
  const pack = localePack(registry, language).installSetup;
  const options = installSetupScopeOptions(preflight, { registry, language });
  if (present) write(renderInstallSetupScopePreflight(preflight, { registry, language }));
  while (true) {
    let raw;
    try {
      raw = await readChoice(Object.freeze({ options, default: null, prompt: pack.scopeChoicePrompt }));
    } catch {
      return "cancel";
    }
    const decision = normalizeInstallScopeChoice(raw);
    if (decision === "eof") return "cancel";
    if (decision === "empty") { write(pack.emptyScopeChoice); continue; }
    if (decision === "invalid") { write(pack.invalidScopeChoice); continue; }
    if (decision === "back") return decision;
    const option = options.find(({ value }) => value === decision);
    if (!option?.enabled) {
      write(pack.blockedScopeChoice.replaceAll("{reason}", option?.blocked_reason ?? "unknown"));
      continue;
    }
    return decision;
  }
}

export async function promptInstallSetup(preflight, {
  input = process.stdin,
  output = process.stdout,
  registry = interactionLocales,
  language = "en",
} = {}) {
  const prompt = createInterface({ input, output });
  try {
    return await selectInstallSetup(preflight, {
      registry,
      language,
      write(value) { output.write(`${value}\n`); },
      readChoice({ prompt: question }) { return prompt.question(question); },
    });
  } finally {
    prompt.close();
  }
}

export async function promptInstallScope(preflight, {
  input = process.stdin,
  output = process.stdout,
  registry = interactionLocales,
  language = "en",
} = {}) {
  const prompt = createInterface({ input, output });
  try {
    return await selectInstallScope(preflight, {
      registry,
      language,
      write(value) { output.write(`${value}\n`); },
      readChoice({ prompt: question }) { return prompt.question(question); },
    });
  } finally {
    prompt.close();
  }
}
