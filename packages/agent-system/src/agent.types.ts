import { Event } from '@karyo/event-system';
import { AIAPI as AIServiceAPI } from '@karyo/ai-system';

export interface MemoryAPI {
  read(key: string): Promise<any | null>;
  write(key: string, value: any): Promise<void>;
  query?(filter: Record<string, any>): Promise<any[]>;
}

export type AIAPI = AIServiceAPI;

export interface AgentContext {
  event: Event;
  memory: MemoryAPI;
  ai: AIAPI;
  emit: (event: Event) => Promise<void>;
}

export interface Agent {
  name: string;
  canHandle(event: Event): boolean;
  execute(context: AgentContext): Promise<void>;
}

export interface Tool {
  name: string;
  description?: string;
  execute(input: any): Promise<any>;
}
