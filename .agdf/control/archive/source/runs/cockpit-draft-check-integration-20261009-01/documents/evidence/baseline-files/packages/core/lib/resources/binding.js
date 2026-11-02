// Build-owned binding; Core never guesses checkout or inherited environment roots.
export const packageURL = new URL("../../", import.meta.url);
export const generatedURL = new URL("../../generated/", import.meta.url);
export const contractsURL = new URL("plugins/agdf/meta/contracts/", generatedURL);
