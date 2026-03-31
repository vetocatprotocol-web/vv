import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';
export declare class UserInputAgent extends BaseAgent {
    name: string;
    canHandle(event: import('@karyo/event-system').Event): boolean;
    execute(context: AgentContext): Promise<void>;
}
//# sourceMappingURL=userInput.agent.d.ts.map