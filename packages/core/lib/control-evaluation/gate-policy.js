import { readSourceRevisions } from "../control-state/run-source-revisions.js";
import { createGatePolicy } from "./gate-policy-pure.js";

// Production keeps the exact validated receipt reader.
export const { CD_TESTS_NEXT_ALLOWED_ACTION, isGateSatisfied, transitionDecisionForRunState } = createGatePolicy(readSourceRevisions);
