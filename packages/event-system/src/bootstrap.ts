import { EventBus, EventRegistry } from './index';
import { userInputHandler, agentResponseHandler, eventLogHandler } from './handlers';

export function createDefaultEventSystem() {
  const bus = new EventBus();
  const registry = new EventRegistry(bus);

  registry.register('USER_INPUT', userInputHandler);
  registry.register('AGENT_RESPONSE', agentResponseHandler);
  registry.register('EVENT_LOG', eventLogHandler);

  return { bus, registry };
}
