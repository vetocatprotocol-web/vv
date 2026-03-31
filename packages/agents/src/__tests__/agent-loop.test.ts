// packages/agents/src/__tests__/agent-loop.test.ts

import { AgentLoop } from '../agent-loop';
import { TaskClassifier } from '@karyo/ai-core';
import { ModelRouter } from '@karyo/ai-core';
import { ContextBuilder } from '@karyo/ai-core';
import { PromptOrchestrator } from '@karyo/ai-core';

describe('AgentLoop', () => {
  let agentLoop: AgentLoop;
  let mockTaskClassifier: jest.Mocked<TaskClassifier>;
  let mockModelRouter: jest.Mocked<ModelRouter>;
  let mockContextBuilder: jest.Mocked<ContextBuilder>;
  let mockPromptOrchestrator: jest.Mocked<PromptOrchestrator>;

  beforeEach(() => {
    // Create mocks
    mockTaskClassifier = {
      classifyTask: jest.fn(),
    } as any;

    mockModelRouter = {
      routeToModel: jest.fn(),
    } as any;

    mockContextBuilder = {
      buildContext: jest.fn(),
    } as any;

    mockPromptOrchestrator = {
      buildPrompt: jest.fn(),
    } as any;

    agentLoop = new AgentLoop(
      mockTaskClassifier,
      mockModelRouter,
      mockContextBuilder,
      mockPromptOrchestrator
    );
  });

  it('should execute a simple task successfully', async () => {
    const task = {
      id: 'test-task',
      description: 'Hello world',
      userId: 'user-1',
      workspaceId: 'ws-1',
    };

    // Mock the AI core responses
    mockTaskClassifier.classifyTask.mockResolvedValue({
      ...task,
      complexity: 'simple',
      estimatedTokens: 10,
      keywords: ['hello'],
    });

    mockModelRouter.routeToModel.mockResolvedValue({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      tier: 'free',
      maxTokens: 4096,
      costPerToken: 0.002,
    });

    mockContextBuilder.buildContext.mockResolvedValue({
      userContext: {},
      memoryContext: [],
      taskHistory: [],
    });

    mockPromptOrchestrator.buildPrompt.mockResolvedValue({
      systemPrompt: 'You are a helpful assistant',
      userPrompt: 'Complete this task',
      variables: {},
    });

    const result = await agentLoop.executeTask(task);

    expect(result.success).toBe(true);
    expect(result.quality).toBeDefined();
    expect(result.steps).toBeDefined();
  });

  it('should handle task execution failures gracefully', async () => {
    const task = {
      id: 'test-task',
      description: 'Complex task that might fail',
      userId: 'user-1',
      workspaceId: 'ws-1',
    };

    // Mock classification
    mockTaskClassifier.classifyTask.mockResolvedValue({
      ...task,
      complexity: 'complex',
      estimatedTokens: 100,
      keywords: ['complex'],
    });

    // Mock other dependencies to throw errors
    mockModelRouter.routeToModel.mockRejectedValue(new Error('Model routing failed'));

    const result = await agentLoop.executeTask(task);

    expect(result.success).toBe(false);
    expect(result.feedback).toContain('Model routing failed');
  });
});