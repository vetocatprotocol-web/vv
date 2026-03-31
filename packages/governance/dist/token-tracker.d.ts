import { TokenUsage, GovernanceConfig } from './types';
export declare class TokenTracker {
    private config;
    private redis;
    constructor(config: GovernanceConfig);
    trackUsage(usage: Omit<TokenUsage, 'timestamp'>): Promise<void>;
    getUsage(userId: string, workspaceId: string, period?: 'daily' | 'monthly' | 'total'): Promise<{
        tokens: number;
        cost: number;
    }>;
    getUsageHistory(userId: string, workspaceId: string, limit?: number): Promise<TokenUsage[]>;
    resetUsage(userId: string, workspaceId: string, period: 'daily' | 'monthly'): Promise<void>;
    private getDateString;
    private getMonthString;
    private setupConnection;
    close(): Promise<void>;
}
//# sourceMappingURL=token-tracker.d.ts.map