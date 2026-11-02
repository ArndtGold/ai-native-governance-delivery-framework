import { readFileSync } from "node:fs";
import { checkFocusedGateContracts } from "./gate-contract-reference-check.js";
import { checkGeneratedGateContracts, checkLateGateTransitions } from "./build-contract-checks.js";

checkFocusedGateContracts(readFileSync(new URL("../../../plugins/agdf/skills/gate-check/SKILL.md", import.meta.url), "utf8"));
checkGeneratedGateContracts();
checkLateGateTransitions();
console.log("Build contracts passed (source references, three generated surfaces, 14 late-gate scenarios).");
