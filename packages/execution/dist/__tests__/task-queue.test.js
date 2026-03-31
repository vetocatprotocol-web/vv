"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_queue_1 = require("../task-queue");
describe('TaskQueue', () => {
    let taskQueue;
    let mockAgentLoop;
    beforeEach(() => {
        mockAgentLoop = {
            executeTask: jest.fn().mockResolvedValue({ result: 'success' }),
        };
        taskQueue = new task_queue_1.TaskQueue({
            concurrency: 2,
            redisUrl: 'redis://localhost:6379',
            queueName: 'test-queue',
        }, mockAgentLoop);
    });
    afterEach(async () => {
        await taskQueue.close();
    });
    it('should add a task successfully', async () => {
        const jobId = await taskQueue.addTask({
            task: 'Test task',
            context: { userId: 'user1', workspaceId: 'ws1' },
        });
        expect(jobId).toBeDefined();
        expect(typeof jobId).toBe('string');
    });
    it('should process a task using agent loop', async () => {
        const jobId = await taskQueue.addTask({
            task: 'Test task',
            context: { userId: 'user1', workspaceId: 'ws1' },
        });
        // Wait a bit for processing
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockAgentLoop.executeTask).toHaveBeenCalledWith(expect.objectContaining({
            id: expect.any(String),
            description: 'Test task',
            userId: 'user1',
            workspaceId: 'ws1',
        }));
    });
});
//# sourceMappingURL=task-queue.test.js.map