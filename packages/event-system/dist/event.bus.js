"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const crypto_1 = require("crypto");
class EventBus {
    constructor() {
        this.handlers = new Map();
        this.allHandlers = new Set();
    }
    publish(event) {
        const normalized = this.normalizeEvent(event);
        const handlers = Array.from(this.handlers.get(normalized.type) || []);
        // Fire-and-forget async processing of handlers
        setTimeout(() => {
            void Promise.all([...handlers, ...this.allHandlers].map((handler) => handler(normalized, this).catch((error) => {
                console.error(`[event-system] handler failed for ${normalized.type}:`, error);
            })));
        }, 0);
        return Promise.resolve();
    }
    subscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType) ?? new Set();
        handlers.add(handler);
        this.handlers.set(eventType, handlers);
    }
    unsubscribe(eventType, handler) {
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
    subscribeAll(handler) {
        this.allHandlers.add(handler);
    }
    unsubscribeAll(handler) {
        if (!handler) {
            this.allHandlers.clear();
            return;
        }
        this.allHandlers.delete(handler);
    }
    normalizeEvent(event) {
        const timestamp = event.metadata?.timestamp || Date.now();
        const correlationId = event.metadata?.correlationId || event.id;
        return {
            ...event,
            id: event.id || (0, crypto_1.randomUUID)(),
            metadata: {
                ...event.metadata,
                timestamp,
                correlationId,
            },
        };
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=event.bus.js.map