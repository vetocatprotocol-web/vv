import { Injectable } from '@nestjs/common';
import { IntegrationManager } from '@karyo/integrations';
import { TaskClassifier, ModelRouter } from '@karyo/ai-core';
import { AgentLoop } from '@karyo/agents';

interface DataAnalysisTask {
  userId: string;
  workspaceId: string;
  query: string;
  dataSources: Array<{
    type: string;
    source: string;
    integrationId?: string;
    config?: Record<string, any>;
    data?: any;
  }>;
  analysisType: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
  outputFormat: 'json' | 'markdown' | 'html' | 'chart';
  model: string;
  includeVisualizations: boolean;
  generateReport: boolean;
  costEstimate: any;
}

@Injectable()
export class DataAnalystProcessor {
  constructor(
    private integrationManager: IntegrationManager,
    private taskClassifier: TaskClassifier,
    private agentLoop: AgentLoop,
    private modelRouter: ModelRouter,
  ) {}

  /**
   * Execute comprehensive data analysis
   */
  async executeAnalysis(task: DataAnalysisTask): Promise<any> {
    try {
      console.log(`Starting AI Data Analyst execution for query: ${task.query}`);

      // Step 1: Gather data from all sources
      const rawData = await this.gatherDataFromSources(task.dataSources);

      // Step 2: Perform analysis based on type
      const analysisResult = await this.performAnalysis(task, rawData);

      // Step 3: Generate insights
      const insights = await this.generateInsights(analysisResult, task.analysisType);

      // Step 4: Create visualizations if requested
      const visualizations = task.includeVisualizations
        ? await this.generateVisualizations(insights, analysisResult)
        : [];

      // Step 5: Generate comprehensive report if requested
      const report = task.generateReport
        ? await this.generateReport(task.query, insights, visualizations, task.analysisType)
        : undefined;

      // Step 6: Format output
      const result = {
        insights,
        visualizations,
        report,
        rawData: task.outputFormat === 'json' ? analysisResult : undefined,
        metadata: {
          analysisType: task.analysisType,
          dataSourcesCount: task.dataSources.length,
          insightsCount: insights.length,
          visualizationsCount: visualizations.length,
          executionTime: Date.now(),
        }
      };

      console.log(`AI Data Analyst execution completed successfully`);
      return result;

    } catch (error) {
      console.error('AI Data Analyst execution failed:', error);
      throw error;
    }
  }

