import { AIAPI, AIRequest, AIResponse } from '@karyo/ai-system';
import { AIService } from '@karyo/ai-system';
export declare class DefaultAIAPI implements AIAPI {
    private service;
    constructor(service?: AIService);
    generateText(request: AIRequest): Promise<AIResponse>;
    generateTextLegacy(prompt: string, context?: string): Promise<string>;
}
//# sourceMappingURL=ai-api.d.ts.map