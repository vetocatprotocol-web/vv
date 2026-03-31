// packages/ai-core/src/__tests__/task-classifier.test.ts

import { TaskClassifier } from '../task-classifier';

describe('TaskClassifier', () => {
  let classifier: TaskClassifier;

  beforeEach(() => {
    classifier = new TaskClassifier();
  });

  it('should classify simple tasks', async () => {
    const task = {
      id: 'test-1',
      description: 'Hello, how are you?',
      userId: 'user-1',
      workspaceId: 'ws-1',
    };

    const result = await classifier.classifyTask(task);

    expect(result.complexity).toBe('simple');
    expect(result.estimatedTokens).toBeGreaterThan(0);
    expect(result.keywords).toContain('hello');
  });

  it('should classify medium tasks', async () => {
    const task = {
      id: 'test-2',
      description: 'Please analyze the sales data and create a summary',
      userId: 'user-1',
      workspaceId: 'ws-1',
    };

    const result = await classifier.classifyTask(task);

    expect(result.complexity).toBe('medium');
    expect(result.keywords).toContain('analyze');
  });

  it('should classify complex tasks', async () => {
    const task = {
      id: 'test-3',
      description: 'Research and design a comprehensive business strategy for Q4',
      userId: 'user-1',
      workspaceId: 'ws-1',
    };

    const result = await classifier.classifyTask(task);

    expect(result.complexity).toBe('complex');
    expect(result.keywords).toContain('research');
  });
});