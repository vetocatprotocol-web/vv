import { PromptOrchestrator, ModelRouter, ClassifiedTask } from '@karyo/ai-core';
import { AgentResult } from '../types';
/**
 * Evaluator Agent
 *
 * Validates the quality and correctness of agent outputs
 * Provides feedback and suggestions for improvement
 * Determines if results meet quality standards
 * Can trigger re-execution if quality is insufficient
 */
export declare class EvaluatorAgent {
    private promptOrchestrator;
    private modelRouter;
    constructor(promptOrchestrator: PromptOrchestrator, modelRouter: ModelRouter);
    /**
     * Evaluate the quality of an agent execution result
     * @param result - The execution result to evaluate
     * @param originalTask - The original task for context
     * @returns Enhanced result with quality assessment
     */
    evaluateResult(result: AgentResult, originalTask: ClassifiedTask): Promise<AgentResult>;
    /**
     * Assess quality using rule-based and AI-powered evaluation
     */
    private assessQuality;
    /**
     * Rule-based quality evaluation
     */
    private ruleBasedEvaluation;
    /**
     * Build evaluation prompt for AI-powered assessment
     */
    private buildEvaluationPrompt;
    /**
     * Check if result needs re-execution
     */
    shouldRetry(result: AgentResult): boolean;
}
//# sourceMappingURL=evaluator-agent.d.ts.map