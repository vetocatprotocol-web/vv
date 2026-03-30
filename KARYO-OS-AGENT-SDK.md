# KARYO OS — Agent SDK Documentation

## Build, Deploy & Manage AI Agents

---

## 🧠 Overview

Agent SDK adalah library yang memungkinkan developer membuat custom AI agents untuk Karyo OS. Setiap agent adalah unit kerja otonom yang bisa menerima task, memproses, dan menghasilkan output.

---

## 📐 Agent Architecture

```
┌─────────────────────────────────────────────┐
│                Agent Instance                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Config   │  │ Context  │  │ Memory   │  │
│  │ Loader   │  │ Builder  │  │ Reader   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │         │
│  ┌────▼─────────────▼─────────────▼─────┐   │
│  │          AI Core (LLM)               │   │
│  │    (LangChain + LangGraph)           │   │
│  └────────────────┬─────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │         Tool Executor                │   │
│  │  (file_read, web_search, code, ...)  │   │
│  └────────────────┬─────────────────────┘   │
│                   │                         │
│  ┌────────────────▼─────────────────────┐   │
│  │       Output Formatter              │   │
│  │  (validate, format, save)           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔧 Agent Interface

```typescript
// @karyo/agent-sdk

import { Task, Context, Memory, Tool, AgentConfig, AgentOutput } from '@karyo/types';

/**
 * Core Agent Interface — semua agent harus implement interface ini
 */
export interface Agent {
  // ═══════════════════════════════════════════
  // Identity
  // ═══════════════════════════════════════════
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: AgentType;
  readonly description: string;

  // ═══════════════════════════════════════════
  // Lifecycle Hooks
  // ═══════════════════════════════════════════

  /**
   * Called once when agent is first loaded
   * Use for: initialization, loading models, warm-up
   */
  onInit?(): Promise<void>;

  /**
   * Called when agent is assigned to a task
   * Use for: validation, resource allocation
   */
  onAssign?(task: Task, context: AgentContext): Promise<void>;

  /**
   * Main execution — THIS IS REQUIRED
   * Receives task + context, returns output
   */
  execute(task: Task, context: AgentContext): Promise<AgentOutput>;

  /**
   * Called after successful execution
   * Use for: cleanup, logging, metrics
   */
  onComplete?(task: Task, output: AgentOutput): Promise<void>;

  /**
   * Called when execution fails
   * Use for: error reporting, retry preparation
   */
  onError?(task: Task, error: AgentError): Promise<void>;

  /**
   * Called when agent is unloaded/shutdown
   * Use for: resource cleanup
   */
  onDestroy?(): Promise<void>;

  // ═══════════════════════════════════════════
  // Capabilities
  // ═══════════════════════════════════════════

  /**
   * Tools this agent can use
   */
  getTools(): Tool[];

  /**
   * Validate input before execution
   * Return null if valid, error message if invalid
   */
  validateInput?(task: Task): Promise<string | null>;

  /**
   * Estimate cost before execution (optional)
   */
  estimateCost?(task: Task): Promise<CostEstimate>;
}

export type AgentType = 'executor' | 'analyst' | 'data' | 'custom';

export interface AgentContext {
  // User who triggered the task
  userId: string;
  workspaceId: string;

  // Files attached to the task
  files: AgentFile[];

  // Memory entries relevant to this task
  memories: MemoryEntry[];

  // Active integrations
  integrations: Integration[];

  // Workspace settings
  workspaceSettings: WorkspaceSettings;

  // Progress callback — call this to update UI
  progress: ProgressCallback;

  // Abort signal — check this for cancellation
  abortSignal: AbortSignal;
}

export interface AgentFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  content?: string;    // Populated by file reader tool
  metadata?: Record<string, any>;
}

export interface AgentOutput {
  // Required
  success: boolean;
  result: any;

  // Optional metadata
  summary?: string;
  format?: 'text' | 'json' | 'markdown' | 'pdf' | 'csv';

  // Generated files
  files?: OutputFile[];

  // Cost tracking
  cost?: {
    usd: number;
    tokensInput: number;
    tokensOutput: number;
    model: string;
  };

  // Confidence score (0–1)
  confidence?: number;

  // Sources cited
  sources?: Source[];
}

export interface OutputFile {
  name: string;
  mimeType: string;
  content: Buffer | string;
  sizeBytes: number;
}

export interface Source {
  type: 'file' | 'web' | 'memory' | 'integration';
  id: string;
  name: string;
  excerpt?: string;
}