  /**
   * Gather data from all configured sources
   */
  private async gatherDataFromSources(dataSources: DataAnalysisTask['dataSources']): Promise<any[]> {
    const allData = [];

    for (const source of dataSources) {
      try {
        switch (source.type) {
          case 'integration':
            if (source.integrationId) {
              const data = await this.gatherIntegrationData(source);
              allData.push({ source: source.source, type: source.type, data });
            }
            break;

          case 'file':
            const fileData = await this.gatherFileData(source);
            allData.push({ source: source.source, type: source.type, data: fileData });
            break;

          case 'database':
            const dbData = await this.gatherDatabaseData(source);
            allData.push({ source: source.source, type: source.type, data: dbData });
            break;

          case 'api':
            const apiData = await this.gatherApiData(source);
            allData.push({ source: source.source, type: source.type, data: apiData });
            break;
        }
      } catch (error) {
        console.warn(`Failed to gather data from ${source.source}:`, error);
        allData.push({ source: source.source, type: source.type, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return allData;
  }

  /**
   * Gather data from integrated services
   */
  private async gatherIntegrationData(source: any): Promise<any> {
    const tools = this.integrationManager.getIntegrationTools(source.integrationId);

    // Use appropriate tools based on integration type
    const integrationStatus = this.integrationManager.getIntegrationStatus(source.integrationId);
    if (!integrationStatus.isActive) {
      throw new Error('Integration is not active');
    }

    // Execute relevant tools to gather data
    const results = [];
    for (const tool of tools.slice(0, 3)) { // Limit to first 3 tools for demo
      try {
        const result = await this.integrationManager.executeTool(
          source.integrationId,
          tool.name,
          source.config || {},
          { userId: 'system', workspaceId: 'system' }
        );
        if (result.success) {
          results.push({ tool: tool.name, data: result.data });
        }
      } catch (error) {
        console.warn(`Tool ${tool.name} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Gather data from files (placeholder)
   */
  private async gatherFileData(source: any): Promise<any> {
    // In a real implementation, this would read from the file system
    return { message: 'File data gathering not implemented', source: source.source };
  }

  /**
   * Gather data from databases (placeholder)
   */
  private async gatherDatabaseData(source: any): Promise<any> {
    // In a real implementation, this would query databases
    return { message: 'Database data gathering not implemented', source: source.source };
  }

  /**
   * Gather data from APIs (placeholder)
   */
  private async gatherApiData(source: any): Promise<any> {
    // In a real implementation, this would call external APIs
    return { message: 'API data gathering not implemented', source: source.source };
  }

  /**
   * Perform the actual data analysis
   */
  private async performAnalysis(task: DataAnalysisTask, rawData: any[]): Promise<any> {
    const analysisPrompt = this.buildAnalysisPrompt(task, rawData);

    const response = await this.agentLoop.executeTask({
      id: `analysis-${Date.now()}`,
      description: analysisPrompt,
      userId: task.userId,
      workspaceId: task.workspaceId,
      metadata: { model: task.model },
    });
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: 4000,
    });

    // Parse and structure the analysis result
    try {
      const analysisResult = JSON.parse(response.content);
      return analysisResult;
    } catch (error) {
      // If JSON parsing fails, return the raw response
      return { rawAnalysis: response.content, parsed: false };
    }
  }

  /**
   * Build analysis prompt based on task and data
   */
  private buildAnalysisPrompt(task: DataAnalysisTask, rawData: any[]): string {
    return `
Perform a ${task.analysisType} data analysis for the following query: "${task.query}"

Data Sources Available:
${rawData.map((d, i) => `${i + 1}. ${d.source} (${d.type}): ${JSON.stringify(d.data).slice(0, 200)}...`).join('\n')}

Analysis Requirements:
- Type: ${task.analysisType}
- Focus on key insights and patterns
- Provide actionable recommendations
- Include statistical summaries where relevant
- Consider data quality and limitations

Please provide a comprehensive analysis including:
1. Data summary and quality assessment
2. Key findings and insights
3. Statistical analysis (if applicable)
4. Trends and patterns
5. Anomalies or outliers
6. Recommendations

Format your response as a structured JSON object.
    `.trim();
  }

  /**
   * Generate insights from analysis results
   */
  private async generateInsights(analysisResult: any, analysisType: string): Promise<Array<{
    type: string;
    title: string;
    description: string;
    confidence: number;
    data?: any;
  }>> {
    const insights = [];

    // Extract insights based on analysis type
    if (analysisResult.rawAnalysis) {
      // Parse raw analysis for insights
      insights.push({
        type: 'summary',
        title: 'Analysis Summary',
        description: analysisResult.rawAnalysis.slice(0, 200) + '...',
        confidence: 0.8,
        data: analysisResult
      });
    } else {
      // Structured insights
      if (analysisResult.keyFindings) {
        analysisResult.keyFindings.forEach((finding: any, index: number) => {
          insights.push({
            type: 'summary',
            title: `Key Finding ${index + 1}`,
            description: finding.description || finding,
            confidence: finding.confidence || 0.8,
            data: finding
          });
        });
      }

      if (analysisResult.trends) {
        insights.push({
          type: 'trend',
          title: 'Identified Trends',
          description: `Found ${analysisResult.trends.length} significant trends`,
          confidence: 0.85,
          data: analysisResult.trends
        });
      }

      if (analysisResult.anomalies) {
        insights.push({
          type: 'anomaly',
          title: 'Detected Anomalies',
          description: `Identified ${analysisResult.anomalies.length} anomalies requiring attention`,
          confidence: 0.9,
          data: analysisResult.anomalies
        });
      }
    }

    return insights;
  }

  /**
   * Generate visualizations from insights
   */
  private async generateVisualizations(insights: any[], analysisResult: any): Promise<Array<{
    type: string;
    title: string;
    data: any;
    config?: any;
  }>> {
    const visualizations = [];

    // Generate charts based on insights
    for (const insight of insights.slice(0, 3)) { // Limit visualizations
      if (insight.type === 'trend' && insight.data) {
        visualizations.push({
          type: 'chart',
          title: `${insight.title} - Trend Chart`,
          data: insight.data,
          config: {
            type: 'line',
            xAxis: 'time',
            yAxis: 'value'
          }
        });
      } else if (insight.type === 'anomaly') {
        visualizations.push({
          type: 'chart',
          title: `${insight.title} - Anomaly Detection`,
          data: insight.data,
          config: {
            type: 'scatter',
            highlightAnomalies: true
          }
        });
      }
    }

    // Add summary table
    visualizations.push({
      type: 'table',
      title: 'Analysis Summary Table',
      data: {
        insights: insights.map(i => ({
          type: i.type,
          title: i.title,
          confidence: `${(i.confidence * 100).toFixed(1)}%`
        }))
      },
      config: {
        columns: ['Type', 'Title', 'Confidence']
      }
    });

    return visualizations;
  }

  /**
   * Generate comprehensive analysis report
   */
  private async generateReport(
    query: string,
    insights: any[],
    visualizations: any[],
    analysisType: string
  ): Promise<{
    title: string;
    summary: string;
    sections: Array<{
      title: string;
      content: string;
      insights: string[];
    }>;
    recommendations: string[];
  }> {
    const reportPrompt = `
Generate a comprehensive data analysis report for the query: "${query}"

Analysis Type: ${analysisType}

Insights Available:
${insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

Visualizations Created: ${visualizations.length}

Please generate a structured report with:
1. Executive Summary
2. Methodology
3. Key Findings
4. Detailed Analysis
5. Recommendations
6. Conclusion

Format as JSON with title, summary, sections array, and recommendations array.
    `.trim();

    const response = await this.agentLoop.executeTask({
      id: `report-${Date.now()}`,
      description: reportPrompt,
      userId: task.userId,
      workspaceId: task.workspaceId,
      metadata: { model: 'gpt-4' },
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback report structure
      return {
        title: `Data Analysis Report: ${query}`,
        summary: `Analysis of ${insights.length} key insights using ${analysisType} methodology.`,
        sections: [
          {
            title: 'Key Findings',
            content: insights.map(i => i.description).join(' '),
            insights: insights.map(i => i.title)
          }
        ],
        recommendations: [
          'Review the identified insights for business impact',
          'Consider implementing monitoring for detected trends',
          'Address any anomalies found in the analysis'
        ]
      };
    }
  }
}