import { Task, ClassifiedTask } from './types';
/**
 * Task Classifier Module
 *
 * Classifies tasks into complexity levels: simple, medium, complex
 * Uses rule-based classification with extensibility for LLM-based classification
 *
 * Future: Integrate with OpenRouter for dynamic classification
 */
export declare class TaskClassifier {
    private readonly complexityRules;
    /**
     * Classify a task based on description and metadata
     * @param task - The task to classify
     * @returns ClassifiedTask with complexity and metadata
     */
    classifyTask(task: Task): Promise<ClassifiedTask>;
    /**
     * Extract relevant keywords from task description
     */
    private extractKeywords;
    /**
     * Check if description contains any of the given keywords
     */
    private hasKeywords;
}
//# sourceMappingURL=task-classifier.d.ts.map