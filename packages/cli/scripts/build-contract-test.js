import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readSkillRuntimeContracts } from "#agdf-core/resources/contracts.js";
import { checkFocusedGateContracts } from "./gate-contract-reference-check.js";
import { checkGeneratedGateContracts, checkLateGateTransitions } from "./build-contract-checks.js";

checkFocusedGateContracts(readFileSync(new URL("../../../plugins/agdf/skills/gate-check/SKILL.md", import.meta.url), "utf8"));
checkGeneratedGateContracts();
checkLateGateTransitions();
const sourceRoot = new URL("../../../plugins/agdf/meta/", import.meta.url);
const definition = JSON.parse(readFileSync(new URL("agdf-plugin.definition.json", sourceRoot), "utf8"));
const quality = readFileSync(new URL("contracts/quality.md", sourceRoot), "utf8").replaceAll("\r\n", "\n");
const qualityDigest = createHash("sha256").update(quality).digest("hex");
const fixture = mkdtempSync(join(tmpdir(), "agdf-quality-contract-"));
try {
  for (const phase of ["sd-definition", "tp-definition"]) {
    const assertQuality = contracts => {
      const actual = contracts.find(contract => contract.module === "quality");
      assert.ok(actual, `${phase} must receive shared quality policy`);
      assert.equal(actual.content, quality);
      assert.equal(actual.sha256, qualityDigest);
    };
    assertQuality(readSkillRuntimeContracts(phase));
    const modules = definition.skillSet.find(skill => skill.slug === phase).runtimeContractModules;
    for (const module of modules.filter(module => module !== "quality")) {
      writeFileSync(join(fixture, `${module}.md`), readFileSync(new URL(`contracts/${module}.md`, sourceRoot)));
    }
    const context = { pluginDefinition: definition, contractsRoot: fixture };
    assert.throws(() => readSkillRuntimeContracts(phase, { context }), /runtime_contracts_unavailable/,
      "missing required policy is refused rather than replaced by a source-checkout fallback");
    writeFileSync(join(fixture, "quality.md"), quality);
    assertQuality(readSkillRuntimeContracts(phase, { context }));
    const missingMapping = structuredClone(definition);
    missingMapping.skillSet.find(skill => skill.slug === phase).runtimeContractModules = modules.filter(module => module !== "quality");
    assert.throws(() => assertQuality(readSkillRuntimeContracts(phase, {
      context: { ...context, pluginDefinition: missingMapping },
    })), assert.AssertionError, "the dependency assertion detects a removed quality mapping");
    rmSync(join(fixture, "quality.md"));
  }
} finally { rmSync(fixture, { recursive: true, force: true }); }
console.log("Build contracts passed (source references, three generated surfaces, 14 late-gate scenarios).");
