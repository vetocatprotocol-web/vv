// packages/memory/src/types.ts

export interface MemoryEntry {
  id: string;
  userId: string;
  workspaceId: string;
  type: 'task' | 'interaction' | 'context' | 'pattern';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  expiresAt?: Date; // For short-term memory
  embedding?: number[]; // For vector search (future)
  tags: string[];
}

export interface ShortTermMemoryEntry extends MemoryEntry {
  type: 'task' | 'interaction';
  sessionId: string;
  ttl: number; // Time to live in seconds
}

export interface LongTermMemoryEntry extends MemoryEntry {
  type: 'context' | 'pattern';
  importance: number; // 0-1, determines retention priority
  accessCount: number;
  lastAccessed: Date;
  consolidationCount: number; // How many times this has been consolidated
}

export interface MemoryQuery {
  userId: string;
  workspaceId?: string;
  type?: MemoryEntry['type'];
  tags?: string[];
  content?: string; // For semantic search
  limit?: number;
  since?: Date;
  until?: Date;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  totalCount: number;
  searchTime: number;
  relevanceScores?: number[]; // For semantic search
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
  storageUsed: number; // in bytes
}

export type MemoryProvider = 'redis' | 'vector-db' | 'hybrid';

export interface MemoryConfig {
  provider: MemoryProvider;
  redisUrl?: string;
  vectorDbUrl?: string;
  defaultTTL: number; // Default TTL for short-term memory
  maxEmbeddings: number; // Maximum embeddings to store
  consolidationInterval: number; // How often to run consolidation (in minutes)
}