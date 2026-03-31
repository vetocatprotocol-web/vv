import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';

export class MemoryAgent extends BaseAgent {
  name = 'MemoryAgent';

  canHandle(event: import('@karyo/event-system').Event): boolean {
    return [
      'MEMORY_READ',
      'MEMORY_WRITE',
      'MEMORY_DELETE',
    ].includes(event.type);
  }

  async execute(context: AgentContext): Promise<void> {
    const payload = context.event.payload || {};
    const key = String(payload.key || '').trim();
    if (!key) {
      return;
    }

    if (context.event.type === 'MEMORY_WRITE') {
      await context.memory.write(key, payload.value);
      await context.emit({
        id: `${context.event.id}-memory-write-result`,
        type: 'MEMORY_WRITE_RESULT',
        payload: { key, value: payload.value },
        metadata: {
          source: 'agent-system.MemoryAgent',
          correlationId: context.event.metadata?.correlationId || context.event.id,
          timestamp: Date.now(),
        },
      });
      return;
    }

    if (context.event.type === 'MEMORY_READ') {
      const stored = await context.memory.read(key);
      await context.emit({
        id: `${context.event.id}-memory-read-result`,
        type: 'MEMORY_READ_RESULT',
        payload: { key, value: stored },
        metadata: {
          source: 'agent-system.MemoryAgent',
          correlationId: context.event.metadata?.correlationId || context.event.id,
          timestamp: Date.now(),
        },
      });
      return;
    }

    if (context.event.type === 'MEMORY_DELETE') {
      const deleteFn = context.memory.delete;
      if (deleteFn) {
        await deleteFn.call(context.memory, key);
      }
      await context.emit({
        id: `${context.event.id}-memory-delete-result`,
        type: 'MEMORY_DELETE_RESULT',
        payload: { key },
        metadata: {
          source: 'agent-system.MemoryAgent',
          correlationId: context.event.metadata?.correlationId || context.event.id,
          timestamp: Date.now(),
        },
      });
    }
  }
}
