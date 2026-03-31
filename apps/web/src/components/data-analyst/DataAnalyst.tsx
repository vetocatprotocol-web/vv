'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { BarChart3, FileText, Database, Globe, Play, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DataSource {
  type: 'file' | 'database' | 'api' | 'integration';
  source: string;
  integrationId?: string;
  config?: Record<string, any>;
}

interface AnalysisRequest {
  query: string;
  dataSources: DataSource[];
  analysisType: 'exploratory' | 'diagnostic' | 'predictive' | 'prescriptive';
  outputFormat: 'json' | 'markdown' | 'html' | 'chart';
  options: {
    includeVisualizations: boolean;
    generateReport: boolean;
  };
}

interface AnalysisResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: {
    insights: Array<{
      type: string;
      title: string;
      description: string;
      confidence: number;
    }>;
    visualizations?: Array<{
      type: string;
      title: string;
      data: any;
    }>;
    report?: {
      title: string;
      summary: string;
      sections: Array<{
        title: string;
        content: string;
      }>;
      recommendations?: string[];
    };
  };
  error?: string;
  cost?: number;
  executionTime?: number;
}

interface DataAnalystProps {
  workspaceId: string;
}

const ANALYSIS_TYPES = {
  exploratory: { label: 'Exploratory', description: 'Discover patterns and insights in data' },
  diagnostic: { label: 'Diagnostic', description: 'Identify causes of problems or anomalies' },
  predictive: { label: 'Predictive', description: 'Forecast future trends and outcomes' },
  prescriptive: { label: 'Prescriptive', description: 'Recommend actions to achieve goals' }
};

const OUTPUT_FORMATS = {
  json: 'JSON',
  markdown: 'Markdown',
  html: 'HTML Report',
  chart: 'Charts & Visualizations'
};

