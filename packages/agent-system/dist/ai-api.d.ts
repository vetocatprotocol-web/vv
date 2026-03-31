import { AIAPI } from './agent.types';
import { ContextBuilder } from '@karyo/ai-core';
export declare class DefaultAIAPI implements AIAPI {
    private contextBuilder;
    constructor(contextBuilder?: ContextBuilder);
    generateText(prompt: string, context?: string): Promise<string>;
}
//# sourceMappingURL=ai-api.d.ts.map