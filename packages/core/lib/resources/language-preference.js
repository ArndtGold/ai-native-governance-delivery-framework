import process from "node:process";
import { canonicalizeLanguageTag } from "../interaction-presentation.js";
import { configuredLanguage, resources } from "./context.js";

export function canonicalizeDetectedSystemLocale(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim().split(":", 1)[0];
  if (!candidate || /^(?:C|POSIX)(?:\.|$)/iu.test(candidate)) return "";
  const withoutModifier = candidate.split("@", 1)[0];
  const withoutEncoding = withoutModifier.split(".", 1)[0];
  return canonicalizeLanguageTag(withoutEncoding.replaceAll("_", "-"));
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

export function resolveLanguagePreference(explicitLanguage, env = process.env, context = resources) {
  const explicit = configuredLanguage(explicitLanguage, context);
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
  const detectedTag = canonicalizeDetectedSystemLocale(detectedLocale);
  const detected = configuredLanguage(detectedTag, context);
  return {
    artifact_language: detected || context.defaults.document.preferences.artifact_language,
    chat_language: detected || context.defaults.document.preferences.chat_language,
    runtime_language: "en",
    source: detectedLocale ? "system_locale" : "default",
    detected_locale: detectedLocale || "unknown",
  };
}

export function languageConfigContent(languagePreference, existing = {}) {
  return `${JSON.stringify({
    ...existing,
    ...languagePreference,
    artifact_language: languagePreference.artifact_language,
    chat_language: languagePreference.chat_language,
    runtime_language: languagePreference.runtime_language,
    source: languagePreference.source,
    detected_locale: languagePreference.detected_locale,
  }, null, 2)}\n`;
}
