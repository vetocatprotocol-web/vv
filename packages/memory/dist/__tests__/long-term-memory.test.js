"use strict";
// packages/memory/src/__tests__/long-term-memory.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const long_term_memory_1 = require("../long-term-memory");
describe('LongTermMemory', () => {
    let ltm;
    beforeEach(() => {
        ltm = new long_term_memory_1.LongTermMemory();
    });
    it('should store and retrieve memory entries', async () => {
        const entry = {
            id: 'test-memory-1',
            userId: 'user-1',
            workspaceId: 'ws-1',
            type: 'context',
            content: 'This is a test memory entry',
            metadata: { test: true },
            timestamp: new Date(),
            tags: ['test', 'memory'],
            importance: 0.8,
            accessCount: 0,
            lastAccessed: new Date(),
            consolidationCount: 0,
        };
        await ltm.store(entry);
        const retrieved = await ltm.retrieve('test-memory-1');
        expect(retrieved).toBeDefined();
        expect(retrieved?.content).toBe('This is a test memory entry');
        expect(retrieved?.importance).toBe(0.8);
    });
    it('should perform semantic search', async () => {
        // Store some test entries
        const entries = [
            {
                id: 'memory-1',
                userId: 'user-1',
                workspaceId: 'ws-1',
                type: 'context',
                content: 'The user prefers detailed reports with charts',
                metadata: {},
                timestamp: new Date(),
                tags: ['preference', 'reports'],
                importance: 0.9,
                accessCount: 0,
                lastAccessed: new Date(),
                consolidationCount: 0,
            },
            {
                id: 'memory-2',
                userId: 'user-1',
                workspaceId: 'ws-1',
                type: 'pattern',
                content: 'User frequently analyzes sales data',
                metadata: {},
                timestamp: new Date(),
                tags: ['pattern', 'analysis'],
                importance: 0.7,
                accessCount: 0,
                lastAccessed: new Date(),
                consolidationCount: 0,
            },
        ];
        for (const entry of entries) {
            await ltm.store(entry);
        }
        const results = await ltm.semanticSearch({
            query: 'user preferences for reports',
            topK: 5,
            threshold: 0.1,
        });
        expect(results.entries.length).toBeGreaterThan(0);
        expect(results.totalCount).toBeGreaterThan(0);
    });
    it('should query memories with filters', async () => {
        const entry = {
            id: 'query-test',
            userId: 'user-1',
            workspaceId: 'ws-1',
            type: 'pattern',
            content: 'Test pattern memory',
            metadata: { category: 'test' },
            timestamp: new Date(),
            tags: ['test', 'pattern'],
            importance: 0.6,
            accessCount: 0,
            lastAccessed: new Date(),
            consolidationCount: 0,
        };
        await ltm.store(entry);
        const results = await ltm.query({
            userId: 'user-1',
            type: 'pattern',
            tags: ['test'],
        });
        expect(results.entries.length).toBe(1);
        expect(results.entries[0].id).toBe('query-test');
    });
});
//# sourceMappingURL=long-term-memory.test.js.map