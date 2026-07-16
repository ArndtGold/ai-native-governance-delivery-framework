import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  canonicalizeLanguageTag,
  resolvePresentationLocale,
} from "../interaction-presentation.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const packageRoot = resolve(__dirname, "../..");
export const generatedRoot = join(packageRoot, "generated");

const pluginDefinitionPath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-plugin.definition.json");
const interactionLocalesPath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-interaction-locales.json");

export const pluginDefinition = JSON.parse(readFileSync(pluginDefinitionPath, "utf8"));
export const interactionLocales = JSON.parse(readFileSync(interactionLocalesPath, "utf8"));

export function configuredLanguage(value) {
  const normalized = canonicalizeLanguageTag(value);
  if (!normalized) return "";
  const language = normalized.split("-")[0];
  if (interactionLocales.locales[normalized] || interactionLocales.locales[language]) {
    return resolvePresentationLocale(interactionLocales, normalized);
  }
  return normalized;
}

export function detectSystemLocale(env = process.env) {
  const envLocale = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || "";
  if (envLocale) return envLocale;
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale || "";
  } catch {
    return "";
  }
}

export function resolveLanguagePreference(explicitLanguage, env = process.env) {
  const explicit = configuredLanguage(explicitLanguage);
  if (explicit) {
    return {
      artifact_language: explicit,
      chat_language: explicit,
      runtime_language: "en",
      source: "parameter",
      detected_locale: detectSystemLocale(env) || "unknown",
    };
  }

  const detectedLocale = detectSystemLocale(env);
  const detected = configuredLanguage(detectedLocale) || interactionLocales.fallbackLocale;
  return {
    artifact_language: detected,
    chat_language: detected,
    runtime_language: "en",
    source: detectedLocale ? "system_locale" : "default",
    detected_locale: detectedLocale || "unknown",
  };
}

export function resolveConfiguredChatLanguage(targetDir) {
  const configPath = join(targetDir, ".agdf", "control", "config.json");
  if (!existsSync(configPath)) return interactionLocales.fallbackLocale;
  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    return resolvePresentationLocale(interactionLocales, config.chat_language);
  } catch {
    return interactionLocales.fallbackLocale;
  }
}

export function languageConfigContent(languagePreference) {
  return `${JSON.stringify({
    artifact_language: languagePreference.artifact_language,
    chat_language: languagePreference.chat_language,
    runtime_language: languagePreference.runtime_language,
    source: languagePreference.source,
    detected_locale: languagePreference.detected_locale,
  }, null, 2)}\n`;
}
