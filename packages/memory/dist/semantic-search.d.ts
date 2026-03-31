import { ShortTermMemory } from './short-term-memory';
import { LongTermMemory } from './long-term-memory';
import { MemoryQuery, MemorySearchResult } from './types';
/**
 * Semantic Search Engine
 *
 * Provides unified semantic search across short-term and long-term memory
 * Combines keyword-based and vector-based search capabilities
 * Supports hybrid search strategies for optimal results
 */
export declare class SemanticSearch {
    private shortTermMemory;
    private longTermMemory;
    constructor(shortTermMemory: ShortTermMemory, longTermMemory: LongTermMemory);
    /**
     * Perform semantic search across all memory types
     * @param query - Search query with semantic content
     * @param options - Search options
     * @returns Combined search results
     */
    search(query: MemoryQuery & {
        semanticQuery?: string;
    }, options?: {
        includeShortTerm?: boolean;
        includeLongTerm?: boolean;
        combineResults?: boolean;
        maxResults?: number;
    }): Promise<MemorySearchResult>;
    /**
     * Search for similar content using vector similarity
     * @param content - Content to find similarities for
     * @param options - Search options
     * @returns Similar entries
     */
    findSimilar(content: string, options: {
        userId: string;
        workspaceId?: string;
        type?: string;
        topK?: number;
        threshold?: number;
    }): Promise<MemorySearchResult>;
    /**
     * Search for contextual information related to a task
     * @param taskDescription - Task description
     * @param userId - User ID
     * @param workspaceId - Workspace ID
     * @returns Contextually relevant memories
     */
    findContext(taskDescription: string, userId: string, workspaceId: string): Promise<MemorySearchResult>;
    /**
     * Search for user behavior patterns
     * @param userId - User ID
     * @param behaviorType - Type of behavior to search for
     * @returns Pattern memories
     */
    findPatterns(userId: string, behaviorType?: string): Promise<MemorySearchResult>;
    /**
     * Hybrid search combining keyword and semantic search
     * @param query - Search query
     * @param options - Search options
     * @returns Hybrid search results
     */
    hybridSearch(query: {
        keywords?: string[];
        semanticQuery?: string;
        userId: string;
        workspaceId?: string;
        type?: string;
    }, options?: {
        topK?: number;
    }): Promise<MemorySearchResult>;
    /**
     * Get search suggestions based on partial queries
     * @param partialQuery - Partial search query
     * @param userId - User ID
     * @returns Search suggestions
     */
    getSuggestions(partialQuery: string, userId: string): Promise<string[]>;
    /**
     * Keyword-based search
     */
    private keywordSearch;
    /**
     * Pure semantic search
     */
    private semanticSearch;
    /**
     * Combine search results from multiple sources
     */
    private combineSearchResults;
    /**
     * Remove duplicate entries based on ID
     */
    private deduplicateEntries;
    /**
     * Hybrid reranking combining keyword and semantic scores
     */
    private hybridRerank;
    /**
     * Calculate keyword matching score
     */
    private calculateKeywordScore;
    /**
     * Extract meaningful phrases from content
     */
    private extractPhrases;
}
//# sourceMappingURL=semantic-search.d.ts.map