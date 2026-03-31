export interface MemoryEntry {
    id: string;
    userId: string;
    workspaceId: string;
    type: 'task' | 'interaction' | 'context' | 'pattern';
    content: string;
    metadata: Record<string, any>;
    timestamp: Date;
    expiresAt?: Date;
    embedding?: number[];
    tags: string[];
}
export interface ShortTermMemoryEntry extends MemoryEntry {
    type: 'task' | 'interaction';
    sessionId: string;
    ttl: number;
}
export interface LongTermMemoryEntry extends MemoryEntry {
    type: 'context' | 'pattern';
    importance: number;
    accessCount: number;
    lastAccessed: Date;
    consolidationCount: number;
}
export interface MemoryQuery {
    userId: string;
    workspaceId?: string;
    type?: MemoryEntry['type'];
    tags?: string[];
    content?: string;
    limit?: number;
    since?: Date;
    until?: Date;
}
export interface MemorySearchResult {
    entries: MemoryEntry[];
    totalCount: number;
    searchTime: number;
    relevanceScores?: number[];
}
export interface VectorSearchOptions {
    query: string;
    topK: number;
    threshold?: number;
    filters?: Record<string, any>;
}
export interface MemoryConsolidationRule {
    name: string;
    condition: (entries: MemoryEntry[]) => boolean;
    consolidate: (entries: MemoryEntry[]) => MemoryEntry[];
    priority: number;
}
export interface MemoryStats {
    shortTermEntries: number;
    longTermEntries: number;
    totalEmbeddings: number;
    averageAccessTime: number;
    consolidationEvents: number;
    storageUsed: number;
}
export type MemoryProvider = 'redis' | 'vector-db' | 'hybrid';
export interface MemoryConfig {
    provider: MemoryProvider;
    redisUrl?: string;
    vectorDbUrl?: string;
    defaultTTL: number;
    maxEmbeddings: number;
    consolidationInterval: number;
}
//# sourceMappingURL=types.d.ts.map