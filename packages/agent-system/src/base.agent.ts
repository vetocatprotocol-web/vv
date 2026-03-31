import { Agent, AgentContext } from './agent.types';

export abstract class BaseAgent implements Agent {
  abstract name: string;

  abstract canHandle(event: import('@karyo/event-system').Event): boolean;

  abstract execute(context: AgentContext): Promise<void>;

  protected async respond(context: AgentContext, responsePayload: any): Promise<void> {
    const outputEvent: import('@karyo/event-system').Event = {
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
