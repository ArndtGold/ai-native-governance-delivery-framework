import { execFileSync } from "node:child_process";

export function repositoryState(cwd) {
  try {
    return execFileSync("git", ["status", "--porcelain=v1", "-z"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

export function guardedExecFileSync(file, args, options = {}) {
  const before = repositoryState(options.cwd);
  let output;
  let failure;
  try {
    output = execFileSync(file, args, {
      ...options,
      encoding: options.encoding ?? "utf8",
      stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
      timeout: options.timeout ?? 30000,
      killSignal: "SIGTERM",
    });
  } catch (error) {
    failure = error;
  }
  const after = repositoryState(options.cwd);
  if (before !== null && after !== before) {
    const error = new Error("repository mutation detected during read-only run");
    error.code = "GENERATOR_MUTATION_DETECTED";
    throw error;
  }
  if (failure?.code === "ETIMEDOUT" || failure?.signal === "SIGTERM") {
    const timeout = new Error("read-only process timed out");
    timeout.code = "GENERATOR_TIMEOUT";
    throw timeout;
  }
  if (failure) throw failure;
  return output;
}
