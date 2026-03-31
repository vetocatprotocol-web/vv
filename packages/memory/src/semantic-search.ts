// packages/memory/src/semantic-search.ts

import { ShortTermMemory } from './short-term-memory';
import { LongTermMemory } from './long-term-memory';
import { MemoryQuery, MemorySearchResult, VectorSearchOptions } from './types';

/**
 * Semantic Search Engine
 *
 * Provides unified semantic search across short-term and long-term memory
 * Combines keyword-based and vector-based search capabilities
 * Supports hybrid search strategies for optimal results
 */
export class SemanticSearch {
  constructor(
    private shortTermMemory: ShortTermMemory,
    private longTermMemory: LongTermMemory
  ) {}

  /**
   * Perform semantic search across all memory types
   * @param query - Search query with semantic content
   * @param options - Search options
   * @returns Combined search results
   */
  async search(
    query: MemoryQuery & { semanticQuery?: string },
    options: {
      includeShortTerm?: boolean;
      includeLongTerm?: boolean;
      combineResults?: boolean;
      maxResults?: number;
    } = {}
  ): Promise<MemorySearchResult> {
    const startTime = Date.now();
    const {
      includeShortTerm = true,
      includeLongTerm = true,
      combineResults = true,
      maxResults = 20,
    } = options;

    const searchPromises: Promise<MemorySearchResult>[] = [];

    // Search short-term memory
    if (includeShortTerm) {
      const stmQuery = { ...query };
      if (query.semanticQuery) {
        // For short-term, we can only do keyword matching
        stmQuery.content = query.semanticQuery;
      }
      searchPromises.push(this.shortTermMemory.query(stmQuery));
    }

    // Search long-term memory
    if (includeLongTerm) {
      if (query.semanticQuery) {
        // Use vector search for long-term memory
        const vectorOptions: VectorSearchOptions = {
          query: query.semanticQuery,
          topK: maxResults,
          filters: {
            userId: query.userId,
            workspaceId: query.workspaceId,
            type: query.type,
          },
        };
        searchPromises.push(this.longTermMemory.semanticSearch(vectorOptions));
      } else {
        // Use regular query for long-term memory
        searchPromises.push(this.longTermMemory.query(query));
      }
    }

    const results = await Promise.all(searchPromises);

    if (!combineResults || results.length === 1) {
      return results[0] || { entries: [], totalCount: 0, searchTime: Date.now() - startTime };
    }

    // Combine and rank results
    return this.combineSearchResults(results, maxResults, startTime);
  }

  /**
   * Search for similar content using vector similarity
   * @param content - Content to find similarities for
   * @param options - Search options
   * @returns Similar entries
   */
  async findSimilar(
    content: string,
    options: {
      userId: string;
      workspaceId?: string;
      type?: string;
      topK?: number;
      threshold?: number;
    }
  ): Promise<MemorySearchResult> {
    const vectorOptions: VectorSearchOptions = {
      query: content,
      topK: options.topK || 10,
      threshold: options.threshold || 0.1,
      filters: {
        userId: options.userId,
        workspaceId: options.workspaceId,
        type: options.type,
      },
    };

    return this.longTermMemory.semanticSearch(vectorOptions);
  }

  /**
   * Search for contextual information related to a task
   * @param taskDescription - Task description
   * @param userId - User ID
   * @param workspaceId - Workspace ID
   * @returns Contextually relevant memories
   */
  async findContext(
    taskDescription: string,
    userId: string,
    workspaceId: string
  ): Promise<MemorySearchResult> {
    // Search for related task history and patterns
    const contextQuery = {
      userId,
      workspaceId,
      semanticQuery: taskDescription,
      type: 'task' as const,
      limit: 5,
    };

    const taskResults = await this.search(contextQuery, {
      includeShortTerm: true,
      includeLongTerm: true,
    });

    // Also search for general patterns and context
    const patternQuery = {
      userId,
      workspaceId,
      semanticQuery: taskDescription,
      type: 'pattern' as const,
      limit: 3,
    };

    const patternResults = await this.search(patternQuery, {
      includeShortTerm: false,
      includeLongTerm: true,
    });

    // Combine results
    const allEntries = [...taskResults.entries, ...patternResults.entries];
    const uniqueEntries = this.deduplicateEntries(allEntries);

    return {
      entries: uniqueEntries.slice(0, 8), // Limit total context
      totalCount: uniqueEntries.length,
      searchTime: taskResults.searchTime + patternResults.searchTime,
    };
  }

  /**
   * Search for user behavior patterns
   * @param userId - User ID
   * @param behaviorType - Type of behavior to search for
   * @returns Pattern memories
   */
  async findPatterns(
    userId: string,
    behaviorType?: string
  ): Promise<MemorySearchResult> {
    const query: MemoryQuery = {
      userId,
      type: 'pattern',
      tags: behaviorType ? [behaviorType] : undefined,
      limit: 10,
    };

    return this.longTermMemory.query(query);
  }

