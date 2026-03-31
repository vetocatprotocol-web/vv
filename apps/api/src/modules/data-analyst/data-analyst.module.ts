import { Module } from '@nestjs/common';
import { DataAnalystController } from './data-analyst.controller';
import { DataAnalystService } from './data-analyst.service';
// Import other services that will be injected
import { TasksModule } from '../tasks/tasks.module';
import { AgentsModule } from '../agents/agents.module';
import { FilesModule } from '../files/files.module';
// Import external packages - we'll need to create providers for these
import { TaskClassifier } from '@karyo/ai-core';
import { AgentLoop } from '@karyo/agents';
import { MemoryInjector } from '@karyo/memory';
import { ExecutionWorker } from '@karyo/execution';
import { GovernanceService } from '@karyo/governance';

@Module({
  imports: [TasksModule, AgentsModule, FilesModule],
  controllers: [DataAnalystController],
  providers: [
    DataAnalystService,
    // External package providers - these would need proper initialization
    {
      provide: TaskClassifier,
      useFactory: () => {
        // This would need proper initialization with dependencies
        // For now, return a mock or basic implementation
        return {
          classifyTask: async (task: any) => ({
            ...task,
            complexity: 'medium',
            estimatedTokens: 1000,
          }),
        };
      },
    },
    {
      provide: AgentLoop,
      useFactory: () => {
        // Mock implementation
        return {
          executeTask: async (task: any) => ({ result: 'Analysis completed', success: true }),
        };
      },
    },
    {
      provide: MemoryInjector,
      useFactory: () => ({
        buildEnrichedContext: async (context: any) => context,
        storeExecutionResult: async () => {},
      }),
    },
    {
      provide: ExecutionWorker,
      useFactory: () => ({
        queueTask: async (task: string, context?: any) => `job_${Date.now()}`,
        getTaskStatus: async (jobId: string) => ({ state: 'completed', returnvalue: { analysis: 'Sample analysis result' } }),
      }),
    },
    {
      provide: GovernanceService,
      useFactory: () => ({
        authorizeRequest: async () => ({
          allowed: true,
          costEstimate: { estimatedCost: 0.1, currency: 'USD' },
          remainingBudget: { tokens: 9000, cost: 9.9 },
        }),
        getUsageHistory: async () => [],
        getUsageStats: async () => ({
          usage: { tokens: 1000, cost: 0.1 },
          limits: { tokens: 10000, cost: 10 },
          remaining: { tokens: 9000, cost: 9.9 },
        }),
      }),
    },
  ],
  exports: [DataAnalystService],
})
export class DataAnalystModule {}