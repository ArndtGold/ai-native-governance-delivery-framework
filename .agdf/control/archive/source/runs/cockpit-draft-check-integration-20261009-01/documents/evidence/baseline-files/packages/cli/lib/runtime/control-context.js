import { fileURLToPath, pathToFileURL } from "node:url";
import { createResourceContext, resources as coreResources, configuredLanguage as configured, resolveConfiguredChatLanguage as resolveLanguage } from "#agdf-core/resources/context.js";
const packageURL = new URL("../../", import.meta.url);
const generatedURL = new URL("../../generated/", import.meta.url);
const contractsURL = coreResources.packageRoot === fileURLToPath(packageURL)
  ? pathToFileURL(`${coreResources.contractsRoot}/`)
  : new URL("plugins/agdf/meta/contracts/", generatedURL);
export const resources = createResourceContext({ packageURL, generatedURL, contractsURL });
export const { packageRoot, generatedRoot, pluginDefinition, interactionLocales } = resources;
export const configuredLanguage = value => configured(value, resources);
export const resolveConfiguredChatLanguage = target => resolveLanguage(target, resources);