export default function DataAnalyst({ workspaceId }: DataAnalystProps) {
  const [request, setRequest] = useState<AnalysisRequest>({
    query: '',
    dataSources: [],
    analysisType: 'exploratory',
    outputFormat: 'json',
    options: {
      includeVisualizations: true,
      generateReport: false
    }
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/integrations/workspace/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const handleSubmit = async () => {
    if (!request.query.trim() || request.dataSources.length === 0) {
      alert('Please provide a query and at least one data source');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/data-analyst/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          userId: 'current-user', // In real app, get from auth
          workspaceId
        })
      });

      const result = await response.json();
      setAnalysisResult(result);

      // Start polling for results if queued
      if (result.status === 'queued' && result.jobId) {
        pollForResults(result.jobId);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult({
        jobId: '',
        status: 'failed',
        error: 'Failed to start analysis'
      });
    } finally {
      setLoading(false);
    }
  };

  const pollForResults = (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/data-analyst/result/${jobId}?userId=current-user`);
        const result = await response.json();

        setAnalysisResult(result);

        if (result.status === 'processing' || result.status === 'queued') {
          setTimeout(poll, 2000); // Poll every 2 seconds
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    };

    poll();
  };

  const addDataSource = (type: string, source: string, integrationId?: string) => {
    const newSource: DataSource = { type: type as any, source };
    if (integrationId) newSource.integrationId = integrationId;

    setRequest(prev => ({
      ...prev,
      dataSources: [...prev.dataSources, newSource]
    }));
    setShowDataSourceDialog(false);
  };

  const removeDataSource = (index: number) => {
    setRequest(prev => ({
      ...prev,
      dataSources: prev.dataSources.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'integration':
        return <Globe className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'api':
        return <Globe className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            AI Data Analyst
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Input */}
          <div>
            <Label htmlFor="query">Analysis Query</Label>
            <Textarea
              id="query"
              placeholder="What insights do you want to discover from your data?"
              value={request.query}
              onChange={(e) => setRequest(prev => ({ ...prev, query: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Analysis Type */}
          <div>
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select
              value={request.analysisType}
              onValueChange={(value) => setRequest(prev => ({ ...prev, analysisType: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ANALYSIS_TYPES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{info.label}</div>
                      <div className="text-sm text-gray-500">{info.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div>
            <Label htmlFor="outputFormat">Output Format</Label>
            <Select
              value={request.outputFormat}
              onValueChange={(value) => setRequest(prev => ({ ...prev, outputFormat: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OUTPUT_FORMATS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visualizations"
                checked={request.options.includeVisualizations}
                onCheckedChange={(checked) =>
                  setRequest(prev => ({
                    ...prev,
                    options: { ...prev.options, includeVisualizations: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="visualizations">Include visualizations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="report"
                checked={request.options.generateReport}
                onCheckedChange={(checked) =>
                  setRequest(prev => ({
                    ...prev,
                    options: { ...prev.options, generateReport: checked as boolean }
                  }))
                }
              />
              <Label htmlFor="report">Generate comprehensive report</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Data Sources
            <Dialog open={showDataSourceDialog} onOpenChange={setShowDataSourceDialog}>
              <DialogTrigger asChild>
                <Button size="sm">Add Data Source</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Data Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Integration Sources */}
                  {integrations.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Connected Integrations</h3>
                      <div className="space-y-2">
                        {integrations.map((integration) => (
                          <Button
                            key={integration.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addDataSource('integration', integration.name, integration.id)}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            {integration.name} ({integration.type})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other Sources */}
                  <div>
                    <h3 className="font-medium mb-2">Other Sources</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addDataSource('file', 'Upload File')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        File Upload
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addDataSource('database', 'Database Connection')}
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Database
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addDataSource('api', 'API Endpoint')}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        REST API
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {request.dataSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data sources selected</p>
              <p className="text-sm">Add data sources to begin analysis</p>
            </div>
          ) : (
            <div className="space-y-2">
              {request.dataSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDataSourceIcon(source.type)}
                    <div>
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-gray-500 capitalize">{source.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDataSource(index)}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execute Analysis */}
      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={loading || !request.query.trim() || request.dataSources.length === 0}
          size="lg"
          className="px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Starting Analysis...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Run AI Data Analysis
            </>
          )}
        </Button>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {getStatusIcon(analysisResult.status)}
              <span className="ml-2">Analysis Results</span>
              <Badge variant="outline" className="ml-auto">
                {analysisResult.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult.status === 'completed' && analysisResult.result ? (
              <Tabs defaultValue="insights" className="w-full">
                <TabsList>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  {analysisResult.result.visualizations && (
                    <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                  )}
                  {analysisResult.result.report && (
                    <TabsTrigger value="report">Report</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="insights" className="space-y-4">
                  {analysisResult.result.insights.map((insight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{insight.title}</h3>
                        <Badge variant="secondary">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </TabsContent>

                {analysisResult.result.visualizations && (
                  <TabsContent value="visualizations">
                    <div className="space-y-4">
                      {analysisResult.result.visualizations.map((viz, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">{viz.title}</h3>
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            <pre>{JSON.stringify(viz.data, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {analysisResult.result.report && (
                  <TabsContent value="report" className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h1 className="text-2xl font-bold mb-2">{analysisResult.result.report.title}</h1>
                      <p className="text-gray-600 mb-4">{analysisResult.result.report.summary}</p>

                      {analysisResult.result.report.sections.map((section, index) => (
                        <div key={index} className="mb-4">
                          <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                          <p className="text-gray-700">{section.content}</p>
                        </div>
                      ))}

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.result.report.recommendations?.map((rec, index) => (
                            <li key={index} className="text-gray-700">{rec}</li>
                          )) || <li className="text-gray-500">No recommendations available</li>}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : analysisResult.status === 'failed' ? (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <p className="text-red-600 font-medium">Analysis Failed</p>
                <p className="text-gray-600 mt-2">{analysisResult.error}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                <p className="text-blue-600 font-medium">
                  {analysisResult.status === 'processing' ? 'Analysis in Progress...' : 'Analysis Queued...'}
                </p>
                {analysisResult.cost && (
                  <p className="text-sm text-gray-600 mt-2">
                    Estimated cost: ${analysisResult.cost.toFixed(4)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}