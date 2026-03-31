// packages/agents/src/agents/planner-agent.ts

import {
  TaskClassifier,
  ModelRouter,
  ContextBuilder,
  PromptOrchestrator,
  ClassifiedTask,
  ModelConfig,
  ContextData,
  PromptTemplate
} from '@karyo/ai-core';
import { AgentExecutionContext, ExecutionPlan, AgentStep } from '../types';

/**
 * Planner Agent
 *
 * Breaks down complex tasks into executable steps
 * Uses AI Core for task understanding and prompt generation
 * Creates structured execution plans for multi-step tasks
 */
export class PlannerAgent {
  private taskClassifier: TaskClassifier;
  private modelRouter: ModelRouter;
  private contextBuilder: ContextBuilder;
  private promptOrchestrator: PromptOrchestrator;

  constructor(
    taskClassifier: TaskClassifier,
    modelRouter: ModelRouter,
    contextBuilder: ContextBuilder,
    promptOrchestrator: PromptOrchestrator
  ) {
    this.taskClassifier = taskClassifier;
    this.modelRouter = modelRouter;
    this.contextBuilder = contextBuilder;
    this.promptOrchestrator = promptOrchestrator;
  }

  /**
   * Create an execution plan for a task
   * @param task - The task to plan
   * @param userTier - User's subscription tier
   * @returns Complete execution context with plan
   */
  async createExecutionPlan(
    task: ClassifiedTask,
    userTier: 'free' | 'premium' | 'enterprise' = 'free'
  ): Promise<AgentExecutionContext> {
    // Route to appropriate model
    const model = await this.modelRouter.routeToModel(task, userTier);

    // Build context
    const context = await this.contextBuilder.buildContext(task, task.userId, task.workspaceId);

    // Build prompt for planning
    const prompt = await this.promptOrchestrator.buildPrompt(task, context, model);

    // Generate execution plan
    const executionPlan = await this.generatePlan(task, model, context, prompt);

    return {
      task,
      model,
      context,
      prompt,
      executionPlan,
    };
  }

  /**
   * Generate a detailed execution plan using AI
   */
  private async generatePlan(
    task: ClassifiedTask,
    _model: ModelConfig,
    _context: ContextData,
    _prompt: PromptTemplate
  ): Promise<ExecutionPlan> {
    // For now, use rule-based planning
    // Future: Use LLM to generate dynamic plans
    const steps = await this.breakDownTask(task);

    return {
      taskId: task.id,
      steps,
      totalSteps: steps.length,
      completedSteps: 0,
      status: 'planning',
    };
  }

  /**
   * Break down task into executable steps
   * Uses task complexity and keywords to determine steps
   */
  private async breakDownTask(task: ClassifiedTask): Promise<AgentStep[]> {
    const steps: AgentStep[] = [];

    switch (task.complexity) {
      case 'simple':
        steps.push({
          id: 'execute-simple',
          description: `Execute the simple task: ${task.description}`,
          status: 'pending',
        });
        break;

      case 'medium':
        steps.push(
          {
            id: 'analyze-requirements',
            description: 'Analyze task requirements and gather necessary information',
            status: 'pending',
          },
          {
            id: 'execute-medium',
            description: `Execute the medium-complexity task: ${task.description}`,
            dependencies: ['analyze-requirements'],
            status: 'pending',
          }
        );
        break;

      case 'complex':
        steps.push(
          {
            id: 'research-topic',
            description: 'Research and gather comprehensive information',
            status: 'pending',
          },
          {
            id: 'analyze-data',
            description: 'Analyze collected data and identify key insights',
            dependencies: ['research-topic'],
            status: 'pending',
          },
          {
            id: 'structure-output',
            description: 'Structure findings into coherent output',
            dependencies: ['analyze-data'],
            status: 'pending',
          },
          {
            id: 'validate-results',
            description: 'Validate results and ensure quality',
            dependencies: ['structure-output'],
            status: 'pending',
          }
        );
        break;
    }

    return steps;
  }

  /**
   * Future: Dynamic planning with LLM
   * Use AI to generate context-aware execution plans
   */
  // private async generatePlanWithAI(
  //   task: ClassifiedTask,
  //   model: ModelConfig,
  //   context: ContextData,
  //   prompt: PromptTemplate
  // ): Promise<ExecutionPlan> {
  //   // Use LangChain to generate plan with LLM
  // }
}