import { AIProvider, AIRequest, AIResponse } from '../ai.types';
export declare class OpenAIProvider implements AIProvider {
    private apiKey;
    constructor(apiKey?: string);
    generate(request: AIRequest): Promise<AIResponse>;
}
//# sourceMappingURL=openai.provider.d.ts.map