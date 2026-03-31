import { AIAPI, AIProvider, AIRequest, AIResponse } from './ai.types';
import { OpenAIProvider } from './providers/openai.provider';

export class AIService implements AIAPI {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      try {
        this.provider = new OpenAIProvider();
      } catch (err) {
        // Fall back to a safe mock provider if API key missing for local/dev convenience.
        this.provider = {
          async generate(req: AIRequest): Promise<AIResponse> {
            return {
              text: `Mock response for prompt: ${req.prompt}`,
              raw: {
                fallback: true,
                prompt: req.prompt,
                context: req.context,
              },
            };
          },
        };
      }
    }
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    return this.provider.generate(request);
  }
}
