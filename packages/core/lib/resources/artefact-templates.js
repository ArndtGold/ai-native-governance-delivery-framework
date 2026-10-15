import { isAbsolute } from "node:path";
import { lstatKindSync } from "../control-read/fs.js";
import { containedRegularFile, hasSymlinkComponent } from "../control-state/contained-file.js";
import { resources } from "./context.js";

export const ARTEFACT_TEMPLATE_IDS = Object.freeze({
  UR: "UR",
  PRD: "PRD",
  SD: "SD",
  TP: "TP",
  UX_INTENT_DEFINITION: "UX_INTENT_DEFINITION",
  BROWNFIELD_REVIEW: "BROWNFIELD_REVIEW",
  VERIFIED_CHANGE: "VERIFIED_CHANGE",
  QA_REPORT: "QA_REPORT",
  OR: "OR",
});

export const ARTEFACT_TEMPLATE_ERROR_CODES = Object.freeze([
  "AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED",
  "AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE",
  "AGDF_ARTEFACT_TEMPLATE_UNAVAILABLE",
  "AGDF_ARTEFACT_TEMPLATE_UNSAFE",
]);

const TEMPLATE_FILES = Object.freeze({
  [ARTEFACT_TEMPLATE_IDS.UR]: "UR.md",
  [ARTEFACT_TEMPLATE_IDS.PRD]: "PRD.md",
  [ARTEFACT_TEMPLATE_IDS.SD]: "SD.md",
  [ARTEFACT_TEMPLATE_IDS.TP]: "TP.md",
  [ARTEFACT_TEMPLATE_IDS.UX_INTENT_DEFINITION]: "UX_INTENT_DEFINITION.md",
  [ARTEFACT_TEMPLATE_IDS.BROWNFIELD_REVIEW]: "BROWNFIELD_REVIEW.md",
  [ARTEFACT_TEMPLATE_IDS.VERIFIED_CHANGE]: "VERIFIED_CHANGE.md",
  [ARTEFACT_TEMPLATE_IDS.QA_REPORT]: "QA_REPORT.md",
  [ARTEFACT_TEMPLATE_IDS.OR]: "OR.md",
});

function templateError(code) {
  return Object.assign(new Error(code), { code });
}

function rootKind(root) {
  try {
    return lstatKindSync(root);
  } catch (error) {
    if (error.code === "ENOENT") throw templateError("AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE");
    throw templateError("AGDF_ARTEFACT_TEMPLATE_UNSAFE");
  }
}

// The root itself must be a real directory and no component below it may be a link;
// ancestors are outside the plugin's ownership and are covered by realpath containment.
export function resolveArtefactTemplatePath(templateId, context = resources) {
  if (!Object.hasOwn(TEMPLATE_FILES, templateId)) {
    throw templateError("AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED");
  }
  const filename = TEMPLATE_FILES[templateId];
  const root = context?.templatesRoot;
  if (root === null || root === undefined || root === "") {
    throw templateError("AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE");
  }
  if (typeof root !== "string" || !isAbsolute(root) || rootKind(root) !== "directory") {
    throw templateError("AGDF_ARTEFACT_TEMPLATE_UNSAFE");
  }
  const relativePath = `artefacts/${filename}`;
  if (hasSymlinkComponent(root, relativePath)) {
    throw templateError("AGDF_ARTEFACT_TEMPLATE_UNSAFE");
  }
  const result = containedRegularFile(root, relativePath);
  if (result.status === "valid") return result.path;
  if (result.status === "missing") throw templateError("AGDF_ARTEFACT_TEMPLATE_UNAVAILABLE");
  throw templateError("AGDF_ARTEFACT_TEMPLATE_UNSAFE");
}
