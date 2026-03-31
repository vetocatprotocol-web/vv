// packages/agents/src/agents/executor-agent.ts

import { AgentExecutionContext, AgentStep, Tool, AgentResult } from '../types';

/**
 * Executor Agent
 *
 * Executes individual steps in an execution plan
 * Uses tools to perform actual work
 * Handles retries and error recovery
 * Supports parallel execution of independent steps
 */
export class ExecutorAgent {
  private tools: Map<string, Tool> = new Map();
  private maxRetries: number = 3;

  /**
   * Register a tool for execution
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute an entire execution plan
   * @param context - The execution context with plan
   * @returns Complete execution result
   */
  async executePlan(context: AgentExecutionContext): Promise<AgentResult> {
    const startTime = Date.now();
    let totalTokens = 0;

    try {
      // Execute steps in dependency order
      const executedSteps = await this.executeStepsInOrder(context.executionPlan.steps);

      // Calculate total tokens (simplified)
      totalTokens = context.task.estimatedTokens;

      // Evaluate final result
      const finalOutput = this.aggregateStepOutputs(executedSteps);
      const quality = this.evaluateQuality(executedSteps);

      return {
        success: true,
        output: finalOutput,
        steps: executedSteps,
        totalTokens,
        executionTime: Date.now() - startTime,
        quality,
      };
    } catch (error) {
      return {
        success: false,
        output: null,
        steps: context.executionPlan.steps,
        totalTokens,
        executionTime: Date.now() - startTime,
        quality: 'low',
        feedback: error instanceof Error ? error.message : 'Unknown execution error',
      };
    }
  }

  /**
   * Execute steps respecting dependencies
   */
  private async executeStepsInOrder(steps: AgentStep[]): Promise<AgentStep[]> {
    const executed = new Set<string>();
    const results: AgentStep[] = [];

    while (executed.size < steps.length) {
      // Find steps that can be executed (no pending dependencies)
      const readySteps = steps.filter(step =>
        !executed.has(step.id) &&
        (!step.dependencies || step.dependencies.every(dep => executed.has(dep)))
      );

      if (readySteps.length === 0) {
        throw new Error('Circular dependency detected or no executable steps');
      }

      // Execute ready steps in parallel
      const executionPromises = readySteps.map(step => this.executeStep(step));
      const executedResults = await Promise.all(executionPromises);

      // Mark as executed and collect results
      executedResults.forEach(result => {
        executed.add(result.id);
        results.push(result);
      });
    }

    return results;
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStep(step: AgentStep): Promise<AgentStep> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        step.status = 'running';
        step.retryCount = attempt;

        const result = await this.executeStepWithTool(step);

        step.status = 'completed';
        step.output = result;
        return step;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        step.error = lastError.message;

        if (attempt === this.maxRetries) {
          step.status = 'failed';
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw lastError;
  }

  /**
   * Execute step using the appropriate tool
   */
  private async executeStepWithTool(step: AgentStep): Promise<any> {
    if (!step.tool) {
      // No tool needed, return step description as output
      return { message: step.description };
    }

    const tool = this.tools.get(step.tool);
    if (!tool) {
      throw new Error(`Tool '${step.tool}' not found`);
    }

    // Validate parameters if validator exists
    if (tool.validateParameters && !tool.validateParameters(step.parameters || {})) {
      throw new Error(`Invalid parameters for tool '${step.tool}'`);
    }

    // Execute the tool
    return await tool.execute(step.parameters || {});
  }

  /**
   * Aggregate outputs from all executed steps
   */
  private aggregateStepOutputs(steps: AgentStep[]): any {
    const successfulSteps = steps.filter(step => step.status === 'completed');

    if (successfulSteps.length === 0) {
      return null;
    }

    // Simple aggregation - combine all outputs
    const outputs = successfulSteps.map(step => step.output);
    return {
      steps: successfulSteps.length,
      results: outputs,
      summary: `Completed ${successfulSteps.length} steps successfully`,
    };
  }

  /**
   * Evaluate the quality of execution
   */
  private evaluateQuality(steps: AgentStep[]): 'low' | 'medium' | 'high' {
    const totalSteps = steps.length;
    const successfulSteps = steps.filter(step => step.status === 'completed').length;
    const successRate = successfulSteps / totalSteps;

    if (successRate === 1.0) return 'high';
    if (successRate >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Future: Advanced execution with LangChain
   * Use LangChain agents for tool calling and orchestration
   */
  // async executeWithLangChain(context: AgentExecutionContext): Promise<AgentResult> {
  //   // Implementation with LangChain agents
  // }
}