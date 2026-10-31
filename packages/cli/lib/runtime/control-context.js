import { fileURLToPath, pathToFileURL } from "node:url";
import { createResourceContext, resources as coreResources, configuredLanguage as configured, resolveConfiguredChatLanguage as resolveLanguage } from "#agdf-core/resources/context.js";
const packageURL = new URL("../../", import.meta.url);
const generatedURL = new URL("../../generated/", import.meta.url);
const contractsURL = coreResources.packageRoot === fileURLToPath(packageURL)
  ? pathToFileURL(`${coreResources.contractsRoot}/`)
  : new URL("plugins/agdf/meta/contracts/", generatedURL);
// Projected packages bind Core and CLI to the same immutable resource files.
// Reuse that already-validated data instead of parsing/freezing it twice. Source
// compositions with different roots still construct their own bound context;
// CLI's existing null template-root contract and fresh runtime digests remain.
const sameResources = coreResources.packageRoot === fileURLToPath(packageURL)
  && coreResources.generatedRoot === fileURLToPath(generatedURL);
export const resources = sameResources ? Object.freeze({ ...coreResources, templatesRoot: null })
  : createResourceContext({ packageURL, generatedURL, contractsURL });
export const { packageRoot, generatedRoot, pluginDefinition, interactionLocales } = resources;
export const configuredLanguage = value => configured(value, resources);
export const resolveConfiguredChatLanguage = target => resolveLanguage(target, resources);
