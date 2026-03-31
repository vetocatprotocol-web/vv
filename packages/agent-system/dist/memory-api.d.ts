import { MemoryAPI } from './agent.types';
export declare class InMemoryAPI implements MemoryAPI {
    private store;
    read(key: string): Promise<any | null>;
    write(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    query(filter: Record<string, any>): Promise<any[]>;
}
//# sourceMappingURL=memory-api.d.ts.map