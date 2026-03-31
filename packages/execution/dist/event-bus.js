"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const redis_1 = require("redis");
class EventBus {
    constructor(config) {
        this.config = config;
        this.eventHandlers = new Map();
        this.publisher = (0, redis_1.createClient)({ url: config.redisUrl });
        this.subscriber = (0, redis_1.createClient)({ url: config.redisUrl });
        this.setupConnections();
    }
    async publish(eventType, payload, source) {
        const message = {
            type: eventType,
            payload,
            timestamp: new Date(),
            source,
        };
        const channel = this.getChannelName(eventType);
        await this.publisher.publish(channel, JSON.stringify(message));
    }
    async subscribe(eventType, handler) {
        const channel = this.getChannelName(eventType);
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
            await this.subscriber.subscribe(channel, (message) => {
                try {
                    const eventMessage = JSON.parse(message);
                    const handlers = this.eventHandlers.get(eventType) || [];
                    handlers.forEach(h => h(eventMessage));
                }
                catch (error) {
                    console.error('Failed to parse event message:', error);
                }
            });
        }
        const handlers = this.eventHandlers.get(eventType);
        handlers.push(handler);
    }
    async unsubscribe(eventType, handler) {
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
    getChannelName(eventType) {
        const prefix = this.config.channelPrefix || 'karyo:events';
        return `${prefix}:${eventType}`;
    }
    async setupConnections() {
        await this.publisher.connect();
        await this.subscriber.connect();
        this.publisher.on('error', (err) => {
            console.error('Publisher error:', err);
        });
        this.subscriber.on('error', (err) => {
            console.error('Subscriber error:', err);
        });
    }
    async close() {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=event-bus.js.map