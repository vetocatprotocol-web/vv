// packages/memory/src/index.ts

export { ShortTermMemory } from './short-term-memory';
export { LongTermMemory } from './long-term-memory';
export { SemanticSearch } from './semantic-search';
export { MemoryInjector } from './memory-injector';

export type {
  MemoryEntry,
  ShortTermMemoryEntry,
  LongTermMemoryEntry,
  MemoryQuery,
  MemorySearchResult,
  VectorSearchOptions,
  MemoryConsolidationRule,
  MemoryStats,
  MemoryProvider,
  MemoryConfig,
} from './types';