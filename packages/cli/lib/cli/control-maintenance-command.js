import { runControlMaintenance } from '#agdf-core/control-maintenance/service.js';
import { maintenanceResult, maintenanceExitCode } from '#agdf-core/control-maintenance/contract.js';
import { renderMaintenanceResult } from '#agdf-core/control-maintenance/presentation.js';
export async function executeControlMaintenance(options, io = console) {
  const language = options.language?.chat_language ?? 'en';
  try {
    const report = await runControlMaintenance(options.dir);
    io.log(options.json ? JSON.stringify(report, null, 2) : renderMaintenanceResult(report, { language, details: options.details }));
    return maintenanceExitCode(report);
  } catch (error) {
    const report = maintenanceResult(options.dir, null, { diagnostic: error.code ?? error.message });
    io.log(options.json ? JSON.stringify(report, null, 2) : renderMaintenanceResult(report, { language }));
    return 1;
  }
}
