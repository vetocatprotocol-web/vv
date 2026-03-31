export type EventType = string;

export interface EventMetadata {
  source?: string;
  timestamp?: number;
  correlationId?: string;
  [key: string]: any;
}

export interface Event<T = any> {
  id: string;
  type: EventType;
  payload: T;
  metadata?: EventMetadata;
}

export interface EventBusInterface {
  publish(event: Event): Promise<void>;
  subscribe(eventType: EventType, handler: EventHandler): void;
  unsubscribe(eventType: EventType, handler?: EventHandler): void;
}

export type EventHandler = (event: Event, bus: EventBusInterface) => Promise<void>;
