import { EventMessage, EventBusConfig } from './types';
export declare class EventBus {
    private config;
    private publisher;
    private subscriber;
    private eventHandlers;
    constructor(config: EventBusConfig);
    publish(eventType: string, payload: Record<string, any>, source?: string): Promise<void>;
    subscribe(eventType: string, handler: (message: EventMessage) => void): Promise<void>;
    unsubscribe(eventType: string, handler?: (message: EventMessage) => void): Promise<void>;
    private getChannelName;
    private setupConnections;
    close(): Promise<void>;
}
//# sourceMappingURL=event-bus.d.ts.map