// Localization (SDD-05, AC-005) with the existing AGDF data: the chat language from config.json,
// gate titles and next-step values from meta/agdf-interaction-locales.json (the registry), and the
// companion's own labels from companion/locales.json. Mirrors resolveConfiguredChatLanguage
// (packages/core/lib/resources/context.js) and localizedOperationalValue
// (packages/core/lib/interaction-presentation.js); parity tests keep them equal.

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
// or one of a locale's `languageNames` in the companion's locales.json, compared without case;
// anything else names no locale (null).
export function settingLocale(registry, labels, value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return null;
  const tag = canonicalLanguageTag(text);
  if (tag && (registry.locales[tag] || registry.locales[tag.split('-')[0]])) return resolveLocale(registry, tag);
  const name = text.toLowerCase();
  const match = Object.entries(labels?.locales ?? {})
    .find(([locale, pack]) => registry.locales[locale] && (pack.languageNames ?? []).some(entry => entry.toLowerCase() === name));
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

// The localized status-card value for a next-step source text, or the source text itself
// ({ text, isLocalized }); an empty or "none" value becomes the pack's "none".
export function localizeNextStep(registry, locale, value) {
  const source = String(value ?? '').trim();
  const pack = registry.locales[locale];
  const fallback = registry.locales[registry.fallbackLocale];
  if (!source || source === 'none') return { text: pack.primary.none, isLocalized: true };
  if (locale === registry.fallbackLocale) return { text: source, isLocalized: true };
  const groups = [
    [fallback.operationalValues, pack.operationalValues],
    [fallback.primary.actions, pack.primary.actions],
    [fallback.primary.afterApproval, pack.primary.afterApproval],
  ];
  for (const [sources, targets] of groups) {
    for (const [key, text] of Object.entries(sources ?? {})) {
      if (text === source) {
        const localized = String(targets?.[key] ?? '').trim();
        return localized ? { text: localized, isLocalized: true } : { text: source, isLocalized: false };
      }
    }
  }
  if (fallback.primary.quality === source && String(pack.primary.quality ?? '').trim()) {
    return { text: pack.primary.quality.trim(), isLocalized: true };
  }
  return { text: source, isLocalized: false };
}

// A companion label by dotted path with {name} parameters; missing keys fall back to the
// fallback locale and finally to the path, so a gap stays visible instead of throwing.
export function label(labels, locale, path, params = {}) {
  const lookup = pack => path.split('.').reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), pack);
  const template = lookup(labels.locales[locale]) ?? lookup(labels.locales[labels.fallbackLocale]) ?? path;
  return String(template).replace(/\{(\w+)\}/gu, (match, name) => (Object.hasOwn(params, name) ? String(params[name]) : match));
}
