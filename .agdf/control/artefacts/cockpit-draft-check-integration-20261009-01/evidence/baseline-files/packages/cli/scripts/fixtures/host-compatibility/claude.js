import { installClaudeGlobalPlugin } from "../../../lib/host-adapters/claude/plugin.js";
import { createMarketplaceFixture } from "./marketplace.js";
export const setup = (base, built) => createMarketplaceFixture(base, "claude", built, installClaudeGlobalPlugin);
