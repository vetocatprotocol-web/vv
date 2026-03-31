import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';

export class SystemConfigAgent extends BaseAgent {
  name = 'SystemConfigAgent';

  canHandle(event: import('@karyo/event-system').Event): boolean {
    return event.type === 'SYSTEM_CONFIG_UPDATE';
  }

  async execute(context: AgentContext): Promise<void> {
    const payload = context.event.payload || {};
    const key = String(payload.key || '').trim();
    const value = payload.value;

    if (!key) {
      return;
    }

    const existingConfig = (await context.memory.read('system_config')) || {};
    const updatedConfig = { ...existingConfig, [key]: value };

    await context.memory.write('system_config', updatedConfig);

    await context.emit({
      id: `${context.event.id}-system-config-updated`,
      type: 'SYSTEM_CONFIG_UPDATED',
      payload: { config: updatedConfig },
      metadata: {
        source: 'agent-system.SystemConfigAgent',
        correlationId: context.event.metadata?.correlationId || context.event.id,
        timestamp: Date.now(),
      },
    });
  }
}
