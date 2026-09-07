import { existsSync, mkdirSync, readFileSync, rmSync, rmdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { renameSyncWithRetry } from "../../fs-swap.js";

export function atomicWrite(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = join(dirname(path), `.${Date.now()}-${process.pid}-agdf-mcp.tmp`);
  writeFileSync(temporary, content, "utf8");
  try { renameSyncWithRetry(temporary, path); } catch (error) {
    rmSync(temporary, { force: true });
    throw error;
  }
}

export function readJsonObject(path, code) {
  if (!existsSync(path)) return { content: "", config: {} };
  const content = readFileSync(path, "utf8");
  try {
    const config = JSON.parse(content);
    if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error(code);
    return { content, config };
  } catch { throw new Error(code); }
}

export function fileSnapshot(path) {
  const parentPath = dirname(path);
  return {
    path,
    parentPath,
    parentExisted: existsSync(parentPath),
    existed: existsSync(path),
    content: existsSync(path) ? readFileSync(path, "utf8") : "",
  };
}

export function restoreSnapshot(snapshot, { removeEmptyParent = false } = {}) {
  if (snapshot.existed) atomicWrite(snapshot.path, snapshot.content);
  else {
    rmSync(snapshot.path, { force: true });
    if (removeEmptyParent && !snapshot.parentExisted) {
      try { rmdirSync(snapshot.parentPath); } catch (error) {
        if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes(error?.code)) throw error;
      }
    }
  }
}

export function sourceRecord(source, inspected) {
  return Object.freeze({
    source: source.id,
    path: source.path,
    priority: source.priority,
    selected: source.selected,
    status: inspected.status,
  });
}

export function referenceIdentityForSurface(surface, nativeScope, { scope, target, registration, createdConfig = false }) {
  return Object.freeze({
    surface,
    native_scope: nativeScope(scope),
    source: registration.selected_source,
    path: registration.path,
    ...(nativeScope(scope) === "user" ? {} : { target }),
    ...(createdConfig ? { created_config: true } : {}),
  });
}

export function inheritedPermissionEffect() {
  return Object.freeze({ code: "inherited_host_user" });
}

export function allSourceResult({ sources, inspected, selectedSource }) {
  const selected = inspected.get(selectedSource.id);
  const higher = sources.filter((source) => source.priority < selectedSource.priority)
    .map((source) => ({ source, state: inspected.get(source.id) }))
    .find(({ state }) => state.status !== "absent");
  const effectivePair = sources.map((source) => ({ source, state: inspected.get(source.id) }))
    .find(({ state }) => state.status !== "absent") ?? { source: selectedSource, state: selected };
  return Object.freeze({
    ...selected,
    status: higher ? "precedence_conflict" : effectivePair.state.status,
    selected_status: selected.status,
    effective_status: effectivePair.state.status,
    selected_source: selectedSource.id,
    effective_source: effectivePair.source.id,
    sources: Object.freeze(sources.map((source) => sourceRecord(source, inspected.get(source.id)))),
  });
}
