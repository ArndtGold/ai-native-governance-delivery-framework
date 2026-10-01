import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateInteractionCatalog } from "../lib/interaction-catalog-validation.js";
import { DISPATCH_RECOVERY_CODES, INSTALL_SETUP_STATES, CODEX_HOOK_STATES, codexHookState } from "../lib/interaction-catalog.js";
import { renderSkillDispatchRecovery } from "../lib/interaction-presentation.js";

const registry = JSON.parse(readFileSync(new URL("../../plugins/agdf/meta/agdf-interaction-locales.json", import.meta.url), "utf8"));
assert.equal(validateInteractionCatalog(registry), true);
const service = readFileSync(new URL("../lib/skill-dispatch/service.js", import.meta.url), "utf8");
assert.doesNotMatch(service, /runDispatchStage\("/);
for (const [, code] of service.matchAll(/DISPATCH_RECOVERY\.(\w+)/g)) {
  assert.ok(DISPATCH_RECOVERY_CODES.includes(code), `service references unregistered recovery ${code}`);
}
for (const [language, pack] of Object.entries(registry.locales)) {
  for (const code of DISPATCH_RECOVERY_CODES) {
    assert.equal(renderSkillDispatchRecovery({ code }, { registry, requestedLocale: language }), pack.skillDispatch.recoveries[code]);
  }
  for (const path of ["installSetup.effectiveStates", "installSetup.actions", "installSetup.failureCodes",
    "installSetup.failurePhases", "skillDispatch.recoveries"]) {
    for (const corruption of ["missing", "extra", "blank"]) {
      const damaged = structuredClone(registry);
      const [group, section] = path.split(".");
      const values = damaged.locales[language][group][section];
      const key = Object.keys(values)[0];
      if (corruption === "missing") delete values[key];
      if (corruption === "extra") values.unregistered = "unexpected";
      if (corruption === "blank") values[key] = " ";
      assert.throws(() => validateInteractionCatalog(damaged), /CATALOG_INCOMPLETE/);
    }
  }
}
for (const row of Object.values(CODEX_HOOK_STATES)) {
  assert.equal(INSTALL_SETUP_STATES[row.state].result, "partial");
  assert.ok(Object.isFrozen(row));
}
assert.equal(codexHookState("__proto__").action, "inspect_codex_hook");
console.log("Interaction catalog: complete locales, recovery rendering, negative and immutable-state checks passed.");
