"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDispatcher = void 0;
class AgentDispatcher {
    constructor(options) {
        this.registry = options.registry;
        this.memory = options.memory;
        this.ai = options.ai;
        this.bus = options.bus;
    }
    async dispatch(event) {
        const agents = this.registry.getAgentsForEvent(event);
        if (agents.length === 0) {
            console.warn('[agent-system] No agents available for event', event.type);
            return;
        }
        await Promise.all(agents.map(async (agent) => {
            try {
                await agent.execute({
                    event,
                    memory: this.memory,
                    ai: this.ai,
                    emit: async (newEvent) => {
                        // preserve correlation chain
                        newEvent.metadata = {
                            ...(newEvent.metadata || {}),
                            correlationId: newEvent.metadata?.correlationId || event.metadata?.correlationId || event.id,
                            timestamp: newEvent.metadata?.timestamp || Date.now(),
                        };
                        await this.bus.publish(newEvent);
                    },
                });
            }
            catch (error) {
                console.error(`[agent-system] Agent ${agent.name} failed for event ${event.type}:`, error);
                await this.bus.publish({
                    id: `${event.id}-agent-error-${Date.now()}`,
                    type: 'AGENT_FAILURE',
                    payload: { error: error.message || 'unknown error', agent: agent.name, eventType: event.type },
                    metadata: {
                        source: `agent-system.${agent.name}`,
                        correlationId: event.metadata?.correlationId || event.id,
                        timestamp: Date.now(),
                    },
                });
            }
        }));
    }
}
exports.AgentDispatcher = AgentDispatcher;
//# sourceMappingURL=agent.dispatcher.js.map