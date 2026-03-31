// packages/ai-core/src/task-classifier.ts

import { Task, ClassifiedTask, TaskComplexity } from './types';

/**
 * Task Classifier Module
 *
 * Classifies tasks into complexity levels: simple, medium, complex
 * Uses rule-based classification with extensibility for LLM-based classification
 *
 * Future: Integrate with OpenRouter for dynamic classification
 */
export class TaskClassifier {
  private readonly complexityRules = {
    simple: {
      maxLength: 100,
      keywords: ['hello', 'hi', 'thanks', 'simple', 'basic'],
      estimatedTokens: 50,
    },
    medium: {
      maxLength: 500,
      keywords: ['analyze', 'summarize', 'create', 'write', 'process'],
      estimatedTokens: 200,
    },
    complex: {
      maxLength: Infinity,
      keywords: ['research', 'design', 'optimize', 'strategize', 'comprehensive'],
      estimatedTokens: 1000,
    },
  };

  /**
   * Classify a task based on description and metadata
   * @param task - The task to classify
   * @returns ClassifiedTask with complexity and metadata
   */
  async classifyTask(task: Task): Promise<ClassifiedTask> {
    const description = task.description.toLowerCase();
    const length = description.length;

    // Extract keywords
    const keywords = this.extractKeywords(description);

    // Determine complexity
    let complexity: TaskComplexity = 'simple';
    let estimatedTokens = this.complexityRules.simple.estimatedTokens;

    if (length > this.complexityRules.medium.maxLength ||
        this.hasKeywords(description, this.complexityRules.medium.keywords)) {
      complexity = 'medium';
      estimatedTokens = this.complexityRules.medium.estimatedTokens;
    }

    if (length > this.complexityRules.complex.maxLength ||
        this.hasKeywords(description, this.complexityRules.complex.keywords)) {
      complexity = 'complex';
      estimatedTokens = this.complexityRules.complex.estimatedTokens;
    }

    // Future: Use LLM for more accurate classification
    // const llmClassification = await this.llmClassify(task);

    return {
      ...task,
      complexity,
      estimatedTokens,
      keywords,
    };
  }

  /**
   * Extract relevant keywords from task description
   */
  private extractKeywords(description: string): string[] {
    const allKeywords = [
      ...this.complexityRules.simple.keywords,
      ...this.complexityRules.medium.keywords,
      ...this.complexityRules.complex.keywords,
    ];

    return allKeywords.filter(keyword => description.includes(keyword));
  }

  /**
   * Check if description contains any of the given keywords
   */
  private hasKeywords(description: string, keywords: string[]): boolean {
    return keywords.some(keyword => description.includes(keyword));
  }

  /**
   * Future method for LLM-based classification
   * To be implemented with OpenRouter integration
   */
  // private async llmClassify(task: Task): Promise<TaskComplexity> {
  //   // Use OpenRouter to classify task
  //   return 'medium';
  // }
}