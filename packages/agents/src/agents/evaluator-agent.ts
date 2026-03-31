// packages/agents/src/agents/evaluator-agent.ts

import {
  PromptOrchestrator,
  ModelRouter,
  ClassifiedTask,
  ModelConfig,
  ContextData,
  PromptTemplate
} from '@karyo/ai-core';
import { AgentResult } from '../types';

/**
 * Evaluator Agent
 *
 * Validates the quality and correctness of agent outputs
 * Provides feedback and suggestions for improvement
 * Determines if results meet quality standards
 * Can trigger re-execution if quality is insufficient
 */
export class EvaluatorAgent {
  private promptOrchestrator: PromptOrchestrator;
  private modelRouter: ModelRouter;

  constructor(
    promptOrchestrator: PromptOrchestrator,
    modelRouter: ModelRouter
  ) {
    this.promptOrchestrator = promptOrchestrator;
    this.modelRouter = modelRouter;
  }

  /**
   * Evaluate the quality of an agent execution result
   * @param result - The execution result to evaluate
   * @param originalTask - The original task for context
   * @returns Enhanced result with quality assessment
   */
  async evaluateResult(
    result: AgentResult,
    originalTask: ClassifiedTask
  ): Promise<AgentResult> {
    // Quick evaluation for failed executions
    if (!result.success) {
      return {
        ...result,
        quality: 'low',
        feedback: 'Execution failed - unable to evaluate quality',
      };
    }

    // Route to evaluation model (prefer higher quality for evaluation)
    const evalModel = await this.modelRouter.routeToModel(
      { ...originalTask, complexity: 'medium' }, // Use medium for evaluation
      'premium' // Prefer premium for evaluation
    );

    // Build evaluation prompt
    const evalPrompt = await this.buildEvaluationPrompt(result, originalTask, evalModel);

    // Perform quality assessment
    const qualityAssessment = await this.assessQuality(result, evalPrompt);

    return {
      ...result,
      quality: qualityAssessment.quality,
      feedback: qualityAssessment.feedback,
    };
  }

  /**
   * Assess quality using rule-based and AI-powered evaluation
   */
  private async assessQuality(
    result: AgentResult,
    _evalPrompt: PromptTemplate
  ): Promise<{ quality: 'low' | 'medium' | 'high'; feedback: string }> {
    // Rule-based quality checks
    const ruleBasedQuality = this.ruleBasedEvaluation(result);

    // Future: AI-powered evaluation
    // const aiQuality = await this.aiPoweredEvaluation(result, evalPrompt);

    return ruleBasedQuality;
  }

  /**
   * Rule-based quality evaluation
   */
  private ruleBasedEvaluation(result: AgentResult): { quality: 'low' | 'medium' | 'high'; feedback: string } {
    let score = 0;
    const feedback: string[] = [];

    // Success rate
    if (result.success) {
      score += 30;
      feedback.push('Execution completed successfully');
    } else {
      feedback.push('Execution failed');
      return { quality: 'low', feedback: feedback.join('. ') };
    }

    // Step completion
    const completedSteps = result.steps.filter(step => step.status === 'completed').length;
    const totalSteps = result.steps.length;
    const completionRate = completedSteps / totalSteps;

    if (completionRate === 1.0) {
      score += 25;
      feedback.push('All steps completed');
    } else if (completionRate >= 0.8) {
      score += 15;
      feedback.push('Most steps completed');
    } else {
      score += 5;
      feedback.push('Some steps incomplete');
    }

    // Output quality
    if (result.output && typeof result.output === 'object') {
      score += 20;
      feedback.push('Structured output generated');
    } else if (result.output) {
      score += 10;
      feedback.push('Basic output generated');
    }

    // Execution time (reasonable bounds)
    if (result.executionTime < 30000) { // Less than 30 seconds
      score += 15;
      feedback.push('Completed within reasonable time');
    } else if (result.executionTime < 120000) { // Less than 2 minutes
      score += 10;
      feedback.push('Completed in acceptable time');
    } else {
      score += 5;
      feedback.push('Took longer than expected');
    }

    // Token efficiency
    if (result.totalTokens < 1000) {
      score += 10;
      feedback.push('Token usage efficient');
    }

    // Determine final quality
    let quality: 'low' | 'medium' | 'high';
    if (score >= 80) {
      quality = 'high';
    } else if (score >= 50) {
      quality = 'medium';
    } else {
      quality = 'low';
    }

    return {
      quality,
      feedback: `Score: ${score}/100. ${feedback.join('. ')}`,
    };
  }

  /**
   * Build evaluation prompt for AI-powered assessment
   */
  private async buildEvaluationPrompt(
    result: AgentResult,
    originalTask: ClassifiedTask,
    model: ModelConfig
  ): Promise<PromptTemplate> {
    // Create a mock context for evaluation
    const evalContext: ContextData = {
      userContext: {},
      memoryContext: [],
      taskHistory: [],
    };

    // Create evaluation task
    const evalTask: ClassifiedTask = {
      ...originalTask,
      description: `Evaluate the quality of this execution result for the task: "${originalTask.description}"`,
      complexity: 'medium',
    };

    return await this.promptOrchestrator.buildPrompt(evalTask, evalContext, model);
  }

  /**
   * Check if result needs re-execution
   */
  shouldRetry(result: AgentResult): boolean {
    return result.quality === 'low' && result.success === false;
  }

  /**
   * Future: AI-powered evaluation using LLM
   * Use language models to assess output quality and coherence
   */
  // private async aiPoweredEvaluation(
  //   result: AgentResult,
  //   evalPrompt: PromptTemplate
  // ): Promise<{ quality: 'low' | 'medium' | 'high'; feedback: string }> {
  //   // Use LLM to evaluate result quality
  // }
}