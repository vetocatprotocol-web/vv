import { Injectable } from '@nestjs/common';
import { TaskClassifier } from '@karyo/ai-core';
import { AgentLoop } from '@karyo/agents';
import { MemoryInjector } from '@karyo/memory';
import { ExecutionWorker, DataAnalystProcessor } from '@karyo/execution';
import { GovernanceService } from '@karyo/governance';
import { IntegrationManager } from '@karyo/integrations';

export interface DataAnalysisRequest {
  query: string;
  dataSource?: string;
  dataSources?: Array<{
    type: 'file' | 'database' | 'api' | 'integration';
    source: string;
    integrationId?: string;
    config?: Record<string, any>;
  }>;
  userId: string;
  workspaceId: string;
  analysisType?: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
  outputFormat?: 'json' | 'markdown' | 'html' | 'chart';
  options?: {
    model?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    timeout?: number;
    includeVisualizations?: boolean;
    generateReport?: boolean;
  };
}

export interface DataAnalysisResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: {
    insights: Array<{
      type: 'summary' | 'trend' | 'anomaly' | 'correlation' | 'prediction';
      title: string;
      description: string;
      confidence: number;
      data?: any;
    }>;
    visualizations?: Array<{
      type: 'chart' | 'graph' | 'table';
      title: string;
      data: any;
      config?: any;
    }>;
    report?: {
      title: string;
      summary: string;
      sections: Array<{
        title: string;
        content: string;
        insights: string[];
      }>;
      recommendations: string[];
    };
    rawData?: any;
  };
  error?: string;
  cost?: number;
  tokens?: number;
  executionTime?: number;
  metadata?: {
    dataSourcesUsed: string[];
    analysisType: string;
    modelUsed: string;
  };
}

@Injectable()
export class DataAnalystService {
  constructor(
    private taskClassifier: TaskClassifier,
    private agentLoop: AgentLoop,
    private memoryInjector: MemoryInjector,
    private executionWorker: ExecutionWorker,
    private governanceService: GovernanceService,
    private integrationManager: IntegrationManager,
    private dataAnalystProcessor: DataAnalystProcessor,
  ) {}

