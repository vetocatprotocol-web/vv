"use strict";
// packages/memory/src/short-term-memory.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortTermMemory = void 0;
const redis_1 = require("redis");
/**
 * Short-Term Memory System
 *
 * Manages session-based memory with Redis
 * Handles temporary storage of task states, interactions, and context
 * Automatically expires entries based on TTL
 */
class ShortTermMemory {
    constructor(redisUrl = 'redis://localhost:6379') {
        this.isConnected = false;
        this.redis = (0, redis_1.createClient)({ url: redisUrl });
        this.setupEventHandlers();
    }
    /**
     * Initialize the Redis connection
     */
    async initialize() {
        if (!this.isConnected) {
            await this.redis.connect();
            this.isConnected = true;
        }
    }
    /**
     * Store a short-term memory entry
     */
    async store(entry) {
        await this.initialize();
        const key = this.generateKey(entry);
        const data = JSON.stringify({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
            expiresAt: entry.expiresAt?.toISOString(),
        });
        // Store with TTL
        await this.redis.setEx(key, entry.ttl, data);
        // Also store in session index for efficient querying
        const sessionKey = `session:${entry.sessionId}:entries`;
        await this.redis.sAdd(sessionKey, key);
        await this.redis.expire(sessionKey, entry.ttl);
    }
    /**
     * Retrieve a specific memory entry
     */
    async retrieve(entryId, userId) {
        await this.initialize();
        const key = `stm:${userId}:${entryId}`;
        const data = await this.redis.get(key);
        if (!data)
            return null;
        const parsed = JSON.parse(data);
        return {
            ...parsed,
            timestamp: new Date(parsed.timestamp),
            expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
        };
    }
    /**
     * Query short-term memory entries
     */
    async query(query) {
        await this.initialize();
        const startTime = Date.now();
        const results = [];
        // If sessionId is provided, query session index
        if (query.tags?.includes('session')) {
            const sessionTag = query.tags.find(tag => tag.startsWith('session:'));
            if (sessionTag) {
                const sessionId = sessionTag.replace('session:', '');
                const sessionKey = `session:${sessionId}:entries`;
                const entryKeys = await this.redis.sMembers(sessionKey);
                for (const key of entryKeys) {
                    const data = await this.redis.get(key);
                    if (data) {
                        const parsed = JSON.parse(data);
                        const entry = {
                            ...parsed,
                            timestamp: new Date(parsed.timestamp),
                            expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
                        };
                        // Apply filters
                        if (this.matchesQuery(entry, query)) {
                            results.push(entry);
                        }
                    }
                }
            }
        }
        else {
            // Fallback: scan for keys (less efficient)
            const pattern = `stm:${query.userId}:*`;
            const keys = await this.scanKeys(pattern);
            for (const key of keys) {
                const data = await this.redis.get(key);
                if (data) {
                    const parsed = JSON.parse(data);
                    const entry = {
                        ...parsed,
                        timestamp: new Date(parsed.timestamp),
                        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
                    };
                    if (this.matchesQuery(entry, query)) {
                        results.push(entry);
                    }
                }
            }
        }
        // Sort by timestamp (newest first) and apply limit
        results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const limitedResults = query.limit ? results.slice(0, query.limit) : results;
        return {
            entries: limitedResults,
            totalCount: results.length,
            searchTime: Date.now() - startTime,
        };
    }
    /**
     * Update an existing memory entry
     */
    async update(entryId, userId, updates) {
        await this.initialize();
        const existing = await this.retrieve(entryId, userId);
        if (!existing) {
            throw new Error(`Memory entry ${entryId} not found`);
        }
        const updated = { ...existing, ...updates };
        await this.store(updated);
    }
    /**
     * Delete a memory entry
     */
    async delete(entryId, userId) {
        await this.initialize();
        const key = `stm:${userId}:${entryId}`;
        await this.redis.del(key);
    }
    /**
     * Clear all entries for a session
     */
    async clearSession(sessionId) {
        await this.initialize();
        const sessionKey = `session:${sessionId}:entries`;
        const entryKeys = await this.redis.sMembers(sessionKey);
        if (entryKeys.length > 0) {
            await this.redis.del([...entryKeys, sessionKey]);
        }
    }
    /**
     * Get memory statistics
     */
    async getStats(userId) {
        await this.initialize();
        const pattern = `stm:${userId}:*`;
        const keys = await this.scanKeys(pattern);
        // Count unique sessions
        const sessions = new Set();
        for (const key of keys) {
            const data = await this.redis.get(key);
            if (data) {
                const parsed = JSON.parse(data);
                sessions.add(parsed.sessionId);
            }
        }
        return {
            entries: keys.length,
            sessions: sessions.size,
        };
    }
    /**
     * Close the Redis connection
     */
    async close() {
        if (this.isConnected) {
            await this.redis.disconnect();
            this.isConnected = false;
        }
    }
    /**
     * Generate Redis key for entry
     */
    generateKey(entry) {
        return `stm:${entry.userId}:${entry.id}`;
    }
    /**
     * Check if entry matches query filters
     */
    matchesQuery(entry, query) {
        if (query.workspaceId && entry.workspaceId !== query.workspaceId)
            return false;
        if (query.type && entry.type !== query.type)
            return false;
        if (query.tags && !query.tags.every(tag => entry.tags.includes(tag)))
            return false;
        if (query.since && entry.timestamp < query.since)
            return false;
        if (query.until && entry.timestamp > query.until)
            return false;
        return true;
    }
    /**
     * Scan Redis keys matching pattern
     */
    async scanKeys(pattern) {
        const keys = [];
        let cursor = 0;
        do {
            const result = await this.redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = result.cursor;
            keys.push(...result.keys);
        } while (cursor !== 0);
        return keys;
    }
    /**
     * Setup Redis event handlers
     */
    setupEventHandlers() {
        this.redis.on('error', (err) => {
            console.error('Redis ShortTermMemory error:', err);
        });
        this.redis.on('connect', () => {
            console.log('ShortTermMemory connected to Redis');
        });
        this.redis.on('disconnect', () => {
            console.log('ShortTermMemory disconnected from Redis');
            this.isConnected = false;
        });
    }
}
exports.ShortTermMemory = ShortTermMemory;
//# sourceMappingURL=short-term-memory.js.map