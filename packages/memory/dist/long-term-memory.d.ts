import { LongTermMemoryEntry, MemoryQuery, MemorySearchResult, VectorSearchOptions } from './types';
/**
 * Long-Term Memory System
 *
 * Manages persistent memory with vector-ready structure
 * Designed for semantic search and pattern recognition
 * Ready for integration with vector databases (Qdrant, Weaviate, etc.)
 */
export declare class LongTermMemory {
    private entries;
    private embeddings;
    /**
     * Store a long-term memory entry
     */
    store(entry: LongTermMemoryEntry): Promise<void>;
    /**
     * Retrieve a specific memory entry
     */
    retrieve(entryId: string): Promise<LongTermMemoryEntry | null>;
    /**
     * Query long-term memory entries
     */
    query(query: MemoryQuery): Promise<MemorySearchResult>;
    /**
     * Semantic search using vector similarity
     */
    semanticSearch(options: VectorSearchOptions): Promise<MemorySearchResult>;
    /**
     * Update an existing memory entry
     */
    update(entryId: string, updates: Partial<LongTermMemoryEntry>): Promise<void>;
    /**
     * Delete a memory entry
     */
    delete(entryId: string): Promise<void>;
    /**
     * Consolidate memories based on patterns and importance
     */
    consolidateMemories(): Promise<void>;
    /**
     * Get memory statistics
     */
    getStats(): Promise<{
        entries: number;
        embeddings: number;
        averageImportance: number;
    }>;
    /**
     * Export memories for backup or migration
     */
    exportMemories(): Promise<LongTermMemoryEntry[]>;
    /**
     * Import memories from backup
     */
    importMemories(memories: LongTermMemoryEntry[]): Promise<void>;
    /**
     * Generate embedding for text (mock implementation)
     * In production, this would use actual embedding models
     */
    private generateEmbedding;
    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity;
    /**
     * Update access metadata for an entry
     */
    private updateAccessMetadata;
    /**
     * Calculate relevance score for sorting
     */
    private calculateRelevanceScore;
    /**
     * Check if entry matches query filters
     */
    private matchesQuery;
    /**
     * Check if entry matches vector search filters
     */
    private matchesVectorFilters;
    /**
     * Find groups of memories that can be consolidated
     */
    private findConsolidationCandidates;
    /**
     * Find entries similar to the given entry
     */
    private findSimilarEntries;
    /**
     * Consolidate a group of similar entries
     */
    private consolidateGroup;
}
//# sourceMappingURL=long-term-memory.d.ts.map