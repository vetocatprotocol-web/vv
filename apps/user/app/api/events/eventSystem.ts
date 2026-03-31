import { createDefaultEventSystem } from '@karyo/event-system';
import type { Event } from '@karyo/event-system';

const eventSystem = createDefaultEventSystem();

export const userEventStore: Event[] = [];

export { eventSystem };

export function addEventToStore(event: Event) {
  const normalized = {
    ...event,
    createdAt: new Date(event.metadata?.timestamp || Date.now()).toISOString(),
  };

  userEventStore.unshift(normalized);
  if (userEventStore.length > 500) {
    userEventStore.pop();
  }

  return normalized;
}
