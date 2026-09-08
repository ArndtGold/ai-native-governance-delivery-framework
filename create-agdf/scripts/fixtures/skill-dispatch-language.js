function freezeRows(rows) {
  return Object.freeze(rows.map((row) => Object.freeze({ ...row })));
}

export const INVALID_PRESENTATION_LANGUAGE_CASES = freezeRows([
  { id: "missing", omit: true },
  { id: "null", value: null },
  { id: "number", value: 0 },
  { id: "empty", value: "" },
  { id: "padded", value: " de " },
  { id: "underscore", value: "de_DE" },
  { id: "posix", value: "de-DE.UTF-8" },
  { id: "malformed_suffix", value: "de-DE.!!!" },
  { id: "list", value: "de,en" },
  { id: "empty_subtag", value: "de--DE" },
]);

export const VALID_PRESENTATION_LANGUAGE_CASES = freezeRows([
  { id: "supported_de", value: "de", expectedLocale: "de" },
  { id: "supported_en", value: "en", expectedLocale: "en" },
  { id: "regional_de", value: "de-DE", expectedLocale: "de" },
  { id: "regional_en", value: "en-US", expectedLocale: "en" },
  { id: "unsupported_fr", value: "fr-FR", expectedLocale: "en" },
  { id: "unsupported_es", value: "es", expectedLocale: "en" },
]);

export const REGISTRY_MUTATION_CASES = freezeRows([
  {
    id: "non_english_fallback",
    mutate(registry) { registry.fallbackLocale = "de"; },
    expectedErrors: ["fallback_locale"],
  },
  {
    id: "missing_english",
    mutate(registry) { delete registry.locales.en; },
    expectedErrors: ["fallback_locale"],
  },
  {
    id: "alias_duplicate",
    mutate(registry) { registry.locales.DE = structuredClone(registry.locales.de); },
    expectedErrors: ["duplicate_locale:DE", "invalid_locale:DE"],
  },
  {
    id: "duplicate_canonical_tag",
    mutate(registry) {
      registry.locales["de-DE"] = structuredClone(registry.locales.de);
      registry.locales["de-de"] = structuredClone(registry.locales.de);
    },
    expectedErrors: ["invalid_locale:de-DE", "duplicate_locale:de-de"],
  },
  {
    id: "incomplete_pack",
    mutate(registry) { delete registry.locales.de.interaction.declineDescription; },
    expectedErrors: ["incomplete_locale:de"],
  },
]);

export function argumentsForLanguageCase(baseArguments, row) {
  if (row.omit) {
    const { presentation_language: _omitted, ...remaining } = baseArguments;
    return remaining;
  }
  return { ...baseArguments, presentation_language: row.value };
}
