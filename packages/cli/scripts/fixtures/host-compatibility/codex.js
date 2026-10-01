import { installCodexGlobalPlugin } from "../../../lib/host-adapters/codex/plugin.js";
import { createMarketplaceFixture } from "./marketplace.js";
export const setup = (base, built) => createMarketplaceFixture(base, "codex", built, installCodexGlobalPlugin);
