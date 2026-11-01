import { createSkillDispatchService } from '../skill-dispatch/service.js';

// Continuation consumes the same derived current facts as a read-only route.
// Relationships come from canonical bindings; there is no editable projection
// for this application layer to repair or synchronize.
export const createDeliveryContinuationService = dependencies => createSkillDispatchService(dependencies);
