import { Agent } from './agent.types';
import { Event } from '@karyo/event-system';
export type AgentStatus = {
    name: string;
    enabled: boolean;
};
export declare class AgentRegistry {
    private agents;
    registerAgent(agent: Agent): void;
    setAgentEnabled(agentName: string, enabled: boolean): void;
    isAgentEnabled(agentName: string): boolean;
    getAgentsForEvent(event: Event): Agent[];
    listAgents(): AgentStatus[];
}
//# sourceMappingURL=agent.registry.d.ts.map