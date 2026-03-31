import { EventBus } from './event.bus';
import { EventHandler, EventType } from './event.types';

export class EventRegistry {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  constructor(private bus: EventBus) {}

  register(eventType: EventType, handler: EventHandler): void {
    const set = this.handlers.get(eventType) ?? new Set();
    set.add(handler);
    this.handlers.set(eventType, set);
    this.bus.subscribe(eventType, handler);
  }

  unregister(eventType: EventType, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(eventType);
      this.bus.unsubscribe(eventType);
      return;
    }

    const set = this.handlers.get(eventType);
    if (!set) return;

    set.delete(handler);
    this.bus.unsubscribe(eventType, handler);

    if (set.size === 0) {
      this.handlers.delete(eventType);
    }
  }

  getHandlers(eventType: EventType): EventHandler[] {
    return Array.from(this.handlers.get(eventType) ?? []);
  }

  listEventTypes(): EventType[] {
    return Array.from(this.handlers.keys());
  }
}
