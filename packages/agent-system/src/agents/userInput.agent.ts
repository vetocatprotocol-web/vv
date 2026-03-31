import { BaseAgent } from '../base.agent';
import { AgentContext } from '../agent.types';

export class UserInputAgent extends BaseAgent {
  name = 'UserInputAgent';

  canHandle(event: import('@karyo/event-system').Event): boolean {
    return event.type === 'USER_INPUT' && typeof event.payload?.text === 'string';
  }

  async execute(context: AgentContext): Promise<void> {
    const text = String(context.event.payload?.text || '').trim();
    if (!text) {
      return;
    }

    // Attempt to use memory for context history (optional)
    const memoryKey = `user_input:${context.event.id}`;
    await context.memory.write(memoryKey, {
      id: context.event.id,
      text,
      timestamp: Date.now(),
      metadata: context.event.metadata,
    });

    const aiPrompt = `Process this user input and return a concise agent response:\n${text}`;
    const userContext = await context.memory.read('user_context');
    const contextPayload = Array.isArray(userContext)
      ? userContext.join('\n')
      : userContext || '';

    const aiText = await context.ai.generateText(aiPrompt, contextPayload);

    await this.respond(context, {
      text: aiText,
      original: text,
      generatedAt: Date.now(),
    });

    // maintain memory provenance
    await context.memory.write(`last_user_input`, {
      text,
      aiText,
      timestamp: Date.now(),
    });
  }
}