export interface AgentError {
  code: string;
  message: string;
  retryable: boolean;
  details?: any;
}

export interface CostEstimate {
  estimatedCostUsd: number;
  estimatedTokens: number;
  estimatedDurationMs: number;
}

export interface ProgressCallback {
  (update: {
    percent: number;           // 0–100
    message: string;           // "Analyzing data..."
    details?: string;          // "Processing row 150/500"
    data?: any;                // Partial results
  }): void;
}

// ═══════════════════════════════════════════════════════════════
// TOOLS — What agents can do
// ═══════════════════════════════════════════════════════════════

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute(params: Record<string, any>, context: AgentContext): Promise<any>;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

// ═══════════════════════════════════════════════════════════════
// BUILT-IN TOOLS
// ═══════════════════════════════════════════════════════════════

export const BUILT_IN_TOOLS = {
  // File operations
  file_read:      'Read file content',
  file_write:     'Write/generate file',
  file_list:      'List files in workspace',
  csv_parse:      'Parse CSV file to structured data',
  pdf_extract:    'Extract text from PDF',
  excel_read:     'Read Excel file',

  // Data operations
  data_analyze:   'Statistical analysis on dataset',
  data_transform: 'Transform/filter/sort data',
  chart_generate: 'Generate chart/visualization',

  // Web operations
  web_search:     'Search the web',
  web_fetch:      'Fetch URL content',

  // Code execution
  code_execute:   'Execute code in sandbox',

  // AI operations
  summarize:      'Summarize text/document',
  translate:      'Translate text',
  classify:       'Classify text into categories',

  // Output operations
  template_render: 'Render template with data',
  pdf_generate:    'Generate PDF from content',
  markdown_format: 'Format as markdown',
} as const;

// ═══════════════════════════════════════════════════════════════
// AGENT CONFIG (Database Schema)
// ═══════════════════════════════════════════════════════════════

export interface AgentConfig {
  // AI Configuration
  systemPrompt: string;              // System prompt untuk LLM
  modelPreference: string;           // Preferred model (e.g., "gpt-4o")
  modelFallback?: string;            // Fallback model
  temperature?: number;              // 0–1, default 0.7
  maxTokens?: number;                // Max output tokens

  // Execution
  tools: string[];                   // Tool names this agent can use
  maxExecutionTime: number;          // Max seconds
  maxRetries?: number;               // Default 2

  // Cost
  maxCostPerExecution?: number;      // USD limit per execution

  // Behavior
  autoSaveResults?: boolean;         // Auto-save output to workspace
  requireHumanReview?: boolean;      // Flag output for review
  notifyOnComplete?: boolean;        // Notify user when done

  // Sandbox
  sandboxEnabled?: boolean;          // Enable code execution sandbox
  sandboxTimeout?: number;           // Sandbox timeout in seconds
}
```

---

## 📝 Example: Building a Custom Agent

### Finance Analyst Agent

```typescript
// agents/finance-analyst/src/index.ts

import {
  Agent,
  AgentContext,
  AgentOutput,
  AgentConfig,
  Tool,
  Task
} from '@karyo/agent-sdk';
import { csvParseTool, chartGenerateTool, summarizeTool } from '@karyo/agent-sdk/tools';

export class FinanceAnalystAgent implements Agent {
  readonly id = 'finance-analyst-v1';
  readonly name = 'Finance Analyst';
  readonly version = '1.2.0';
  readonly type = 'analyst';
  readonly description = 'Analisis data keuangan, generate laporan, dan forecasting';

  private llm: any;
  private config: AgentConfig;

  async onInit(): Promise<void> {
    this.config = {
      systemPrompt: `You are an expert financial analyst. 
        Analyze data carefully, identify trends, and provide actionable insights.
        Always cite your data sources and show your reasoning.
        Format output as structured reports with clear sections.`,
      modelPreference: 'gpt-4o',
      temperature: 0.3,         // Low temp for analytical accuracy
      tools: ['csv_parse', 'chart_generate', 'summarize', 'file_read'],
      maxExecutionTime: 300,
      requireHumanReview: true,  // Financial output needs review
    };
  }

  getTools(): Tool[] {
    return [csvParseTool, chartGenerateTool, summarizeTool];
  }

  async validateInput(task: Task): Promise<string | null> {
    const files = task.input?.file_ids;
    if (!files || files.length === 0) {
      return 'Finance Analyst requires at least one data file (CSV/Excel)';
    }
    return null;
  }

