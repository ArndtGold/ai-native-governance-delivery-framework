// Localization (SDD-05, AC-005; SD SDD-004) with the existing AGDF data: the chat language from
// config.json and every text from meta/agdf-interaction-locales.json (the registry): gate titles and
// the companion section. Next steps and blocking texts arrive localized in the run view. Mirrors
// resolveConfiguredChatLanguage (packages/core/lib/resources/context.js); parity tests keep it equal.

const TAG = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;

export function canonicalLanguageTag(value) {
  if (typeof value !== 'string' || !TAG.test(value)) return '';
  try {
    return Intl.getCanonicalLocales(value)[0]?.toLowerCase() ?? '';
  } catch {
    return '';
  }
}

// Exact locale, else its base language, else the registry's fallback locale.
export function resolveLocale(registry, requested) {
  const tag = canonicalLanguageTag(requested);
  if (tag && registry.locales[tag]) return tag;
  const language = tag.split('-')[0];
  if (language && registry.locales[language]) return language;
  return registry.fallbackLocale;
}

// Claude's own `language` setting is free text: a supported language tag (exact or base language)
// or one of a locale's `languageNames` in the catalog's companion section, compared without case;
// anything else names no locale (null).
export function settingLocale(registry, labels, value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  const tag = canonicalLanguageTag(text);
  if (tag && (registry.locales[tag] || registry.locales[tag.split('-')[0]])) return resolveLocale(registry, tag);
  const name = text.toLowerCase();
  const match = Object.entries(labels?.locales ?? {})
    .find(([locale, pack]) => registry.locales[locale] && Object.values(pack.languageNames ?? {}).some(entry => String(entry).toLowerCase() === name));
  return match?.[0] ?? null;
}

// configText: content of .agdf/control/config.json, or null when absent. Only without it, Claude's
// `language` setting (follow-up SDD-11) chooses the locale before the registry's fallback.
export function chatLocale(registry, configText, { setting = null, labels = null } = {}) {
  if (typeof configText !== 'string') return settingLocale(registry, labels, setting) ?? registry.fallbackLocale;
  try {
    return resolveLocale(registry, JSON.parse(configText).chat_language);
  } catch {
    return registry.fallbackLocale;
  }
}

export function gateTitle(registry, locale, gate) {
  return registry.locales[locale]?.gateTitles?.[gate] ?? registry.locales[registry.fallbackLocale]?.gateTitles?.[gate] ?? gate;
}

// What a gate decides, in one sentence from the catalog; null for a step without one.
export function gateRationale(registry, locale, gate) {
  return registry.locales[locale]?.gateRationale?.[gate] ?? registry.locales[registry.fallbackLocale]?.gateRationale?.[gate] ?? null;
}

// The companion's labels: the catalog's companion section per locale, in the shape label() reads.
export function companionLabels(registry) {
  return { fallbackLocale: registry.fallbackLocale,
    locales: Object.fromEntries(Object.entries(registry.locales).map(([locale, pack]) => [locale, pack.companion ?? {}])) };
}

// A companion label by dotted path with {name} parameters; missing keys fall back to the
// fallback locale and finally to the path, so a gap stays visible instead of throwing.
export function label(labels, locale, path, params = {}) {
  const lookup = pack => path.split('.').reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), pack);
  const template = lookup(labels.locales[locale]) ?? lookup(labels.locales[labels.fallbackLocale]) ?? path;
  return String(template).replace(/\{(\w+)\}/gu, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match));
}
