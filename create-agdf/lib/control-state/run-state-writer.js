import { randomUUID } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  existsSync,
  lstatSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { parseRunState } from "./run-state-parser.js";

function fsyncDirectory(path) {
  if (process.platform === "win32") return;
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

export function atomicWrite(path, content) {
  if (existsSync(path)) {
    const destination = lstatSync(path);
    if (destination.isSymbolicLink() || !destination.isFile()) {
      throw new Error("AGDF_RUN_PATH_INVALID");
    }
  }

  const parent = lstatSync(dirname(path));
  if (parent.isSymbolicLink() || !parent.isDirectory()) {
    throw new Error("AGDF_RUN_PATH_INVALID");
  }

  const temp = `${path}.tmp-${process.pid}-${randomUUID()}`;
  let descriptor;

  try {
    descriptor = openSync(temp, "wx");
    writeFileSync(descriptor, content, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;

    renameSync(temp, path);
    fsyncDirectory(dirname(path));
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temp);
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") throw cleanupError;
    }
    throw error;
  }
}

export function writeRun(path, content, expectedRevisionId) {
  const lockPath = `${path}.lock`;
  let lockDescriptor;
  try {
    lockDescriptor = openSync(lockPath, "wx");
  } catch (error) {
    if (error.code === "EEXIST") throw new Error("AGDF_RUN_WRITE_LOCKED");
    throw error;
  }

  try {
    const current = parseRunState(readFileSync(path, "utf8"));
    if (!current.valid) throw new Error("AGDF_RUN_STATE_INVALID");
    if (current.meta.revision_id !== expectedRevisionId) {
      throw new Error("AGDF_STALE_RUN_REVISION");
    }

    const next = content
      .replace(
        /^- revision:\s*.*$/m,
        `- revision: ${Number(current.meta.revision) + 1}`,
      )
      .replace(/^- revision_id:\s*.*$/m, `- revision_id: ${randomUUID()}`);
    const candidate = parseRunState(next);
    if (!candidate.valid || candidate.meta.run_id !== current.meta.run_id) {
      throw new Error("AGDF_RUN_STATE_INVALID");
    }

    atomicWrite(path, next);
    return candidate;
  } finally {
    closeSync(lockDescriptor);
    unlinkSync(lockPath);
  }
}