  async execute(task: Task, context: AgentContext): Promise<AgentOutput> {
    const { progress, files, abortSignal } = context;

    try {
      // Step 1: Read & parse files
      progress({ percent: 10, message: 'Membaca file data...' });
      
      const dataFiles = files.filter(f => 
        f.mimeType.includes('csv') || f.mimeType.includes('spreadsheet')
      );

      if (dataFiles.length === 0) {
        throw new Error('No CSV/Excel files found in task');
      }

      // Step 2: Parse CSV data
      progress({ percent: 20, message: 'Memproses data...' });
      
      const parsedData = await this.parseDataFiles(dataFiles, context);

      // Step 3: Analyze trends
      progress({ percent: 40, message: 'Menganalisis tren keuangan...' });
      
      if (abortSignal.aborted) throw new Error('Task cancelled');

      const analysis = await this.analyzeFinancialData(parsedData, task.input);

      // Step 4: Generate insights
      progress({ percent: 60, message: 'Menghasilkan insight...' });
      
      const insights = await this.generateInsights(analysis);

      // Step 5: Create charts
      progress({ percent: 75, message: 'Membuat visualisasi...' });
      
      const charts = await this.generateCharts(parsedData, analysis);

      // Step 6: Compile report
      progress({ percent: 90, message: 'Menyusun laporan...' });
      
      const report = await this.compileReport(analysis, insights, charts);

      // Step 7: Done
      progress({ percent: 100, message: 'Analisis selesai!' });

      return {
        success: true,
        result: report,
        summary: this.generateSummary(analysis, insights),
        format: 'markdown',
        files: [
          {
            name: 'financial-analysis-report.md',
            mimeType: 'text/markdown',
            content: report,
            sizeBytes: Buffer.byteLength(report, 'utf-8'),
          },
          ...charts,
        ],
        confidence: analysis.confidence,
        sources: dataFiles.map(f => ({
          type: 'file' as const,
          id: f.id,
          name: f.name,
        })),
        cost: {
          usd: 0.045,          // Actual cost from LLM calls
          tokensInput: 12500,
          tokensOutput: 3200,
          model: 'gpt-4o',
        },
      };

    } catch (error) {
      return {
        success: false,
        result: null,
        summary: `Analisis gagal: ${error.message}`,
      };
    }
  }

  // ═══════════════════════════════════════
  // Private methods
  // ═══════════════════════════════════════

  private async parseDataFiles(files: any[], context: AgentContext) {
    const parsed = [];
    for (const file of files) {
      const content = await this.tools.csv_parse.execute(
        { fileUrl: file.url },
        context
      );
      parsed.push({ fileName: file.name, data: content });
    }
    return parsed;
  }

  private async analyzeFinancialData(data: any[], input: any) {
    // LLM-powered analysis
    const prompt = `
      Analyze this financial data:
      ${JSON.stringify(data.slice(0, 100))}  // First 100 rows
      
      Focus on: ${input?.focus || 'revenue trends, cost analysis, profitability'}
      
      Provide:
      1. Key metrics summary
      2. Trend analysis (MoM, YoY if applicable)
      3. Anomalies or outliers
      4. Top performers / underperformers
    `;

    const result = await this.llm.invoke(prompt);
    return { ...result, confidence: 0.87 };
  }

  private async generateInsights(analysis: any) {
    const prompt = `Based on this analysis, generate 3-5 actionable insights: ${JSON.stringify(analysis)}`;
    return await this.llm.invoke(prompt);
  }

  private async generateCharts(data: any, analysis: any) {
    return await this.tools.chart_generate.execute({
      type: 'line',
      data: data,
      title: 'Revenue Trend',
    }, context);
  }

  private async compileReport(analysis: any, insights: any, charts: any[]) {
    // Compile into markdown report
    return `
# Financial Analysis Report

## Executive Summary
${analysis.summary}

## Key Metrics
${analysis.metrics}

## Trend Analysis
${analysis.trends}

## Insights & Recommendations
${insights}

## Charts
${charts.map(c => `![Chart](${c.url})`).join('\n')}
    `.trim();
  }

  private generateSummary(analysis: any, insights: any) {
    return `Financial analysis completed. Key findings: ${insights.slice(0, 200)}...`;
  }
}

// Export the agent
export default new FinanceAnalystAgent();
```

### Register Agent

```typescript
// agents/finance-analyst/package.json
{
  "name": "@karyo/agent-finance-analyst",
  "version": "1.2.0",
  "main": "dist/index.js",
  "karyo": {
    "agent": true,
    "type": "analyst",
    "category": "finance",
    "permissions": ["read:files", "write:files", "read:tasks"]
  }
}
```

---

## 🔄 Agent Lifecycle

```
Agent Loaded (onInit)
    ↓
