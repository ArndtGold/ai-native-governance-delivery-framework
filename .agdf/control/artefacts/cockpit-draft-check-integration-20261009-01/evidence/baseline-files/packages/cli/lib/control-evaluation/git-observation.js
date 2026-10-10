import { execFileSync } from "node:child_process";

export function gitPathList(targetDir, args, exec = execFileSync) {
  try {
    return exec("git", args, { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
}

export function gitValue(targetDir, args, exec = execFileSync) {
  try {
    return exec("git", args, { cwd: targetDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export const cliGitObservation = Object.freeze({ gitPathList, gitValue });
