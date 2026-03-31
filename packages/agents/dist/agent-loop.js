"use strict";
// packages/agents/src/agent-loop.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
const planner_agent_1 = require("./agents/planner-agent");
const executor_agent_1 = require("./agents/executor-agent");
const evaluator_agent_1 = require("./agents/evaluator-agent");
/**
 * Agent Loop Engine
 *
 * Orchestrates the complete agent execution cycle:
 * 1. Plan → 2. Execute → 3. Evaluate → 4. Repeat (if needed)
 *
 * Supports multi-agent expansion and failure handling
 * Integrates with AI Core for intelligent task processing
 */
class AgentLoop {
    constructor(taskClassifier, modelRouter, contextBuilder, promptOrchestrator) {
        this.maxIterations = 3;
        this.tools = [];
        this.taskClassifier = taskClassifier;
        this.modelRouter = modelRouter;
        this.contextBuilder = contextBuilder;
        this.promptOrchestrator = promptOrchestrator;
        // Initialize agents
        this.planner = new planner_agent_1.PlannerAgent(taskClassifier, modelRouter, contextBuilder, promptOrchestrator);
        this.executor = new executor_agent_1.ExecutorAgent();
        this.evaluator = new evaluator_agent_1.EvaluatorAgent(promptOrchestrator, modelRouter);
        // Register default tools
        this.registerDefaultTools();
    }
    /**
     * Execute a task through the complete agent loop
     * @param task - The task to execute
     * @param userTier - User's subscription tier
     * @returns Final execution result
     */
    async executeTask(task, userTier = 'free') {
        // Classify task first
        const classifiedTask = await this.taskClassifier.classifyTask(task);
        let finalResult = null;
        let iteration = 0;
        while (iteration < this.maxIterations) {
            try {
                // Phase 1: Planning
                const executionContext = await this.planner.createExecutionPlan(classifiedTask, userTier);
                // Phase 2: Execution
                const executionResult = await this.executor.executePlan(executionContext);
                // Phase 3: Evaluation
                finalResult = await this.evaluator.evaluateResult(executionResult, classifiedTask);
                // Check if we need to retry
                if (!this.evaluator.shouldRetry(finalResult)) {
                    break; // Success or acceptable quality
                }
                iteration++;
                console.log(`Iteration ${iteration}: Quality insufficient, retrying...`);
            }
            catch (error) {
                console.error(`Iteration ${iteration} failed:`, error);
                iteration++;
                if (iteration >= this.maxIterations) {
                    return {
                        success: false,
                        output: null,
                        steps: [],
                        totalTokens: 0,
                        executionTime: 0,
                        quality: 'low',
                        feedback: error instanceof Error ? error.message : 'Unknown error in agent loop',
                    };
                }
            }
        }
        return finalResult || {
            success: false,
            output: null,
            steps: [],
            totalTokens: 0,
            executionTime: 0,
            quality: 'low',
            feedback: 'Maximum iterations reached without success',
        };
    }
    /**
     * Register a tool for use by the executor agent
     */
    registerTool(tool) {
        this.executor.registerTool(tool);
        this.tools.push(tool);
    }
    /**
     * Get available tools
     */
    getAvailableTools() {
        return this.tools;
    }
    /**
     * Configure loop parameters
     */
    configure(options) {
        if (options.maxIterations) {
            this.maxIterations = options.maxIterations;
        }
    }
    /**
     * Register default built-in tools
     */
    registerDefaultTools() {
        // Text processing tool
        this.registerTool({
            name: 'text_processor',
            description: 'Process and analyze text content',
            execute: async (parameters) => {
                const { text, operation } = parameters;
                switch (operation) {
                    case 'summarize':
                        return { summary: text.substring(0, 100) + '...' };
                    case 'analyze':
                        return {
                            wordCount: text.split(' ').length,
                            charCount: text.length,
                            sentiment: 'neutral' // Simplified
                        };
                    default:
                        return { processed: text };
                }
            },
            validateParameters: (parameters) => {
                return typeof parameters.text === 'string' && parameters.text.length > 0;
            },
        });
        // Data analysis tool
        this.registerTool({
            name: 'data_analyzer',
            description: 'Analyze structured data',
            execute: async (parameters) => {
                const { data, operation } = parameters;
                switch (operation) {
                    case 'count':
                        return { count: data.length };
                    case 'average':
                        if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
                            const sum = data.reduce((a, b) => a + b, 0);
                            return { average: sum / data.length };
                        }
                        throw new Error('Data must be array of numbers for average');
                    default:
                        return { result: data };
                }
            },
            validateParameters: (params) => {
                return Array.isArray(params.data);
            },
        });
        // Web search tool (mock)
        this.registerTool({
            name: 'web_search',
            description: 'Search the web for information',
            execute: async (parameters) => {
                const { query } = parameters;
                // Mock implementation - in real system, integrate with search APIs
                return {
                    results: [
                        { title: `Result for ${query}`, url: 'https://example.com', snippet: 'Mock result' }
                    ]
                };
            },
            validateParameters: (params) => {
                return typeof params.query === 'string' && params.query.length > 3;
            },
        });
    }
}
exports.AgentLoop = AgentLoop;
//# sourceMappingURL=agent-loop.js.map