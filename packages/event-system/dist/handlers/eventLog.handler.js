"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventLogHandler = void 0;
const eventLogHandler = async (event, bus) => {
    console.log(`[event-system] EVENT_LOG (${event.id}):`, event.payload);
};
exports.eventLogHandler = eventLogHandler;
//# sourceMappingURL=eventLog.handler.js.map