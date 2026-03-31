// packages/memory/src/long-term-memory.ts

import { LongTermMemoryEntry, MemoryQuery, MemorySearchResult, VectorSearchOptions } from './types';

/**
 * Long-Term Memory System
 *
 * Manages persistent memory with vector-ready structure
 * Designed for semantic search and pattern recognition
 * Ready for integration with vector databases (Qdrant, Weaviate, etc.)
 */
export class LongTermMemory {
  private entries: Map<string, LongTermMemoryEntry> = new Map();
  private embeddings: Map<string, number[]> = new Map(); // Future: move to vector DB

  /**
   * Store a long-term memory entry
   */
  async store(entry: LongTermMemoryEntry): Promise<void> {
    // Generate embedding for semantic search (mock implementation)
    const embedding = await this.generateEmbedding(entry.content);
    this.embeddings.set(entry.id, embedding);

    // Store entry
    this.entries.set(entry.id, {
      ...entry,
      accessCount: entry.accessCount || 0,
      lastAccessed: entry.lastAccessed || new Date(),
      consolidationCount: entry.consolidationCount || 0,
    });

    // Update access metadata
    await this.updateAccessMetadata(entry.id);
  }

  /**
   * Retrieve a specific memory entry
   */
  async retrieve(entryId: string): Promise<LongTermMemoryEntry | null> {
    const entry = this.entries.get(entryId);
    if (!entry) return null;

    // Update access metadata
    await this.updateAccessMetadata(entryId);

    return entry;
  }

  /**
   * Query long-term memory entries
   */
  async query(query: MemoryQuery): Promise<MemorySearchResult> {
    const startTime = Date.now();
    const results: LongTermMemoryEntry[] = [];

    for (const entry of this.entries.values()) {
      if (this.matchesQuery(entry, query)) {
        results.push(entry);
      }
    }

    // Sort by relevance (importance + recency + access frequency)
    results.sort((a, b) => this.calculateRelevanceScore(b) - this.calculateRelevanceScore(a));

    const limitedResults = query.limit ? results.slice(0, query.limit) : results;

    return {
      entries: limitedResults,
      totalCount: results.length,
      searchTime: Date.now() - startTime,
    };
  }

  /**
   * Semantic search using vector similarity
   */
  async semanticSearch(options: VectorSearchOptions): Promise<MemorySearchResult> {
    const startTime = Date.now();

    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(options.query);

    // Calculate similarities
    const similarities: Array<{ entry: LongTermMemoryEntry; score: number }> = [];

    for (const [entryId, entry] of this.entries) {
      const embedding = this.embeddings.get(entryId);
      if (embedding) {
        const score = this.cosineSimilarity(queryEmbedding, embedding);
        if (score >= (options.threshold || 0.1)) {
          similarities.push({ entry, score });
        }
      }
    }

    // Sort by similarity score
    similarities.sort((a, b) => b.score - a.score);

    // Apply filters and limit
    const filtered = similarities
      .filter(item => this.matchesVectorFilters(item.entry, options.filters))
      .slice(0, options.topK);

    return {
      entries: filtered.map(item => item.entry),
      totalCount: filtered.length,
      searchTime: Date.now() - startTime,
      relevanceScores: filtered.map(item => item.score),
    };
  }

  /**
   * Update an existing memory entry
   */
  async update(entryId: string, updates: Partial<LongTermMemoryEntry>): Promise<void> {
    const existing = this.entries.get(entryId);
    if (!existing) {
      throw new Error(`Memory entry ${entryId} not found`);
    }

    const updated = { ...existing, ...updates };
    this.entries.set(entryId, updated);

    // Regenerate embedding if content changed
    if (updates.content) {
      const embedding = await this.generateEmbedding(updated.content);
      this.embeddings.set(entryId, embedding);
    }
  }

  /**
   * Delete a memory entry
   */
  async delete(entryId: string): Promise<void> {
    this.entries.delete(entryId);
    this.embeddings.delete(entryId);
  }

