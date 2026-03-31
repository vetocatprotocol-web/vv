import { EventBus } from './event.bus';
import { EventHandler, EventType } from './event.types';
export declare class EventRegistry {
    private bus;
    private handlers;
    constructor(bus: EventBus);
    register(eventType: EventType, handler: EventHandler): void;
    unregister(eventType: EventType, handler?: EventHandler): void;
    getHandlers(eventType: EventType): EventHandler[];
    listEventTypes(): EventType[];
}
//# sourceMappingURL=event.registry.d.ts.map