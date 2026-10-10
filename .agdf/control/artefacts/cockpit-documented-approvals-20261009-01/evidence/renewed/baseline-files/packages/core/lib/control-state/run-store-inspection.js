import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { doctorRequiredFiles } from "../control-evaluation/required-files.js";

export function canonicalScaffoldRequired(root, path) {
  const error = new Error(
    `AGDF_CANONICAL_SCAFFOLD_REQUIRED: ${path}. Run init with the same explicit --dir before run-create.`,
  );
  error.code = "AGDF_CANONICAL_SCAFFOLD_REQUIRED";
  error.root = root;
  error.path = path;
  return error;
}

export function directoryIdentity(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isDirectory()) throw Error("invalid directory");
  return Object.freeze({ path, realpath: realpathSync(path), dev: stats.dev, ino: stats.ino });
}

export function regularFileSnapshot(path) {
  const stats = lstatSync(path);
  if (stats.isSymbolicLink() || !stats.isFile()) throw Error("invalid file");
  return Object.freeze({ path, dev: stats.dev, ino: stats.ino, content: readFileSync(path) });
}

export function assertCanonicalRunStore(root) {
  const directoryPaths = [
    root,
    join(root, ".agdf"),
    join(root, ".agdf", "control"),
    join(root, ".agdf", "control", "runs"),
  ];
  const directories = [];
  for (const path of directoryPaths) {
    try {
      directories.push(directoryIdentity(path));
    } catch (error) {
      if (error?.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED") throw error;
      throw canonicalScaffoldRequired(root, path);
    }
  }
  const requiredPaths = [...new Set([
    join(".agdf", "control", "config.json"),
    join(".agdf", "control", "README.md"),
    ...doctorRequiredFiles.filter((path) => !path.endsWith("AGDF_RUN.md")),
  ])];
  const files = [];
  for (const relativePath of requiredPaths) {
    const path = join(root, relativePath);
    try {
      files.push(regularFileSnapshot(path));
    } catch (error) {
      if (error?.code === "AGDF_CANONICAL_SCAFFOLD_REQUIRED") throw error;
      throw canonicalScaffoldRequired(root, path);
    }
  }
  return Object.freeze({
    root,
    path: directoryPaths.at(-1),
    directories: Object.freeze(directories),
    files: Object.freeze(files),
  });
}

