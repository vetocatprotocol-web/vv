import { Event, EventBusInterface, EventHandler, EventType } from './event.types';
export declare class EventBus implements EventBusInterface {
    private handlers;
    private allHandlers;
    publish(event: Event): Promise<void>;
    subscribe(eventType: EventType, handler: EventHandler): void;
    unsubscribe(eventType: EventType, handler?: EventHandler): void;
    subscribeAll(handler: EventHandler): void;
    unsubscribeAll(handler?: EventHandler): void;
    private normalizeEvent;
}
//# sourceMappingURL=event.bus.d.ts.map