import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';
export declare class MemoryAgent extends BaseAgent {
    name: string;
    canHandle(event: import('@karyo/event-system').Event): boolean;
    execute(context: AgentContext): Promise<void>;
}
//# sourceMappingURL=memory.agent.d.ts.map