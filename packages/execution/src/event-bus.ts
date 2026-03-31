import { createClient, RedisClientType } from 'redis';
import { EventMessage, EventBusConfig } from './types';

export class EventBus {
  private publisher: RedisClientType;
  private subscriber: RedisClientType;
  private eventHandlers: Map<string, ((message: EventMessage) => void)[]> = new Map();

  constructor(private config: EventBusConfig) {
    this.publisher = createClient({ url: config.redisUrl });
    this.subscriber = createClient({ url: config.redisUrl });

    this.setupConnections();
  }

  async publish(eventType: string, payload: Record<string, any>, source?: string): Promise<void> {
    const message: EventMessage = {
      type: eventType,
      payload,
      timestamp: new Date(),
      source,
    };

    const channel = this.getChannelName(eventType);
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(eventType: string, handler: (message: EventMessage) => void): Promise<void> {
    const channel = this.getChannelName(eventType);

    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
      await this.subscriber.subscribe(channel, (message) => {
        try {
          const eventMessage: EventMessage = JSON.parse(message);
          const handlers = this.eventHandlers.get(eventType) || [];
          handlers.forEach(h => h(eventMessage));
        } catch (error) {
          console.error('Failed to parse event message:', error);
        }
      });
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.push(handler);
  }

  async unsubscribe(eventType: string, handler?: (message: EventMessage) => void): Promise<void> {
    if (!handler) {
      // Unsubscribe all handlers for this event type
      this.eventHandlers.delete(eventType);
      const channel = this.getChannelName(eventType);
      await this.subscriber.unsubscribe(channel);
      return;
    }

    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.eventHandlers.delete(eventType);
          const channel = this.getChannelName(eventType);
          await this.subscriber.unsubscribe(channel);
        }
      }
    }
  }

  private getChannelName(eventType: string): string {
    const prefix = this.config.channelPrefix || 'karyo:events';
    return `${prefix}:${eventType}`;
  }

  private async setupConnections(): Promise<void> {
    await this.publisher.connect();
    await this.subscriber.connect();

    this.publisher.on('error', (err) => {
      console.error('Publisher error:', err);
    });

    this.subscriber.on('error', (err) => {
      console.error('Subscriber error:', err);
    });
  }

  async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}