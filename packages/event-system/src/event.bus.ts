import { randomUUID } from 'crypto';
import { Event, EventBusInterface, EventHandler, EventMetadata, EventType } from './event.types';

export class EventBus implements EventBusInterface {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  publish(event: Event): Promise<void> {
    const normalized = this.normalizeEvent(event);

    const handlers = Array.from(this.handlers.get(normalized.type) || []);

    // Fire-and-forget async processing of handlers
    setTimeout(() => {
      void Promise.all(
        handlers.map((handler) =>
          handler(normalized, this).catch((error) => {
            console.error(`[event-system] handler failed for ${normalized.type}:`, error);
          }),
        ),
      );
    }, 0);

    return Promise.resolve();
  }

  subscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) ?? new Set();
    handlers.add(handler);
    this.handlers.set(eventType, handlers);
  }

  unsubscribe(eventType: EventType, handler?: EventHandler): void {
    if (!handler) {
      this.handlers.delete(eventType);
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (!handlers) {
      return;
    }

    handlers.delete(handler);
    if (handlers.size === 0) {
      this.handlers.delete(eventType);
    }
  }

  private normalizeEvent(event: Event): Event {
    const timestamp = event.metadata?.timestamp || Date.now();
    const correlationId = event.metadata?.correlationId || event.id;

    return {
      ...event,
      id: event.id || randomUUID(),
      metadata: {
        ...event.metadata,
        timestamp,
        correlationId,
      },
    };
  }
}
