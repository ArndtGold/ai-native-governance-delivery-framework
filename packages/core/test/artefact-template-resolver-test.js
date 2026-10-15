import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative } from "node:path";
import {
  ARTEFACT_TEMPLATE_IDS,
  resolveArtefactTemplatePath,
} from "../lib/resources/artefact-templates.js";

const filenames = {
  UR: "UR.md",
  PRD: "PRD.md",
  SD: "SD.md",
  TP: "TP.md",
  UX_INTENT_DEFINITION: "UX_INTENT_DEFINITION.md",
  BROWNFIELD_REVIEW: "BROWNFIELD_REVIEW.md",
  VERIFIED_CHANGE: "VERIFIED_CHANGE.md",
  QA_REPORT: "QA_REPORT.md",
  OR: "OR.md",
};

function expectCode(callback, code) {
  assert.throws(callback, (error) => error?.code === code && error.message === code);
}

function snapshotTree(root) {
  const snapshot = [];
  function visit(directory) {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name);
      const stat = statSync(path);
      if (stat.isDirectory()) visit(path);
      else snapshot.push([relative(root, path), readFileSync(path, "utf8")]);
    }
  }
  visit(root);
  return snapshot;
}

const root = mkdtempSync(join(tmpdir(), "agdf-artefact-templates-"));
try {
  const templatesRoot = join(root, "control", "templates");
  const artefactsRoot = join(templatesRoot, "artefacts");
  mkdirSync(artefactsRoot, { recursive: true });
  for (const filename of Object.values(filenames)) writeFileSync(join(artefactsRoot, filename), `# ${filename}\n`);

  assert.deepEqual(Object.keys(ARTEFACT_TEMPLATE_IDS), Object.keys(filenames));
  assert.equal(Object.isFrozen(ARTEFACT_TEMPLATE_IDS), true);
  for (const [id, filename] of Object.entries(filenames)) {
    const resolved = resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS[id], { templatesRoot });
    assert.equal(resolved, join(artefactsRoot, filename));
    assert.equal(isAbsolute(resolved), true);
    assert.equal(relative(templatesRoot, resolved).startsWith(".."), false);
  }

  const unchanged = snapshotTree(root);
  for (const unsupported of [undefined, null, "", "RUN_STATE", "AGDF_RUN", "MASTER_BACKLOG",
    "CONTEXT_GRAPH", "SOT_REGISTRY", "AGENT_QUALITY_CONTRACTS", "../UR.md", "constructor", "toString", "__proto__"]) {
    expectCode(() => resolveArtefactTemplatePath(unsupported, { templatesRoot }),
      "AGDF_ARTEFACT_TEMPLATE_UNSUPPORTED");
  }

  for (const unavailable of [null, undefined, "", join(root, "missing")]) {
    expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: unavailable }),
      "AGDF_ARTEFACT_TEMPLATE_ROOT_UNAVAILABLE");
  }
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: "relative/templates" }),
    "AGDF_ARTEFACT_TEMPLATE_UNSAFE");
  assert.deepEqual(snapshotTree(root), unchanged, "resolver failures must not mutate repository or template state");

  const fileRoot = join(root, "file-root");
  writeFileSync(fileRoot, "not a directory\n");
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: fileRoot }),
    "AGDF_ARTEFACT_TEMPLATE_UNSAFE");

  rmSync(join(artefactsRoot, "PRD.md"));
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.PRD, { templatesRoot }),
    "AGDF_ARTEFACT_TEMPLATE_UNAVAILABLE");

  rmSync(join(artefactsRoot, "SD.md"));
  mkdirSync(join(artefactsRoot, "SD.md"));
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.SD, { templatesRoot }),
    "AGDF_ARTEFACT_TEMPLATE_UNSAFE");

  const realTemplatesRoot = join(root, "real-templates");
  mkdirSync(join(realTemplatesRoot, "artefacts"), { recursive: true });
  writeFileSync(join(realTemplatesRoot, "artefacts", "UR.md"), "# UR\n");
  const linkedTemplatesRoot = join(root, "linked-templates");
  symlinkSync(realTemplatesRoot, linkedTemplatesRoot, "junction");
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: linkedTemplatesRoot }),
    "AGDF_ARTEFACT_TEMPLATE_UNSAFE");

  const linkedComponentRoot = join(root, "linked-component-root");
  mkdirSync(linkedComponentRoot);
  symlinkSync(join(realTemplatesRoot, "artefacts"), join(linkedComponentRoot, "artefacts"), "junction");
  expectCode(() => resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: linkedComponentRoot }),
    "AGDF_ARTEFACT_TEMPLATE_UNSAFE");

  // Ancestors above the root are outside plugin ownership (macOS /var -> /private/var, linked
  // homes); the real root and realpath containment decide, never the ancestor chain.
  const realParent = join(root, "real-parent");
  mkdirSync(join(realParent, "templates", "artefacts"), { recursive: true });
  writeFileSync(join(realParent, "templates", "artefacts", "UR.md"), "# UR\n");
  const linkedParent = join(root, "linked-parent");
  symlinkSync(realParent, linkedParent, "junction");
  assert.equal(resolveArtefactTemplatePath(ARTEFACT_TEMPLATE_IDS.UR, { templatesRoot: join(linkedParent, "templates") }),
    realpathSync(join(realParent, "templates", "artefacts", "UR.md")));
} finally {
  rmSync(root, { recursive: true, force: true });
}

console.log("Canonical artefact templates resolve only from a safe trusted template root.");
