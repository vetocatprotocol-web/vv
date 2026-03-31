"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
class BaseAgent {
    async respond(context, responsePayload) {
        const outputEvent = {
            id: `${context.event.id}-agent-${Date.now()}`,
            type: 'AGENT_RESPONSE',
            payload: responsePayload,
            metadata: {
                source: `agent-system.${this.name}`,
                correlationId: context.event.metadata?.correlationId || context.event.id,
                timestamp: Date.now(),
            },
        };
        await context.emit(outputEvent);
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base.agent.js.map