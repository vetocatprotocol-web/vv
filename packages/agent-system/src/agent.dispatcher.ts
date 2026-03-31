import { AgentContext, AIAPI, MemoryAPI } from './agent.types';
import { AgentRegistry } from './agent.registry';
import { Event, EventBusInterface } from '@karyo/event-system';

export class AgentDispatcher {
  private registry: AgentRegistry;
  private memory: MemoryAPI;
  private ai: AIAPI;
  private bus: EventBusInterface;

  constructor(options: {
    registry: AgentRegistry;
    memory: MemoryAPI;
    ai: AIAPI;
    bus: EventBusInterface;
  }) {
    this.registry = options.registry;
    this.memory = options.memory;
    this.ai = options.ai;
    this.bus = options.bus;
  }

  async dispatch(event: Event): Promise<void> {
    const agents = this.registry.getAgentsForEvent(event);

    if (agents.length === 0) {
      console.warn('[agent-system] No agents available for event', event.type);
      return;
    }

    await Promise.all(
      agents.map(async (agent) => {
        try {
          await agent.execute({
            event,
            memory: this.memory,
            ai: this.ai,
            emit: async (newEvent: Event) => {
              // preserve correlation chain
              newEvent.metadata = {
                ...(newEvent.metadata || {}),
                correlationId: newEvent.metadata?.correlationId || event.metadata?.correlationId || event.id,
                timestamp: newEvent.metadata?.timestamp || Date.now(),
              };
              await this.bus.publish(newEvent);
            },
          });
        } catch (error) {
          console.error(`[agent-system] Agent ${agent.name} failed for event ${event.type}:`, error);
          await this.bus.publish({
            id: `${event.id}-agent-error-${Date.now()}`,
            type: 'AGENT_FAILURE',
            payload: { error: (error as Error).message || 'unknown error', agent: agent.name, eventType: event.type },
            metadata: {
              source: `agent-system.${agent.name}`,
              correlationId: event.metadata?.correlationId || event.id,
              timestamp: Date.now(),
            },
          });
        }
      })
    );
  }
}
