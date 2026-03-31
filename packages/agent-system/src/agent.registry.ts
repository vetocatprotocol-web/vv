import { Agent } from './agent.types';
import { Event } from '@karyo/event-system';

interface AgentRecord {
  agent: Agent;
  enabled: boolean;
}

export type AgentStatus = { name: string; enabled: boolean };

export class AgentRegistry {
  private agents: Map<string, AgentRecord> = new Map();

  registerAgent(agent: Agent): void {
    if (this.agents.has(agent.name)) {
      return;
    }
    this.agents.set(agent.name, { agent, enabled: true });
  }

  setAgentEnabled(agentName: string, enabled: boolean): void {
    const record = this.agents.get(agentName);
    if (!record) {
      return;
    }
    record.enabled = enabled;
  }

  isAgentEnabled(agentName: string): boolean {
    const record = this.agents.get(agentName);
    return record?.enabled ?? false;
  }

  getAgentsForEvent(event: Event): Agent[] {
    return Array.from(this.agents.values())
      .filter((record) => record.enabled)
      .map((record) => record.agent)
      .filter((agent) => {
        try {
          return agent.canHandle(event);
        } catch (error) {
          console.warn(`[agent-system] canHandle error ${agent.name}:`, error);
          return false;
        }
      });
  }

  listAgents(): AgentStatus[] {
    return Array.from(this.agents.entries()).map(([name, record]) => ({
      name,
      enabled: record.enabled,
    }));
  }
}

