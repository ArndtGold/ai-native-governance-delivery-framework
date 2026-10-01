import { runMcpServer } from "../src/main.js";
import { createTestRuntime } from "./runtime-fixture.js";

const runtime = createTestRuntime();
const executor = Object.freeze({
  async execute(argumentsValue, { toolName } = {}) {
    const tool = runtime.tool(toolName ?? runtime.definition.name);
    return tool.execute(tool.parse(argumentsValue));
  },
  async close() {},
});
await runMcpServer({ surface: "codex", runtime, executor });
