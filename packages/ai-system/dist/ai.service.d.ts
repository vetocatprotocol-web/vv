import { AIAPI, AIProvider, AIRequest, AIResponse } from './ai.types';
export declare class AIService implements AIAPI {
    private provider;
    constructor(provider?: AIProvider);
    generateText(request: AIRequest): Promise<AIResponse>;
}
//# sourceMappingURL=ai.service.d.ts.map