  /**
   * Hybrid search combining keyword and semantic search
   * @param query - Search query
   * @param options - Search options
   * @returns Hybrid search results
   */
  async hybridSearch(
    query: {
      keywords?: string[];
      semanticQuery?: string;
      userId: string;
      workspaceId?: string;
      type?: string;
    },
    options: { topK?: number } = {}
  ): Promise<MemorySearchResult> {
    const { topK = 10 } = options;
    const startTime = Date.now();

    // Perform both keyword and semantic search
    const keywordResults = await this.keywordSearch(query);
    const semanticResults = query.semanticQuery
      ? await this.semanticSearch({
          semanticQuery: query.semanticQuery,
          userId: query.userId,
          workspaceId: query.workspaceId,
          type: query.type,
        })
      : { entries: [], totalCount: 0, searchTime: 0 };

    // Combine and rerank results
    const combinedEntries = this.hybridRerank(
      keywordResults.entries,
      semanticResults.entries,
      query.keywords || []
    );

    return {
      entries: combinedEntries.slice(0, topK),
      totalCount: combinedEntries.length,
      searchTime: Date.now() - startTime,
    };
  }

  /**
   * Get search suggestions based on partial queries
   * @param partialQuery - Partial search query
   * @param userId - User ID
   * @returns Search suggestions
   */
  async getSuggestions(partialQuery: string, userId: string): Promise<string[]> {
    // Search for similar past queries or content
    const similarResults = await this.findSimilar(partialQuery, {
      userId,
      topK: 5,
      threshold: 0.3,
    });

    // Extract keywords and phrases from results
    const suggestions: string[] = [];
    const keywordSet = new Set<string>();

    for (const entry of similarResults.entries) {
      // Extract meaningful phrases from content
      const phrases = this.extractPhrases(entry.content);
      phrases.forEach(phrase => {
        if (phrase.toLowerCase().includes(partialQuery.toLowerCase()) &&
            !keywordSet.has(phrase)) {
          keywordSet.add(phrase);
          suggestions.push(phrase);
        }
      });
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Keyword-based search
   */
  private async keywordSearch(query: {
    keywords?: string[];
    userId: string;
    workspaceId?: string;
    type?: string;
  }): Promise<MemorySearchResult> {
    const memoryQuery: MemoryQuery = {
      userId: query.userId,
      workspaceId: query.workspaceId,
      type: query.type as any,
      content: query.keywords?.join(' '),
      limit: 20,
    };

    return this.search(memoryQuery, {
      includeShortTerm: true,
      includeLongTerm: true,
    });
  }

  /**
   * Pure semantic search
   */
  private async semanticSearch(query: {
    semanticQuery: string;
    userId: string;
    workspaceId?: string;
    type?: string;
  }): Promise<MemorySearchResult> {
    const vectorOptions: VectorSearchOptions = {
      query: query.semanticQuery,
      topK: 20,
      threshold: 0.1,
      filters: {
        userId: query.userId,
        workspaceId: query.workspaceId,
        type: query.type,
      },
    };

    return this.longTermMemory.semanticSearch(vectorOptions);
  }

  /**
   * Combine search results from multiple sources
   */
  private combineSearchResults(
    results: MemorySearchResult[],
    maxResults: number,
    startTime: number
  ): MemorySearchResult {
    const allEntries = results.flatMap(r => r.entries);
    const deduplicated = this.deduplicateEntries(allEntries);

    // Sort by timestamp (recency) and limit
    deduplicated.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      entries: deduplicated.slice(0, maxResults),
      totalCount: deduplicated.length,
      searchTime: Date.now() - startTime,
    };
  }

  /**
   * Remove duplicate entries based on ID
   */
  private deduplicateEntries(entries: any[]): any[] {
    const seen = new Set<string>();
    return entries.filter(entry => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    });
  }

  /**
   * Hybrid reranking combining keyword and semantic scores
   */
  private hybridRerank(
    keywordResults: any[],
    semanticResults: any[],
    keywords: string[]
  ): any[] {
    const scoredEntries = new Map<string, { entry: any; score: number }>();

    // Score keyword results
    keywordResults.forEach(entry => {
      const keywordScore = this.calculateKeywordScore(entry, keywords);
      scoredEntries.set(entry.id, { entry, score: keywordScore });
    });

    // Boost semantic results
    semanticResults.forEach(entry => {
      const existing = scoredEntries.get(entry.id);
      const semanticScore = 0.7; // Base semantic boost
      const combinedScore = existing
        ? existing.score + semanticScore
        : semanticScore;
      scoredEntries.set(entry.id, { entry, score: combinedScore });
    });

    // Sort by combined score
    return Array.from(scoredEntries.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.entry);
  }

  /**
   * Calculate keyword matching score
   */
  private calculateKeywordScore(entry: any, keywords: string[]): number {
    if (!keywords.length) return 0;

    const content = entry.content.toLowerCase();
    let score = 0;

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    return score / keywords.length; // Normalize by keyword count
  }

  /**
   * Extract meaningful phrases from content
   */
  private extractPhrases(content: string): string[] {
    // Simple phrase extraction (can be enhanced with NLP)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const phrases: string[] = [];

    sentences.forEach(sentence => {
      // Extract noun phrases (simplified)
      const words = sentence.trim().split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        if (words[i].length > 3 && words[i + 1].length > 3) {
          phrases.push(`${words[i]} ${words[i + 1]}`);
        }
      }
    });

    return [...new Set(phrases)]; // Remove duplicates
  }
}