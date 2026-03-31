import { AIAPI, AIRequest, AIResponse } from '@karyo/ai-system';
import { AIService } from '@karyo/ai-system';

export class DefaultAIAPI implements AIAPI {
  private service: AIService;

  constructor(service: AIService = new AIService()) {
    this.service = service;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    return this.service.generateText(request);
  }

  // backward-compatible helper for old signature
  async generateTextLegacy(prompt: string, context?: string): Promise<string> {
    const result = await this.service.generateText({ prompt, context });
    return result.text;
  }
}
