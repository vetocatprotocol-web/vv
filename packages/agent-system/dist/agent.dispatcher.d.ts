import { AIAPI, MemoryAPI } from './agent.types';
import { AgentRegistry } from './agent.registry';
import { Event, EventBusInterface } from '@karyo/event-system';
export declare class AgentDispatcher {
    private registry;
    private memory;
    private ai;
    private bus;
    constructor(options: {
        registry: AgentRegistry;
        memory: MemoryAPI;
        ai: AIAPI;
        bus: EventBusInterface;
    });
    dispatch(event: Event): Promise<void>;
}
//# sourceMappingURL=agent.dispatcher.d.ts.map