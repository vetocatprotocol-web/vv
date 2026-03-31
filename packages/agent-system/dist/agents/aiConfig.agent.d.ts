import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';
export declare class AIConfigAgent extends BaseAgent {
    name: string;
    canHandle(event: import('@karyo/event-system').Event): boolean;
    execute(context: AgentContext): Promise<void>;
}
//# sourceMappingURL=aiConfig.agent.d.ts.map