"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentResponseHandler = void 0;
const agentResponseHandler = async (event, bus) => {
    console.log(`[event-system] AGENT_RESPONSE consumed (${event.id}):`, event.payload);
    // Example of additional workflow: emit optional log event
    await bus.publish({
        id: event.id + '-log',
        type: 'EVENT_LOG',
        payload: {
            message: `Agent response processed for correlation ${event.metadata?.correlationId ?? event.id}`,
            originalResponse: event.payload,
        },
        metadata: {
            source: 'event-system.agentResponseHandler',
            correlationId: event.metadata?.correlationId || event.id,
            timestamp: Date.now(),
        },
    });
};
exports.agentResponseHandler = agentResponseHandler;
//# sourceMappingURL=agentResponse.handler.js.map