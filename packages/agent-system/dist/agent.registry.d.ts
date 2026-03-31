import { Agent } from './agent.types';
import { Event } from '@karyo/event-system';
export declare class AgentRegistry {
    private agents;
    registerAgent(agent: Agent): void;
    getAgentsForEvent(event: Event): Agent[];
    listAgents(): string[];
}
//# sourceMappingURL=agent.registry.d.ts.map