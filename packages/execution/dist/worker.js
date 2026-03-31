"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionWorker = void 0;
const task_queue_1 = require("./task-queue");
const event_bus_1 = require("./event-bus");
class ExecutionWorker {
    constructor(workerConfig, eventBusConfig, agentLoop, memoryInjector, dataAnalystProcessor) {
        this.agentLoop = agentLoop;
        this.memoryInjector = memoryInjector;
        this.dataAnalystProcessor = dataAnalystProcessor;
        this.taskQueue = new task_queue_1.TaskQueue(workerConfig, agentLoop);
        this.eventBus = new event_bus_1.EventBus(eventBusConfig);
        this.setupEventHandlers();
    }
    async start() {
        console.log('Starting KARYO Execution Worker...');
        // Subscribe to relevant events
        await this.eventBus.subscribe('task:queued', this.handleTaskQueued.bind(this));
        await this.eventBus.subscribe('task:completed', this.handleTaskCompleted.bind(this));
        await this.eventBus.subscribe('task:failed', this.handleTaskFailed.bind(this));
        // Worker is already started in TaskQueue constructor
        console.log('Execution Worker started successfully');
    }
    async stop() {
        console.log('Stopping KARYO Execution Worker...');
        await this.taskQueue.close();
        await this.eventBus.close();
        console.log('Execution Worker stopped');
    }
    async queueTask(task, context, priority) {
        const enrichedContext = await this.memoryInjector.buildEnrichedContext(context || {});
        const jobId = await this.taskQueue.addTask({
            task,
            context: enrichedContext,
            priority: priority,
        });
        // Publish event
        await this.eventBus.publish('task:queued', {
            jobId,
            task,
            context: enrichedContext,
            priority,
        });
        return jobId;
    }
    async getTaskStatus(jobId) {
        return await this.taskQueue.getTaskStatus(jobId);
    }
    async handleTaskQueued(message) {
        console.log(`Task queued: ${message.payload.jobId}`);
        // Could add additional processing here, like logging to memory
    }
    async handleTaskCompleted(message) {
        console.log(`Task completed: ${message.payload.jobId}`);
        // Store successful execution in memory for learning
        if (message.payload.result) {
            await this.memoryInjector.storeExecutionResult(message.payload.task, message.payload.result, true);
        }
    }
    async handleTaskFailed(message) {
        console.error(`Task failed: ${message.payload.jobId} - ${message.payload.error}`);
        // Store failed execution for analysis
        await this.memoryInjector.storeExecutionResult(message.payload.task, { error: message.payload.error }, false);
    }
    setupEventHandlers() {
        // Additional event handlers can be set up here
    }
}
exports.ExecutionWorker = ExecutionWorker;
//# sourceMappingURL=worker.js.map