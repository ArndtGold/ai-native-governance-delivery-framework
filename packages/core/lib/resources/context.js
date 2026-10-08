import { existsSync, readFileSync } from "../control-read/fs.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalizeLanguageTag, resolvePresentationLocale } from "../interaction-presentation.js";
import { validateInteractionCatalog } from "../interaction-catalog-validation.js";
import { packageURL, generatedURL, contractsURL } from "./binding.js";

function freeze(value) {
  if (value && typeof value === "object") { for (const entry of Object.values(value)) freeze(entry); Object.freeze(value); }
  return value;
}
export function createResourceContext({ packageURL, generatedURL, contractsURL, expectedVersion } = {}) {
  if (![packageURL, generatedURL, contractsURL].every(value => value instanceof URL && value.protocol === "file:")) throw new Error("runtime_resources_unavailable");
  const packageRoot = fileURLToPath(packageURL), generatedRoot = fileURLToPath(generatedURL);
  expectedVersion ??= JSON.parse(readFileSync(new URL("package.json", packageURL), "utf8")).version;
  const pluginDefinition = JSON.parse(readFileSync(new URL("plugins/agdf/meta/agdf-plugin.definition.json", generatedURL), "utf8"));
  const interactionLocales = JSON.parse(readFileSync(new URL("plugins/agdf/meta/agdf-interaction-locales.json", generatedURL), "utf8"));
  if (typeof expectedVersion !== "string" || !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(expectedVersion) || pluginDefinition.version !== expectedVersion
      || !Array.isArray(pluginDefinition.runtimeContract?.modules) || !pluginDefinition.runtimeContract.modules.length
      || new Set(pluginDefinition.runtimeContract.modules).size !== pluginDefinition.runtimeContract.modules.length
      || pluginDefinition.runtimeContract.modules.some(path => !/^meta\/contracts\/[a-z0-9-]+\.md$/u.test(path))
      || !Array.isArray(pluginDefinition.skillSet) || !interactionLocales.locales?.[interactionLocales.fallbackLocale]) throw new Error("runtime_resources_unavailable");
  validateInteractionCatalog(interactionLocales);
  return freeze({ packageRoot, generatedRoot, contractsRoot: fileURLToPath(contractsURL), pluginDefinition, interactionLocales });
}
export const resources = createResourceContext({ packageURL, generatedURL, contractsURL });
export const { packageRoot, generatedRoot, pluginDefinition, interactionLocales } = resources;
export function configuredLanguage(value, context = resources) {
  const normalized = canonicalizeLanguageTag(value);
  if (!normalized) return "";
  const language = normalized.split("-")[0];
  if (context.interactionLocales.locales[normalized] || context.interactionLocales.locales[language]) return resolvePresentationLocale(context.interactionLocales, normalized);
  return normalized;
}
export function resolveConfiguredChatLanguage(targetDir, context = resources) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return context.interactionLocales.fallbackLocale;
  try { return resolvePresentationLocale(context.interactionLocales, JSON.parse(readFileSync(configPath, "utf8")).chat_language); }
  catch { return context.interactionLocales.fallbackLocale; }
}
// Missing or invalid config means English artefacts.
export function resolveConfiguredArtifactLanguage(targetDir) {
  try { return canonicalizeLanguageTag(JSON.parse(readFileSync(join(targetDir, ".agdf", "control", "config.json"), "utf8")).artifact_language).split("-")[0] || "en"; }
  catch { return "en"; }
}

// Shared by artefact authoring and approval rendering; the selected locale may override
// the configured chat default, but never changes the persisted artefact language.
export function resolveArtifactPresentationLanguages(targetDir, requestedLanguage, context = resources) {
  const artifactLanguage = resolveConfiguredArtifactLanguage(targetDir);
  const presentationLanguage = requestedLanguage
    ? resolvePresentationLocale(context.interactionLocales, requestedLanguage)
    : resolveConfiguredChatLanguage(targetDir, context);
  const required = artifactLanguage !== presentationLanguage.split("-")[0];
  return Object.freeze({
    artifact_language: artifactLanguage,
    presentation_language: presentationLanguage,
    approval_summary_required: required,
    approval_summary_heading: required ? `AGDF Approval Summary (${presentationLanguage}; source=${artifactLanguage})` : null,
  });
}
