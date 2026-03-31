import { AIAPI } from './agent.types';
import { ContextBuilder } from '@karyo/ai-core';

// Simple wrapper around AI core as an abstraction layer. In production, connect to LLM providers.
export class DefaultAIAPI implements AIAPI {
  private contextBuilder: ContextBuilder;

  constructor(contextBuilder: ContextBuilder = new ContextBuilder()) {
    this.contextBuilder = contextBuilder;
  }

  async generateText(prompt: string, context?: string): Promise<string> {
    // placeholder for actual AI call; it may use model router + prompt orchestrator in later iterations.
    const contextSuffix = context ? `\n\nContext:\n${context}` : '';
    const formatted = `Assistant response to: "${prompt}"${contextSuffix}`;
    return Promise.resolve(formatted);
  }
}
