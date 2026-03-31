import { Event, EventBusInterface, EventHandler } from './event.types';
export type { Event, EventBusInterface, EventHandler };
export declare abstract class BaseEventHandler {
    abstract type: string;
    abstract handle(event: Event, bus: EventBusInterface): Promise<void>;
}
//# sourceMappingURL=event.handler.d.ts.map