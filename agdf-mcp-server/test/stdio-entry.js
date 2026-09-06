import { runMcpServer } from "../src/main.js";
import { createTestRuntime } from "./runtime-fixture.js";

const runtime = createTestRuntime();
const executor = Object.freeze({
  async execute(argumentsValue) {
    return runtime.execute(runtime.parse(argumentsValue));
  },
  async close() {},
});
await runMcpServer({ surface: "codex", runtime, executor });