Task Received
    ↓
Validate Input (validateInput)
    ↓ (if invalid → reject task)
Assign to Agent (onAssign)
    ↓
Build Context
├── Load files
├── Load memories
├── Load integration data
├── Set up progress callback
└── Set up abort signal
    ↓
Execute (execute)
├── Progress updates → WebSocket → UI
├── Check abort signal periodically
├── Use tools as needed
└── Track cost
    ↓
┌─────────────┬──────────────┐
│ Success     │ Failure      │
├─────────────┼──────────────┤
│ onComplete  │ onError      │
│ Save output │ Log error    │
│ Update task │ Retry?       │
│ Notify user │ Alert admin  │
└─────────────┴──────────────┘
    ↓
Agent Unloaded (onDestroy) — if no more tasks
```

---

## 🛠 Available Tools Reference

### File Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `file_read` | Read file content | `{ fileId: string }` |
| `file_write` | Write new file | `{ name: string, content: string, mimeType: string }` |
| `file_list` | List workspace files | `{ filter?: { mimeType?, tags? } }` |
| `csv_parse` | Parse CSV to objects | `{ fileUrl: string, delimiter?: string }` |
| `pdf_extract` | Extract PDF text | `{ fileUrl: string, pages?: number[] }` |
| `excel_read` | Read Excel sheets | `{ fileUrl: string, sheet?: string }` |

### Data Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `data_analyze` | Statistical analysis | `{ data: any[], operations: string[] }` |
| `data_transform` | Transform data | `{ data: any[], operations: TransformOp[] }` |
| `chart_generate` | Generate chart | `{ type: string, data: any, title: string }` |

### Web Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `web_search` | Search the web | `{ query: string, limit?: number }` |
| `web_fetch` | Fetch URL content | `{ url: string, extractMode?: string }` |

### AI Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `summarize` | Summarize text | `{ text: string, maxLength?: number }` |
| `translate` | Translate text | `{ text: string, targetLang: string }` |
| `classify` | Classify text | `{ text: string, categories: string[] }` |

---

## 📦 Package Structure

```
@karyo/agent-sdk/
├── src/
│   ├── index.ts              # Main exports
│   ├── agent.ts              # Agent interface
│   ├── context.ts            # Context builder
│   ├── tools/                # Built-in tools
│   │   ├── index.ts
│   │   ├── file/
│   │   ├── data/
│   │   ├── web/
│   │   ├── code/
│   │   └── ai/
│   ├── llm/                  # LLM providers
│   │   ├── openrouter.ts
│   │   └── local.ts
│   ├── memory/               # Memory operations
│   │   └── reader.ts
│   ├── validators/           # Output validation
│   │   ├── schema.ts
│   │   └── confidence.ts
│   └── utils/
│       ├── progress.ts
│       ├── cost.ts
│       └── retry.ts
├── package.json
└── tsconfig.json
```

---

## 🧪 Testing Agents

```typescript
// __tests__/finance-analyst.test.ts

import { FinanceAnalystAgent } from '../src';
import { createMockTask, createMockContext } from '@karyo/agent-sdk/testing';

describe('FinanceAnalystAgent', () => {
  let agent: FinanceAnalystAgent;

  beforeEach(async () => {
    agent = new FinanceAnalystAgent();
    await agent.onInit();
  });

  it('should reject task without files', async () => {
    const task = createMockTask({ input: { file_ids: [] } });
    const error = await agent.validateInput(task);
    expect(error).toContain('requires at least one data file');
  });

  it('should analyze CSV data successfully', async () => {
    const task = createMockTask({
      input: { file_ids: ['file-1'], focus: 'revenue' },
    });
    const context = createMockContext({
      files: [{ id: 'file-1', name: 'sales.csv', mimeType: 'text/csv' }],
    });

    const result = await agent.execute(task, context);

    expect(result.success).toBe(true);
    expect(result.format).toBe('markdown');
    expect(result.files.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should handle cancellation gracefully', async () => {
    const abortController = new AbortController();
    const task = createMockTask();
    const context = createMockContext({ abortSignal: abortController.signal });

    // Cancel after 1 second
    setTimeout(() => abortController.abort(), 1000);

    const result = await agent.execute(task, context);
    // Should either complete fast or handle cancellation
    expect(result).toBeDefined();
  });
});
```

---

**🚀 Build your first agent dalam 30 menit!**
