import { dirname, join, win32 } from "node:path";
import process from "node:process";

export function npmExecutable({
  platform = process.platform,
  execPath = process.execPath,
  env = process.env,
} = {}) {
  const testCli = env.NODE_ENV === "test" ? env.AGDF_TEST_NPM_CLI_PATH || "" : "";
  if (testCli) return Object.freeze({ executable: execPath, prefix: Object.freeze([testCli]) });
  if (platform === "win32") {
    return Object.freeze({
      executable: execPath,
      prefix: Object.freeze([win32.join(win32.dirname(execPath), "node_modules", "npm", "bin", "npm-cli.js")]),
    });
  }
  return Object.freeze({ executable: "npm", prefix: Object.freeze([]) });
}

export function npmInvocation(args, options = {}) {
  const npm = npmExecutable(options);
  return Object.freeze({ executable: npm.executable, args: Object.freeze([...npm.prefix, ...args]) });
}

export function defaultNpmInstallRoot(dataRoot, version) {
  return join(dataRoot, version);
}
