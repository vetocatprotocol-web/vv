import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';

export class AIConfigAgent extends BaseAgent {
  name = 'AIConfigAgent';

  canHandle(event: import('@karyo/event-system').Event): boolean {
    return event.type === 'AI_CONFIG_UPDATE';
  }

  async execute(context: AgentContext): Promise<void> {
    const payload = context.event.payload || {};
    const config = { ...((await context.memory.read('ai_config')) || {}), ...payload };

    await context.memory.write('ai_config', config);

    await context.emit({
      id: `${context.event.id}-ai-config-updated`,
      type: 'AI_CONFIG_UPDATED',
      payload: { config },
      metadata: {
        source: 'agent-system.AIConfigAgent',
        correlationId: context.event.metadata?.correlationId || context.event.id,
        timestamp: Date.now(),
      },
    });
  }
}
