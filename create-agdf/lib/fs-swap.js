import { renameSync } from "node:fs";
import process from "node:process";

const RETRY_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 50;

function sleepSync(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

export function renameSyncWithRetry(source, destination, adapters = {}) {
  const rename = adapters.rename ?? renameSync;
  const sleep = adapters.sleep ?? sleepSync;
  const platform = adapters.platform ?? process.platform;
  for (let attempt = 1; ; attempt += 1) {
    try {
      rename(source, destination);
      return;
    } catch (error) {
      // Windows antivirus/indexer handle locks surface as transient EPERM on
      // renames of freshly written directory trees; retry briefly before failing.
      if (platform !== "win32" || error?.code !== "EPERM" || attempt >= RETRY_ATTEMPTS) throw error;
      sleep(RETRY_BASE_DELAY_MS * attempt);
    }
  }
}