  /**
   * Execute comprehensive AI Data Analyst analysis
   */
  async analyzeData(request: DataAnalysisRequest): Promise<DataAnalysisResult> {
    const {
      query,
      dataSources = [],
      userId,
      workspaceId,
      analysisType = 'exploratory',
      outputFormat = 'json',
      options = {}
    } = request;

    try {
      // Step 1: Validate and prepare data sources
      const validatedDataSources = await this.validateDataSources(dataSources, workspaceId, userId);

      // Step 2: Classify the analysis task
      const taskDescription = `AI Data Analysis: ${query} (${analysisType}) using ${validatedDataSources.length} data sources`;
      const classifiedTask = await this.taskClassifier.classifyTask({
        id: `analysis_${Date.now()}`,
        description: taskDescription,
        userId,
        workspaceId,
        metadata: {
          dataSources: validatedDataSources,
          analysisType,
          outputFormat,
          includeVisualizations: options.includeVisualizations,
          generateReport: options.generateReport
        },
      });

      // Step 3: Estimate computational requirements
      const estimatedTokens = this.estimateAnalysisTokens(validatedDataSources, analysisType, options);

      // Step 4: Check governance and cost limits
      const authResult = await this.governanceService.authorizeRequest(
        userId,
        workspaceId,
        options.model || 'gpt-4',
        estimatedTokens.input,
        estimatedTokens.output,
      );

      if (!authResult.allowed) {
        return {
          jobId: '',
          status: 'failed',
          error: authResult.reason,
        };
      }

      // Step 5: Queue the comprehensive analysis task
      const jobId = await this.executionWorker.queueTask(
        `AI Data Analyst: ${taskDescription}`,
        {
          userId,
          workspaceId,
          query,
          dataSources: validatedDataSources,
          analysisType,
          outputFormat,
          model: options.model || 'gpt-4',
          includeVisualizations: options.includeVisualizations || false,
          generateReport: options.generateReport || false,
          costEstimate: authResult.costEstimate,
        },
        options.priority || 'high'
      );

      return {
        jobId,
        status: 'queued',
        cost: authResult.costEstimate.estimatedCost,
        metadata: {
          dataSourcesUsed: validatedDataSources.map(ds => ds.source),
          analysisType,
          modelUsed: options.model || 'gpt-4'
        }
      };

    } catch (error) {
      console.error('Data analysis error:', error);
      return {
        jobId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
   * Validate and prepare data sources for analysis
   */
  private async validateDataSources(
    dataSources: DataAnalysisRequest['dataSources'],
    workspaceId: string,
    userId: string
  ): Promise<Array<{
    type: string;
    source: string;
    integrationId?: string;
    config?: Record<string, any>;
    data?: any;
  }>> {
    const validatedSources = [];

    for (const source of dataSources) {
      try {
        switch (source.type) {
          case 'integration':
            // Validate integration access
            if (!source.integrationId) {
              throw new Error('Integration ID required for integration data source');
            }
            const integrationStatus = this.integrationManager.getIntegrationStatus(source.integrationId);
            if (!integrationStatus.isActive) {
              throw new Error(`Integration ${source.integrationId} is not active`);
            }
            validatedSources.push({
              ...source,
              tools: integrationStatus.tools
            });
            break;

          case 'file':
            // Validate file access (would integrate with file system)
            validatedSources.push(source);
            break;

          case 'database':
            // Validate database connection
            validatedSources.push(source);
            break;

          case 'api':
            // Validate API configuration
            validatedSources.push(source);
            break;

          default:
            throw new Error(`Unsupported data source type: ${source.type}`);
        }
      } catch (error) {
        console.warn(`Skipping invalid data source ${source.source}:`, error);
      }
    }

    return validatedSources;
  }

  /**
   * Estimate token usage for analysis
   */
  private estimateAnalysisTokens(
    dataSources: any[],
    analysisType: string,
    options: any
  ): { input: number; output: number } {
    let baseInputTokens = 1000; // Base prompt tokens
    let baseOutputTokens = 2000; // Base output tokens

    // Adjust based on data sources
    for (const source of dataSources) {
      switch (source.type) {
        case 'integration':
          baseInputTokens += 500; // Integration data
          break;
        case 'file':
          baseInputTokens += 2000; // File content
          break;
        case 'database':
          baseInputTokens += 1500; // Query results
          break;
        case 'api':
          baseInputTokens += 1000; // API response
          break;
      }
    }

    // Adjust based on analysis type
    switch (analysisType) {
      case 'predictive':
        baseOutputTokens += 1000;
        break;
      case 'prescriptive':
        baseOutputTokens += 1500;
        break;
    }

    // Adjust for visualizations and reports
    if (options.includeVisualizations) baseOutputTokens += 500;
    if (options.generateReport) baseOutputTokens += 1000;

    return {
      input: baseInputTokens,
      output: baseOutputTokens
    };
  }
  async getAnalysisResult(jobId: string, userId: string): Promise<DataAnalysisResult> {
    try {
      const jobStatus = await this.executionWorker.getTaskStatus(jobId);

      if (!jobStatus) {
        return {
          jobId,
          status: 'failed',
          error: 'Job not found',
        };
      }

      const status = jobStatus.state;
      let resultStatus: 'queued' | 'processing' | 'completed' | 'failed' = 'processing';

      if (status === 'completed') {
        resultStatus = 'completed';
      } else if (status === 'failed') {
        resultStatus = 'failed';
      } else if (status === 'active') {
        resultStatus = 'processing';
      } else {
        resultStatus = 'queued';
      }

      return {
        jobId,
        status: resultStatus,
        result: jobStatus.returnvalue,
        error: jobStatus.failedReason,
        executionTime: jobStatus.finishedOn ? (new Date(jobStatus.finishedOn).getTime() - new Date(jobStatus.processedOn).getTime()) : undefined,
      };

    } catch (error) {
      console.error('Get analysis result error:', error);
      return {
        jobId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to get result',
      };
    }
  }

  /**
   * Get user's analysis history
   */
  async getAnalysisHistory(userId: string, workspaceId: string, limit: number = 10) {
    try {
      const history = await this.governanceService.getUsageHistory(userId, workspaceId, limit);

      // Filter for data analysis operations
      return history.filter(record =>
        record.operation === 'data_analysis' ||
        (record as any).metadata?.analysisType === 'data_analyst'
      );

    } catch (error) {
      console.error('Get analysis history error:', error);
      return [];
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUsageStats(userId: string, workspaceId: string) {
    try {
      return await this.governanceService.getUsageStats(userId, workspaceId, 'monthly');
    } catch (error) {
      console.error('Get usage stats error:', error);
      return null;
    }
  }

  /**
   * Get data sources for a workspace
   */
  async getDataSources(workspaceId: string) {
    try {
      // In a real implementation, this would query a database
      // For now, return mock data
      return {
        dataSources: [
          {
            id: '1',
            name: 'Sample CSV Data',
            type: 'file',
            status: 'active',
            config: {},
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Get data sources error:', error);
      return { dataSources: [] };
    }
  }

  /**
   * Add a new data source
   */
  async addDataSource(dataSource: any) {
    try {
      // In a real implementation, this would save to database
      // For now, return mock response
      return {
        dataSource: {
          id: Date.now().toString(),
          ...dataSource,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Add data source error:', error);
      throw error;
    }
  }

  /**
   * Delete a data source
   */
  async deleteDataSource(id: string) {
    try {
      // In a real implementation, this would delete from database
      return { success: true };
    } catch (error) {
      console.error('Delete data source error:', error);
      throw error;
    }
  }

  /**
   * Test a data source connection
   */
  async testDataSource(id: string) {
    try {
      // In a real implementation, this would test the actual connection
      return { success: true };
    } catch (error) {
      console.error('Test data source error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete an analysis from history
   */
  async deleteAnalysis(analysisId: string, userId: string) {
    try {
      // In a real implementation, this would delete from database
      return { success: true };
    } catch (error) {
      console.error('Delete analysis error:', error);
      throw error;
    }
  }
}