  /**
   * Consolidate memories based on patterns and importance
   */
  async consolidateMemories(): Promise<void> {
    // Identify entries that can be consolidated
    const consolidationCandidates = this.findConsolidationCandidates();

    for (const group of consolidationCandidates) {
      if (group.length > 1) {
        const consolidated = await this.consolidateGroup(group);
        // Remove old entries and add consolidated one
        for (const entry of group) {
          await this.delete(entry.id);
        }
        await this.store(consolidated);
      }
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{ entries: number; embeddings: number; averageImportance: number }> {
    const entries = Array.from(this.entries.values());
    const totalImportance = entries.reduce((sum, entry) => sum + entry.importance, 0);

    return {
      entries: entries.length,
      embeddings: this.embeddings.size,
      averageImportance: entries.length > 0 ? totalImportance / entries.length : 0,
    };
  }

  /**
   * Export memories for backup or migration
   */
  async exportMemories(): Promise<LongTermMemoryEntry[]> {
    return Array.from(this.entries.values());
  }

  /**
   * Import memories from backup
   */
  async importMemories(memories: LongTermMemoryEntry[]): Promise<void> {
    for (const memory of memories) {
      await this.store(memory);
    }
  }

  /**
   * Generate embedding for text (mock implementation)
   * In production, this would use actual embedding models
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Simple mock embedding based on text characteristics
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384 dimensions (common for many models)

    // Create deterministic but varied embedding based on content
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < Math.min(word.length, embedding.length); j++) {
        const charCode = word.charCodeAt(j);
        embedding[j] = (embedding[j] + charCode * (i + 1)) % 1000;
      }
    }

    // Normalize to 0-1 range
    const max = Math.max(...embedding);
    return embedding.map(x => x / max);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Update access metadata for an entry
   */
  private async updateAccessMetadata(entryId: string): Promise<void> {
    const entry = this.entries.get(entryId);
    if (entry) {
      entry.accessCount += 1;
      entry.lastAccessed = new Date();
      this.entries.set(entryId, entry);
    }
  }

  /**
   * Calculate relevance score for sorting
   */
  private calculateRelevanceScore(entry: LongTermMemoryEntry): number {
    const recencyScore = Math.max(0, 1 - (Date.now() - entry.lastAccessed.getTime()) / (30 * 24 * 60 * 60 * 1000)); // Decay over 30 days
    const importanceScore = entry.importance;
    const accessScore = Math.min(1, entry.accessCount / 10); // Cap at 10 accesses

    return (recencyScore * 0.4) + (importanceScore * 0.4) + (accessScore * 0.2);
  }

  /**
   * Check if entry matches query filters
   */
  private matchesQuery(entry: LongTermMemoryEntry, query: MemoryQuery): boolean {
    if (query.userId && entry.userId !== query.userId) return false;
    if (query.workspaceId && entry.workspaceId !== query.workspaceId) return false;
    if (query.type && entry.type !== query.type) return false;
    if (query.tags && !query.tags.every(tag => entry.tags.includes(tag))) return false;
    if (query.since && entry.timestamp < query.since) return false;
    if (query.until && entry.timestamp > query.until) return false;

    return true;
  }

  /**
   * Check if entry matches vector search filters
   */
  private matchesVectorFilters(entry: LongTermMemoryEntry, filters?: Record<string, any>): boolean {
    if (!filters) return true;

    for (const [key, value] of Object.entries(filters)) {
      if (entry.metadata[key] !== value) return false;
    }

    return true;
  }

  /**
   * Find groups of memories that can be consolidated
   */
  private findConsolidationCandidates(): LongTermMemoryEntry[][] {
    const groups: LongTermMemoryEntry[][] = [];
    const processed = new Set<string>();

    for (const entry of this.entries.values()) {
      if (processed.has(entry.id)) continue;

      const similar = this.findSimilarEntries(entry);
      if (similar.length > 1) {
        groups.push(similar);
        similar.forEach(e => processed.add(e.id));
      }
    }

    return groups;
  }

  /**
   * Find entries similar to the given entry
   */
  private findSimilarEntries(entry: LongTermMemoryEntry): LongTermMemoryEntry[] {
    const similar: LongTermMemoryEntry[] = [entry];
    const entryEmbedding = this.embeddings.get(entry.id);

    if (!entryEmbedding) return similar;

    for (const [id, otherEntry] of this.entries) {
      if (id === entry.id) continue;

      const otherEmbedding = this.embeddings.get(id);
      if (otherEmbedding) {
        const similarity = this.cosineSimilarity(entryEmbedding, otherEmbedding);
        if (similarity > 0.8 && otherEntry.type === entry.type) { // High similarity threshold
          similar.push(otherEntry);
        }
      }
    }

    return similar;
  }

  /**
   * Consolidate a group of similar entries
   */
  private async consolidateGroup(group: LongTermMemoryEntry[]): Promise<LongTermMemoryEntry> {
    // Create consolidated content
    const contents = group.map(e => e.content);
    const consolidatedContent = contents.join('\n\n---\n\n');

    // Calculate average importance and sum access counts
    const totalImportance = group.reduce((sum, e) => sum + e.importance, 0);
    const totalAccess = group.reduce((sum, e) => sum + e.accessCount, 0);

    // Use the most recent timestamp
    const latestTimestamp = group.reduce((latest, e) =>
      e.timestamp > latest ? e.timestamp : latest, group[0].timestamp);

    return {
      id: `consolidated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: group[0].userId,
      workspaceId: group[0].workspaceId,
      type: group[0].type,
      content: consolidatedContent,
      metadata: {
        consolidatedFrom: group.map(e => e.id),
        originalCount: group.length,
      },
      timestamp: new Date(),
      tags: [...new Set(group.flatMap(e => e.tags))],
      importance: totalImportance / group.length,
      accessCount: totalAccess,
      lastAccessed: latestTimestamp,
      consolidationCount: Math.max(...group.map(e => e.consolidationCount || 0)) + 1,
    };
  }
}