import { INSTALL_SETUP_STATES, INSTALL_ACTIONS, INSTALL_FAILURE_PHASES, INSTALL_FAILURE_CODES,
  DISPATCH_RECOVERY_CODES, CODEX_HOOK_STATES } from "./interaction-catalog.js";

// Build-time validation, not a second vocabulary. Unknown and missing copy both fail closed.
export function validateInteractionCatalog(registry) {
  const check = (path, values, expected) => {
    if (!values || Object.keys(values).sort().join("\n") !== [...expected].sort().join("\n")
        || Object.values(values).some(value => typeof value !== "string" || !value.trim())) {
      throw new Error(`AGDF_INTERACTION_CATALOG_INCOMPLETE: ${path}`);
    }
  };
  if (!registry?.locales?.en || !registry.locales.de) throw new Error("AGDF_INTERACTION_CATALOG_LOCALES_MISSING");
  for (const [language, pack] of Object.entries(registry.locales)) {
    for (const [section, keys] of Object.entries({ effectiveStates: Object.keys(INSTALL_SETUP_STATES),
      actions: INSTALL_ACTIONS, failurePhases: INSTALL_FAILURE_PHASES, failureCodes: INSTALL_FAILURE_CODES })) {
      check(`${language}.installSetup.${section}`, pack.installSetup?.[section], keys);
    }
    check(`${language}.skillDispatch.recoveries`, pack.skillDispatch?.recoveries, DISPATCH_RECOVERY_CODES);
  }
  for (const row of Object.values(CODEX_HOOK_STATES)) {
    if (!INSTALL_SETUP_STATES[row.state]?.actions.includes(row.action)) throw new Error("AGDF_INTERACTION_CATALOG_HOOK_INVALID");
  }
  return true;
}
