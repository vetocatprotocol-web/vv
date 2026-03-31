'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Eye, Download, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AnalysisHistoryItem {
  id: string;
  query: string;
  analysisType: string;
  status: 'completed' | 'failed' | 'processing' | 'queued';
  createdAt: string;
  completedAt?: string;
  cost?: number;
  executionTime?: number;
  result?: {
    insights: Array<{
      type: string;
      title: string;
      description: string;
      confidence: number;
    }>;
    report?: {
      title: string;
      summary: string;
    };
  };
}

interface AnalysisHistoryProps {
  workspaceId: string;
}

export default function AnalysisHistory({ workspaceId }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisHistoryItem | null>(null);

  useEffect(() => {
    loadHistory();
  }, [workspaceId]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`/api/data-analyst/history?workspaceId=${workspaceId}&userId=current-user`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await fetch(`/api/data-analyst/history/${analysisId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' })
      });
      setHistory(prev => prev.filter(item => item.id !== analysisId));
    } catch (error) {
      console.error('Failed to delete analysis:', error);
    }
  };

  const downloadReport = async (analysis: AnalysisHistoryItem) => {
    if (!analysis.result?.report) return;

    const reportContent = `
# ${analysis.result.report.title}

## Summary
${analysis.result.report.summary}

## Analysis Details
- Query: ${analysis.query}
- Type: ${analysis.analysisType}
- Completed: ${new Date(analysis.completedAt || analysis.createdAt).toLocaleString()}
- Cost: $${analysis.cost?.toFixed(4) || 'N/A'}
- Execution Time: ${analysis.executionTime ? `${analysis.executionTime}ms` : 'N/A'}

## Insights
${analysis.result.insights.map(insight =>
  `### ${insight.title}\n${insight.description}\nConfidence: ${(insight.confidence * 100).toFixed(0)}%\n`
).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-report-${analysis.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary',
      queued: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading analysis history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Analysis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No analysis history found</p>
              <p className="text-sm">Your completed analyses will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {history.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(analysis.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{analysis.query}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {analysis.analysisType}
                          </Badge>
                          {getStatusBadge(analysis.status)}
                          <span className="text-xs text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {analysis.cost && (
                          <p className="text-xs text-gray-500 mt-1">
                            Cost: ${analysis.cost.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Analysis Details</DialogTitle>
                          </DialogHeader>
                          {selectedAnalysis && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-medium">Query</h3>
                                  <p className="text-sm text-gray-600">{selectedAnalysis.query}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Type</h3>
                                  <p className="text-sm text-gray-600 capitalize">{selectedAnalysis.analysisType}</p>
                                </div>
                                <div>
                                  <h3 className="font-medium">Status</h3>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(selectedAnalysis.status)}
                                    <span className="text-sm text-gray-600 capitalize">{selectedAnalysis.status}</span>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-medium">Created</h3>
                                  <p className="text-sm text-gray-600">
                                    {new Date(selectedAnalysis.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                {selectedAnalysis.completedAt && (
                                  <>
                                    <div>
                                      <h3 className="font-medium">Completed</h3>
                                      <p className="text-sm text-gray-600">
                                        {new Date(selectedAnalysis.completedAt).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="font-medium">Execution Time</h3>
                                      <p className="text-sm text-gray-600">
                                        {selectedAnalysis.executionTime}ms
                                      </p>
                                    </div>
                                  </>
                                )}
                                {selectedAnalysis.cost && (
                                  <div>
                                    <h3 className="font-medium">Cost</h3>
                                    <p className="text-sm text-gray-600">
                                      ${selectedAnalysis.cost.toFixed(4)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {selectedAnalysis.result?.insights && (
                                <div>
                                  <h3 className="font-medium mb-2">Insights</h3>
                                  <div className="space-y-2">
                                    {selectedAnalysis.result.insights.map((insight, index) => (
                                      <div key={index} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                          <h4 className="font-medium">{insight.title}</h4>
                                          <Badge variant="secondary">
                                            {(insight.confidence * 100).toFixed(0)}%
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">{insight.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedAnalysis.result?.report && (
                                <div>
                                  <h3 className="font-medium mb-2">Report Summary</h3>
                                  <div className="p-3 border rounded-lg">
                                    <h4 className="font-medium">{selectedAnalysis.result.report.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{selectedAnalysis.result.report.summary}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {analysis.status === 'completed' && analysis.result?.report && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadReport(analysis)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnalysis(analysis.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}