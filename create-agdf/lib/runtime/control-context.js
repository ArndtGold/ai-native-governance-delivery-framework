import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

