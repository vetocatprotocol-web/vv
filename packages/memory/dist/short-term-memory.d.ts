import { ShortTermMemoryEntry, MemoryQuery, MemorySearchResult } from './types';
/**
 * Short-Term Memory System
 *
 * Manages session-based memory with Redis
 * Handles temporary storage of task states, interactions, and context
 * Automatically expires entries based on TTL
 */
export declare class ShortTermMemory {
    private redis;
    private isConnected;
    constructor(redisUrl?: string);
    /**
     * Initialize the Redis connection
     */
    initialize(): Promise<void>;
    /**
     * Store a short-term memory entry
     */
    store(entry: ShortTermMemoryEntry): Promise<void>;
    /**
     * Retrieve a specific memory entry
     */
    retrieve(entryId: string, userId: string): Promise<ShortTermMemoryEntry | null>;
    /**
     * Query short-term memory entries
     */
    query(query: MemoryQuery): Promise<MemorySearchResult>;
    /**
     * Update an existing memory entry
     */
    update(entryId: string, userId: string, updates: Partial<ShortTermMemoryEntry>): Promise<void>;
    /**
     * Delete a memory entry
     */
    delete(entryId: string, userId: string): Promise<void>;
    /**
     * Clear all entries for a session
     */
    clearSession(sessionId: string): Promise<void>;
    /**
     * Get memory statistics
     */
    getStats(userId: string): Promise<{
        entries: number;
        sessions: number;
    }>;
    /**
     * Close the Redis connection
     */
    close(): Promise<void>;
    /**
     * Generate Redis key for entry
     */
    private generateKey;
    /**
     * Check if entry matches query filters
     */
    private matchesQuery;
    /**
     * Scan Redis keys matching pattern
     */
    private scanKeys;
    /**
     * Setup Redis event handlers
     */
    private setupEventHandlers;
}
//# sourceMappingURL=short-term-memory.d.ts.map