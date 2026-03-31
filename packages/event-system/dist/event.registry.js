"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistry = void 0;
class EventRegistry {
    constructor(bus) {
        this.bus = bus;
        this.handlers = new Map();
    }
    register(eventType, handler) {
        const set = this.handlers.get(eventType) ?? new Set();
        set.add(handler);
        this.handlers.set(eventType, set);
        this.bus.subscribe(eventType, handler);
    }
    unregister(eventType, handler) {
        if (!handler) {
            this.handlers.delete(eventType);
            this.bus.unsubscribe(eventType);
            return;
        }
        const set = this.handlers.get(eventType);
        if (!set)
            return;
        set.delete(handler);
        this.bus.unsubscribe(eventType, handler);
        if (set.size === 0) {
            this.handlers.delete(eventType);
        }
    }
    getHandlers(eventType) {
        return Array.from(this.handlers.get(eventType) ?? []);
    }
    listEventTypes() {
        return Array.from(this.handlers.keys());
    }
}
exports.EventRegistry = EventRegistry;
//# sourceMappingURL=event.registry.js.map