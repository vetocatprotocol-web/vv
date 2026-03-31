export type AIRequest = {
    prompt: string;
    context?: string;
    temperature?: number;
    maxTokens?: number;
};
export type AIResponse = {
    text: string;
    raw?: any;
};
export interface AIProvider {
    generate(request: AIRequest): Promise<AIResponse>;
}
export interface AIAPI {
    generateText(request: AIRequest): Promise<AIResponse>;
}
//# sourceMappingURL=ai.types.d.ts.map