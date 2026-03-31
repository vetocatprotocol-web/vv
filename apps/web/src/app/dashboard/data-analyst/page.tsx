import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, History, Database, Loader2 } from 'lucide-react';
import DataAnalyst from '@/components/data-analyst/DataAnalyst';
import AnalysisHistory from '@/components/data-analyst/AnalysisHistory';
import DataSourceManager from '@/components/data-analyst/DataSourceManager';

interface DataAnalystPageProps {
  params: {
    workspaceId: string;
  };
}

export default function DataAnalystPage({ params }: DataAnalystPageProps) {
  const { workspaceId } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Data Analyst</h1>
        <p className="text-gray-600">
          Leverage AI to analyze your data across multiple sources and generate comprehensive insights,
          visualizations, and reports.
        </p>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analyze" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze Data
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <History className="w-4 h-4 mr-2" />
            Analysis History
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center">
            <Database className="w-4 h-4 mr-2" />
            Data Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="mt-6">
          <Suspense fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading AI Data Analyst...</span>
              </CardContent>
            </Card>
          }>
            <DataAnalyst workspaceId={workspaceId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Suspense fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading analysis history...</span>
              </CardContent>
            </Card>
          }>
            <AnalysisHistory workspaceId={workspaceId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="sources" className="mt-6">
          <Suspense fallback={
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading data sources...</span>
              </CardContent>
            </Card>
          }>
            <DataSourceManager workspaceId={workspaceId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}