import { MemoryAPI } from './agent.types';

interface MemoryRecord { [key: string]: any }

export class InMemoryAPI implements MemoryAPI {
  private store: Map<string, any> = new Map();

  async read(key: string): Promise<any | null> {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async write(key: string, value: any): Promise<void> {
    this.store.set(key, value);
  }

  async query(filter: Record<string, any>): Promise<any[]> {
    const matches: any[] = [];
    for (const [key, value] of this.store.entries()) {
      let match = true;
      for (const field of Object.keys(filter)) {
        if (value?.[field] !== filter[field]) {
          match = false;
          break;
        }
      }
      if (match) {
        matches.push({ key, value });
      }
    }
    return matches;
  }
}
