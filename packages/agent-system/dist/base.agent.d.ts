import { Agent, AgentContext } from './agent.types';
export declare abstract class BaseAgent implements Agent {
    abstract name: string;
    abstract canHandle(event: import('@karyo/event-system').Event): boolean;
    abstract execute(context: AgentContext): Promise<void>;
    protected respond(context: AgentContext, responsePayload: any): Promise<void>;
}
//# sourceMappingURL=base.agent.d.ts.map