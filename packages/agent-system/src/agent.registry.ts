import { Agent } from './agent.types';
import { Event } from '@karyo/event-system';

export class AgentRegistry {
  private agents: Agent[] = [];

  registerAgent(agent: Agent): void {
    if (this.agents.some((a) => a.name === agent.name)) {
      return;
    }
    this.agents.push(agent);
  }

  getAgentsForEvent(event: Event): Agent[] {
    return this.agents.filter((agent) => {
      try {
        return agent.canHandle(event);
      } catch (error) {
        console.warn(`[agent-system] canHandle error ${agent.name}:`, error);
        return false;
      }
    });
  }

  listAgents(): string[] {
    return this.agents.map((agent) => agent.name);
  }
}
