import { isMainEntry } from "../../../scripts/support/main-entry.js";
export * from "../../../scripts/sync-package-assets.js";
import { syncPackageAssets } from "../../../scripts/sync-package-assets.js";
import { pathToFileURL } from "node:url";
if (isMainEntry(import.meta.url)) syncPackageAssets();
