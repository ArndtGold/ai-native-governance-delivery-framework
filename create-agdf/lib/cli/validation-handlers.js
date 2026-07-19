import {
  buildStatusCard,
  evaluateGateCheck,
  printApprovalEnvelope,
  postApprovalTransition,
  printGateCheckReport,
} from "../control-evaluation/gate-check.js";
import { evaluateDeliveryMap, printDeliveryMapReport } from "../control-evaluation/delivery-map.js";
import { evaluateDoctor, printDoctorReport } from "../control-evaluation/doctor.js";
import { executeDeliveryPathSearch } from "./delivery-path-search-command.js";

const deliveryMapDependencies = Object.freeze({ evaluateDoctor, buildStatusCard, postApprovalTransition });

export function createValidationHandlers(io = console) {
  return new Map([
    ["doctor", (options) => {
      const report = evaluateDoctor(options.dir, options);
      printDoctorReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["gate-check", (options) => {
      const report = evaluateGateCheck(options.dir, options);
      if (options.approvalEnvelope) {
        const output = printApprovalEnvelope(report, { io, reEvaluate: () => evaluateGateCheck(options.dir, options) });
        return output.status === "blocked" ? 2 : 0;
      }
      const presentationRendered = printGateCheckReport(report, options.json, options.statusCard, io);
      if (presentationRendered === false) return 2;
      return report.status === "blocked" ? 2 : 0;
    }],
    ["delivery-map", (options) => {
      const report = evaluateDeliveryMap(options.dir, options, deliveryMapDependencies);
      printDeliveryMapReport(report, options.json, io);
      return report.status === "block" ? 2 : 0;
    }],
    ["delivery-path-search", async (options) => {
      try {
        const result = await executeDeliveryPathSearch(options, io);
        return result.status === "recommendation" ? 0 : 2;
      } catch (error) {
        io.error(`Delivery Path Search failed: ${error.message}`);
        return 2;
      }
    }],
  ]);
}
